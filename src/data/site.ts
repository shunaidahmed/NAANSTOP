/**
 * ── SITE CONFIGURATION ──────────────────────────────────────────────
 * The shipped defaults. Everything here is editable at /admin/ once the site
 * is deployed; this file is what visitors see before any content is published,
 * and the fallback if the CMS is unreachable.
 */

export const SITE = {
  name: "NAAN STOP",
  subtitle: "FRENCH TACOS",
  /** Country code + digits only, no "+" and no spaces. */
  phone: "34624205945",
  /** ISO 4217. Prices are formatted with Intl, so this is all it takes. */
  currency: "EUR",
  address: "Passeig Prat de la Riba, 78, 08320 El Masnou, Barcelona, Spain",
  hours: [
    { days: "Monday – Sunday", time: "12:00 PM – 12:00 AM", daysEs: "Lunes – Domingo", timeEs: "12:00 PM – 12:00 AM" },
  ],
  hoursNote: "Hours may differ on public holidays.",
  hoursNoteEs: "Los horarios pueden cambiar en festivos.",

  /* ── ordering ──────────────────────────────────────────────────── */
  /** Offer delivery alongside pickup. Turn off and the site is pickup-only. */
  delivery: true,
  /** Added to the total for delivery orders. 0 = free. */
  deliveryFee: 2.5,
  /** Minimum basket value before a delivery order can be sent. 0 = no minimum. */
  minDeliveryOrder: 12,
} as const;

export const waLink = (message: string): string =>
  `https://wa.me/${SITE.phone}?text=${encodeURIComponent(message)}`;

export const DEFAULT_WA_MESSAGE = "Hi NAAN STOP! I'd like to place an order.";

export const DEFAULT_WA_MESSAGE_ES = "¡Hola NAAN STOP! Me gustaría hacer un pedido.";

export const mapsUrl = (): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${SITE.name} ${SITE.subtitle}, ${SITE.address}`
  )}`;

/** A size option, e.g. Medium / Large. Each size carries its own price. */
export interface MenuSize {
  label: string;
  labelEs?: string;
  price: number;
}

export interface MenuItem {
  name: string;
  desc: string;
  nameEs?: string;
  descEs?: string;
  /** Price when the dish has no sizes; also the fallback if `sizes` is empty. */
  price: number;
  /** Optional size choices. When present the customer must pick one. */
  sizes?: MenuSize[];
  tag?: "Bestseller" | "Spicy" | "New";
  tagEs?: { Bestseller: string; Spicy: string; New: string };
  img?: string;
}

export interface MenuCategory {
  id: string;
  label: string;
  labelEs: string;
  items: MenuItem[];
}

