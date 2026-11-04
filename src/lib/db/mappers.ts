import type {
  Client,
  ClientPrice,
  ClientSnapshot,
  CompanySettings,
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  Product,
} from "@/lib/types";
import { EMPTY_CLIENT_SNAPSHOT, defaultSettings } from "@/lib/domain";

export type InvoiceDraft = Omit<
  Invoice,
  "id" | "number" | "createdAt" | "updatedAt" | "paidAt"
>;

export interface ClientRow {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  npwp: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  sku: string;
  name: string;
  description: string;
  unit: string;
  price: number | string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientPriceRow {
  id: string;
  client_id: string;
  product_id: string;
  price: number | string;
  effective_from: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsRow {
  id: number;
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  npwp: string;
  logo_url: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  invoice_prefix: string;
  payment_term_days: number;
  tax_label: string;
  tax_rate: number | string;
  tax_enabled_by_default: boolean;
  default_notes: string;
  terms: string;
  deploy_hook_url: string;
  updated_at: string;
}

export interface InvoiceRow {
  id: string;
  number: string;
  client_id: string | null;
  client_snapshot: ClientSnapshot | null;
  issue_date: string | null;
  due_date: string | null;
  delivery_date: string | null;
  items: InvoiceItem[] | null;
  discount: number | string;
  shipping_cost: number | string;
  tax_enabled: boolean;
  tax_label: string;
  tax_rate: number | string;
  down_payment: number | string;
  notes: string;
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}

const num = (value: number | string | null | undefined): number => {
  const parsed = typeof value === "string" ? Number.parseFloat(value) : value ?? 0;
  return Number.isFinite(parsed) ? (parsed as number) : 0;
};

export function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name ?? "",
    contactPerson: row.contact_person ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    npwp: row.npwp ?? "",
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function clientToRow(client: Client): ClientRow {
  return {
    id: client.id,
    name: client.name,
    contact_person: client.contactPerson,
    phone: client.phone,
    email: client.email,
    address: client.address,
    city: client.city,
    npwp: client.npwp,
    notes: client.notes,
    created_at: client.createdAt,
    updated_at: client.updatedAt,
  };
}

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku ?? "",
    name: row.name ?? "",
    description: row.description ?? "",
    unit: row.unit ?? "",
    price: num(row.price),
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function productToRow(product: Product): ProductRow {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    unit: product.unit,
    price: product.price,
    active: product.active,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  };
}

export function toClientPrice(row: ClientPriceRow): ClientPrice {
  return {
    id: row.id,
    clientId: row.client_id,
    productId: row.product_id,
    price: num(row.price),
    effectiveFrom: row.effective_from,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function clientPriceToRow(price: ClientPrice): ClientPriceRow {
  return {
    id: price.id,
    client_id: price.clientId,
    product_id: price.productId,
    price: price.price,
    effective_from: price.effectiveFrom,
    created_at: price.createdAt,
    updated_at: price.updatedAt,
  };
}

export function toSettings(row: Partial<SettingsRow>): CompanySettings {
  const base = defaultSettings();
  return {
    name: row.name ?? base.name,
    tagline: row.tagline ?? base.tagline,
    address: row.address ?? base.address,
    city: row.city ?? base.city,
    phone: row.phone ?? base.phone,
    email: row.email ?? base.email,
    website: row.website ?? base.website,
    npwp: row.npwp ?? base.npwp,
    logoUrl: row.logo_url ?? base.logoUrl,
    bankName: row.bank_name ?? base.bankName,
    bankAccountNumber: row.bank_account_number ?? base.bankAccountNumber,
    bankAccountName: row.bank_account_name ?? base.bankAccountName,
    invoicePrefix: row.invoice_prefix ?? base.invoicePrefix,
    paymentTermDays: row.payment_term_days ?? base.paymentTermDays,
    taxLabel: row.tax_label ?? base.taxLabel,
    taxRate: num(row.tax_rate ?? base.taxRate),
    taxEnabledByDefault: row.tax_enabled_by_default ?? base.taxEnabledByDefault,
    defaultNotes: row.default_notes ?? base.defaultNotes,
    terms: row.terms ?? base.terms,
    deployHookUrl: row.deploy_hook_url ?? base.deployHookUrl,
  };
}

export function settingsToRow(settings: CompanySettings) {
  return {
    name: settings.name,
    tagline: settings.tagline,
    address: settings.address,
    city: settings.city,
    phone: settings.phone,
    email: settings.email,
    website: settings.website,
    npwp: settings.npwp,
    logo_url: settings.logoUrl,
    bank_name: settings.bankName,
    bank_account_number: settings.bankAccountNumber,
    bank_account_name: settings.bankAccountName,
    invoice_prefix: settings.invoicePrefix,
    payment_term_days: settings.paymentTermDays,
    tax_label: settings.taxLabel,
    tax_rate: settings.taxRate,
    tax_enabled_by_default: settings.taxEnabledByDefault,
    default_notes: settings.defaultNotes,
    terms: settings.terms,
    deploy_hook_url: settings.deployHookUrl,
  };
}

export function toInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    number: row.number,
    clientId: row.client_id ?? "",
    clientSnapshot: row.client_snapshot ?? { ...EMPTY_CLIENT_SNAPSHOT },
    issueDate: row.issue_date ?? "",
    dueDate: row.due_date ?? "",
    deliveryDate: row.delivery_date ?? "",
    items: Array.isArray(row.items) ? row.items : [],
    discount: num(row.discount),
    shippingCost: num(row.shipping_cost),
    taxEnabled: Boolean(row.tax_enabled),
    taxLabel: row.tax_label ?? "PPN",
    taxRate: num(row.tax_rate),
    downPayment: num(row.down_payment),
    notes: row.notes ?? "",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at,
  };
}

type InvoiceFields = Pick<
  Invoice,
  | "clientId"
  | "clientSnapshot"
  | "issueDate"
  | "dueDate"
  | "deliveryDate"
  | "items"
  | "discount"
  | "shippingCost"
  | "taxEnabled"
  | "taxLabel"
  | "taxRate"
  | "downPayment"
  | "notes"
  | "status"
>;

function invoiceFields(src: InvoiceFields) {
  return {
    client_id: src.clientId || null,
    client_snapshot: src.clientSnapshot,
    issue_date: src.issueDate || null,
    due_date: src.dueDate || null,
    delivery_date: src.deliveryDate || null,
    items: src.items,
    discount: src.discount,
    shipping_cost: src.shippingCost,
    tax_enabled: src.taxEnabled,
    tax_label: src.taxLabel,
    tax_rate: src.taxRate,
    down_payment: src.downPayment,
    notes: src.notes,
    status: src.status,
  };
}

export function invoiceInsert(draft: InvoiceDraft, number: string) {
  return { number, ...invoiceFields(draft) };
}

export function invoiceUpdate(invoice: Invoice) {
  return { ...invoiceFields(invoice), number: invoice.number, paid_at: invoice.paidAt };
}
