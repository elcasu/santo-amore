export type PortableTextBlock = {
  _type: "block";
  _key: string;
  style?: "normal" | "h2" | "h3";
  children: { _type: "span"; _key: string; text: string; marks?: string[] }[];
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
  mainImage?: {
    src: string;
    alt?: string;
  };
  images?: { src: string; alt?: string }[];
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
  label: string;
  title: string;
  description?: string;
  image: string;
  href: string;
  span?: "wide" | "tall" | "square";
};
