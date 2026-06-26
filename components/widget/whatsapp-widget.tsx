import { brand } from "@/brand.config";
import { WhatsAppIcon } from "@/components/icons";

/**
 * WhatsApp click-to-chat. Renders ONLY when brand.contact.whatsapp is set
 * (the scraper fills it from the source site). Floats bottom-LEFT so it never
 * collides with the FAQ widget (bottom-right). Opens wa.me in a new tab.
 *
 * WhatsApp green is kept as-is on purpose: it's a recognised action affordance,
 * not part of the site palette.
 */
export function WhatsAppWidget() {
  const number = brand.contact?.whatsapp?.replace(/[^\d]/g, "");
  if (!number) return null;

  const text = encodeURIComponent(`Hi ${brand.name}, I have a question.`);
  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 left-5 z-50 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 motion-reduce:transition-none cursor-pointer"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
