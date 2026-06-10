export type FarmDiscoveryCategory = "all" | "vegetables" | "fruits" | "rice" | "specialties";

export type FarmDiscoveryMetadata = {
  description: string;
  specialty: string;
  categories: Exclude<FarmDiscoveryCategory, "all">[];
  badges: string[];
  coverImageUrl: string;
  avatarLabel?: string;
  openForSale: boolean;
};

const FARM_METADATA_BY_ID: Record<number, Partial<FarmDiscoveryMetadata>> = {
  1: {
    specialty: "Rau hữu cơ và rau sạch trong nhà lưới.",
    categories: ["vegetables"],
    badges: ["Hữu cơ"],
  },
  2: {
    specialty: "Lúa gạo chất lượng cao và nông sản đặc sản đồng bằng.",
    categories: ["rice", "specialties"],
    badges: ["Đang mở bán"],
  },
  3: {
    specialty: "Cam, quýt và trái cây theo mùa.",
    categories: ["fruits"],
    badges: ["VietGAP"],
  },
  4: {
    specialty: "Rau thủy canh và rau hữu cơ an toàn.",
    categories: ["vegetables"],
    badges: ["Hữu cơ"],
  },
};

const FALLBACK_METADATA: FarmDiscoveryMetadata[] = [
  {
    description: "Chuyên canh nông sản sạch, ưu tiên canh tác bền vững và truy xuất minh bạch.",
    specialty: "Rau củ hữu cơ và rau sạch theo tiêu chuẩn mùa vụ.",
    categories: ["vegetables"],
    badges: ["Hữu cơ"],
    coverImageUrl: "/demo-evidence/products/soybean%20field.jpg",
    avatarLabel: "NX",
    openForSale: true,
  },
  {
    description: "Nông trại gia đình với vùng trồng ổn định, đóng gói theo đơn marketplace.",
    specialty: "Gạo, nông sản khô và đặc sản địa phương.",
    categories: ["rice", "specialties"],
    badges: ["Đang mở bán"],
    coverImageUrl: "/demo-evidence/products/rice%20field.jpg",
    avatarLabel: "FD",
    openForSale: true,
  },
  {
    description: "Vườn cây theo mùa, thu hái trong ngày và kiểm soát chất lượng đầu ra.",
    specialty: "Trái cây tươi, cam quýt và sản phẩm vườn.",
    categories: ["fruits"],
    badges: ["VietGAP"],
    coverImageUrl: "/demo-evidence/products/corn%20field.jpg",
    avatarLabel: "VC",
    openForSale: true,
  },
  {
    description: "Khu trồng rau trong nhà màng, tập trung vào sản phẩm ít tồn dư.",
    specialty: "Rau ăn lá, rau thủy canh và rau gia vị.",
    categories: ["vegetables", "specialties"],
    badges: ["Hữu cơ"],
    coverImageUrl: "/demo-evidence/evidence/Ruong.png",
    avatarLabel: "GO",
    openForSale: false,
  },
];

export function getFarmDiscoveryMetadata(farmId: number): FarmDiscoveryMetadata {
  const fallback = FALLBACK_METADATA[Math.abs(farmId) % FALLBACK_METADATA.length];
  const override = FARM_METADATA_BY_ID[farmId];

  return {
    ...fallback,
    ...override,
    categories: override?.categories ?? fallback.categories,
    badges: override?.badges ?? fallback.badges,
  };
}
