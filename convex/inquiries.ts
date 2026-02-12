import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createInquiry = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    message: v.string(),
    inquiryType: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("inquiries", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      message: args.message,
      inquiryType: args.inquiryType,
      status: "new",
    });
  },
});

export const createCateringRequest = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    eventDate: v.string(),
    guestCount: v.number(),
    eventType: v.string(),
    menuPreferences: v.string(),
    specialRequirements: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cateringRequests", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      eventDate: args.eventDate,
      guestCount: args.guestCount,
      eventType: args.eventType,
      menuPreferences: args.menuPreferences,
      specialRequirements: args.specialRequirements,
      status: "new",
    });
  },
});
