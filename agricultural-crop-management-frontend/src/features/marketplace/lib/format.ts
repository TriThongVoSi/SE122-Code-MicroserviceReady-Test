export function formatVnd(value: number, locale: string = "vi-VN"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(iso: string, locale: string = "vi-VN"): string {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function formatDate(iso: string, locale: string = "vi-VN"): string {
  const value = new Date(iso);
  if (Number.isNaN(value.getTime())) {
    return iso;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(value);
}

