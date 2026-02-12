import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listMenuItems = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("menuItems")
      .filter((q) => q.eq(q.field("available"), true))
      .collect();
    
    const itemsByCategory: Record<string, Array<typeof items[0]>> = {};
    
    for (const item of items) {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    }
    
    return itemsByCategory;
  },
});

export const getMenuItem = query({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
