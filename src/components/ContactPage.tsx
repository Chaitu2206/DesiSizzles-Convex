import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, FormEvent } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const createInquiry = useMutation(api.inquiries.createInquiry);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      await createInquiry({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        message: formData.get("message") as string,
        inquiryType: formData.get("inquiryType") as string,
      });

      toast.success("Message sent! We'll get back to you soon.");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Contact Us</h1>
          <p className="text-xl text-gray-600">
            We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white mb-8">
              <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Location</h3>
                    <p className="text-orange-100">
                      Crawley, West Sussex<br />
                      United Kingdom
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Phone</h3>
                    <p className="text-orange-100">01293 XXX XXX</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">✉️</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Email</h3>
                    <p className="text-orange-100">info@desisizzles.co.uk</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🕐</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Opening Hours</h3>
                    <p className="text-orange-100">
                      Tuesday - Sunday: 5:00 PM - 10:00 PM<br />
                      Monday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Find Us
              </h3>
              <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                <p className="text-gray-500">Map placeholder - Crawley, West Sussex</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              Send Us a Message
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
                  Inquiry Type *
                </label>
                <select
                  name="inquiryType"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                >
                  <option value="">Select inquiry type</option>
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Question</option>
                  <option value="catering">Catering</option>
                  <option value="feedback">Feedback</option>
                  <option value="complaint">Complaint</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
