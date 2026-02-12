import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function SeedMenu() {
  const seedMenuItems = useMutation(api.seedData.seedMenuItems);
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState("");

  const handleSeed = async () => {
    setIsSeeding(true);
    setMessage("");
    try {
      const result = await seedMenuItems({});
      setMessage(result.message);
    } catch (error) {
      setMessage("Error seeding menu");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border-2 border-orange-500">
      <p className="text-sm font-semibold mb-2">Admin: Seed Menu</p>
      <button
        onClick={handleSeed}
        disabled={isSeeding}
        className="bg-orange-500 text-white px-4 py-2 rounded font-semibold hover:bg-orange-600 disabled:opacity-50 text-sm"
      >
        {isSeeding ? "Seeding..." : "Seed Menu Data"}
      </button>
      {message && (
        <p className="text-xs mt-2 text-gray-600">{message}</p>
      )}
    </div>
  );
}
