export const ORDER_STATUS = {
  NEW: { label: "Новая", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  APPROVED: { label: "Подтверждена", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" },
  SHIPPED: { label: "Отправлена", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  DELIVERED: { label: "Доставлена", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  CANCELLED: { label: "Отменена", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS;

export function getStatusLabel(status: string): string {
  return ORDER_STATUS[status as OrderStatus]?.label || status;
}

export function getStatusColor(status: string): string {
  return ORDER_STATUS[status as OrderStatus]?.color || "bg-gray-100 text-gray-800";
}
