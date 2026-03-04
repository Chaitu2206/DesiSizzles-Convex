import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type MenuPageProps = {
  onAddToCart: (item: { id: string; name: string; price: number }) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  cartItems: Array<{ id: string; quantity: number }>;
  onNavigateToOrder: () => void;
};

type ExtraMenuItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  menuSection?: string;
  menuOrder?: number;
  isVegetarian: boolean;
  isVegan: boolean;
  spiceLevel: string;
  imageUrl?: string;
};

const normalizeItemName = (name: string) =>
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]/g, "");

const foodImage = (query: string) =>
  `https://loremflickr.com/640/480/${encodeURIComponent(query)}/all`;

const pexelsImage = (id: string) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;

const premiumImageRules: Array<{ pattern: RegExp; imageId: string }> = [
  { pattern: /(biryani|biryani)/i, imageId: "34159106" },
  { pattern: /(pulao|pulao|rice|jeera|vangi|fried rice|sambar rice)/i, imageId: "30748997" },
  { pattern: /(noodles|hakka)/i, imageId: "8108059" },
  { pattern: /(pani puri)/i, imageId: "34270741" },
  { pattern: /(paneer tikka)/i, imageId: "34541595" },
  { pattern: /(paneer|kadai|palak|chettinad|makhani)/i, imageId: "30858420" },
  { pattern: /(samosa)/i, imageId: "28075291" },
  { pattern: /(pakodi|pakora)/i, imageId: "29547418" },
  { pattern: /(vada|wada paav|vada pav)/i, imageId: "15017417" },
  { pattern: /(bajji|bonda|mirchi)/i, imageId: "8585763" },
  { pattern: /(curry|masala|pulusu|fry|dal|sambar|chole|kofta|brinjal|bhindi|gutti|aritikay|dondakay|chikkudukay|majjiga)/i, imageId: "29684990" },
  { pattern: /(coffee)/i, imageId: "8469498" },
  { pattern: /(tea|chai|hot chocolate)/i, imageId: "5946612" },
  { pattern: /(lassi|mango lassi|sweet lassi|salt lassi)/i, imageId: "14509267" },
  { pattern: /(rose milk)/i, imageId: "17200460" },
  { pattern: /(7up|pepsi|ginger beer|lemonade|rio|rubicon|tango|fruit shoot|soft drink|cola)/i, imageId: "13599792" },
];

const categoryImageByName: Record<string, string> = {
  Starters: pexelsImage("34270741"),
  Curries: pexelsImage("29684990"),
  "Rice Dishes": pexelsImage("34159106"),
  "Hot Beverages": pexelsImage("5946612"),
  "Cold Beverages": pexelsImage("14509267"),
};

const getPremiumImageForItem = (
  itemName: string,
  sectionName: string,
  fallbackImage?: string,
) => {
  for (const rule of premiumImageRules) {
    if (rule.pattern.test(itemName)) {
      return pexelsImage(rule.imageId);
    }
  }
  return categoryImageByName[sectionName] ?? fallbackImage ?? pexelsImage("29684990");
};

const linkItem = (
  id: string,
  name: string,
  description: string,
  price: number,
  imageQuery: string,
  options?: Partial<Pick<ExtraMenuItem, "isVegetarian" | "isVegan" | "spiceLevel">>,
): ExtraMenuItem => ({
  _id: id,
  name,
  description,
  price,
  isVegetarian: options?.isVegetarian ?? true,
  isVegan: options?.isVegan ?? false,
  spiceLevel: options?.spiceLevel ?? "Medium",
  imageUrl: foodImage(imageQuery),
});

type MenuItemLike = {
  _id: string;
  name: string;
  description: string;
  price: number;
  menuSection?: string;
  menuOrder?: number;
  isVegetarian: boolean;
  isVegan: boolean;
  spiceLevel: string;
  imageUrl?: string;
};

export const zomatoSections = [
  "Soups",
  "Veg Starters",
  "Non Veg Starters",
  "Veg Main Course",
  "Non Veg Main Course",
  "Breads",
  "Rice And Biryani",
  "Veg Fried Rice",
  "Non Veg Fried Rice",
  "Veg Noodles",
  "Non Veg Noodles",
  "Snacks",
  "Accompaniment",
  "Desserts",
  "Hot Beverages",
  "Cold Beverages",
] as const;

const getZomatoSectionForItem = (item: MenuItemLike): (typeof zomatoSections)[number] => {
  if (item.menuSection && zomatoSections.includes(item.menuSection as any)) {
    return item.menuSection as (typeof zomatoSections)[number];
  }
  const name = item.name.toLowerCase();

  if (/(coffee|tea|hot chocolate)/i.test(name)) return "Hot Beverages";
  if (
    /(lassi|rose milk|7up|pepsi|lemonade|ginger beer|rio|rubicon|tango|fruit shoot|cola|soft drink)/i.test(
      name,
    )
  )
    return "Cold Beverages";
  if (/(rasam|soup|tom yum|lung fung|manchow|hot.?sour|cantonese)/i.test(name))
    return "Soups";
  if (/(raita|raitha|chutney|papad|papadum|sauce|accompaniment)/i.test(name))
    return "Accompaniment";
  if (/(naan|roti|chapathi|chapati|paratha|kulcha)/i.test(name)) return "Breads";
  if (/(fried rice|schezwan fried rice|manchurian fried rice)/i.test(name))
    return item.isVegetarian ? "Veg Fried Rice" : "Non Veg Fried Rice";
  if (/(noodles|hakka)/i.test(name))
    return item.isVegetarian ? "Veg Noodles" : "Non Veg Noodles";
  if (/(biryani|pulao|pulav|bath|rice)/i.test(name)) return "Rice And Biryani";
  if (/(jamun|kesari|dessert|ice cream|halwa)/i.test(name)) return "Desserts";
  if (
    /(pani puri|samosa|vada|bonda|bajji|pakodi|pakora|fries|roll|omelette|corn vada)/i.test(
      name,
    )
  )
    return "Snacks";

  const isStarterLike =
    /(65|manchurian|majestic|chilli|dragon|tikka|wings|devil|chukka|kurkure|starter|fry)/i.test(
      name,
    );
  if (item.isVegetarian) return isStarterLike ? "Veg Starters" : "Veg Main Course";
  return isStarterLike ? "Non Veg Starters" : "Non Veg Main Course";
};

const additionalStarters: ExtraMenuItem[] = [
  {
    _id: "custom-mirchi-bajji",
    name: "Mirchi Bajji",
    description: "Fried snack made with gram flour, spices and green chilies",
    price: 6,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("mirchi bajji indian snack"),
  },
  {
    _id: "custom-onion-pakodi",
    name: "Onion pakodi (VG)",
    description: "Fritters made with gram flour, onions, basic herbs and spices",
    price: 5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("onion pakoda"),
  },
  {
    _id: "custom-punjabi-aloo-samosa",
    name: "Punjabi Aloo samosa (V)",
    description:
      "Fried pastry with a savoury filling, including ingredients such as spiced potatoes, onions, peas",
    price: 4,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("aloo samosa"),
  },
  {
    _id: "custom-munta-masala",
    name: "Munta Masala (V)",
    description:
      "Puffed rice mixed with traditional Andhra masalas and mirchi bajji",
    price: 4,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("puffed rice masala"),
  },
  {
    _id: "custom-wada-paav",
    name: "Wada Paav (V)",
    description: "Deep fried Potato dumpling served inside bread bun",
    price: 3,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("vada pav"),
  },
  {
    _id: "custom-honey-chilly-potato",
    name: "Honey Chilly Potato (V)",
    description:
      "Potatoes tossed in honey, slightly sweet, spicy, hot and tangy chilli sauce",
    price: 5.5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("honey chilli potato"),
  },
  {
    _id: "custom-raw-banana-bajji",
    name: "Raw banana bajji (VG)",
    description: "Fried snack made with gram flour, spices and Raw banana",
    price: 6,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("raw banana bajji"),
  },
  {
    _id: "custom-egg-bonda",
    name: "Egg Bonda",
    description: "Fried snack made with gram flour, spices and Egg",
    price: 6,
    isVegetarian: false,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("egg bonda"),
  },
  {
    _id: "custom-babycorn-manchuria",
    name: "Babycorn manchuria (VG)",
    description: "Crispy fired babycorn in a spicy, hot and tangy chilli sauce",
    price: 5.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("babycorn manchurian"),
  },
  {
    _id: "custom-paneer-kurkure",
    name: "Paneer kurkure (V)",
    description: "Crispy fried paneer (cottage cheese) coated with herbs & spices",
    price: 5.5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("paneer starter"),
  },
  {
    _id: "custom-pani-puri",
    name: "Pani Puri (VG)",
    description:
      "Panipuri consists of a round hollow puri (a deep-fried crisp flatbread), filled with flavorful water and fillings",
    price: 3,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("pani puri"),
  },
  {
    _id: "custom-cut-mirchi",
    name: "Cut mirchi (VG)",
    description: "Fried snack made with gram flour, spices and green chilies",
    price: 6,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("cut mirchi"),
  },
];

