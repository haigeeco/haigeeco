import type { Client, ClientSnapshot, CompanySettings } from "./types";

// Logo bawaan aplikasi (aset di /public). Dipakai bila settings.logoUrl kosong.
// Versi 320px dari sumber `assets/brand/logo-source.png` (1254px, tidak ikut di-deploy)
// supaya tidak memuat file 811 KB di setiap halaman.
export const DEFAULT_LOGO_URL = "/img/logo-320.png";

export function defaultSettings(): CompanySettings {
  return {
    name: "Gee Co.",
    tagline: "Bakery, Dessert & Viral Food Supplier",
    address: "",
    city: "",
    phone: "",
    email: "",
    website: "",
    npwp: "",
    logoUrl: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
    invoicePrefix: "GC",
    paymentTermDays: 14,
    taxLabel: "PPN",
    taxRate: 11,
    taxEnabledByDefault: false,
    defaultNotes: "Terima kasih atas kepercayaan Anda.",
    terms:
      "Pembayaran ditransfer ke rekening di atas. Invoice ini sah tanpa tanda tangan basah.",
  };
}

export function snapshotClient(client: Client): ClientSnapshot {
  return {
    name: client.name,
    contactPerson: client.contactPerson,
    phone: client.phone,
    email: client.email,
    address: client.address,
    city: client.city,
    npwp: client.npwp,
  };
}

export const EMPTY_CLIENT_SNAPSHOT: ClientSnapshot = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  npwp: "",
};
