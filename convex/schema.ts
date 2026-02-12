import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  menuItems: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.string(),
    price: v.number(),
    isVegetarian: v.boolean(),
    isVegan: v.boolean(),
    spiceLevel: v.string(),
    imageUrl: v.optional(v.string()),
    available: v.boolean(),
  }).index("by_category", ["category"]),

  orders: defineTable({
    userId: v.optional(v.id("users")),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    totalAmount: v.number(),
    deliveryAddress: v.string(),
    specialInstructions: v.optional(v.string()),
    status: v.string(),
    orderType: v.string(),
  }).index("by_status", ["status"]),

  inquiries: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    message: v.string(),
    inquiryType: v.string(),
    status: v.string(),
  }).index("by_status", ["status"]),

  cateringRequests: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    eventDate: v.string(),
    guestCount: v.number(),
    eventType: v.string(),
    menuPreferences: v.string(),
    specialRequirements: v.optional(v.string()),
    status: v.string(),
  }).index("by_status", ["status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