const additionalCurries: ExtraMenuItem[] = [
  {
    _id: "custom-dondakay-fry",
    name: "Dondakay Fry",
    description: "Crispy Ivy Gourd Fry cooked with a blend of spices",
    price: 5.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("dondakaya fry"),
  },
  {
    _id: "custom-egg-curry",
    name: "Egg Curry",
    description:
      "Dish made with hard boiled eggs, onions, tomatoes, whole and ground spices",
    price: 5,
    isVegetarian: false,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("egg curry indian"),
  },
  {
    _id: "custom-aritikay-fry",
    name: "Aritikay Fry",
    description: "Crispy Plantain Fry cooked with a blend of spices",
    price: 5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("raw banana fry"),
  },
  {
    _id: "custom-mix-veg-dry",
    name: "Mix Veg Dry (V) (VG)",
    description: "Dish made with choice of vegetables (Carrot, Beans & Potatoes)",
    price: 4.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("mixed vegetable dry"),
  },
  {
    _id: "custom-chikkudukay-masala",
    name: "Chikkudukay Masala",
    description: "Dish made with Broad beans cooked with tomatoes and spices",
    price: 5.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("broad beans curry"),
  },
  {
    _id: "custom-egg-kheema-masala",
    name: "Egg Kheema Masala",
    description:
      "Dish made with scrambled eggs, onions, tomatoes, whole and ground spices",
    price: 5.5,
    isVegetarian: false,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("egg kheema masala"),
  },
  {
    _id: "custom-dal-fry",
    name: "Dal Fry (V) (VG)",
    description: "Dish made with lentils (toor dal), onions, tomatoes, spices and herbs",
    price: 4,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("dal fry"),
  },
  {
    _id: "custom-drumstik-kaju-masala",
    name: "Drumstik Kaju Masala",
    description: "Dish made with Drumsticks & cashew nuts in a creamy cashew gravy",
    price: 5.5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("drumstick curry indian"),
  },
  {
    _id: "custom-paneer-chettinad",
    name: "Paneer Chettinad",
    description: "Dish made with Paneer cooked in chettinad masala",
    price: 5.5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("paneer chettinad"),
  },
  {
    _id: "custom-paneer-tikka-masala",
    name: "Paneer Tikka Masala (V)",
    description:
      "Dish made with cubes of paneer and veggies marinated with yogurt and spices",
    price: 5.5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("paneer tikka masala"),
  },
  {
    _id: "custom-majjiga-pusulu",
    name: "Majjiga Pusulu",
    description: "Buttermilk stew combines tanginess and rich traditional spice notes",
    price: 4.5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Mild",
    imageUrl: foodImage("buttermilk curry indian"),
  },
  {
    _id: "custom-chole-curry",
    name: "Chole Curry (V) (VG)",
    description: "Dish made with chickpeas, onions, tomatoes, plenty of spices and herbs",
    price: 4.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("chole curry"),
  },
  {
    _id: "custom-dal-makhani",
    name: "Dal Makhani (V)",
    description: "Dish made with whole black lentils cooked with butter and cream",
    price: 5.5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Mild",
    imageUrl: foodImage("dal makhani"),
  },
  {
    _id: "custom-mukkala-pulusu",
    name: "Mukkala Pulusu",
    description: "Spicy and tangy vegetable stew cooked in tamarind juice",
    price: 5.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("vegetable pulusu"),
  },
  {
    _id: "custom-potato-fry",
    name: "Potato Fry (VG)",
    description: "Side dish made with fried potatoes, spices and herbs",
    price: 4,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("potato fry indian"),
  },
  {
    _id: "custom-bendakay-fry",
    name: "Bendakay Fry",
    description: "Crispy Okra Fry cooked with a blend of spices",
    price: 5.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("okra fry indian"),
  },
  {
    _id: "custom-aritikay-pulusu",
    name: "Aritikay Pulusu (veg fish curry)",
    description: "Dish made with Plantain cooked in a tamarind based stew",
    price: 5.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("plantain curry"),
  },
  {
    _id: "custom-brinjal-curry",
    name: "Brinjal curry (VG)",
    description: "Dish made with Aubergine, onions, tomatoes, herbs and spices",
    price: 5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("brinjal curry"),
  },
  {
    _id: "custom-sambar",
    name: "Sambar (V) (VG)",
    description: "Lentil and vegetable stew made with lentils, tamarind and spices",
    price: 4,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("sambar"),
  },
  {
    _id: "custom-paneer-butter-masala",
    name: "Paneer Butter Masala (V)",
    description: "Rich and creamy dish made with paneer, onions, tomatoes and spices",
    price: 4.5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Mild",
    imageUrl: foodImage("paneer butter masala"),
  },
  {
    _id: "custom-dahi-bhindi-masala",
    name: "Dahi Bhindi Masala",
    description: "Dish made with Okra cooked in spiced gravy and curd",
    price: 5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("dahi bhindi"),
  },
  {
    _id: "custom-tomato-daal",
    name: "Tomato Daal",
    description:
      "Dish made with lentils (toor dal), cooked in tomato base with authentic spices",
    price: 4,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("tomato dal"),
  },
  {
    _id: "custom-mixed-veg-curry",
    name: "Mixed veg curry (V)",
    description: "Vegetable curry made with mixed vegetables, spices and herbs",
    price: 4.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("mixed veg curry"),
  },
  {
    _id: "custom-aritikay-ulli-karam",
    name: "Aritikay Ulli Karam",
    description: "Dish made with Plantain cooked in special onion masala",
    price: 5.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("raw banana curry indian"),
  },
  {
    _id: "custom-gutti-vankay",
    name: "Gutti Vankay",
    description: "Dish made with tender brinjals stuffed with special spice mixture",
    price: 5.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("gutti vankaya"),
  },
  {
    _id: "custom-paalak-paneer",
    name: "Paalak Paneer",
    description: "Dish made with Paneer cooked in Spinach gravy",
    price: 4.5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Mild",
    imageUrl: foodImage("palak paneer"),
  },
  {
    _id: "custom-brinjal-coriander-curry",
    name: "Brinjal Coriander Curry (VG)",
    description: "Dish made with Aubergine in coriander and chilli base",
    price: 5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("brinjal coriander curry"),
  },
  {
    _id: "custom-chutney-roti-pachadi",
    name: "Chutney (Roti Pachadi)",
    description: "Authentic chutney made with selected range of vegetables",
    price: 3,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("indian chutney"),
  },
  {
    _id: "custom-dal-tadka",
    name: "Dal Tadka (V) (VG)",
    description: "Dal Tadka (lentils) tempered with spices",
    price: 4,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("dal tadka"),
  },
  {
    _id: "custom-malai-kofta",
    name: "Malai Kofta (V)",
    description:
      "Dish of fried balls of potato and paneer in a rich and creamy mild gravy",
    price: 5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Mild",
    imageUrl: foodImage("malai kofta"),
  },
  {
    _id: "custom-aloo-kurma",
    name: "Aloo kurma (VG)",
    description: "Dish of potatoes cooked in a spicy and fragrant curry gravy",
    price: 4,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("aloo kurma"),
  },
  {
    _id: "custom-kadai-paneer",
    name: "Kadai Paneer (V)",
    description:
      "Paneer dish made by cooking paneer and bell peppers in a fragrant kadai masala",
    price: 5.5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("kadai paneer"),
  },
];

