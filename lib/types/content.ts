export type PortableTextBlock = {
  _type: "block";
  _key: string;
  style?: "normal" | "h2" | "h3";
  children: { _type: "span"; _key: string; text: string; marks?: string[] }[];
};

export type CmsImage = {
  src: string;
  alt?: string;
};

export type CtaLink = {
  label: string;
  href: string;
};

export type Category = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
};

export type Product = {
  _id: string;
  title: string;
  slug: string;
  price?: number;
  description?: string;
  body?: PortableTextBlock[];
  featured?: boolean;
  available?: boolean;
  mainImage?: CmsImage;
  images?: CmsImage[];
  categories?: Category[];
  collectionLabel?: string;
};

export type Page = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: PortableTextBlock[];
};

export type FeaturedDrop = {
  id: string;
  label?: string;
  description?: string;
  span?: "wide" | "tall" | "square";
  product: Pick<
    Product,
    "_id" | "title" | "slug" | "description" | "mainImage" | "collectionLabel"
  >;
};

export type HomePage = {
  hero: {
    eyebrow?: string;
    title: string;
    titleHighlight?: string;
    subtitle?: string;
    backgroundImage?: CmsImage;
    primaryCta?: CtaLink;
    secondaryCta?: CtaLink;
  };
  collections?: {
    title?: string;
    description?: string;
    exploreCta?: CtaLink;
    drops?: FeaturedDrop[];
  };
  journal?: {
    eyebrow?: string;
    title: string;
    body?: string;
    cta?: CtaLink;
  };
  featuredProducts?: {
    title?: string;
    viewAllCta?: CtaLink;
    products?: Product[];
  };
};
