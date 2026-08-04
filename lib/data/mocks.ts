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
    description: "Piezas para acompañar cada gesto.",
  },
  {
    _id: "cat-home",
    title: "Home",
    slug: "home",
    description: "Objetos con presencia para el hogar.",
  },
];

export const mockProducts: Product[] = [
  {
    _id: "prod-aurelia",
    title: "Brazalete Aurelia",
    slug: "brazalete-aurelia",
    sku: "SA-AUR-01",
    price: 425000,
    collectionLabel: "New Heritage Collection",
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
    collectionLabel: "Pure Form",
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
    collectionLabel: "Golden Hour",
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
    collectionLabel: "Home",
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
    collectionLabel: "Home",
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
    excerpt: "Artisanal Soul, Modern Grace.",
    body: [
      block(
        "Santo Amore nace del encuentro entre oficio artesanal y siluetas contemporáneas. Diseñamos accesorios y piezas para el hogar con presencia, calidez y detalle.",
        "n1",
      ),
      block(
        "Cada colección busca el peso de lo hecho a mano sin renunciar a una estética clara y actual.",
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
    label: "Drop 01",
    span: "wide",
    description: "Accesorios atemporales para la luz del atardecer.",
    product: mockProducts[4], // Bandeja Golden Hour
  },
  {
    id: "drop-atrium",
    label: "Drop 02",
    span: "tall",
    description: "Formas arquitectónicas y contraste sereno.",
    product: mockProducts[3], // Bowl Atrium
  },
  {
    id: "drop-pure",
    label: "Drop 03",
    span: "square",
    description: "Siluetas limpias, presencia marcada.",
    product: mockProducts[1], // Colgante Veda
  },
];

export const mockSiteSettings: SiteSettings = {
  locationLabel: DEFAULT_LOCATION_LABEL,
  countryCode: DEFAULT_COUNTRY_CODE,
};

export const mockHome: HomePage = {
  hero: {
    eyebrow: "The 2026 Curation",
    title: "Artisanal Soul,",
    titleHighlight: "Modern Grace.",
    subtitle:
      "Descubrí una colección donde el oficio artesanal encuentra siluetas contemporáneas. Accesorios y home con presencia.",
    backgroundImage: {
      src: "/brand/neo-drop-atrium.png",
      alt: "",
    },
    primaryCta: { label: "Ver catálogo", href: "/catalogo" },
    secondaryCta: { label: "Heritage", href: "/nosotros" },
  },
  collections: {
    title: "Featured Collections",
    description:
      "Drops de temporada, curados con estética Neo Luxury refined.",
    exploreCta: { label: "Explorar todo", href: "/catalogo" },
    drops: mockFeaturedDrops,
  },
  journal: {
    eyebrow: "The Journal",
    title: "Behind the Seams: The Hand of the Artist",
    body: "Oficio, materia y gesto — el alma artesanal detrás de cada pieza Santo Amore.",
    cta: { label: "Leer más →", href: "/nosotros" },
  },
  featuredProducts: {
    title: "Piezas destacadas",
    viewAllCta: { label: "Ver todas", href: "/catalogo" },
    products: mockProducts.filter((p) => p.featured).slice(0, 3),
  },
};
