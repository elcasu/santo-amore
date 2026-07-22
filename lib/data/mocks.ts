import type {
  Category,
  FeaturedDrop,
  Page,
  PortableTextBlock,
  Product,
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
    price: 425000,
    collectionLabel: "New Heritage Collection",
    featured: true,
    available: true,
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
    price: 289000,
    collectionLabel: "Pure Form",
    featured: true,
    available: true,
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
    price: 198000,
    collectionLabel: "Golden Hour",
    featured: true,
    available: true,
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
    price: 156000,
    collectionLabel: "Home",
    featured: false,
    available: true,
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
    price: 212000,
    collectionLabel: "Home",
    featured: false,
    available: true,
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
        "Instagram y WhatsApp serán los canales principales mientras armamos la tienda completa.",
        "c2",
      ),
    ],
  },
];

export const mockFeaturedDrops: FeaturedDrop[] = [
  {
    id: "drop-golden",
    label: "Drop 01",
    title: "Golden Hour",
    description: "Accesorios atemporales para la luz del atardecer.",
    image: "/brand/neo-drop-golden.png",
    href: "/catalogo?categoria=accesorios",
    span: "wide",
  },
  {
    id: "drop-atrium",
    label: "Drop 02",
    title: "The Atrium",
    description: "Formas arquitectónicas y contraste sereno.",
    image: "/brand/neo-drop-atrium.png",
    href: "/catalogo?categoria=home",
    span: "tall",
  },
  {
    id: "drop-pure",
    label: "Drop 03",
    title: "Pure Form",
    description: "Siluetas limpias, presencia marcada.",
    image: "/brand/neo-drop-pure.png",
    href: "/catalogo",
    span: "square",
  },
];
