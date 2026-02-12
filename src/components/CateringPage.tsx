import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, FormEvent } from "react";
import { toast } from "sonner";

export default function CateringPage() {
  const createCateringRequest = useMutation(api.inquiries.createCateringRequest);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      await createCateringRequest({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        eventDate: formData.get("eventDate") as string,
        guestCount: parseInt(formData.get("guestCount") as string),
        eventType: formData.get("eventType") as string,
        menuPreferences: formData.get("menuPreferences") as string,
        specialRequirements: formData.get("specialRequirements") as string || undefined,
      });

      toast.success("Catering request submitted! We'll contact you soon.");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Catering Services
          </h1>
          <p className="text-xl text-gray-600">
            Make your event memorable with authentic Indian cuisine
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white mb-8">
              <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <strong>Authentic Flavors</strong>
                    <p className="text-orange-100">
                      Traditional recipes prepared by experienced chefs
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <strong>Flexible Menus</strong>
                    <p className="text-orange-100">
                      Customizable options for all dietary requirements
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <strong>Professional Service</strong>
                    <p className="text-orange-100">
                      On-time delivery and setup for your event
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <strong>Competitive Pricing</strong>
                    <p className="text-orange-100">
                      Quality food at affordable rates
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Perfect For
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <span className="text-3xl mb-2 block">🎉</span>
                  <p className="font-semibold text-gray-900">Parties</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <span className="text-3xl mb-2 block">💼</span>
                  <p className="font-semibold text-gray-900">Corporate Events</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <span className="text-3xl mb-2 block">💒</span>
                  <p className="font-semibold text-gray-900">Weddings</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <span className="text-3xl mb-2 block">🎂</span>
                  <p className="font-semibold text-gray-900">Celebrations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              Request a Quote
            </h2>
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  name="eventDate"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Guests *
                </label>
                <input
                  type="number"
                  name="guestCount"
                  required
                  min="10"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Type *
                </label>
                <select
                  name="eventType"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                >
                  <option value="">Select event type</option>
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday Party</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="religious">Religious Ceremony</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Menu Preferences *
                </label>
                <textarea
                  name="menuPreferences"
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  placeholder="Tell us about your menu preferences (vegetarian, non-vegetarian, specific dishes, etc.)"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Requirements
                </label>
                <textarea
                  name="specialRequirements"
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  placeholder="Any allergies, dietary restrictions, or special requests?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Request Quote"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
