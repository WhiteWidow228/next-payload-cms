import { CustomCursor } from "@/components/CustomCursor";
import { EstimatePopup } from "@/components/EstimatePopup";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <div className="pt-[92px] sm:pt-[108px]">{children}</div>
      <SiteFooter />
      <EstimatePopup />
      <CustomCursor />
    </>
  );
}