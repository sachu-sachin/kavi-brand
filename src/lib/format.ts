export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function decimalToNumber(
  value: { toString(): string } | null | undefined,
): number | null {
  return value == null ? null : Number(value.toString());
}

export function formatUnit(value: number, unitType: string): string {
  const suffix: Record<string, string> = {
    G: "g",
    KG: "kg",
    ML: "ml",
    L: "L",
    PCS: " pcs",
  };
  return `${value}${suffix[unitType] ?? unitType.toLowerCase()}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
