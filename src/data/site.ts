/**
 * ── SITE CONFIGURATION ──────────────────────────────────────────────
 * Everything you need to customise the site lives in this one file.
 */

export const SITE = {
  name: "NAAN STOP",
  subtitle: "FRENCH TACOS",
  phone: "34624205945",
  currency: "Rs.",
  address: "Passeig Prat de la Riba, 78, 08320 El Masnou, Barcelona, Spain",
  hours: [
    { days: "Monday – Sunday", time: "12:00 PM – 12:00 AM", daysEs: "Lunes – Domingo", timeEs: "12:00 PM – 12:00 AM" },
  ],
  hoursNote: "Hours may differ on public holidays.",
  hoursNoteEs: "Los horarios pueden cambiar en festivos.",
} as const;

export const waLink = (message: string): string =>
  `https://wa.me/${SITE.phone}?text=${encodeURIComponent(message)}`;

export const DEFAULT_WA_MESSAGE =
  "Hi NAAN STOP! I'd like to place an order.";

export const DEFAULT_WA_MESSAGE_ES =
  "¡Hola NAAN STOP! Me gustaría hacer un pedido.";

export const mapsUrl = (): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${SITE.name} ${SITE.subtitle}, ${SITE.address}`
  )}`;

export interface MenuItem {
  name: string;
  desc: string;
  nameEs?: string;
  descEs?: string;
  price: string;
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
        price: "M 350 · L 450",
        tag: "Bestseller",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Peri Peri Taco",
        desc: "Fiery peri peri chicken, fries & creamy garlic sauce.",
        nameEs: "Taco Peri Peri",
        descEs: "Pollo peri peri ardiente, patatas y salsa cremosa de ajo.",
        price: "M 380 · L 480",
        tag: "Spicy",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Loaded Cheese Taco",
        desc: "Double cheddar & mozzarella, double the cheese pull.",
        nameEs: "Taco Doble Queso",
        descEs: "Doble cheddar y mozzarella, doble tirón de queso.",
        price: "M 400 · L 500",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Mixed Taco",
        desc: "Chicken & beef together with signature sauce.",
        nameEs: "Taco Mixto",
        descEs: "Pollo y carne juntos con salsa signature.",
        price: "M 420 · L 520",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Double Decker Taco",
        desc: "Two layers of tortilla, double filling, pure indulgence.",
        nameEs: "Taco Doble Capa",
        descEs: "Dos capas de tortilla, doble relleno, puro placer.",
        price: "M 480 · L 580",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Naan Stop Special",
        desc: "Our secret recipe — all our sauces, every filling.",
        nameEs: "Especial NAAN STOP",
        descEs: "Nuestra receta secreta — todas nuestras salsas, cada relleno.",
        price: "M 450 · L 550",
        tag: "New",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
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
        price: "350",
        tag: "Bestseller",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Classic Chicken Burger",
        desc: "Grilled patty, cheddar & smoky BBQ sauce.",
        nameEs: "Hamburguesa Clásica de Pollo",
        descEs: "Parrilla, cheddar y salsa BBQ ahumada.",
        price: "300",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Peri Peri Chicken Burger",
        desc: "Spicy peri marinade, jalapeños & pepper jack.",
        nameEs: "Hamburguesa Peri Peri de Pollo",
        descEs: "Marinada peri picante, jalapeños y pepper jack.",
        price: "380",
        tag: "Spicy",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Double Smash Burger",
        desc: "Two smashed beef patties, double cheese.",
        nameEs: "Hamburguesa Doble Smash",
        descEs: "Dos hamburguesas de ternera aplastadas, doble queso.",
        price: "450",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
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
        price: "150",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Loaded Fries",
        desc: "Fries smothered in cheese sauce, chicken & jalapeños.",
        nameEs: "Patatas Cargadas",
        descEs: "Patatas bañadas en salsa de queso, pollo y jalapeños.",
        price: "250",
        tag: "Bestseller",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Chicken Nuggets",
        desc: "6 pieces with dipping sauce.",
        nameEs: "Nuggets de Pollo",
        descEs: "6 piezas con salsa para mojar.",
        price: "250",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Onion Rings",
        desc: "Crunchy battered rings with tangy dip.",
        nameEs: "Aros de Cebolla",
        descEs: "Aros crujientes empanizados con dip ácido.",
        price: "200",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
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
        price: "100",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Cold Coffee",
        desc: "Frothy, chilled & loaded with cream.",
        nameEs: "Café Helado",
        descEs: "Espumoso, frío y cargado de crema.",
        price: "250",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Chocolate Shake",
        desc: "Thick shake topped with chocolate syrup.",
        nameEs: "Batido de Chocolate",
        descEs: "Batido espeso cubierto con jarabe de chocolate.",
        price: "300",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
        img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80",
      },
      {
        name: "Fresh Lime",
        desc: "Zesty and refreshing.",
        nameEs: "Lima Fresca",
        descEs: "Zarzosa y refrescante.",
        price: "150",
        tagEs: { Bestseller: "Más Vendido", Spicy: "Picante", New: "Nuevo" },
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
