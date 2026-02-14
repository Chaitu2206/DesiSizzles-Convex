import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type HomePageProps = {
  onNavigate: (page: "home" | "menu" | "catering" | "contact" | "order") => void;
  onAddToCart: (item: { id: string; name: string; price: number }) => void;
};

const heroImage =
  "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1800";

const storyImage =
  "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200";

const trayImage =
  "https://images.pexels.com/photos/7353387/pexels-photo-7353387.jpeg?auto=compress&cs=tinysrgb&w=1200";

export default function HomePage({ onNavigate, onAddToCart }: HomePageProps) {
  const menuItems = useQuery(api.menu.listMenuItems);

  const featuredItems = menuItems
    ? Object.values(menuItems)
        .flat()
        .slice(0, 4)
    : [];

  return (
    <div className="bg-[#f6f0e6] text-[#1f1a15]">
      <section className="relative min-h-[70vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Indian street food spread"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1f1a15]/85 via-[#1f1a15]/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="uppercase tracking-[0.35em] text-sm text-[#f4d7b8] mb-5">
              Desi Sizzles House
            </p>
            <h1 className="font-['Georgia'] text-5xl sm:text-6xl leading-tight text-white">
              Street-side flavours, served with a proper restaurant finish.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-[#f7e6d2] max-w-2xl">
              Inspired by bustling Indian street kitchens and designed for relaxed dining,
              family tables, and quick comfort cravings.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate("menu")}
                className="px-8 py-3 bg-[#f08a24] text-white font-semibold rounded-full hover:bg-[#dc7820] transition-colors"
              >
                Explore Menu
              </button>
              <button
                onClick={() => onNavigate("order")}
                className="px-8 py-3 border border-[#f7e6d2] text-[#f7e6d2] font-semibold rounded-full hover:bg-white/10 transition-colors"
              >
                Order Online
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-[#f6f0e6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <img src={storyImage} alt="Traditional Indian food" className="w-full h-[380px] object-cover" />
          </div>
          <div>
            <p className="uppercase tracking-[0.25em] text-xs text-[#8b5e34] mb-3">
              Our Kitchen Story
            </p>
            <h2 className="font-['Georgia'] text-4xl sm:text-5xl leading-tight mb-6">
              Rooted in tradition, built for today.
            </h2>
            <p className="text-[#4e463f] text-lg leading-relaxed">
              Every dish starts from classic regional bases and is tuned for vibrant,
              balanced flavour. We keep the spirit of Indian home cooking, then finish with
              street-food energy.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/80 border border-[#e6dac8] rounded-2xl p-4">
                <p className="font-semibold text-[#2b241d]">Freshly cooked batches</p>
                <p className="text-sm text-[#5f574f] mt-1">No stale prep, no shortcuts.</p>
              </div>
              <div className="bg-white/80 border border-[#e6dac8] rounded-2xl p-4">
                <p className="font-semibold text-[#2b241d]">Family-friendly spice levels</p>
                <p className="text-sm text-[#5f574f] mt-1">Comfortable for every table.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-[#efe4d1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="uppercase tracking-[0.25em] text-xs text-[#8b5e34] mb-2">
                Favourites
              </p>
              <h2 className="font-['Georgia'] text-3xl sm:text-4xl">
                Signature Picks
              </h2>
            </div>
            <button
              onClick={() => onNavigate("menu")}
              className="text-[#8b5e34] font-semibold hover:text-[#6f4b2a] transition-colors"
            >
              View Full Menu
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#e4d6c1] divide-y divide-[#eadfce]">
            {featuredItems.map((item) => (
              <div key={item._id} className="p-5 sm:p-6 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded border-2 text-[10px] font-bold ${
                        item.isVegetarian
                          ? "border-green-600 text-green-600"
                          : "border-red-600 text-red-600"
                      }`}
                    >
                      {item.isVegetarian ? "V" : "NV"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#221b15] leading-tight">{item.name}</h3>
                  <p className="text-[#d46f1b] font-bold text-2xl mt-1">£{item.price.toFixed(2)}</p>
                  <p className="text-[#5f574f] text-base mt-3">{item.description}</p>
                </div>
                <div className="w-32 shrink-0 flex items-start justify-end">
                  <button
                    onClick={() =>
                      onAddToCart({
                        id: item._id,
                        name: item.name,
                        price: item.price,
                      })
                    }
                    className="w-28 bg-white border border-gray-300 rounded-xl shadow-sm text-green-600 font-extrabold text-2xl leading-none py-2 hover:shadow-md transition-all"
                  >
                    ADD
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-[#123b3b] text-[#f8f2e7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="uppercase tracking-[0.25em] text-xs text-[#f3c78f] mb-3">
              Catering & Events
            </p>
            <h2 className="font-['Georgia'] text-4xl sm:text-5xl leading-tight mb-5">
              Bring Desi Sizzles to your next celebration.
            </h2>
            <p className="text-[#d8c6ae] text-lg">
              From house parties to corporate lunches, we can curate a menu that fits your
              event size, dietary preferences, and spice profile.
            </p>
            <button
              onClick={() => onNavigate("catering")}
              className="mt-8 px-8 py-3 bg-[#f08a24] text-white font-semibold rounded-full hover:bg-[#dc7820] transition-colors"
            >
              Plan Catering
            </button>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <img src={trayImage} alt="Catering spread" className="w-full h-[340px] object-cover" />
          </div>
        </div>
      </section>
    </div>
  );
}
