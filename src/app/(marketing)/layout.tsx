import type { ReactNode } from "react";
import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { StructuredData } from "@/components/StructuredData";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <StructuredData data={[organizationJsonLd(), websiteJsonLd()]} />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      <FloatingWhatsApp />
    </div>
  );
}
