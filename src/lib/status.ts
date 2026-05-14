export const ORDER_STATUSES = {
  NEW: { label: "Новая", color: "blue" },
  CONFIRMED: { label: "Подтверждена", color: "cyan" },
  PURCHASING: { label: "Закупка", color: "amber" },
  PURCHASED: { label: "Куплено", color: "orange" },
  QUALITY_CHECK: { label: "Проверка качества", color: "yellow" },
  PACKING: { label: "Упаковка", color: "lime" },
  IN_TRANSIT: { label: "В пути", color: "emerald" },
  CUSTOMS: { label: "Таможня", color: "purple" },
  DELIVERING: { label: "Доставка", color: "indigo" },
  DELIVERED: { label: "Доставлено", color: "green" },
  CANCELLED: { label: "Отменена", color: "red" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUSES;

export function getStatusInfo(status: string) {
  return ORDER_STATUSES[status as OrderStatus] || { label: status, color: "gray" };
}

export const STATUS_FLOW: OrderStatus[] = [
  "NEW", "CONFIRMED", "PURCHASING", "PURCHASED",
  "QUALITY_CHECK", "PACKING", "IN_TRANSIT", "CUSTOMS",
  "DELIVERING", "DELIVERED",
];
