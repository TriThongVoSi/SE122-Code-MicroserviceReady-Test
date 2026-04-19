import { User, Farm, Season, Lot, Product, Order, Review, Address } from '@/src/shared/types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Nguyễn Văn Mua', email: 'buyer@example.com', role: 'buyer', phone: '0901234567', status: 'active' },
  { id: 'u2', name: 'Trần Thị Bán', email: 'seller@example.com', role: 'seller', phone: '0987654321', avatar: 'https://i.pravatar.cc/150?u=u2', bio: 'Nông dân 10 năm kinh nghiệm', region: 'Lâm Đồng', farmId: 'f1', status: 'active' },
  { id: 'u3', name: 'Admin Hệ Thống', email: 'admin@example.com', role: 'admin', status: 'active' },
];

export const mockAddresses: Address[] = [
  {
    id: 'a1',
    userId: 'u1',
    fullName: 'Nguyễn Văn Mua',
    phone: '0901234567',
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    street: '123 Đường Lê Lợi',
    detail: 'Tòa nhà Saigon Centre',
    isDefault: true,
    label: 'office'
  },
  {
    id: 'a2',
    userId: 'u1',
    fullName: 'Nguyễn Văn Mua',
    phone: '0901234567',
    province: 'Hồ Chí Minh',
    district: 'Quận 7',
    ward: 'Phường Tân Phong',
    street: '456 Nguyễn Văn Linh',
    isDefault: false,
    label: 'home'
  },
  {
    id: 'a3',
    userId: 'u2',
    fullName: 'Trần Thị Bán',
    phone: '0987654321',
    province: 'Lâm Đồng',
    district: 'Thành phố Đà Lạt',
    ward: 'Phường 1',
    street: '123 Đường Hoa',
    isDefault: true,
    label: 'home'
  }
];

export const mockFarms: Farm[] = [
  {
    id: 'f1',
    name: 'Nông trại Xanh Đà Lạt',
    ownerId: 'u2',
    region: 'Lâm Đồng',
    address: '123 Đường Hoa, Phường 1, Đà Lạt',
    description: 'Nông trại chuyên trồng rau củ quả sạch theo tiêu chuẩn VietGAP.',
    image: 'https://picsum.photos/seed/farm1/800/600',
  },
  {
    id: 'f2',
    name: 'Vườn Trái Cây Miền Tây',
    ownerId: 'u2',
    region: 'Cần Thơ',
    address: '456 Đường Sông, Cái Răng, Cần Thơ',
    description: 'Chuyên cung cấp các loại trái cây đặc sản miền Tây.',
    image: 'https://picsum.photos/seed/farm2/800/600',
  }
];

export const mockSeasons: Season[] = [
  { id: 's1', farmId: 'f1', name: 'Vụ Đông Xuân 2023', cropType: 'Rau củ', startDate: '2023-10-01', endDate: '2024-03-31', status: 'completed' },
  { id: 's2', farmId: 'f2', name: 'Vụ Hè Thu 2024', cropType: 'Trái cây', startDate: '2024-04-01', endDate: '2024-09-30', status: 'active' },
];

export const mockLots: Lot[] = [
  { id: 'l1', seasonId: 's1', code: 'LOT-DX23-001', harvestDate: '2024-01-15', quantity: 500, status: 'available' },
  { id: 'l2', seasonId: 's2', code: 'LOT-HT24-001', harvestDate: '2024-05-20', quantity: 1000, status: 'available' },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Cà chua Cherry VietGAP',
    slug: 'ca-chua-cherry-vietgap',
    category: 'Rau củ',
    description: 'Cà chua Cherry trồng trong nhà màng, không sử dụng thuốc trừ sâu hóa học. Vị ngọt thanh, giòn, thích hợp làm salad.',
    shortDescription: 'Cà chua Cherry sạch, an toàn cho sức khỏe.',
    price: 45000,
    unit: 'kg',
    stock: 150,
    images: ['https://images.unsplash.com/photo-1607305387299-a3d9611cd469?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
    sellerId: 'u2',
    farmId: 'f1',
    seasonId: 's1',
    lotId: 'l1',
    region: 'Lâm Đồng',
    traceable: true,
    rating: 4.8,
    reviewCount: 124,
    createdAt: '2024-01-20T10:00:00Z',
    status: 'published',
  },
  {
    id: 'p2',
    name: 'Sầu riêng Ri6',
    slug: 'sau-rieng-ri6',
    category: 'Trái cây',
    description: 'Sầu riêng Ri6 chín cây tự nhiên, cơm vàng hạt lép, thơm ngon đậm đà.',
    shortDescription: 'Sầu riêng Ri6 đặc sản miền Tây.',
    price: 120000,
    unit: 'kg',
    stock: 50,
    images: ['https://images.unsplash.com/photo-1562486683-67d4d5886f99?q=80&w=1375&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
    sellerId: 'u2',
    farmId: 'f2',
    seasonId: 's2',
    lotId: 'l2',
    region: 'Cần Thơ',
    traceable: true,
    rating: 4.9,
    reviewCount: 89,
    createdAt: '2024-05-25T08:00:00Z',
    status: 'published',
  },
  {
    id: 'p3',
    name: 'Xà lách thủy canh',
    slug: 'xa-lach-thuy-canh',
    category: 'Rau củ',
    description: 'Xà lách trồng theo phương pháp thủy canh, sạch 100%, không cần rửa lại trước khi ăn.',
    shortDescription: 'Xà lách thủy canh tươi ngon.',
    price: 35000,
    unit: 'kg',
    stock: 200,
    images: ['https://images.unsplash.com/photo-1757514029798-d92f3ffe5ad5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2FsYWQlMjBmYXJtfGVufDB8fDB8fHww'],
    sellerId: 'u2',
    farmId: 'f1',
    seasonId: 's1',
    lotId: 'l1',
    region: 'Lâm Đồng',
    traceable: true,
    rating: 4.5,
    reviewCount: 45,
    createdAt: '2024-02-10T09:00:00Z',
    status: 'published',
  }
];

export const mockOrders: Order[] = [
  {
    id: 'o1',
    buyerId: 'u1',
    sellerId: 'u2',
    items: [
      { productId: 'p1', quantity: 2, price: 45000 },
      { productId: 'p3', quantity: 1, price: 35000 }
    ],
    total: 125000,
    shippingFee: 30000,
    status: 'delivering',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    phone: '0901234567',
    paymentMethod: 'COD',
    createdAt: '2024-06-01T14:30:00Z',
  },
  {
    id: 'o2',
    buyerId: 'u1',
    sellerId: 'u2',
    items: [
      { productId: 'p2', quantity: 3, price: 120000 }
    ],
    total: 360000,
    shippingFee: 50000,
    status: 'completed',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    phone: '0901234567',
    paymentMethod: 'Bank Transfer',
    createdAt: '2024-05-28T09:15:00Z',
  }
];

export const mockReviews: Review[] = [
  {
    id: 'r1',
    productId: 'p1',
    userId: 'u1',
    rating: 5,
    comment: 'Cà chua rất tươi và ngọt. Giao hàng nhanh.',
    createdAt: '2024-02-05T10:00:00Z'
  }
];
