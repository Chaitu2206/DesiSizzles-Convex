import { type FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInForm } from "../SignInForm";
import { SignOutButton } from "../SignOutButton";
import { toast } from "sonner";
import {
  additionalMenuItemsByCategory,
  posterAdditionsByCategory,
  zomatoSections,
} from "./MenuPage";

type NewMenuItemForm = {
  name: string;
  description: string;
  category: string;
  price: string;
  isVegetarian: boolean;
  isVegan: boolean;
  spiceLevel: string;
  imageUrl: string;
  available: boolean;
};

const defaultNewItem: NewMenuItemForm = {
  name: "",
  description: "",
  category: "Starters",
  price: "",
  isVegetarian: true,
  isVegan: false,
  spiceLevel: "Medium",
  imageUrl: "",
  available: true,
};

type AdminMenuItem = {
  _id?: string;
  key: string;
  name: string;
  description: string;
  category: string;
  menuSection?: string;
  price: number;
  isVegetarian: boolean;
  isVegan: boolean;
  spiceLevel: string;
  imageUrl?: string;
  available: boolean;
  isDb: boolean;
};

export default function AdminPage() {
  const user = useQuery(api.auth.loggedInUser);
  const isAdmin = useQuery(api.admin.isAdmin);
  const adminAccessInfo = useQuery(api.admin.adminAccessInfo);
  const orders = useQuery(api.admin.listAllOrders, isAdmin ? {} : "skip");
  const menuItems = useQuery(api.admin.listAllMenuItems, isAdmin ? {} : "skip");

  const addMenuItem = useMutation(api.admin.addMenuItem);
  const upsertMenuItemFromAdmin = useMutation(api.admin.upsertMenuItemFromAdmin);

  const [newItem, setNewItem] = useState<NewMenuItemForm>(defaultNewItem);
  const [priceEdits, setPriceEdits] = useState<Record<string, string>>({});
  const [sectionEdits, setSectionEdits] = useState<Record<string, string>>({});
  const [menuSearch, setMenuSearch] = useState("");

  const sortedMenuItems = useMemo(() => {
    const merged = new Map<string, AdminMenuItem>();
    const makeKey = (category: string, name: string) =>
      `${category.toLowerCase()}::${name.trim().toLowerCase()}`;

    for (const [category, items] of Object.entries(additionalMenuItemsByCategory)) {
      for (const item of items) {
        merged.set(makeKey(category, item.name), {
          key: item._id,
          name: item.name,
          description: item.description,
          category,
          menuSection: undefined,
          price: item.price,
          isVegetarian: item.isVegetarian,
          isVegan: item.isVegan,
          spiceLevel: item.spiceLevel,
          imageUrl: item.imageUrl,
          available: true,
          isDb: false,
        });
      }
    }

    for (const [category, items] of Object.entries(posterAdditionsByCategory)) {
      for (const item of items) {
        merged.set(makeKey(category, item.name), {
          key: item._id,
          name: item.name,
          description: item.description,
          category,
          menuSection: undefined,
          price: item.price,
          isVegetarian: item.isVegetarian,
          isVegan: item.isVegan,
          spiceLevel: item.spiceLevel,
          imageUrl: item.imageUrl,
          available: true,
          isDb: false,
        });
      }
    }

    for (const item of menuItems ?? []) {
      merged.set(makeKey(item.category, item.name), {
        _id: item._id,
        key: item._id,
        name: item.name,
        description: item.description,
        category: item.category,
        menuSection: item.menuSection,
        price: item.price,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        spiceLevel: item.spiceLevel,
        imageUrl: item.imageUrl,
        available: item.available,
        isDb: true,
      });
    }

    return Array.from(merged.values()).sort((a, b) => {
      if (a.category === b.category) return a.name.localeCompare(b.name);
      return a.category.localeCompare(b.category);
    });
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    const query = menuSearch.trim().toLowerCase();
    if (!query) return sortedMenuItems;
    return sortedMenuItems.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.menuSection ?? "").toLowerCase().includes(query)
      );
    });
  }, [menuSearch, sortedMenuItems]);

  const formatScheduledSlot = (scheduledDate?: string, scheduledTime?: string) => {
    const rawDate = scheduledDate?.trim();
    const rawTime = scheduledTime?.trim();

    let formattedDate = "Date not set";
    if (rawDate) {
      const parsed = new Date(`${rawDate}T00:00:00`);
      formattedDate = Number.isNaN(parsed.getTime())
        ? rawDate
        : parsed.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
    }

    let formattedTime = "Time not set";
    if (rawTime) {
      formattedTime = rawTime.toLowerCase() === "asap" ? "ASAP" : rawTime;
    }

    return `${formattedDate}, ${formattedTime}`;
  };

  if (user === undefined || isAdmin === undefined) {
    return <div className="py-12 text-center text-gray-600">Loading admin...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Admin Login</h2>
        <p className="text-gray-600 mb-6">Sign in with your admin account to continue.</p>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <SignInForm />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
        <p className="text-gray-600 mb-6">
          Your account is signed in but does not have admin privileges.
        </p>
        {adminAccessInfo && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <p className="font-semibold mb-2">Debug Info</p>
            <p>Signed in: {String(adminAccessInfo.signedIn)}</p>
            <p>
              Detected account emails:{" "}
              {adminAccessInfo.emails.length > 0
                ? adminAccessInfo.emails.join(", ")
                : "none"}
            </p>
            <p>
              Configured admin emails:{" "}
              {adminAccessInfo.configuredAdmins.length > 0
                ? adminAccessInfo.configuredAdmins.join(", ")
                : "none"}
            </p>
          </div>
        )}
        <SignOutButton />
      </div>
    );
  }

  const handleAddMenuItem = async (e: FormEvent) => {
    e.preventDefault();
    const parsedPrice = Number(newItem.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Enter a valid price.");
      return;
    }
    try {
      await addMenuItem({
        name: newItem.name.trim(),
        description: newItem.description.trim(),
        category: newItem.category.trim(),
        price: parsedPrice,
        isVegetarian: newItem.isVegetarian,
        isVegan: newItem.isVegan,
        spiceLevel: newItem.spiceLevel.trim(),
        imageUrl: newItem.imageUrl.trim() || undefined,
        available: newItem.available,
      });
      setNewItem(defaultNewItem);
      toast.success("Menu item added.");
    } catch {
      toast.error("Failed to add menu item.");
    }
  };

  const handleSavePrice = async (itemId: string) => {
    const target = sortedMenuItems.find((item) => item.key === itemId);
    if (!target) return;
    const parsedPrice = Number(priceEdits[itemId] ?? target.price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Enter a valid price.");
      return;
    }
    try {
      await upsertMenuItemFromAdmin({
        id: target._id as any,
        name: target.name,
        description: target.description,
        category: target.category,
        menuSection: sectionEdits[itemId] ?? target.menuSection,
        menuOrder: undefined,
        price: parsedPrice,
        isVegetarian: target.isVegetarian,
        isVegan: target.isVegan,
        spiceLevel: target.spiceLevel,
        imageUrl: target.imageUrl,
        available: target.available,
      });
      setPriceEdits((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      toast.success("Price updated.");
    } catch {
      toast.error("Failed to update price.");
    }
  };

  const handleToggleAvailability = async (itemId: string, currentValue: boolean) => {
    const target = sortedMenuItems.find((item) => item.key === itemId);
    if (!target) return;
    try {
      await upsertMenuItemFromAdmin({
        id: target._id as any,
        name: target.name,
        description: target.description,
        category: target.category,
        menuSection: sectionEdits[itemId] ?? target.menuSection,
        menuOrder: undefined,
        price: Number(priceEdits[itemId] ?? target.price),
        isVegetarian: target.isVegetarian,
        isVegan: target.isVegan,
        spiceLevel: target.spiceLevel,
        imageUrl: target.imageUrl,
        available: !currentValue,
      });
      toast.success(currentValue ? "Menu item removed." : "Menu item restored.");
    } catch {
      toast.error("Failed to update item.");
    }
  };

  const handleSaveSection = async (itemId: string) => {
    const target = sortedMenuItems.find((item) => item.key === itemId);
    if (!target) return;
    const menuSection = sectionEdits[itemId] ?? target.menuSection ?? "";
    if (!menuSection) {
      toast.error("Select a section first.");
      return;
    }
    try {
      await upsertMenuItemFromAdmin({
        id: target._id as any,
        name: target.name,
        description: target.description,
        category: target.category,
        menuSection,
        menuOrder: undefined,
        price: Number(priceEdits[itemId] ?? target.price),
        isVegetarian: target.isVegetarian,
        isVegan: target.isVegan,
        spiceLevel: target.spiceLevel,
        imageUrl: target.imageUrl,
        available: target.available,
      });
      toast.success("Section updated.");
    } catch {
      toast.error("Failed to update section.");
    }
  };

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage orders and menu items.</p>
          </div>
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Placed Orders</h2>
          <div className="space-y-4 max-h-[460px] overflow-auto pr-1">
            {(orders ?? []).map((order) => (
              <div key={order._id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.customerEmail}</p>
                    <p className="text-sm text-gray-600">{order.customerPhone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-orange-700">GBP {order.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{new Date(order._creationTime).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{order.orderType}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-700">
                  {order.items.map((item) => (
                    <p key={`${order._id}-${item.menuItemId}`}>{item.name} x{item.quantity}</p>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-medium">Address:</span> {order.deliveryAddress}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">
                    {order.orderType === "delivery" ? "Delivery:" : "Pickup:"}
                  </span>{" "}
                  {formatScheduledSlot(order.scheduledDate, order.scheduledTime)}
                </p>
                {order.specialInstructions && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Instructions:</span> {order.specialInstructions}
                  </p>
                )}
              </div>
            ))}
            {orders?.length === 0 && (
              <p className="text-gray-600">No orders yet.</p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Menu Item</h2>
            <form className="space-y-3" onSubmit={handleAddMenuItem}>
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Name"
                value={newItem.name}
                onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Category"
                value={newItem.category}
                onChange={(e) => setNewItem((prev) => ({ ...prev, category: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Price"
                type="number"
                min="0"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem((prev) => ({ ...prev, price: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Spice Level"
                value={newItem.spiceLevel}
                onChange={(e) => setNewItem((prev) => ({ ...prev, spiceLevel: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Image URL (optional)"
                value={newItem.imageUrl}
                onChange={(e) => setNewItem((prev) => ({ ...prev, imageUrl: e.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={newItem.isVegetarian}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, isVegetarian: e.target.checked }))
                  }
                />
                Vegetarian
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={newItem.isVegan}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, isVegan: e.target.checked }))}
                />
                Vegan
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={newItem.available}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, available: e.target.checked }))}
                />
                Available
              </label>
              <button
                type="submit"
                className="w-full rounded-lg bg-orange-600 text-white font-semibold py-2 hover:bg-orange-700"
              >
                Add Item
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Menu</h2>
            <input
              type="text"
              placeholder="Search item or category..."
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
            />
            <div className="space-y-3 max-h-[620px] overflow-auto pr-1">
              {filteredMenuItems.map((item) => (
                <div key={item.key} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                      <p className="text-xs text-gray-500">{item.available ? "Active" : "Removed"}</p>
                      <p className="text-xs text-gray-500">{item.isDb ? "Database item" : "Local item (save to persist)"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(item.key, item.available)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        item.available
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {item.available ? "Remove" : "Restore"}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-32 rounded border border-gray-300 px-2 py-1 text-sm"
                      value={priceEdits[item.key] ?? item.price.toFixed(2)}
                      onChange={(e) =>
                        setPriceEdits((prev) => ({ ...prev, [item.key]: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleSavePrice(item.key)}
                      className="px-3 py-1 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 text-sm font-medium"
                    >
                      Save Menu
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <select
                      className="rounded border border-gray-300 px-2 py-1 text-sm"
                      value={sectionEdits[item.key] ?? item.menuSection ?? ""}
                      onChange={(e) =>
                        setSectionEdits((prev) => ({ ...prev, [item.key]: e.target.value }))
                      }
                    >
                      <option value="">Auto Select</option>
                      {zomatoSections
                        .filter((section) => !/non veg/i.test(section))
                        .map((section) => (
                          <option key={section} value={section}>
                            {section}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleSaveSection(item.key)}
                      className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium"
                    >
                      Move Section
                    </button>
                  </div>
                </div>
              ))}
              {filteredMenuItems.length === 0 && (
                <p className="text-sm text-gray-600">No menu items found for this search.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
