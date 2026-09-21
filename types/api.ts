export interface Tenant {
  id: number;
  name: string;
  slug: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "owner" | "employee";
  tenant: Tenant | null;
}

export interface Category {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface ProductType {
  id: number;
  name: string;
  category?: Category | null;
}

export interface ProductVariant {
  id: number;
  name: string;
  unit: string;
  price: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string | null;
  description: string | null;

  category: Category | null;

  product_type: ProductType | null;

  brand: Brand | null;

  variants: ProductVariant[];
}

export interface PaginatedResponse<T> {
  data: T[];

  current_page: number;
  last_page: number;
  per_page: number;
  total: number;

  first_page_url: string | null;
  last_page_url: string | null;
  next_page_url: string | null;
  prev_page_url: string | null;

  from: number | null;
  to: number | null;
}

export type ProductResponse =
  PaginatedResponse<Product>;