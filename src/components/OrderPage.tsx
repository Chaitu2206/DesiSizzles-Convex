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

type PlacedOrder = {
  orderId: string;
  placedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderType: "delivery" | "collection";
  deliveryAddress: string;
  specialInstructions?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export default function OrderPage({
  cartItems,
  onUpdateQuantity,
  onClearCart,
}: OrderPageProps) {
  const WHATSAPP_ORDER_NUMBER =
    (import.meta.env.VITE_WHATSAPP_ORDER_NUMBER as string | undefined)?.replace(/\D/g, "") ||
    "447733765683";
  const createOrder = useMutation(api.orders.createOrder);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderType, setOrderType] = useState<"delivery" | "collection">("delivery");
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const isOrderLocked = placedOrder !== null;
  const activeItems = placedOrder?.items ?? cartItems;

  const subtotal = activeItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = orderType === "delivery" ? 3.99 : 0;
  const total = subtotal + deliveryFee;
  const formatCurrency = (value: number) => `\u00A3${value.toFixed(2)}`;

  const openWhatsAppWithOrder = (payload: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    specialInstructions?: string;
  }) => {
    const itemsText = cartItems
      .map(
        (item) =>
          `- ${item.name} x${item.quantity} (${formatCurrency(item.price)} each = ${formatCurrency(
            item.price * item.quantity,
          )})`,
      )
      .join("\n");

    const lines = [
      "New Order - Desi Sizzles",
      "",
      `Order Type: ${orderType === "delivery" ? "Delivery" : "Collection"}`,
      `Name: ${payload.customerName}`,
      `Email: ${payload.customerEmail}`,
      `Phone: ${payload.customerPhone}`,
      ...(orderType === "delivery" ? [`Address: ${payload.deliveryAddress}`] : []),
      ...(payload.specialInstructions ? [`Instructions: ${payload.specialInstructions}`] : []),
      "",
      "Items:",
      itemsText,
      "",
      `Subtotal: ${formatCurrency(subtotal)}`,
      `${orderType === "delivery" ? "Delivery Fee" : "Collection"}: ${
        orderType === "delivery" ? formatCurrency(deliveryFee) : "FREE"
      }`,
      `Total: ${formatCurrency(total)}`,
    ];

    const message = lines.join("\n");
    const whatsappUrl = `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(message)}`;
    const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    if (!opened) {
      window.location.href = whatsappUrl;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isOrderLocked) {
      toast.error("This order is already placed and locked.");
      return;
    }
    
    if (activeItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    setIsSubmitting(true);
    setOrderSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const customerName = formData.get("name") as string;
    const customerEmail = formData.get("email") as string;
    const customerPhone = formData.get("phone") as string;
    const deliveryAddress =
      orderType === "delivery" ? (formData.get("address") as string) : "Collection";
    const specialInstructions = (formData.get("instructions") as string) || undefined;
    
    try {
      const orderId = await createOrder({
        customerName,
        customerEmail,
        customerPhone,
        items: activeItems.map((item) => ({
          menuItemId: item.id as any,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        deliveryAddress,
        specialInstructions,
        orderType,
      });

      toast.success("Order placed successfully!");
      setOrderSuccessMessage("Order placed successfully! We will contact you shortly.");
      setPlacedOrder({
        orderId: String(orderId),
        placedAt: new Date().toISOString(),
        customerName,
        customerEmail,
        customerPhone,
        orderType,
        deliveryAddress,
        specialInstructions,
        items: activeItems.map((item) => ({ ...item })),
        subtotal,
        deliveryFee,
        total,
      });
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {orderSuccessMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            {orderSuccessMessage}
          </div>
        )}
        {placedOrder && (
          <div className="mb-8 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-orange-100 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Invoice</h2>
                <p className="text-sm text-gray-600">Order ID: {placedOrder.orderId}</p>
                <p className="text-sm text-gray-600">
                  Placed At: {new Date(placedOrder.placedAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right text-sm text-gray-700">
                <p className="font-semibold">{placedOrder.customerName}</p>
                <p>{placedOrder.customerEmail}</p>
                <p>{placedOrder.customerPhone}</p>
                <p className="mt-1 font-medium">
                  {placedOrder.orderType === "delivery" ? "Delivery" : "Collection"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {placedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-orange-100 pt-4 text-sm space-y-1">
              {placedOrder.orderType === "delivery" && (
                <p className="text-gray-700">
                  <span className="font-medium">Delivery Address:</span> {placedOrder.deliveryAddress}
                </p>
              )}
              {placedOrder.specialInstructions && (
                <p className="text-gray-700">
                  <span className="font-medium">Instructions:</span>{" "}
                  {placedOrder.specialInstructions}
                </p>
              )}
              <div className="pt-2">
                <p className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{formatCurrency(placedOrder.subtotal)}</span>
                </p>
                <p className="flex justify-between text-gray-700">
                  <span>{placedOrder.orderType === "delivery" ? "Delivery Fee" : "Collection"}</span>
                  <span>
                    {placedOrder.orderType === "delivery"
                      ? formatCurrency(placedOrder.deliveryFee)
                      : "FREE"}
                  </span>
                </p>
                <p className="mt-1 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-600">{formatCurrency(placedOrder.total)}</span>
                </p>
              </div>
            </div>
          </div>
        )}
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
              
              {activeItems.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🛒</span>
                  <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
                  <p className="text-gray-500">Add some delicious items to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeItems.map((item) => (
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
                            type="button"
                            disabled={isOrderLocked}
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 bg-white rounded-full font-bold text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={isOrderLocked}
                            onClick={() =>
                              onUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 bg-white rounded-full font-bold text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          type="button"
                          disabled={isOrderLocked}
                          onClick={() => onUpdateQuantity(item.id, 0)}
                          className="text-red-600 hover:text-red-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeItems.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  Delivery Details
                </h2>
                
                <div className="mb-6">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      disabled={isOrderLocked}
                      onClick={() => setOrderType("delivery")}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        orderType === "delivery"
                          ? "bg-gradient-to-r from-orange-500 to-red-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      🚚 Delivery
                    </button>
                    <button
                      type="button"
                      disabled={isOrderLocked}
                      onClick={() => setOrderType("collection")}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
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
                      disabled={isOrderLocked}
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
                      disabled={isOrderLocked}
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
                      disabled={isOrderLocked}
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
                        disabled={isOrderLocked}
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
                      disabled={isOrderLocked}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                      placeholder="Any special requests or dietary requirements?"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || activeItems.length === 0 || isOrderLocked}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isOrderLocked
                      ? "Order Completed"
                      : isSubmitting
                        ? "Placing Order..."
                        : "Place Order"}
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
