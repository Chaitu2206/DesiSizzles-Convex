import { Authenticated, Unauthenticated } from "convex/react";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import HomePage from "./components/HomePage";
import MenuPage from "./components/MenuPage";
import CateringPage from "./components/CateringPage";
import ContactPage from "./components/ContactPage";
import OrderPage from "./components/OrderPage";
import SeedMenu from "./components/SeedMenu";

type Page = "home" | "menu" | "catering" | "contact" | "order";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [cartItems, setCartItems] = useState<Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>>([]);

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setCurrentPage("home")}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Desi Sizzles
                </h1>
                <p className="text-xs text-orange-600">Authentic Indian Cuisine</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => setCurrentPage("home")}
                className={`font-medium transition-colors ${
                  currentPage === "home"
                    ? "text-orange-600"
                    : "text-gray-700 hover:text-orange-600"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage("menu")}
                className={`font-medium transition-colors ${
                  currentPage === "menu"
                    ? "text-orange-600"
                    : "text-gray-700 hover:text-orange-600"
                }`}
              >
                Menu
              </button>
              <button
                onClick={() => setCurrentPage("catering")}
                className={`font-medium transition-colors ${
                  currentPage === "catering"
                    ? "text-orange-600"
                    : "text-gray-700 hover:text-orange-600"
                }`}
              >
                Catering
              </button>
              <button
                onClick={() => setCurrentPage("contact")}
                className={`font-medium transition-colors ${
                  currentPage === "contact"
                    ? "text-orange-600"
                    : "text-gray-700 hover:text-orange-600"
                }`}
              >
                Contact
              </button>
              <button
                onClick={() => setCurrentPage("order")}
                className="relative bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Order Now
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <Authenticated>
                <SignOutButton />
              </Authenticated>
              <button
                className="md:hidden text-gray-700"
                onClick={() => {
                  const menu = document.getElementById("mobile-menu");
                  menu?.classList.toggle("hidden");
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div id="mobile-menu" className="hidden md:hidden pb-4">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setCurrentPage("home");
                  document.getElementById("mobile-menu")?.classList.add("hidden");
                }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-orange-50 rounded"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentPage("menu");
                  document.getElementById("mobile-menu")?.classList.add("hidden");
                }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-orange-50 rounded"
              >
                Menu
              </button>
              <button
                onClick={() => {
                  setCurrentPage("catering");
                  document.getElementById("mobile-menu")?.classList.add("hidden");
                }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-orange-50 rounded"
              >
                Catering
              </button>
              <button
                onClick={() => {
                  setCurrentPage("contact");
                  document.getElementById("mobile-menu")?.classList.add("hidden");
                }}
                className="text-left px-4 py-2 text-gray-700 hover:bg-orange-50 rounded"
              >
                Contact
              </button>
              <button
                onClick={() => {
                  setCurrentPage("order");
                  document.getElementById("mobile-menu")?.classList.add("hidden");
                }}
                className="text-left px-4 py-2 bg-orange-500 text-white hover:bg-orange-600 rounded font-semibold"
              >
                Order Now {cartCount > 0 && `(${cartCount})`}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {currentPage === "home" && (
          <HomePage onNavigate={setCurrentPage} onAddToCart={addToCart} />
        )}
        {currentPage === "menu" && (
          <MenuPage onAddToCart={addToCart} onNavigateToOrder={() => setCurrentPage("order")} />
        )}
        {currentPage === "catering" && <CateringPage />}
        {currentPage === "contact" && <ContactPage />}
        {currentPage === "order" && (
          <OrderPage
            cartItems={cartItems}
            onUpdateQuantity={updateCartQuantity}
            onClearCart={clearCart}
          />
        )}
      </main>

      <SeedMenu />

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Desi Sizzles</h3>
              <p className="text-gray-400">
                Authentic Indian cuisine made with love and traditional recipes.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-gray-400">Crawley, West Sussex</p>
              <p className="text-gray-400">Phone: 01293 XXX XXX</p>
              <p className="text-gray-400">Email: info@desisizzles.co.uk</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Hours</h3>
              <p className="text-gray-400">Tuesday - Sunday: 5:00 PM - 10:00 PM</p>
              <p className="text-gray-400">Monday: Closed</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Desi Sizzles. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <Toaster position="top-right" />
    </div>
  );
}
