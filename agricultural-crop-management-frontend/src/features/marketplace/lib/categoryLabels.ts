export const CATEGORY_LABEL_MAP: Record<string, string> = {
  CORN: "Ngô",
  RICE: "Gạo",
  SOYBEAN: "Đậu nành",
  Vegetable: "Rau củ",
  Grain: "Ngũ cốc",
  Fruit: "Trái cây",
};

export function getCategoryLabel(cat: string): string {
  return CATEGORY_LABEL_MAP[cat] ?? cat;
}
