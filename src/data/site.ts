/**
 * ── SITE CONFIGURATION ──────────────────────────────────────────────
 * Everything you need to customise the site lives in this one file.
 */

export const SITE = {
  name: "NAAN STOP",
  subtitle: "FRENCH TACOS",
  // WhatsApp number: country code + number, digits only.
  // e.g. Spain: "34624205945" · Pakistan: "923001234567" · US: "15551234567"
  phone: "34624205945",
  currency: "Rs.",
  address: "Passeig Prat de la Riba, 78, 08320 El Masnou, Barcelona, Spain",
  hours: [
    { days: "Monday – Sunday", time: "12:00 PM – 12:00 AM" },
  ],
  // Optional note shown under the opening hours in the contact section
  hoursNote: "Hours may differ on public holidays.",
} as const;

/** Build a WhatsApp deep-link with a pre-filled message. */
export const waLink = (message: string): string =>
  `https://wa.me/${SITE.phone}?text=${encodeURIComponent(message)}`;

export const DEFAULT_WA_MESSAGE =
  "Hi NAAN STOP! I'd like to place an order.";

/** Open the restaurant's location in Google Maps. */
export const mapsUrl = (): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${SITE.name} ${SITE.subtitle}, ${SITE.address}`
  )}`;

export interface MenuItem {
  name: string;
  desc: string;
  price: string;
  tag?: "Bestseller" | "Spicy" | "New";
  // Unsplash image for the dish (keeps snacks fast). Replace with your own photos.
  img?: string;
}

export interface MenuCategory {
  id: string;
  label: string;
  items: MenuItem[];
}

export const MENU: MenuCategory[] = [
  {
    id: "tacos",
    label: "French Tacos",
    items: [
      {
        name: "Classic Chicken Taco",
        desc: "Grilled tortilla loaded with fries, cheese sauce & crispy chicken.",
        price: "M 350 · L 450",
        tag: "Bestseller",
        img: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Peri Peri Taco",
        desc: "Fiery peri peri chicken, fries & creamy garlic sauce.",
        price: "M 380 · L 480",
        tag: "Spicy",
        img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Loaded Cheese Taco",
        desc: "Double cheddar & mozzarella, double the cheese pull.",
        price: "M 400 · L 500",
        img: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Mixed Taco",
        desc: "Chicken & beef together with signature sauce.",
        price: "M 420 · L 520",
        img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Double Decker Taco",
        desc: "Two layers of tortilla, double filling, pure indulgence.",
        price: "M 480 · L 580",
        img: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Naan Stop Special",
        desc: "Our secret recipe — all our sauces, every filling.",
        price: "M 450 · L 550",
        tag: "New",
        img: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    id: "burgers",
    label: "Burgers",
    items: [
      {
        name: "Crispy Zinger Burger",
        desc: "Buttermilk fried chicken, lettuce & house mayo.",
        price: "350",
        tag: "Bestseller",
        img: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Classic Chicken Burger",
        desc: "Grilled patty, cheddar & smoky BBQ sauce.",
        price: "300",
        img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Peri Peri Chicken Burger",
        desc: "Spicy peri marinade, jalapeños & pepper jack.",
        price: "380",
        tag: "Spicy",
        img: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Double Smash Burger",
        desc: "Two smashed beef patties, double cheese.",
        price: "450",
        img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    id: "sides",
    label: "Sides",
    items: [
      {
        name: "French Fries",
        desc: "Golden, crispy, lightly salted.",
        price: "150",
        img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Loaded Fries",
        desc: "Fries smothered in cheese sauce, chicken & jalapeños.",
        price: "250",
        tag: "Bestseller",
        img: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Chicken Nuggets",
        desc: "6 pieces with dipping sauce.",
        price: "250",
        img: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Onion Rings",
        desc: "Crunchy battered rings with tangy dip.",
        price: "200",
        img: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    id: "drinks",
    label: "Drinks",
    items: [
      {
        name: "Soft Drink",
        desc: "Ice-cold canned drink of your choice.",
        price: "100",
        img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Cold Coffee",
        desc: "Frothy, chilled & loaded with cream.",
        price: "250",
        img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Chocolate Shake",
        desc: "Thick shake topped with chocolate syrup.",
        price: "300",
        img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Fresh Lime",
        desc: "Zesty and refreshing.",
        price: "150",
        img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
];

export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;