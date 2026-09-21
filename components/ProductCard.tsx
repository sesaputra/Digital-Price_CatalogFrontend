"use client";

import Link from "next/link";
import { Product } from "@/types/api";
import { formatRupiah } from "@/lib/format";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  return (
    <Link
      href={`/catalog/products/${product.id}`}
      className="group block"
    >
      <article className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:border-slate-300 group-hover:shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">
              {product.name}
            </h2>

            {product.sku && (
              <p className="mt-1 text-xs text-slate-400">
                SKU: {product.sku}
              </p>
            )}
          </div>

          {product.brand && (
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {product.brand.name}
            </span>
          )}
        </div>

        {/* Category */}
        <div className="mt-4 flex flex-wrap gap-2">
          {product.category && (
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {product.category.name}
            </span>
          )}

          {product.product_type && (
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {product.product_type.name}
            </span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
            {product.description}
          </p>
        )}

        {/* Variants */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              Pilihan Harga
            </h3>

            <span className="text-xs text-slate-400">
              {product.variants.length} ukuran
            </span>
          </div>

          <div className="space-y-2">
            {product.variants.map(
              (variant) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {variant.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      per {variant.unit}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-slate-900">
                    {formatRupiah(
                      variant.price
                    )}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Detail indicator */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-400">
            Lihat detail produk
          </span>

          <span className="text-sm font-semibold text-slate-700 transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </div>
      </article>
    </Link>
  );
}