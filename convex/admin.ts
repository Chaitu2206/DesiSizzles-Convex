import { action, mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import {
  createAccount,
  getAuthUserId,
  modifyAccountCredentials,
  retrieveAccount,
} from "@convex-dev/auth/server";

const parseAdminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const isAdminEmail = (email: string) => parseAdminEmails().includes(email.toLowerCase());

const extractUserEmailsFromUserDoc = (user: any): string[] => {
  const candidates = new Set<string>();

  if (typeof user?.email === "string" && user.email.trim()) {
    candidates.add(user.email.trim().toLowerCase());
  }

  if (typeof user?.tokenIdentifier === "string" && user.tokenIdentifier.includes("|")) {
    const possibleEmail = user.tokenIdentifier.split("|").pop();
    if (possibleEmail?.includes("@")) {
      candidates.add(possibleEmail.trim().toLowerCase());
    }
  }

  return Array.from(candidates);
};

const extractUserEmails = async (ctx: any, userId: string, user: any): Promise<string[]> => {
  const candidates = new Set<string>(extractUserEmailsFromUserDoc(user));

  const passwordAccounts = await ctx.db
    .query("authAccounts")
    .withIndex("userIdAndProvider", (q: any) =>
      q.eq("userId", userId).eq("provider", "password"),
    )
    .collect();

  for (const account of passwordAccounts) {
    const accountId = account.providerAccountId;
    if (typeof accountId === "string" && accountId.includes("@")) {
      candidates.add(accountId.trim().toLowerCase());
    }
  }

  return Array.from(candidates);
};

const requireAdmin = async (ctx: any) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("Authentication required.");
  }

  const user = await ctx.db.get(userId);
  const emails = await extractUserEmails(ctx, userId, user);
  if (emails.length === 0 || !emails.some((email) => isAdminEmail(email))) {
    throw new ConvexError("Admin access required.");
  }

  return { userId, email: emails[0] };
};

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }
    const user = await ctx.db.get(userId);
    const emails = await extractUserEmails(ctx, userId, user);
    if (emails.length === 0) {
      return false;
    }
    return emails.some((email) => isAdminEmail(email));
  },
});

export const adminAccessInfo = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        signedIn: false,
        emails: [] as string[],
        isAdmin: false,
        configuredAdmins: parseAdminEmails(),
      };
    }
    const user = await ctx.db.get(userId);
    const emails = await extractUserEmails(ctx, userId, user);
    return {
      signedIn: true,
      emails,
      isAdmin: emails.some((email) => isAdminEmail(email)),
      configuredAdmins: parseAdminEmails(),
    };
  },
});

export const listAllOrders = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("orders").order("desc").collect();
  },
});

export const listAllMenuItems = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("menuItems").collect();
  },
});

export const addMenuItem = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    isVegetarian: v.boolean(),
    isVegan: v.boolean(),
    spiceLevel: v.string(),
    imageUrl: v.optional(v.string()),
    available: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("menuItems", args);
  },
});

export const updateMenuItem = mutation({
  args: {
    id: v.id("menuItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    price: v.optional(v.number()),
    isVegetarian: v.optional(v.boolean()),
    isVegan: v.optional(v.boolean()),
    spiceLevel: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    available: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...patch } = args;
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const removeMenuItem = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { available: false });
    return args.id;
  },
});

const normalizeMenuName = (value: string) => value.trim().toLowerCase();

export const upsertMenuItemFromAdmin = mutation({
  args: {
    id: v.optional(v.id("menuItems")),
    name: v.string(),
    description: v.string(),
    category: v.string(),
    menuSection: v.optional(v.string()),
    menuOrder: v.optional(v.number()),
    price: v.number(),
    isVegetarian: v.boolean(),
    isVegan: v.boolean(),
    spiceLevel: v.string(),
    imageUrl: v.optional(v.string()),
    available: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const {
      id,
      name,
      description,
      category,
      menuSection,
      menuOrder,
      price,
      isVegetarian,
      isVegan,
      spiceLevel,
      imageUrl,
      available,
    } = args;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      menuSection: menuSection?.trim() || undefined,
      menuOrder,
      price,
      isVegetarian,
      isVegan,
      spiceLevel: spiceLevel.trim(),
      imageUrl: imageUrl?.trim() || undefined,
      available,
    };

    if (id) {
      await ctx.db.patch(id, payload);
      return id;
    }

    const normalizedTarget = normalizeMenuName(payload.name);
    const existing = (await ctx.db.query("menuItems").collect()).find(
      (item) => normalizeMenuName(item.name) === normalizedTarget,
    );

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("menuItems", payload);
  },
});

export const saveMenuLayout = mutation({
  args: {
    items: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        category: v.string(),
        menuSection: v.optional(v.string()),
        menuOrder: v.number(),
        price: v.number(),
        isVegetarian: v.boolean(),
        isVegan: v.boolean(),
        spiceLevel: v.string(),
        imageUrl: v.optional(v.string()),
        available: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const existingItems = await ctx.db.query("menuItems").collect();
    const byNormalizedName = new Map(
      existingItems.map((item) => [normalizeMenuName(item.name), item]),
    );

    const touched = new Set<string>();
    for (const item of args.items) {
      const normalizedName = normalizeMenuName(item.name);
      const payload = {
        name: item.name.trim(),
        description: item.description.trim(),
        category: item.category.trim(),
        menuSection: item.menuSection?.trim() || undefined,
        menuOrder: item.menuOrder,
        price: item.price,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        spiceLevel: item.spiceLevel.trim(),
        imageUrl: item.imageUrl?.trim() || undefined,
        available: item.available,
      };

      const existing = byNormalizedName.get(normalizedName);
      if (existing) {
        await ctx.db.patch(existing._id, payload);
        touched.add(existing._id);
      } else {
        const id = await ctx.db.insert("menuItems", payload);
        touched.add(id);
      }
    }

    return { saved: touched.size };
  },
});

export const resetAdminPassword = action({
  args: {
    email: v.string(),
    newPassword: v.string(),
    resetToken: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const configuredToken = process.env.ADMIN_PASSWORD_RESET_TOKEN;

    if (!configuredToken || args.resetToken !== configuredToken) {
      throw new ConvexError("Invalid reset token.");
    }
    if (!isAdminEmail(normalizedEmail)) {
      throw new ConvexError("Only configured admin emails can be reset.");
    }
    if (!args.newPassword || args.newPassword.length < 8) {
      throw new ConvexError("Password must be at least 8 characters.");
    }

    try {
      await retrieveAccount(ctx, {
        provider: "password",
        account: { id: normalizedEmail },
      });
      await modifyAccountCredentials(ctx, {
        provider: "password",
        account: { id: normalizedEmail, secret: args.newPassword },
      });
      return { status: "updated" as const };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("InvalidAccountId")) {
        throw error;
      }
      await createAccount(ctx, {
        provider: "password",
        account: { id: normalizedEmail, secret: args.newPassword },
        profile: { email: normalizedEmail },
      });
      return { status: "created" as const };
    }
  },
});
