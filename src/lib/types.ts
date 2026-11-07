export interface CompanySettings {
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  npwp: string;
  logoUrl: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  invoicePrefix: string;
  paymentTermDays: number;
  taxLabel: string;
  taxRate: number;
  taxEnabledByDefault: boolean;
  defaultNotes: string;
  terms: string;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  npwp: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  /** Harga B2B / kolaborasi. Tidak pernah ditampilkan di situs publik. */
  price: number;
  /** Harga end-user / customer yang tampil di situs publik. */
  customerPrice: number;
  imageUrl: string;
  websiteVisible: boolean;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPrice {
  id: string;
  clientId: string;
  productId: string;
  price: number;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  productId: string | null;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
}

export interface ClientSnapshot {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  npwp: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientSnapshot: ClientSnapshot;
  issueDate: string;
  dueDate: string;
  deliveryDate: string;
  items: InvoiceItem[];
  discount: number;
  shippingCost: number;
  taxEnabled: boolean;
  taxLabel: string;
  taxRate: number;
  downPayment: number;
  notes: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
}

export type AppRole = "superuser" | "staff_finance" | "editor";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  username: string | null;
  role: AppRole | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  cover_image_url: string;
  published: boolean;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}
