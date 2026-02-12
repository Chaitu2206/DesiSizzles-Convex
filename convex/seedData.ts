import { mutation } from "./_generated/server";

export const seedMenuItems = mutation({
  args: {},
  handler: async (ctx) => {
    const existingItems = await ctx.db.query("menuItems").collect();
    if (existingItems.length > 0) {
      return { message: "Menu already seeded" };
    }

    const menuItems = [
      {
        name: "Chicken Tikka Masala",
        description: "Tender chicken pieces in a rich, creamy tomato-based sauce with aromatic spices",
        category: "Main Courses",
        price: 12.99,
        isVegetarian: false,
        isVegan: false,
        spiceLevel: "Medium",
        available: true,
      },
      {
        name: "Lamb Rogan Josh",
        description: "Slow-cooked lamb in a fragrant curry with Kashmiri spices",
        category: "Main Courses",
        price: 14.99,
        isVegetarian: false,
        isVegan: false,
        spiceLevel: "Medium",
        available: true,
      },
      {
        name: "Paneer Butter Masala",
        description: "Cottage cheese cubes in a velvety tomato and butter sauce",
        category: "Main Courses",
        price: 10.99,
        isVegetarian: true,
        isVegan: false,
        spiceLevel: "Mild",
        available: true,
      },
      {
        name: "Chana Masala",
        description: "Chickpeas cooked in a tangy tomato and onion gravy",
        category: "Main Courses",
        price: 9.99,
        isVegetarian: true,
        isVegan: true,
        spiceLevel: "Medium",
        available: true,
      },
      {
        name: "Biryani (Chicken)",
        description: "Fragrant basmati rice layered with marinated chicken and aromatic spices",
        category: "Rice & Biryani",
        price: 13.99,
        isVegetarian: false,
        isVegan: false,
        spiceLevel: "Medium",
        available: true,
      },
      {
        name: "Vegetable Biryani",
        description: "Aromatic rice with mixed vegetables and traditional spices",
        category: "Rice & Biryani",
        price: 10.99,
        isVegetarian: true,
        isVegan: true,
        spiceLevel: "Mild",
        available: true,
      },
      {
        name: "Garlic Naan",
        description: "Soft flatbread topped with fresh garlic and butter",
        category: "Breads",
        price: 3.49,
        isVegetarian: true,
        isVegan: false,
        spiceLevel: "None",
        available: true,
      },
      {
        name: "Butter Naan",
        description: "Traditional Indian flatbread brushed with butter",
        category: "Breads",
        price: 2.99,
        isVegetarian: true,
        isVegan: false,
        spiceLevel: "None",
        available: true,
      },
      {
        name: "Samosa (2 pieces)",
        description: "Crispy pastry filled with spiced potatoes and peas",
        category: "Starters",
        price: 4.99,
        isVegetarian: true,
        isVegan: true,
        spiceLevel: "Mild",
        available: true,
      },
      {
        name: "Chicken Pakora",
        description: "Crispy fried chicken fritters with Indian spices",
        category: "Starters",
        price: 6.99,
        isVegetarian: false,
        isVegan: false,
        spiceLevel: "Medium",
        available: true,
      },
      {
        name: "Onion Bhaji",
        description: "Golden fried onion fritters with gram flour and spices",
        category: "Starters",
        price: 4.49,
        isVegetarian: true,
        isVegan: true,
        spiceLevel: "Mild",
        available: true,
      },
      {
        name: "Gulab Jamun (3 pieces)",
        description: "Soft milk dumplings soaked in rose-flavored sugar syrup",
        category: "Desserts",
        price: 4.99,
        isVegetarian: true,
        isVegan: false,
        spiceLevel: "None",
        available: true,
      },
      {
        name: "Mango Lassi",
        description: "Refreshing yogurt drink blended with sweet mango",
        category: "Beverages",
        price: 3.99,
        isVegetarian: true,
        isVegan: false,
        spiceLevel: "None",
        available: true,
      },
      {
        name: "Masala Chai",
        description: "Traditional Indian spiced tea with milk",
        category: "Beverages",
        price: 2.99,
        isVegetarian: true,
        isVegan: false,
        spiceLevel: "None",
        available: true,
      },
    ];

    for (const item of menuItems) {
      await ctx.db.insert("menuItems", item);
    }

    return { message: "Menu seeded successfully", count: menuItems.length };
  },
});