const additionalRiceAndBiryani: ExtraMenuItem[] = [
  {
    _id: "custom-fried-aloo-dum-biryani",
    name: "Fried Aloo Dum Biryani",
    description:
      "Aromatic rice dish made with basmati rice, spices and fried potatoes",
    price: 5.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("aloo dum biryani"),
  },
  {
    _id: "custom-jackfruit-biryani",
    name: "Jackfruit Biryani",
    description:
      "Aromatic rice dish made with basmati rice, spices and raw jackfruit",
    price: 6,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("jackfruit biryani"),
  },
  {
    _id: "custom-veg-pulao",
    name: "Veg Pulao (VG)",
    description: "Veg pulao made with rice, vegetables, spices and herbs",
    price: 4.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Mild",
    imageUrl: foodImage("veg pulao"),
  },
  {
    _id: "custom-sambar-rice",
    name: "Sambar Rice (V) (VG)",
    description: "Sambar rice made with lentils, rice, mixed vegetables and spices",
    price: 4,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("sambar rice"),
  },
  {
    _id: "custom-gobi-manchurian-fried-rice",
    name: "Gobi Manchurian Fried Rice (V) (VG)",
    description: "Fried rice made with gobi manchurian pieces and veggies",
    price: 5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("gobi manchurian fried rice"),
  },
  {
    _id: "custom-veg-hakka-noodles",
    name: "Veg Hakka Noodles",
    description: "Hakka noodles cooked with sauces and vegetables",
    price: 4.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("veg hakka noodles"),
  },
  {
    _id: "custom-schezwan-fried-rice",
    name: "Schezwan Fried Rice (V)",
    description:
      "Schezwan fried rice with bursting flavours of ginger, garlic and spices",
    price: 4.5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Hot",
    imageUrl: foodImage("schezwan fried rice"),
  },
  {
    _id: "custom-egg-biryani",
    name: "Egg Biryani",
    description:
      "Aromatic rice dish made with basmati rice, mixed veggies, eggs and herbs",
    price: 6,
    isVegetarian: false,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("egg biryani"),
  },
  {
    _id: "custom-veg-biryani",
    name: "Veg Biryani (V)",
    description:
      "Aromatic rice dish made with basmati rice, mixed veggies, herbs and spices",
    price: 5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("veg biryani"),
  },
  {
    _id: "custom-paneer-makhani-biryani",
    name: "Paneer Makhani Biryani",
    description: "Aromatic rice dish made with basmati rice, paneer and spices",
    price: 6.5,
    isVegetarian: true,
    isVegan: false,
    spiceLevel: "Medium",
    imageUrl: foodImage("paneer biryani"),
  },
  {
    _id: "custom-peas-pulao",
    name: "Peas Pulao (V) (VG)",
    description: "Matar pulao made with rice, peas, onions and aromatic spices",
    price: 4.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Mild",
    imageUrl: foodImage("matar pulao"),
  },
  {
    _id: "custom-vangi-bath",
    name: "Vangi Bath (VG)",
    description: "Basmati rice made with brinjal (aubergine) and aromatic masala",
    price: 4.5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Medium",
    imageUrl: foodImage("vangi bath"),
  },
  {
    _id: "custom-jeera-rice",
    name: "Jeera Rice (VG)",
    description: "Aromatic basmati rice scented with cumin seeds and spices",
    price: 4,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: "Mild",
    imageUrl: foodImage("jeera rice"),
  },
];

