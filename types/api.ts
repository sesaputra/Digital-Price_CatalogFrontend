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

  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };

  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export type ProductResponse =
  PaginatedResponse<Product>;