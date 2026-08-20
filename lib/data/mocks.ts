import {
  DEFAULT_COUNTRY_CODE,
  DEFAULT_LOCATION_LABEL,
} from "@/lib/site/location";
import type {
  Category,
  FeaturedDrop,
  HomePage,
  Page,
  PortableTextBlock,
  Product,
  SiteSettings,
} from "@/lib/types/content";

function block(text: string, key: string): PortableTextBlock {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    children: [{ _type: "span", _key: `${key}-span`, text }],
  };
}

export const mockCategories: Category[] = [
  {
    _id: "cat-accesorios",
    title: "Accesorios",
    slug: "accesorios",
    description: "Pulseras, collares y piezas para llevar.",
  },
  {
    _id: "cat-home",
    title: "Home",
    slug: "home",
    description: "Objetos para la mesa y la casa.",
  },
];

export const mockProducts: Product[] = [
  {
    _id: "prod-aurelia",
    title: "Brazalete Aurelia",
    slug: "brazalete-aurelia",
    sku: "SA-AUR-01",
    price: 425000,
    collectionLabel: "Muñeca",
    featured: true,
    commerceStatus: "available",
    trackInventory: true,
    stockQty: 1,
    maxPerOrder: 1,
    description:
      "Geometría fluida en metal dorado. Inspirado en el oleaje mediterráneo y terminado a mano en 40 horas de taller.",
    body: [
      block(
        "Cada Brazalete Aurelia nace en el atelier: martillado tradicional, pulido artesanal y un perfil contemporáneo.",
        "b1",
      ),
      block(
        "Diseñado para acompañar el día a día con peso visual sin perder gracia.",
        "b2",
      ),
    ],
    mainImage: {
      src: "/brand/neo-product-aurelia.png",
      alt: "Brazalete Aurelia sobre piedra",
    },
    images: [
      {
        src: "/brand/neo-product-aurelia.png",
        alt: "Brazalete Aurelia — detalle",
      },
      { src: "/brand/neo-product-veda.png", alt: "Detalle de textura" },
      { src: "/brand/neo-product-teiger.png", alt: "Vista lifestyle" },
    ],
    categories: [mockCategories[0]],
  },
  {
    _id: "prod-veda",
    title: "Colgante Veda",
    slug: "colgante-veda",
    sku: "SA-VED-01",
    price: 289000,
    compareAtPrice: 320000,
    collectionLabel: "Cuello",
    featured: true,
    commerceStatus: "available",
    trackInventory: true,
    stockQty: 3,
    maxPerOrder: 2,
    description:
      "Silueta limpia y presencia serena. Una pieza central para collares y capas.",
    mainImage: {
      src: "/brand/neo-product-veda.png",
      alt: "Colgante Veda",
    },
    categories: [mockCategories[0]],
  },
  {
    _id: "prod-teiger",
    title: "Set de Anillos Teiger",
    slug: "set-anillos-teiger",
    sku: "SA-TEI-01",
    price: 198000,
    collectionLabel: "Mano",
    featured: true,
    commerceStatus: "coming_soon",
    comingSoonLabel: "Próximamente · Agosto",
    trackInventory: false,
    description:
      "Tres anillos que dialogan entre sí: líneas suaves, metal cálido, stack versátil.",
    mainImage: {
      src: "/brand/neo-product-teiger.png",
      alt: "Set de Anillos Teiger",
    },
    categories: [mockCategories[0]],
  },
  {
    _id: "prod-atrium",
    title: "Bowl Atrium",
    slug: "bowl-atrium",
    sku: "SA-ATR-01",
    price: 156000,
    collectionLabel: "Mesa",
    featured: false,
    commerceStatus: "made_to_order",
    leadTimeDays: 21,
    maxPerOrder: 2,
    trackInventory: false,
    description:
      "Cerámica de formas arquitectónicas para la mesa o la consolá.",
    mainImage: {
      src: "/brand/neo-drop-atrium.png",
      alt: "Bowl Atrium",
    },
    categories: [mockCategories[1]],
  },
  {
    _id: "prod-golden",
    title: "Bandeja Golden Hour",
    slug: "bandeja-golden-hour",
    sku: "SA-GOL-01",
    price: 212000,
    collectionLabel: "Mesa",
    featured: false,
    commerceStatus: "sold_out",
    trackInventory: false,
    description: "Superficie metálica suave para rituales de mesa.",
    mainImage: {
      src: "/brand/neo-drop-golden.png",
      alt: "Bandeja Golden Hour",
    },
    categories: [mockCategories[1]],
  },
];