const menuFromLinkByCategory: Record<string, ExtraMenuItem[]> = {
  Starters: [
    linkItem(
      "link-veg-soup",
      "Veg Soup",
      "Diced vegetables tossed and finished with veg stock and seasoning",
      4.28,
      "vegetable soup",
      { isVegan: true, spiceLevel: "Mild" },
    ),
    linkItem(
      "link-rasam",
      "Rasam",
      "South Indian soup made with cumin, garlic, ginger and tamarind extract",
      4.28,
      "rasam soup",
      { isVegan: true },
    ),
    linkItem(
      "link-chicken-soup",
      "Chicken Soup",
      "Diced chicken and vegetables with chicken stock and spices",
      4.28,
      "chicken soup",
      { isVegetarian: false, isVegan: false, spiceLevel: "Mild" },
    ),
    linkItem(
      "link-papadum-salad",
      "Papadum & Salad (2pcs)",
      "Fried papadum served with chutney and salsa",
      3.8,
      "papadum salad",
      { isVegan: true, spiceLevel: "None" },
    ),
    linkItem(
      "link-medu-vada",
      "Medu Vada (2pcs)",
      "Deep fried lentil doughnut containing onion and green chilies",
      4.28,
      "medu vada",
      { isVegan: true },
    ),
    linkItem(
      "link-sambar-rasam-vada",
      "Sambar or Rasam Vada (1pcs)",
      "Vada soaked with sambar or rasam",
      5.7,
      "sambar vada",
      { isVegan: true },
    ),
    linkItem(
      "link-gobi-65",
      "Gobi 65",
      "Cauliflower marinated with gram flour and spices and crispy fried",
      7.84,
      "gobi 65",
      { isVegan: true },
    ),
    linkItem(
      "link-gobi-manchurian",
      "Gobi Manchurian",
      "Crispy fried cauliflower coated with tangy sauce",
      7.84,
      "gobi manchurian",
      { isVegan: true },
    ),
    linkItem(
      "link-potato-devilled",
      "Potato Devilled",
      "Deep fried crispy potato coated with tangy chilli sauce",
      7.84,
      "chilli potato",
      { isVegan: true },
    ),
    linkItem(
      "link-chilly-paneer",
      "Chilly Paneer",
      "Diced cottage cheese in crispy fingers with chef spices",
      8.08,
      "chilli paneer",
      { isVegan: false },
    ),
    linkItem(
      "link-paneer-65",
      "Paneer 65",
      "Paneer marinated with gram flour and spices and crispy fried",
      8.08,
      "paneer 65",
      { isVegan: false },
    ),
    linkItem(
      "link-crispy-chilly-idly",
      "Crispy Chilly Idly",
      "South Indian rice cakes cooked with chef special spices",
      8.08,
      "chilli idli",
      { isVegan: true },
    ),
    linkItem(
      "link-chilly-mushroom",
      "Chilly Mushroom",
      "Mushroom cooked with corn flour and chef special spices",
      7.84,
      "chilli mushroom",
      { isVegan: true },
    ),
    linkItem(
      "link-chilly-chicken",
      "Chilly Chicken",
      "Chicken tossed with oriental sauce and green chilies",
      8.31,
      "chilli chicken",
      { isVegetarian: false, isVegan: false },
    ),
    linkItem(
      "link-chicken-wings",
      "Chicken Wings",
      "Spiced chicken wings coated and fried in Indo-Chinese style",
      8.31,
      "chicken wings",
      { isVegetarian: false, isVegan: false },
    ),
    linkItem(
      "link-chicken-65",
      "Chicken 65",
      "Spicy pepper crusted traditional South Indian chicken",
      8.31,
      "chicken 65",
      { isVegetarian: false, isVegan: false, spiceLevel: "Hot" },
    ),
    linkItem(
      "link-chicken-chukka",
      "Chicken Chukka",
      "Diced chicken cooked with onion, garlic, chilies and curry leaves",
      8.31,
      "chicken chukka",
      { isVegetarian: false, isVegan: false },
    ),
    linkItem(
      "link-chicken-manchurian",
      "Chicken Manchurian",
      "Diced chicken deep fried and tossed with tangy Indo-Chinese sauce",
      8.31,
      "chicken manchurian",
      { isVegetarian: false, isVegan: false },
    ),
    linkItem(
      "link-mutton-roll",
      "Mutton Roll (2pcs)",
      "Sri Lankan spicy mutton masala wrapped in filo pastry",
      4.51,
      "mutton roll",
      { isVegetarian: false, isVegan: false },
    ),
    linkItem(
      "link-mutton-chukka",
      "Mutton Chukka",
      "Diced mutton cooked with onion, garlic, fennel and curry leaf",
      9.26,
      "mutton chukka",
      { isVegetarian: false, isVegan: false },
    ),
    linkItem(
      "link-mutton-devil",
      "Mutton Devil",
      "Mutton deep fried and toasted with oriental sauce and chilies",
      9.26,
      "mutton fry",
      { isVegetarian: false, isVegan: false },
    ),
    linkItem(
      "link-nethili-meen-varuval",
      "Nethili Meen Varuval",
      "Lightly coated spicy batter fried anchovies",
      8.31,
      "anchovy fry",
      { isVegetarian: false, isVegan: false },
    ),
    linkItem(
      "link-deviled-squid",
      "Deviled Squid",
      "Spicy marinated deep fried squid with peppers and chilies",
      8.55,
      "devilled squid",
      { isVegetarian: false, isVegan: false },
    ),
    linkItem(
      "link-chilli-prawns",
      "Chilli Prawns",
      "Prawns toasted with oriental sauce and green chilies",
      9.5,
      "chilli prawns",
      { isVegetarian: false, isVegan: false },
    ),
    linkItem(
      "link-papadum",
      "Papadum (1pcs)",
      "Crispy roasted papadum",
      0.95,
      "papadum",
      { isVegan: true, spiceLevel: "None" },
    ),
  ],
  Dosa: [
    linkItem("link-idly-vada", "Idly (2 pcs) and 1 Vada", "Traditional idly with vada", 7.13, "idly vada", { isVegan: true }),
    linkItem("link-idly-3", "Idly (3 pcs)", "Soft steamed rice cakes", 7.13, "idly", { isVegan: true }),
    linkItem("link-idly-mutton-gravy", "3 Idly Mutton Gravy", "Idly served with mutton gravy", 7.36, "idly mutton curry", { isVegetarian: false, isVegan: false }),
    linkItem("link-plain-dosa", "Plain Dosa", "Rice and lentil crepe served with sambar and chutney", 7.13, "plain dosa", { isVegan: true }),
    linkItem("link-masala-dosa", "Masala Dosa", "Dosa stuffed with spiced potatoes", 7.6, "masala dosa", { isVegan: true }),
    linkItem("link-onion-dosa", "Onion Dosa", "Dosa cooked with onion", 7.84, "onion dosa", { isVegan: true }),
    linkItem("link-kal-dosa", "Kal Dosa (2 pcs)", "Small plain dosas with sambar and chutney", 8.08, "kal dosa", { isVegan: true }),
    linkItem("link-mysore-masala-dosa", "Mysore Masala Dosa", "Mysore masala dosa with special chutney spread", 8.31, "mysore masala dosa", { isVegan: true }),
    linkItem("link-chilli-coriander-dosa", "Chilli Coriander Dosa", "Dosa with chopped chilies and coriander", 8.31, "chilli coriander dosa", { isVegan: true }),
    linkItem("link-ghee-roast", "Ghee Roast", "Crispy dosa spread with ghee", 9.03, "ghee roast dosa"),
    linkItem("link-paneer-dosa", "Paneer Dosa", "Dosa stuffed with cottage cheese", 8.79, "paneer dosa"),
    linkItem("link-rava-dosa", "Rava Dosa", "Semolina dosa with chili and coriander", 8.55, "rava dosa"),
    linkItem("link-onion-rava-dosa", "Onion Rava Dosa", "Rava dosa with onion, chili and coriander", 8.79, "onion rava dosa"),
    linkItem("link-onion-rava-masala", "Onion Rava Masala Dosa", "Rava dosa with onion and masala", 9.03, "onion rava masala dosa"),
    linkItem("link-special-uthappam", "Special Uthappam", "Rice pancake with chef special ingredients", 9.03, "uthappam"),
    linkItem("link-onion-tomato-uthappam", "Onion Tomato Uthappam", "Uthappam with onion and tomato", 8.55, "onion tomato uthappam"),
    linkItem("link-chicken-dosa", "Chicken Dosa", "Dosa stuffed with chicken masala", 9.03, "chicken dosa", { isVegetarian: false, isVegan: false }),
    linkItem("link-mutton-dosa", "Mutton Dosa", "Dosa stuffed with mutton masala", 9.5, "mutton dosa", { isVegetarian: false, isVegan: false }),
  ],
  Seafood: [
    linkItem("link-fish-curry-king-fish", "Fish Curry (King Fish)", "South Indian king fish curry with tamarind and coconut milk", 9.03, "king fish curry", { isVegetarian: false, isVegan: false }),
    linkItem("link-nethili-meen-curry", "Nethili Meen Curry", "Anchovies cooked in tamarind and coconut milk curry", 9.03, "anchovy curry", { isVegetarian: false, isVegan: false }),
    linkItem("link-squid-pepper-masala", "Squid Pepper Masala", "Squid rings tossed with spicy onion tomato masala", 9.03, "squid pepper fry", { isVegetarian: false, isVegan: false }),
    linkItem("link-tawa-fish", "Tawa Fish (Dry)", "Spicy marinated king fish grilled with onion and lemon", 9.03, "tawa fish", { isVegetarian: false, isVegan: false }),
    linkItem("link-prawns-chettinadu", "Prawns Chettinadu", "Prawns cooked with chettinad spices", 9.74, "prawns chettinad", { isVegetarian: false, isVegan: false }),
    linkItem("link-chilly-crab-masala", "Chilly Crab Masala", "Crab in South Indian style tangy chilli garlic sauce", 9.74, "crab masala", { isVegetarian: false, isVegan: false }),
  ],
  Poultry: [
    linkItem("link-chicken-curry", "Chicken Curry", "Chicken curry with coconut milk and curry leaves", 8.79, "chicken curry", { isVegetarian: false, isVegan: false }),
    linkItem("link-chicken-khorma", "Chicken Khorma", "Chicken cooked in rich nut sauce", 8.79, "chicken korma", { isVegetarian: false, isVegan: false }),
    linkItem("link-chicken-jalfrezi", "Chicken Jalfrezi", "Chicken with onion, peppers and green chili", 9.26, "chicken jalfrezi", { isVegetarian: false, isVegan: false }),
    linkItem("link-saag-chicken", "Saag Chicken", "Chicken cooked with fresh spinach in rich sauce", 9.26, "saag chicken", { isVegetarian: false, isVegan: false }),
    linkItem("link-chicken-65-butter-masala", "Chicken 65 Butter Masala", "Marinated chicken 65 cooked with masala sauce", 9.26, "chicken 65 masala", { isVegetarian: false, isVegan: false }),
    linkItem("link-chicken-pepper-masala", "Chicken Pepper Masala", "Chicken cooked with onion tomato curry leaves and black pepper", 9.26, "chicken pepper masala", { isVegetarian: false, isVegan: false }),
    linkItem("link-kadai-chicken", "Kadai Chicken", "Chicken cooked with peppers, onion and spicy tomato gravy", 9.26, "kadai chicken", { isVegetarian: false, isVegan: false }),
    linkItem("link-chicken-chettinad", "Chicken Chettinad", "Chicken with chettinad spices of onion, chilli and ginger", 9.26, "chicken chettinad", { isVegetarian: false, isVegan: false }),
  ],
  Meat: [
    linkItem("link-mutton-curry", "Mutton Curry", "Mutton curry made from roasted and ground spices", 9.79, "mutton curry", { isVegetarian: false, isVegan: false }),
    linkItem("link-mutton-pepper-masala", "Mutton Pepper Masala", "Mutton with onion, tomato, curry leaves and black pepper", 9.79, "mutton pepper masala", { isVegetarian: false, isVegan: false }),
    linkItem("link-mutton-chettinad", "Mutton Chettinad", "Mutton with special roasted spice blend and curry leaves", 9.79, "mutton chettinad", { isVegetarian: false, isVegan: false }),
    linkItem("link-kadai-mutton", "Kadai Mutton", "Mutton with peppers, onion and spicy tomato sauce", 9.79, "kadai mutton", { isVegetarian: false, isVegan: false }),
    linkItem("link-saag-mutton", "Saag Mutton", "Cubed mutton cooked with fresh spinach in rich sauce", 9.79, "saag mutton", { isVegetarian: false, isVegan: false }),
    linkItem("link-methi-mutton", "Methi Mutton", "Cubed mutton cooked with fenugreek leaves, cumin and ginger", 9.79, "methi mutton", { isVegetarian: false, isVegan: false }),
  ],
  Curries: [
    linkItem("link-dal-spinach", "Dal Spinach", "Garlic and mustard flavored moong dal with seasonal greens", 8.55, "dal palak", { isVegan: true }),
    linkItem("link-channa-masala", "Channa Masala", "Chickpeas stewed with yogurt and spices", 8.55, "chana masala"),
    linkItem("link-aloo-mutter", "Aloo Mutter", "Garden peas and diced potato in creamy sauce", 8.55, "aloo matar", { isVegan: true }),
    linkItem("link-aloo-capsicum", "Aloo Capsicum", "Diced potato and capsicum with onion tomato masala", 8.55, "aloo capsicum", { isVegan: true }),
  ],
  "Rice & Biryani": [
    linkItem("link-steamed-rice", "Steamed Rice", "Steamed basmati rice", 3.8, "steamed rice", { isVegan: true, spiceLevel: "None" }),
    linkItem("link-coconut-rice", "Coconut Rice", "Rice cooked with fresh coconut, coconut milk, ghee and nuts", 6.65, "coconut rice"),
    linkItem("link-jeera-pulao", "Jeera Pulao", "Basmati rice flavored with cumin seeds", 6.65, "jeera pulao", { isVegan: true, spiceLevel: "Mild" }),
    linkItem("link-vegetable-biryani", "Vegetable Biryani", "Seasonal vegetables cooked with rice, yogurt, mint and coriander", 9.03, "vegetable biryani"),
    linkItem("link-chicken-biryani", "Chicken Biryani", "Rice cooked with chicken, mint, coriander and spices", 9.5, "chicken biryani", { isVegetarian: false, isVegan: false }),
    linkItem("link-mutton-biryani", "Mutton Biryani", "Hyderabadi-style mutton biryani", 9.98, "mutton biryani", { isVegetarian: false, isVegan: false }),
    linkItem("link-prawn-biryani", "Prawn Biryani", "Prawns cooked with rice, yogurt, mint and coriander", 10.4, "prawn biryani", { isVegetarian: false, isVegan: false }),
    linkItem("link-vegetable-fried-rice", "Vegetable Fried Rice", "Steamed rice fried with vegetables in Indo-Chinese style", 9.03, "vegetable fried rice", { isVegan: true }),
    linkItem("link-mushroom-fried-rice", "Mushroom Fried Rice", "Steamed rice fried with mushrooms in Indo-Chinese style", 9.03, "mushroom fried rice", { isVegan: true }),
    linkItem("link-chicken-fried-rice", "Chicken Fried Rice", "Steamed rice fried with vegetables, egg and chicken", 9.74, "chicken fried rice", { isVegetarian: false, isVegan: false }),
    linkItem("link-prawn-fried-rice", "Prawn Fried Rice", "Steamed rice fried with vegetables, egg and prawns", 10.4, "prawn fried rice", { isVegetarian: false, isVegan: false }),
  ],
  Noodles: [
    linkItem("link-vegetable-noodles", "Vegetable Noodles", "Noodles cooked with julienne vegetables", 9.03, "vegetable noodles", { isVegan: true }),
    linkItem("link-chicken-noodles", "Chicken Noodles", "Scrambled egg cooked with chicken and noodles", 9.74, "chicken noodles", { isVegetarian: false, isVegan: false }),
    linkItem("link-prawn-noodles", "Prawn Noodles", "Scrambled egg with prawns, vegetables and noodles", 10.4, "prawn noodles", { isVegetarian: false, isVegan: false }),
    linkItem("link-seafood-noodles", "Sea Food Noodles", "Scrambled egg with prawns, squid and noodles", 10.4, "seafood noodles", { isVegetarian: false, isVegan: false }),
  ],
  Roti: [
    linkItem("link-vegetable-kothu", "Vegetable Kothu", "Chopped roti on griddle with onion, chilies and vegetables", 9.03, "vegetable kothu roti", { isVegan: true }),
    linkItem("link-chicken-kothu", "Chicken Kothu", "Chopped roti on griddle with onion, chilies and chicken", 9.74, "chicken kothu roti", { isVegetarian: false, isVegan: false }),
    linkItem("link-mutton-kothu", "Mutton Kothu", "Chopped roti on griddle with onion, chilies and mutton", 10.21, "mutton kothu roti", { isVegetarian: false, isVegan: false }),
    linkItem("link-seafood-kothu", "Seafood Kothu", "Chopped roti with seafood and spices", 10.4, "seafood kothu roti", { isVegetarian: false, isVegan: false }),
    linkItem("link-mixed-kothu", "Mixed Kothu", "Chopped roti with mixed proteins and spices", 10.4, "mixed kothu roti", { isVegetarian: false, isVegan: false }),
  ],
  Extra: [
    linkItem("link-raitha", "Raitha", "Yogurt side dip", 1.43, "raita", { isVegan: false, spiceLevel: "None" }),
    linkItem("link-chutney-side", "Chutney", "Side chutney", 1.9, "chutney", { isVegan: true }),
    linkItem("link-samber", "Samber", "Sambar side", 2.38, "sambar", { isVegan: true }),
    linkItem("link-potato-masala", "Potato Masala", "Spiced potato side", 1.9, "potato masala", { isVegan: true }),
    linkItem("link-gravy", "Gravy", "House gravy", 1.9, "curry gravy"),
    linkItem("link-green-chutney", "Green Chutney", "Green chutney side", 0.48, "green chutney", { isVegan: true }),
    linkItem("link-red-chutney", "Red Chutney", "Red chutney side", 0.48, "red chutney", { isVegan: true }),
    linkItem("link-white-chutney", "White Chutney", "White chutney side", 0.48, "coconut chutney", { isVegan: true }),
    linkItem("link-chilli-sauce", "Chilli Sauce", "2oz", 0.48, "chilli sauce", { isVegan: true }),
  ],
  "Kids Meals": [
    linkItem("link-kids-nuggets", "Kids Chicken Nuggets, Chips and Drink", "Kids meal combo", 6.41, "chicken nuggets and fries", { isVegetarian: false, isVegan: false, spiceLevel: "None" }),
    linkItem("link-kids-burger", "Kids Chicken Burger, Chips and Drink", "Kids meal combo", 6.41, "chicken burger and fries", { isVegetarian: false, isVegan: false, spiceLevel: "None" }),
    linkItem("link-kids-fish-fingers", "Kids Fish Fingers, Chips and Drink", "Kids meal combo", 6.41, "fish fingers and fries", { isVegetarian: false, isVegan: false, spiceLevel: "None" }),
    linkItem("link-kids-chips", "Kids Chips", "Kids chips", 2.85, "french fries", { isVegan: true, spiceLevel: "None" }),
    linkItem("link-kids-dosa", "Kids Dosa", "Kids dosa", 6.65, "plain dosa", { isVegan: true, spiceLevel: "Mild" }),
    linkItem("link-kids-cheese-dosa", "Kids Cheese Dosa", "Kids cheese dosa", 6.65, "cheese dosa", { isVegan: false, spiceLevel: "Mild" }),
  ],
  Desserts: [
    linkItem("link-rava-kesari", "Rava Kesari", "South Indian sweet made with semolina, sugar, ghee and nuts", 3.09, "rava kesari", { spiceLevel: "None" }),
  ],
  "Hot Beverages": [
    linkItem("link-south-indian-coffee", "South Indian Coffee", "Traditional filter coffee brewed strong with milk and froth (12oz)", 3.33, "south indian filter coffee", { spiceLevel: "None" }),
    linkItem("link-hot-chocolate", "Hot Chocolate", "Creamy cocoa drink served hot (12oz)", 3.09, "hot chocolate", { spiceLevel: "None" }),
    linkItem("link-masala-tea", "Masala Tea", "Indian tea simmered with aromatic spices and milk (12oz)", 3.09, "masala tea", { spiceLevel: "None" }),
    linkItem("link-tea", "Tea", "Classic milk tea served hot (12oz)", 2.61, "tea cup", { spiceLevel: "None" }),
    linkItem("link-black-tea", "Black Tea", "Plain black tea served hot without milk (12oz)", 1.9, "black tea", { spiceLevel: "None" }),
  ],
  "Cold Beverages": [
    linkItem("link-sweet-lassi", "Sweet Lassi", "Refreshing sweet yogurt drink served chilled (12oz)", 3.75, "sweet lassi", { spiceLevel: "None" }),
    linkItem("link-mango-lassi", "Mango Lassi", "Creamy mango and yogurt blended drink served chilled (12oz)", 4.04, "mango lassi", { spiceLevel: "None" }),
    linkItem("link-salt-lassi", "Salt Lassi", "Traditional salted yogurt drink served chilled (12oz)", 3.75, "salt lassi", { spiceLevel: "None" }),
    linkItem("link-jug-mango-lassi", "Jug of Mango Lassi", "Family-size mango lassi jug (1ltr)", 14.25, "mango lassi jug", { spiceLevel: "None" }),
    linkItem("link-7up", "7Up", "Chilled soft drink can (330ml)", 1.66, "7up can", { spiceLevel: "None" }),
    linkItem("link-diet-pepsi", "Diet Pepsi", "Chilled diet cola can (330ml)", 1.66, "diet pepsi can", { spiceLevel: "None" }),
    linkItem("link-ginger-beer", "Ginger Beer", "Chilled ginger-flavored soft drink can (330ml)", 1.66, "ginger beer can", { spiceLevel: "None" }),
    linkItem("link-lemonade", "Lemonade", "Chilled lemonade soft drink can (330ml)", 1.66, "lemonade can", { spiceLevel: "None" }),
    linkItem("link-pepsi", "Pepsi", "Chilled cola can (330ml)", 1.66, "pepsi can", { spiceLevel: "None" }),
    linkItem("link-pepsi-max", "Pepsi Max", "Chilled zero-sugar cola can (330ml)", 1.66, "pepsi max can", { spiceLevel: "None" }),
    linkItem("link-rio", "Rio", "Chilled tropical fruit soft drink can (330ml)", 1.66, "rio drink can", { spiceLevel: "None" }),
    linkItem("link-rubicon-mango", "Rubicon Mango", "Chilled mango fruit drink can (330ml)", 1.66, "rubicon mango can", { spiceLevel: "None" }),
    linkItem("link-rubicon-passion", "Rubicon Passion", "Chilled passion fruit drink can (330ml)", 1.66, "rubicon passion can", { spiceLevel: "None" }),
    linkItem("link-tango-orange", "Tango Orange", "Chilled orange soft drink can (330ml)", 1.66, "tango orange can", { spiceLevel: "None" }),
    linkItem("link-fruit-shoot-blackcurrant", "Fruit Shoot Blackcurrant", "Kids blackcurrant fruit drink (200ml)", 0.95, "fruit shoot blackcurrant", { spiceLevel: "None" }),
    linkItem("link-fruit-shoot-orange", "Fruit Shoot Orange", "Kids orange fruit drink (200ml)", 0.95, "fruit shoot orange", { spiceLevel: "None" }),
    linkItem("link-rose-milk", "Rose Milk", "Chilled milk drink with rose syrup and basil seeds (12oz)", 3.8, "rose milk", { spiceLevel: "None" }),
  ],
};

