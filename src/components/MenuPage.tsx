import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

type MenuPageProps = {
  onAddToCart: (item: { id: string; name: string; price: number }) => void;
  onNavigateToOrder: () => void;
};

export default function MenuPage({ onAddToCart, onNavigateToOrder }: MenuPageProps) {
  const menuItems = useQuery(api.menu.listMenuItems);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = menuItems ? ["all", ...Object.keys(menuItems)] : ["all"];

  const handleAddToCart = (item: { id: string; name: string; price: number }) => {
    onAddToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Our Menu</h1>
          <p className="text-xl text-gray-600">
            Explore our delicious selection of authentic Indian dishes
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-orange-50 border border-gray-200"
              }`}
            >
              {category === "all" ? "All Items" : category}
            </button>
          ))}
        </div>

        {menuItems === undefined ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(menuItems).map(([category, items]) => {
              if (selectedCategory !== "all" && selectedCategory !== category) {
                return null;
              }

              return (
                <div key={category}>
                  <h2 className="text-3xl font-bold mb-6 text-gray-900 border-b-2 border-orange-500 pb-2">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                      >
                        <div className="h-40 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                          <span className="text-6xl">
                            {category === "Starters"
                              ? "🥟"
                              : category === "Main Courses"
                              ? "🍛"
                              : category === "Rice & Biryani"
                              ? "🍚"
                              : category === "Breads"
                              ? "🫓"
                              : category === "Desserts"
                              ? "🍮"
                              : "🥤"}
                          </span>
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              {item.name}
                            </h3>
                            <span className="text-orange-600 font-bold text-lg">
                              £{item.price.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {item.isVegetarian && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                                🌱 Veg
                              </span>
                            )}
                            {item.isVegan && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                                🌿 Vegan
                              </span>
                            )}
                            {item.spiceLevel !== "None" && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">
                                🌶️ {item.spiceLevel}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() =>
                              handleAddToCart({
                                id: item._id,
                                name: item.name,
                                price: item.price,
                              })
                            }
                            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={onNavigateToOrder}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