const TAGS_ES = { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" };

/** Medium / Large, the two sizes every French taco comes in. */
const sizes = (medium: number, large: number): MenuSize[] => [
  { label: "Medium", labelEs: "Mediano", price: medium },
  { label: "Large", labelEs: "Grande", price: large },
];

export const MENU: MenuCategory[] = [
  {
    id: "tacos",
    label: "French Tacos",
    labelEs: "Tacos Franceses",
    items: [
      {
        name: "Classic Chicken Taco",
        desc: "Grilled tortilla loaded with fries, cheese sauce & crispy chicken.",
        nameEs: "Taco Clásico de Pollo",
        descEs: "Tortilla a la parrilla cargada de patatas, salsa de queso y pollo crujiente.",
        price: 7,
        sizes: sizes(7, 9),
        tag: "Bestseller",
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Peri Peri Taco",
        desc: "Fiery peri peri chicken, fries & creamy garlic sauce.",
        nameEs: "Taco Peri Peri",
        descEs: "Pollo peri peri ardiente, patatas y salsa cremosa de ajo.",
        price: 7.6,
        sizes: sizes(7.6, 9.6),
        tag: "Spicy",
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Loaded Cheese Taco",
        desc: "Double cheddar & mozzarella, double the cheese pull.",
        nameEs: "Taco Doble Queso",
        descEs: "Doble cheddar y mozzarella, doble tirón de queso.",
        price: 8,
        sizes: sizes(8, 10),
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Mixed Taco",
        desc: "Chicken & beef together with signature sauce.",
        nameEs: "Taco Mixto",
        descEs: "Pollo y carne juntos con salsa signature.",
        price: 8.4,
        sizes: sizes(8.4, 10.4),
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Double Decker Taco",
        desc: "Two layers of tortilla, double filling, pure indulgence.",
        nameEs: "Taco Doble Capa",
        descEs: "Dos capas de tortilla, doble relleno, puro placer.",
        price: 9.6,
        sizes: sizes(9.6, 11.6),
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Naan Stop Special",
        desc: "Our secret recipe — all our sauces, every filling.",
        nameEs: "Especial NAAN STOP",
        descEs: "Nuestra receta secreta — todas nuestras salsas, cada relleno.",
        price: 9,
        sizes: sizes(9, 11),
        tag: "New",
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    id: "burgers",
    label: "Burgers",
    labelEs: "Hamburguesas",
    items: [
      {
        name: "Crispy Zinger Burger",
        desc: "Buttermilk fried chicken, lettuce & house mayo.",
        nameEs: "Hamburguesa Crispy Zinger",
        descEs: "Pollo frito en suero de leche, lechuga y mayonesa casera.",
        price: 7,
        tag: "Bestseller",
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Classic Chicken Burger",
        desc: "Grilled patty, cheddar & smoky BBQ sauce.",
        nameEs: "Hamburguesa Clásica de Pollo",
        descEs: "Parrilla, cheddar y salsa BBQ ahumada.",
        price: 6,
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Peri Peri Chicken Burger",
        desc: "Spicy peri marinade, jalapeños & pepper jack.",
        nameEs: "Hamburguesa Peri Peri de Pollo",
        descEs: "Marinada peri picante, jalapeños y pepper jack.",
        price: 7.6,
        tag: "Spicy",
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Double Smash Burger",
        desc: "Two smashed beef patties, double cheese.",
        nameEs: "Hamburguesa Doble Smash",
        descEs: "Dos hamburguesas de ternera aplastadas, doble queso.",
        price: 9,
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    id: "sides",
    label: "Sides",
    labelEs: "Acompañamientos",
    items: [
      {
        name: "French Fries",
        desc: "Golden, crispy, lightly salted.",
        nameEs: "Patatas Fritas",
        descEs: "Doradas, crujientes, ligeramente saladas.",
        price: 3,
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Loaded Fries",
        desc: "Fries smothered in cheese sauce, chicken & jalapeños.",
        nameEs: "Patatas Cargadas",
        descEs: "Patatas bañadas en salsa de queso, pollo y jalapeños.",
        price: 5,
        tag: "Bestseller",
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Chicken Nuggets",
        desc: "6 pieces with dipping sauce.",
        nameEs: "Nuggets de Pollo",
        descEs: "6 piezas con salsa para mojar.",
        price: 5,
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Onion Rings",
        desc: "Crunchy battered rings with tangy dip.",
        nameEs: "Aros de Cebolla",
        descEs: "Aros crujientes empanizados con dip ácido.",
        price: 4,
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
  {
    id: "drinks",
    label: "Drinks",
    labelEs: "Bebidas",
    items: [
      {
        name: "Soft Drink",
        desc: "Ice-cold canned drink of your choice.",
        nameEs: "Refresco",
        descEs: "Bebida en lata bien fría de tu elección.",
        price: 2,
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Cold Coffee",
        desc: "Frothy, chilled & loaded with cream.",
        nameEs: "Café Helado",
        descEs: "Espumoso, frío y cargado de crema.",
        price: 5,
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Chocolate Shake",
        desc: "Thick shake topped with chocolate syrup.",
        nameEs: "Batido de Chocolate",
        descEs: "Batido espeso cubierto con jarabe de chocolate.",
        price: 6,
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Fresh Lime",
        desc: "Zesty and refreshing.",
        nameEs: "Lima Fresca",
        descEs: "Zarzosa y refrescante.",
        price: 3,
        tagEs: TAGS_ES,
        img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
      },
    ],
  },
];

export const NAV_LINKS = [
  { label: "Home", labelEs: "Inicio", href: "#home" },
  { label: "Menu", labelEs: "Menú", href: "#menu" },
  { label: "About", labelEs: "Nosotros", href: "#about" },
  { label: "Contact", labelEs: "Contacto", href: "#contact" },
] as const;

/** A picture in the hero carousel or the About strip. Editable at /admin/. */
export interface Slide {
  src: string;
  alt: string;
  kicker: string;
  kickerEs: string;
  caption: string;
  captionEs: string;
}

export const HERO_SLIDES: Slide[] = [
  { src: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1400&q=85", alt: "Fresh tacos ready to serve", kicker: "The house pour", kickerEs: "El favorito de la casa", caption: "Melt. Toast. Repeat.", captionEs: "Derretir. Tostar. Repetir." },
  { src: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=1400&q=85", alt: "Loaded burger with fresh toppings", kicker: "Pressed to order", kickerEs: "Presionado al pedido", caption: "Big bite energy.", captionEs: "Energía de bocado grande." },
  { src: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=1400&q=85", alt: "Loaded fries with sauce", kicker: "Side of serious", kickerEs: "Lado serio", caption: "Fries get loud.", captionEs: "Las patatas se hacen ruido." },
  { src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1400&q=85", alt: "Iced coffee on a table", kicker: "Cold pour", kickerEs: "Derramado frío", caption: "Cool it down.", captionEs: "Enfríate." },
  { src: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1400&q=85", alt: "Chocolate shake with cream", kicker: "Something sweet", kickerEs: "Algo dulce", caption: "End on a high.", captionEs: "Termina en grande." },
  { src: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1400&q=85", alt: "Fresh lime drink with mint", kicker: "Fresh finish", kickerEs: "Acabado fresco", caption: "Brighten the table.", captionEs: "Ilumina la mesa." },
];

export const ABOUT_SLIDES: Slide[] = [
  { src: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=80", alt: "French taco close-up", kicker: "", kickerEs: "", caption: "French taco close-up", captionEs: "Taco francés cercano" },
  { src: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=1200&q=80", alt: "Chicken burger", kicker: "", kickerEs: "", caption: "Chicken burger", captionEs: "Hamburguesa de pollo" },
  { src: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80", alt: "French fries", kicker: "", kickerEs: "", caption: "French fries", captionEs: "Patatas fritas" },
  { src: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80", alt: "Chocolate shake", kicker: "", kickerEs: "", caption: "Chocolate shake", captionEs: "Batido de chocolate" },
  { src: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1200&q=80", alt: "Cheese taco", kicker: "", kickerEs: "", caption: "Cheese taco", captionEs: "Taco de queso" },
  { src: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80", alt: "Special taco", kicker: "", kickerEs: "", caption: "Special taco", captionEs: "Taco especial" },
];