const customMenuItemsByCategory: Record<string, ExtraMenuItem[]> = {
  Starters: additionalStarters,
  Curries: additionalCurries,
  "Rice & Biryani": additionalRiceAndBiryani,
};

export const additionalMenuItemsByCategory: Record<string, ExtraMenuItem[]> = Object.fromEntries(
  Array.from(
    new Set([...Object.keys(customMenuItemsByCategory), ...Object.keys(menuFromLinkByCategory)]),
  ).map((category) => [
    category,
    [
      ...(customMenuItemsByCategory[category] ?? []),
      ...(menuFromLinkByCategory[category] ?? []),
    ],
  ]),
) as Record<string, ExtraMenuItem[]>;

export const posterAdditionsByCategory: Record<string, ExtraMenuItem[]> = {
  Starters: [
    linkItem(
      "poster-cajun-potato",
      "Cajun Potato (V)",
      "Crispy fried potatoes topped with creamy and spicy dressing",
      3.5,
      "cajun potato",
      { isVegan: false, spiceLevel: "Medium" },
    ),
    linkItem(
      "poster-paneer-tikka-starter",
      "Paneer Tikka (V)",
      "Cubes of paneer and veggies marinated with yogurt and spices",
      4.5,
      "paneer tikka",
      { isVegan: false, spiceLevel: "Medium" },
    ),
    linkItem(
      "poster-chilli-paneer-starter",
      "Chilli Paneer (V)",
      "Paneer tossed in slightly sweet, spicy, hot and tangy chilli sauce",
      4,
      "chilli paneer",
      { isVegan: false, spiceLevel: "Medium" },
    ),
    linkItem(
      "poster-pav-bhaji",
      "Pav Bhaji (V)",
      "Spiced mashed vegetables in thick gravy served with bread",
      4.5,
      "pav bhaji",
      { isVegan: false, spiceLevel: "Medium" },
    ),
  ],
  Curries: [
    linkItem(
      "poster-roti-chapathi",
      "Roti/chapathi",
      "2 pieces of wheat bread",
      1,
      "chapati roti",
      { isVegan: true, spiceLevel: "None" },
    ),
  ],
  "Rice & Biryani": [
    linkItem(
      "poster-coriander-pulao",
      "Coriander Pulao (VG)",
      "Coriander pulao made with basmati rice cooked in coriander gravy/masala",
      4.5,
      "coriander rice pulao",
      { isVegan: true, spiceLevel: "Mild" },
    ),
    linkItem(
      "poster-sweetcorn-pulao",
      "Sweetcorn Pulao (VG)",
      "Sweet corn pulao made with basmati rice, sweetcorn and masala",
      4.5,
      "sweet corn pulao",
      { isVegan: true, spiceLevel: "Mild" },
    ),
  ],
};

