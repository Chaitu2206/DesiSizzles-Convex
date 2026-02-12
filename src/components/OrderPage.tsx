import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, FormEvent } from "react";
import { toast } from "sonner";

type OrderPageProps = {
  cartItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClearCart: () => void;
};

export default function OrderPage({
  cartItems,
  onUpdateQuantity,
  onClearCart,
}: OrderPageProps) {
  const createOrder = useMutation(api.orders.createOrder);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderType, setOrderType] = useState<"delivery" | "collection">("delivery");

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = orderType === "delivery" ? 3.99 : 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      await createOrder({
        customerName: formData.get("name") as string,
        customerEmail: formData.get("email") as string,
        customerPhone: formData.get("phone") as string,
        items: cartItems.map((item) => ({
          menuItemId: item.id as any,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        deliveryAddress: orderType === "delivery" 
          ? (formData.get("address") as string)
          : "Collection",
        specialInstructions: formData.get("instructions") as string || undefined,
        orderType,
      });

      toast.success("Order placed successfully! We'll contact you shortly.");
      onClearCart();
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Your Order</h1>
          <p className="text-xl text-gray-600">
            Review your cart and complete your order
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Cart Items
              </h2>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🛒</span>
                  <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
                  <p className="text-gray-500">Add some delicious items to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-orange-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="text-orange-600 font-semibold">
                          £{item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 bg-white rounded-full font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 bg-white rounded-full font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <div className="w-24 text-right">
                          <p className="font-bold text-gray-900">
                            £{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 0)}
                          className="text-red-600 hover:text-red-700 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Delivery Details
                </h2>
                
                <div className="mb-6">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setOrderType("delivery")}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                        orderType === "delivery"
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      🚚 Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType("collection")}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                        orderType === "collection"
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      🏪 Collection
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      placeholder="07XXX XXXXXX"
                    />
                  </div>

                  {orderType === "delivery" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Address *
                      </label>
                      <textarea
                        name="address"
                        required
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                        placeholder="Full delivery address including postcode"
                      ></textarea>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Special Instructions
                    </label>
                    <textarea
                      name="instructions"
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      placeholder="Any special requests or dietary requirements?"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || cartItems.length === 0}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                  </button>

                  <p className="text-sm text-gray-600 text-center">
                    Note: This is a demo. Payment will be collected on delivery/collection.
                  </p>
                </form>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>
                    {orderType === "delivery" ? "Delivery Fee" : "Collection"}
                  </span>
                  <span className="font-semibold">
                    {orderType === "delivery" ? `£${deliveryFee.toFixed(2)}` : "FREE"}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-600">£{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Estimated Time:</strong><br />
                  {orderType === "delivery" ? "45-60 minutes" : "30-40 minutes"}
                </p>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>✓ Fresh ingredients</p>
                <p>✓ Prepared to order</p>
                <p>✓ Contactless delivery available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
