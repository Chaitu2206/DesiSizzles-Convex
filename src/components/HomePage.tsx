import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type HomePageProps = {
  onNavigate: (page: "home" | "menu" | "catering" | "contact" | "order") => void;
  onAddToCart: (item: { id: string; name: string; price: number }) => void;
};

export default function HomePage({ onNavigate, onAddToCart }: HomePageProps) {
  const menuItems = useQuery(api.menu.listMenuItems);

  const featuredItems = menuItems
    ? Object.values(menuItems)
        .flat()
        .slice(0, 3)
    : [];

  return (
    <div>
      <section className="relative bg-gradient-to-r from-orange-600 to-red-700 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Experience Authentic Indian Flavors
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-orange-100">
            Traditional recipes, fresh ingredients, delivered to your door
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate("menu")}
              className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all hover:scale-105 shadow-lg"
            >
              View Menu
            </button>
            <button
              onClick={() => onNavigate("order")}
              className="bg-orange-800 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-900 transition-all hover:scale-105 shadow-lg"
            >
              Order Now
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🍛</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Authentic Recipes
              </h3>
              <p className="text-gray-600">
                Traditional Indian dishes passed down through generations
              </p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🌶️</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Fresh Spices
              </h3>
              <p className="text-gray-600">
                Premium quality spices imported directly from India
              </p>
            </div>
            <div className="text-center p-6 rounded-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Fast Delivery
              </h3>
              <p className="text-gray-600">
                Hot, fresh meals delivered right to your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Featured Dishes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <span className="text-7xl">🍛</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {item.name}
                    </h3>
                    <span className="text-orange-600 font-bold text-lg">
                      £{item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex gap-2 mb-4">
                    {item.isVegetarian && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                        Vegetarian
                      </span>
                    )}
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">
                      {item.spiceLevel}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      onAddToCart({
                        id: item._id,
                        name: item.name,
                        price: item.price,
                      })
                    }
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate("menu")}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
            >
              View Full Menu
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Catering Services Available</h2>
          <p className="text-xl mb-8 text-orange-100">
            Planning a party or event? We cater for all occasions!
          </p>
          <button
            onClick={() => onNavigate("catering")}
            className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-50 transition-all hover:scale-105 shadow-lg"
          >
            Learn More About Catering
          </button>
        </div>
      </section>
    </div>
  );
}