const posterSections = [
  "Starters",
  "Curries",
  "Rice Dishes",
  "Hot Beverages",
  "Cold Beverages",
] as const;

const posterSourceCategories: Record<(typeof posterSections)[number], string[]> = {
  Starters: ["Starters"],
  Curries: ["Curries"],
  "Rice Dishes": ["Rice & Biryani"],
  "Hot Beverages": ["Hot Beverages"],
  "Cold Beverages": ["Cold Beverages"],
};

const posterAllowedNames: Record<(typeof posterSections)[number], Set<string>> = {
  Starters: new Set(
    [
      "Cajun Potato (V)",
      "Mirchi Bajji (VG)",
      "Onion pakodi (VG)",
      "Honey Chilly Potato (V)",
      "Wada Paav (V)",
      "Munta Masala (V)",
      "Punjabi Aloo samosa (V)",
      "Cut mirchi (VG)",
      "Pani Puri (VG)",
      "Paneer kurkure (V)",
      "Babycorn manchuria (VG)",
      "Egg Bonda",
      "Raw banana bajji (VG)",
      "Paneer Tikka (V)",
      "Chilli Paneer (V)",
      "Gobi Manchurian (VG)",
      "Pav Bhaji (V)",
    ].map(normalizeItemName),
  ),
  Curries: new Set(
    [
      "Chikkudukay Masala",
      "Majjiga Pusulu",
      "Aritikay Ulli Karam",
      "Mukkala Pulusu",
      "Aritikay Pulusu (veg fish curry)",
      "Bendakay Fry",
      "Drumstik Kaju Masala",
      "Gutti Vankay",
      "Dondakay Fry",
      "Aritikay Fry",
      "Aloo kurma (VG)",
      "Mixed veg curry (V)",
      "Egg kheema masala",
      "Brinjal curry (VG)",
      "Potato Fry (VG)",
      "paneer tikka masala (V)",
      "Mix veg dry (V) (VG)",
      "Egg Curry",
      "Brinjal Coriander curry (VG)",
      "Chole curry (V) (VG)",
      "Dal Fry (V) (VG)",
      "Tomato Daal",
      "Dal Tadka (V) (VG)",
      "Sambar (V) (VG)",
      "Chutney",
      "Paneer butter masala (V)",
      "Dal Makhani (V)",
      "Roti/chapathi",
      "Malai kofta (V)",
      "Kadai Paneer (V)",
      "Paalak paneer",
      "dahi bhindi masala",
      "Paneer chettinad",
    ].map(normalizeItemName),
  ),
  "Rice Dishes": new Set(
    [
      "Peas Pulao (V) (VG)",
      "Veg Pulao (VG)",
      "Coriander Pulao (VG)",
      "Sweetcorn Pulao (VG)",
      "Veg Biryani (V) (VG)",
      "Egg Biryani",
      "paneer makhani Biryani",
      "Jackfruit Biryani",
      "Fried aloo dum Biryani",
      "Schezwan Fried Rice (V)",
      "Gobi Manchurian fried rice(V) (VG)",
      "Sambar Rice (V) (VG)",
      "Jeera Rice (VG)",
      "Vangi Bath (VG)",
      "Veg hakka noodles",
    ].map(normalizeItemName),
  ),
  "Hot Beverages": new Set(
    (menuFromLinkByCategory["Hot Beverages"] ?? []).map((item) =>
      normalizeItemName(item.name),
    ),
  ),
  "Cold Beverages": new Set(
    (menuFromLinkByCategory["Cold Beverages"] ?? []).map((item) =>
      normalizeItemName(item.name),
    ),
  ),
};

