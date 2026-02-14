import { Authenticated, useQuery } from "convex/react";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import HomePage from "./components/HomePage";
import MenuPage from "./components/MenuPage";
import CateringPage from "./components/CateringPage";
import ContactPage from "./components/ContactPage";
import OrderPage from "./components/OrderPage";
import SeedMenu from "./components/SeedMenu";
import AdminPage from "./components/AdminPage";
import { api } from "../convex/_generated/api";

type Page = "home" | "menu" | "catering" | "contact" | "order" | "admin";

export default function App() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [cartItems, setCartItems] = useState<
    Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
    }>
  >([]);

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
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
        prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f0e6]">
      <header className="sticky top-0 z-50 bg-[#f8f2e9]/95 backdrop-blur-sm border-b border-[#e7d8c2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setCurrentPage("home")}
            >
              <div className="w-12 h-12 bg-[#123b3b] rounded-full flex items-center justify-center">
                <span className="text-xl text-[#f3c78f] font-bold">DS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1f1a15]">Desi Sizzles</h1>
                <p className="text-xs text-[#8b5e34]">Fresh Indian home cooking</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => setCurrentPage("home")}
                className={`font-medium transition-colors ${
                  currentPage === "home"
                    ? "text-[#d46f1b]"
                    : "text-[#3f3731] hover:text-[#d46f1b]"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage("menu")}
                className={`font-medium transition-colors ${
                  currentPage === "menu"
                    ? "text-[#d46f1b]"
                    : "text-[#3f3731] hover:text-[#d46f1b]"
                }`}
              >
                Menu
              </button>
              <button
                onClick={() => setCurrentPage("catering")}
                className={`font-medium transition-colors ${
                  currentPage === "catering"
                    ? "text-[#d46f1b]"
                    : "text-[#3f3731] hover:text-[#d46f1b]"
                }`}
              >
                Catering
              </button>
              <button
                onClick={() => setCurrentPage("contact")}
                className={`font-medium transition-colors ${
                  currentPage === "contact"
                    ? "text-[#d46f1b]"
                    : "text-[#3f3731] hover:text-[#d46f1b]"
                }`}
              >
                Contact
              </button>
              <button
                onClick={() => setCurrentPage("order")}
                className="relative bg-[#f08a24] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#dc7820] transition-colors"
              >
                Order Now
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#123b3b] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setCurrentPage("admin")}
                className={`font-medium transition-colors ${
                  currentPage === "admin"
                    ? "text-[#d46f1b]"
                    : "text-[#3f3731] hover:text-[#d46f1b]"
                }`}
              >
                Admin
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <Authenticated>
                <div className="hidden lg:block text-right">
                  <p className="text-xs text-[#8b5e34]">Logged in as</p>
                  <p className="text-sm font-semibold text-[#1f1a15]">
                    {(loggedInUser as { email?: string } | null)?.email ??
                      "Authenticated User"}
                  </p>
                </div>
              </Authenticated>
              <Authenticated>
                <SignOutButton />
              </Authenticated>
              <button
                className="md:hidden text-[#3f3731]"
                onClick={() => {
                  const menu = document.getElementById("mobile-menu");
                  menu?.classList.toggle("hidden");
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="text-left px-4 py-2 text-[#3f3731] hover:bg-[#efe4d1] rounded"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentPage("menu");
                  document.getElementById("mobile-menu")?.classList.add("hidden");
                }}
                className="text-left px-4 py-2 text-[#3f3731] hover:bg-[#efe4d1] rounded"
              >
                Menu
              </button>
              <button
                onClick={() => {
                  setCurrentPage("catering");
                  document.getElementById("mobile-menu")?.classList.add("hidden");
                }}
                className="text-left px-4 py-2 text-[#3f3731] hover:bg-[#efe4d1] rounded"
              >
                Catering
              </button>
              <button
                onClick={() => {
                  setCurrentPage("contact");
                  document.getElementById("mobile-menu")?.classList.add("hidden");
                }}
                className="text-left px-4 py-2 text-[#3f3731] hover:bg-[#efe4d1] rounded"
              >
                Contact
              </button>
              <button
                onClick={() => {
                  setCurrentPage("order");
                  document.getElementById("mobile-menu")?.classList.add("hidden");
                }}
                className="text-left px-4 py-2 bg-[#f08a24] text-white hover:bg-[#dc7820] rounded font-semibold"
              >
                Order Now {cartCount > 0 && `(${cartCount})`}
              </button>
              <button
                onClick={() => {
                  setCurrentPage("admin");
                  document.getElementById("mobile-menu")?.classList.add("hidden");
                }}
                className="text-left px-4 py-2 text-[#3f3731] hover:bg-[#efe4d1] rounded"
              >
                Admin
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
          <MenuPage
            onAddToCart={addToCart}
            onUpdateQuantity={updateCartQuantity}
            cartItems={cartItems}
            onNavigateToOrder={() => setCurrentPage("order")}
          />
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
        {currentPage === "admin" && <AdminPage />}
      </main>

      <SeedMenu />

      <footer className="bg-[#123b3b] text-[#f8f2e7] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Desi Sizzles</h3>
              <p className="text-[#d8c6ae]">
                Authentic Indian cuisine made with love and traditional recipes.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-[#d8c6ae]">Crawley, West Sussex</p>
              <p className="text-[#d8c6ae]">Phone: 01293 XXX XXX</p>
              <p className="text-[#d8c6ae]">Email: info@desisizzles.co.uk</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Hours</h3>
              <p className="text-[#d8c6ae]">Tuesday - Sunday: 5:00 PM - 10:00 PM</p>
              <p className="text-[#d8c6ae]">Monday: Closed</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-[#2c5b5b] text-center text-[#d8c6ae]">
            <p>&copy; 2024 Desi Sizzles. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <Toaster position="top-right" />
    </div>
  );
}