export const mockPages: Page[] = [
  {
    _id: "page-nosotros",
    title: "Nosotros",
    slug: "nosotros",
    excerpt: "Atelier de accesorios y home en Mar del Plata.",
    body: [
      block(
        "Santo Amore nace del oficio: accesorios y piezas para el hogar hechas a mano, con siluetas contemporáneas.",
        "n1",
      ),
      block(
        "Trabajamos a escala chica — locales, ferias y encargos — y vendemos también por la web. Si estás en Mar del Plata, escribinos y coordinamos.",
        "n2",
      ),
    ],
  },
  {
    _id: "page-envios",
    title: "Envíos",
    slug: "envios",
    excerpt: "Entregas cuidadosas en Argentina.",
    body: [
      block(
        "Despachamos a todo el país. Los tiempos estimados se confirman al momento de la compra (fase e-commerce).",
        "e1",
      ),
      block(
        "Por ahora podés consultar disponibilidad y envíos por WhatsApp o el formulario de contacto.",
        "e2",
      ),
    ],
  },
  {
    _id: "page-contacto",
    title: "Contacto",
    slug: "contacto",
    excerpt: "Escribinos: estamos para ayudarte.",
    body: [
      block(
        "Consultas de stock, encargos y mayoristas: escribinos y te respondemos a la brevedad.",
        "c1",
      ),
      block(
        "WhatsApp es el canal principal de consultas (stock, encargos y envíos). También estamos en Instagram.",
        "c2",
      ),
    ],
  },
];

export const mockFeaturedDrops: FeaturedDrop[] = [
  {
    id: "drop-golden",
    label: "Mesa",
    span: "wide",
    description: "Para rituales de mesa, cuando vuelva al taller.",
    product: mockProducts[4], // Bandeja Golden Hour
  },
  {
    id: "drop-atrium",
    label: "Encargo",
    span: "tall",
    description: "Cerámica a pedido, con tiempo de elaboración.",
    product: mockProducts[3], // Bowl Atrium
  },
  {
    id: "drop-pure",
    label: "Listo",
    span: "square",
    description: "Una pieza central, disponible ahora.",
    product: mockProducts[1], // Colgante Veda
  },
];

export const mockSiteSettings: SiteSettings = {
  locationLabel: DEFAULT_LOCATION_LABEL,
  countryCode: DEFAULT_COUNTRY_CODE,
};

export const mockHome: HomePage = {
  hero: {
    eyebrow: "Atelier en Mar del Plata",
    title: "Artisanal Soul,",
    titleHighlight: "Modern Grace.",
    subtitle:
      "Accesorios y piezas para el hogar, hechas a mano. Algunas listas para llevar; otras, a pedido.",
    backgroundImage: {
      src: "/brand/neo-drop-atrium.png",
      alt: "Bowl Atrium sobre mesa",
    },
    primaryCta: { label: "Ver piezas", href: "/catalogo" },
    secondaryCta: {
      label: "Encargar",
      href: "/catalogo?disponibilidad=encargo",
    },
  },
  collections: {
    title: "En la mesa",
    description: "Una vitrina chica: lo que está en el taller ahora.",
    exploreCta: { label: "Ver todas", href: "/catalogo" },
    drops: mockFeaturedDrops,
  },
  journal: {
    eyebrow: "El taller",
    title: "Oficio en Mar del Plata",
    body: "Trabajamos a escala chica: locales, ferias y encargos por WhatsApp. Si estás en la ciudad, escribinos y coordinamos.",
    cta: { label: "Conocenos", href: "/nosotros" },
  },
  featuredProducts: {
    title: "Piezas",
    viewAllCta: { label: "Ver catálogo", href: "/catalogo" },
    products: mockProducts.filter((p) => p.featured).slice(0, 3),
  },
};