const posterPriceEntries: Array<[string, number]> = [
    ["Cajun Potato (V)", 3.5],
    ["Mirchi Bajji (VG)", 5],
    ["Onion pakodi (VG)", 3],
    ["Honey Chilly Potato (V)", 4.5],
    ["Wada Paav (V)", 3],
    ["Munta Masala (V)", 3],
    ["Punjabi Aloo samosa (V)", 4],
    ["Cut mirchi (VG)", 4],
    ["Pani Puri (VG)", 3],
    ["Paneer kurkure (V)", 4.5],
    ["Babycorn manchuria (VG)", 4.5],
    ["Egg Bonda", 4],
    ["Raw banana bajji (VG)", 4],
    ["Paneer Tikka (V)", 4.5],
    ["Chilli Paneer (V)", 4],
    ["Gobi Manchurian (VG)", 4],
    ["Pav Bhaji (V)", 4.5],
    ["Chikkudukay Masala", 5.5],
    ["Majjiga Pusulu", 4.5],
    ["Aritikay Ulli Karam", 5.5],
    ["Mukkala Pulusu", 5.5],
    ["Aritikay Pulusu (veg fish curry)", 5.5],
    ["Bendakay Fry", 5.5],
    ["Drumstik Kaju Masala", 5.5],
    ["Gutti Vankay", 5.5],
    ["Dondakay Fry", 5.5],
    ["Aritikay Fry", 5],
    ["Aloo kurma (VG)", 4],
    ["Mixed veg curry (V)", 4.5],
    ["Egg kheema masala", 5.5],
    ["Brinjal curry (VG)", 5],
    ["Potato Fry (VG)", 4],
    ["paneer tikka masala (V)", 5.5],
    ["Mix veg dry (V) (VG)", 4.5],
    ["Egg Curry", 5],
    ["Brinjal Coriander curry (VG)", 5],
    ["Chole curry (V) (VG)", 4.5],
    ["Dal Fry (V) (VG)", 4],
    ["Tomato Daal", 4],
    ["Dal Tadka (V) (VG)", 4],
    ["Sambar (V) (VG)", 4],
    ["Chutney", 3],
    ["Paneer butter masala (V)", 4.5],
    ["Dal Makhani (V)", 5.5],
    ["Roti/chapathi", 1],
    ["Malai kofta (V)", 5],
    ["Kadai Paneer (V)", 5.5],
    ["Paalak paneer", 4.5],
    ["dahi bhindi masala", 5],
    ["Paneer chettinad", 5.5],
    ["Peas Pulao (V) (VG)", 4.5],
    ["Veg Pulao (VG)", 4.5],
    ["Coriander Pulao (VG)", 4.5],
    ["Sweetcorn Pulao (VG)", 4.5],
    ["Veg Biryani (V) (VG)", 5],
    ["Egg Biryani", 6],
    ["paneer makhani Biryani", 6.5],
    ["Jackfruit Biryani", 6],
    ["Fried aloo dum Biryani", 5.5],
    ["Schezwan Fried Rice (V)", 4.5],
    ["Gobi Manchurian fried rice(V) (VG)", 5],
    ["Sambar Rice (V) (VG)", 4],
    ["Jeera Rice (VG)", 4],
    ["Vangi Bath (VG)", 4.5],
    ["Veg hakka noodles", 4.5],
  ];

const posterPriceOverrides: Record<string, number> = posterPriceEntries.reduce(
  (acc, [name, price]) => {
    acc[normalizeItemName(name)] = price;
    return acc;
  },
  {} as Record<string, number>,
);

const starterPosterNames = posterAllowedNames.Starters;

