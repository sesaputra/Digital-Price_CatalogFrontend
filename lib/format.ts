export function formatRupiah(
  value: string | number
): string {
  const number =
    typeof value === "string"
      ? Number(value)
      : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}