export default function MenuPage({
  onAddToCart,
  onUpdateQuantity,
  cartItems,
  onNavigateToOrder,
}: MenuPageProps) {
  const menuItems = useQuery(api.menu.listMenuItems);
  const isAdmin = useQuery(api.admin.isAdmin) ?? false;
  const upsertMenuItemFromAdmin = useMutation(api.admin.upsertMenuItemFromAdmin);
  const saveMenuLayout = useMutation(api.admin.saveMenuLayout);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [adminSectionEdits, setAdminSectionEdits] = useState<Record<string, string>>({});
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [isSavingMenuLayout, setIsSavingMenuLayout] = useState(false);
  const [hiddenMenuItemIds] = useState<Record<string, boolean>>({});
  const [itemSectionOverrides] = useState<Partial<Record<string, (typeof zomatoSections)[number]>>>({});
  const [sectionOrderOverrides, setSectionOrderOverrides] = useState<Record<string, string[]>>({});

  const sortItemsBySectionOrder = (
    category: string,
    items: MenuItemLike[],
  ): MenuItemLike[] => {
    const orderedIds = sectionOrderOverrides[category] ?? [];
    if (orderedIds.length === 0) {
      return [...items].sort((a, b) => {
        const aOrder = a.menuOrder;
        const bOrder = b.menuOrder;
        if (aOrder !== undefined && bOrder !== undefined) return aOrder - bOrder;
        if (aOrder !== undefined) return -1;
        if (bOrder !== undefined) return 1;
        return a.name.localeCompare(b.name);
      });
    }
    const rank = new Map(orderedIds.map((id, index) => [id, index]));
    return [...items].sort(
      (a, b) =>
        (rank.get(a._id) ?? Number.MAX_SAFE_INTEGER) -
        (rank.get(b._id) ?? Number.MAX_SAFE_INTEGER),
    );
  };
  const getCategoryLabel = (category: string) =>
    category === "Veg Starters" ? "Starters" : category;
  const toggleSectionCollapse = (category: string) => {
    setCollapsedSections((prev) => ({ ...prev, [category]: !prev[category] }));
  };
  const formatPrice = (price: number) => `\u00A3${price.toFixed(2)}`;
  const sourceCategories = menuItems
    ? Array.from(
        new Set([
          ...Object.keys(menuItems),
          ...Object.keys(additionalMenuItemsByCategory),
          ...Object.keys(posterAdditionsByCategory),
        ]),
      )
    : Array.from(
        new Set([
          ...Object.keys(additionalMenuItemsByCategory),
          ...Object.keys(posterAdditionsByCategory),
        ]),
      );

  const allRawItems: MenuItemLike[] = sourceCategories.flatMap((sourceCategory) => [
    ...(menuItems?.[sourceCategory] ?? []),
    ...(additionalMenuItemsByCategory[sourceCategory] ?? []),
    ...(posterAdditionsByCategory[sourceCategory] ?? []),
  ]);

  const uniqueItems = Array.from(
    allRawItems.reduce((acc, item) => {
      const key = normalizeItemName(item.name);
      if (!acc.has(key)) acc.set(key, item);
      return acc;
    }, new Map<string, MenuItemLike>()).values(),
  ).map((item) => {
    const key = normalizeItemName(item.name);
    const posterPrice = posterPriceOverrides[key];
    return posterPrice !== undefined ? { ...item, price: posterPrice } : item;
  });

  const availableItems = uniqueItems.filter((item) => !hiddenMenuItemIds[item._id]);

  const sectionedItems = new Map<(typeof zomatoSections)[number], MenuItemLike[]>();
  for (const item of availableItems) {
    const section = getZomatoSectionForItem(item);
    if (!sectionedItems.has(section)) sectionedItems.set(section, []);
    sectionedItems.get(section)!.push(item);
  }

  const starterItemsFromPoster = availableItems
    .filter((item) => item.isVegetarian)
    .filter((item) => starterPosterNames.has(normalizeItemName(item.name)));
  sectionedItems.set("Veg Starters", starterItemsFromPoster);
  const snacksItems = sectionedItems.get("Snacks") ?? [];
  sectionedItems.set(
    "Snacks",
    snacksItems.filter((item) => !starterPosterNames.has(normalizeItemName(item.name))),
  );

  const updatedSectionedItems = new Map<(typeof zomatoSections)[number], MenuItemLike[]>();
  for (const section of zomatoSections) {
    updatedSectionedItems.set(section, [...(sectionedItems.get(section) ?? [])]);
  }
  const itemById = new Map(availableItems.map((item) => [item._id, item]));
  for (const [itemId, targetSection] of Object.entries(itemSectionOverrides)) {
    const item = itemById.get(itemId);
    if (!item || !targetSection || /non veg/i.test(targetSection)) {
      continue;
    }
    for (const section of zomatoSections) {
      updatedSectionedItems.set(
        section,
        (updatedSectionedItems.get(section) ?? []).filter((entry) => entry._id !== itemId),
      );
    }
    if (!item.isVegetarian) {
      continue;
    }
    const targetItems = updatedSectionedItems.get(targetSection) ?? [];
    if (!targetItems.some((entry) => entry._id === itemId)) {
      updatedSectionedItems.set(targetSection, [...targetItems, item]);
    }
  }

  const visibleCategories = zomatoSections.filter((section) => {
    if (/non veg/i.test(section)) {
      return false;
    }
    const itemsInSection = updatedSectionedItems.get(section) ?? [];
    return itemsInSection.some((item) => item.isVegetarian);
  });
  const categories = ["all", ...visibleCategories];
  const deletedItemsCount = Object.values(hiddenMenuItemIds).filter(Boolean).length;

  const handleAddToCart = (item: { id: string; name: string; price: number }) => {
    onAddToCart(item);
    toast.success(`${item.name} added to cart`);
  };

  const handleMoveItemToSection = async (item: MenuItemLike, selectedSection: string) => {
    if (!selectedSection) {
      toast.error("Select a section first.");
      return;
    }
    setMovingItemId(item._id);
    try {
      await upsertMenuItemFromAdmin({
        name: item.name,
        description: item.description,
        category: getZomatoSectionForItem(item),
        menuSection: selectedSection,
        price: item.price,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        spiceLevel: item.spiceLevel,
        imageUrl: item.imageUrl,
        available: true,
      });
      toast.success("Item section updated.");
    } catch {
      toast.error("Failed to move item section.");
    } finally {
      setMovingItemId(null);
    }
  };

  const moveItemWithinSection = (
    category: string,
    itemId: string,
    direction: "up" | "down",
    displayItems: MenuItemLike[],
  ) => {
    setSectionOrderOverrides((prev) => {
      const baseline = displayItems.map((entry) => entry._id);
      const existing = prev[category] ?? baseline;
      const ordered = [...existing];
      for (const id of baseline) {
        if (!ordered.includes(id)) {
          ordered.push(id);
        }
      }
      const filtered = ordered.filter((id) => baseline.includes(id));
      const currentIndex = filtered.indexOf(itemId);
      if (currentIndex < 0) return prev;
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= filtered.length) return prev;
      const next = [...filtered];
      [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
      return { ...prev, [category]: next };
    });
  };

  const handleSaveMenuLayout = async () => {
    setIsSavingMenuLayout(true);
    try {
      const itemsPayload = visibleCategories.flatMap((category) => {
        const ordered = sortItemsBySectionOrder(
          category,
          (updatedSectionedItems.get(category) ?? []).filter((item) => item.isVegetarian),
        );
        return ordered.map((item, index) => ({
          name: item.name,
          description: item.description,
          category: getZomatoSectionForItem(item),
          menuSection: category,
          menuOrder: index,
          price: item.price,
          isVegetarian: item.isVegetarian,
          isVegan: item.isVegan,
          spiceLevel: item.spiceLevel,
          imageUrl: item.imageUrl,
          available: true,
        }));
      });

      const result = await saveMenuLayout({ items: itemsPayload });
      toast.success(`Menu saved. ${result.saved} items finalized.`);
    } catch {
      toast.error("Failed to save menu layout.");
    } finally {
      setIsSavingMenuLayout(false);
    }
  };

  const getItemQuantity = (id: string) =>
    cartItems.find((cartItem) => cartItem.id === id)?.quantity ?? 0;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("menu-section-overrides", JSON.stringify(itemSectionOverrides));
  }, [itemSectionOverrides]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("menu-hidden-item-ids", JSON.stringify(hiddenMenuItemIds));
  }, [hiddenMenuItemIds]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      "menu-section-order-overrides",
      JSON.stringify(sectionOrderOverrides),
    );
  }, [sectionOrderOverrides]);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">Our Menu</h1>
          <p className="text-xl text-gray-600">
            Explore our delicious selection of authentic Indian dishes
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === category
                  ? "bg-[#f08a24] text-white shadow-sm"
                  : "bg-[#f8f2e9] text-[#3f3731] hover:bg-[#efe4d1] border border-[#e4d6c1]"
              }`}
            >
              {category === "all" ? "All Items" : getCategoryLabel(category)}
            </button>
          ))}
        </div>
        {isAdmin && (
          <div className="mb-8 flex justify-center">
            <button
              type="button"
              onClick={handleSaveMenuLayout}
              disabled={isSavingMenuLayout}
              className="bg-[#123b3b] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#0f3232] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingMenuLayout ? "Saving Menu..." : "Save Menu"}
            </button>
          </div>
        )}

        {menuItems === undefined ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {visibleCategories.map((category) => {
              if (selectedCategory !== "all" && selectedCategory !== category) {
                return null;
              }

              const displayItems = sortItemsBySectionOrder(
                category,
                (updatedSectionedItems.get(category) ?? []).filter((item) => item.isVegetarian),
              );

              if (displayItems.length === 0) {
                return null;
              }
              const isCollapsed = collapsedSections[category] ?? false;

              return (
                <div key={category}>
                  <button
                    type="button"
                    onClick={() => toggleSectionCollapse(category)}
                    className="w-full flex items-center justify-between text-left mb-4 border-b-2 border-orange-500 pb-2"
                  >
                    <h2 className="text-3xl font-bold text-gray-900">
                      {getCategoryLabel(category)} ({displayItems.length})
                    </h2>
                    <span className="text-2xl font-bold text-gray-700">
                      {isCollapsed ? "+" : "-"}
                    </span>
                  </button>
                  {!isCollapsed && (
                    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
                      {displayItems.map((item, index) => (
                        <div key={item._id} className="p-5 sm:p-6 flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="mb-2">
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded border-2 text-[10px] font-bold ${
                                  item.isVegetarian
                                    ? "border-green-600 text-green-600"
                                    : "border-red-600 text-red-600"
                                }`}
                              >{item.isVegetarian ? "V" : "NV"}</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 leading-tight">{item.name}</h3>
                            <p className="text-orange-600 font-bold text-2xl mt-1">
                              {formatPrice(item.price)}
                            </p>
                            <p className="text-gray-600 text-base mt-3 max-w-2xl">{item.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.isVegetarian && (
                                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                                  Veg
                                </span>
                              )}
                              {item.isVegan && (
                                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                                  Vegan
                                </span>
                              )}
                              {item.spiceLevel !== "None" && (
                                <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">
                                  {item.spiceLevel}
                                </span>
                              )}
                            </div>
                            {isAdmin && (
                              <div className="mt-3 flex items-center gap-2">
                                <select
                                  className="rounded border border-gray-300 px-2 py-1 text-sm"
                                  value={adminSectionEdits[item._id] ?? category}
                                  onChange={(e) =>
                                    setAdminSectionEdits((prev) => ({
                                      ...prev,
                                      [item._id]: e.target.value,
                                    }))
                                  }
                                >
                                  {zomatoSections
                                    .filter((section) => !/non veg/i.test(section))
                                    .map((section) => (
                                      <option key={section} value={section}>
                                        {getCategoryLabel(section)}
                                      </option>
                                    ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleMoveItemToSection(
                                      item,
                                      adminSectionEdits[item._id] ?? category,
                                    )
                                  }
                                  disabled={movingItemId === item._id}
                                  className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {movingItemId === item._id ? "Moving..." : "Move Section"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    moveItemWithinSection(category, item._id, "up", displayItems)
                                  }
                                  disabled={index === 0}
                                  className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Move Up
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    moveItemWithinSection(category, item._id, "down", displayItems)
                                  }
                                  disabled={index === displayItems.length - 1}
                                  className="px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Move Down
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="w-32 shrink-0 flex flex-col items-end gap-2">
                            {getItemQuantity(item._id) === 0 ? (
                              <button
                                onClick={() =>
                                  handleAddToCart({
                                    id: item._id,
                                    name: item.name,
                                    price: item.price,
                                  })
                                }
                                className="w-28 bg-white border border-gray-300 rounded-xl shadow-md text-green-600 font-extrabold text-2xl leading-none py-2 hover:shadow-lg transition-all"
                              >
                                ADD
                              </button>
                            ) : (
                              <div className="w-28 bg-white border border-gray-300 rounded-xl shadow-md flex items-center justify-between px-2 py-2">
                                <button
                                  onClick={() =>
                                    onUpdateQuantity(item._id, getItemQuantity(item._id) - 1)
                                  }
                                  className="text-green-600 font-bold text-xl leading-none"
                                >
                                  -
                                </button>
                                <span className="text-green-600 font-extrabold text-lg leading-none">
                                  {getItemQuantity(item._id)}
                                </span>
                                <button
                                  onClick={() =>
                                    onUpdateQuantity(item._id, getItemQuantity(item._id) + 1)
                                  }
                                  className="text-green-600 font-bold text-xl leading-none"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={onNavigateToOrder}
            className="bg-[#f08a24] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#dc7820] transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}


















