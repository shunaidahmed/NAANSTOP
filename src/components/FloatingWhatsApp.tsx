import { useLanguage } from "../i18n/LanguageContext";
import { WhatsAppIcon } from "./icons";

export default function FloatingWhatsApp() {
  const { t, waLink, waMsg } = useLanguage();

  return (
    <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer" aria-label={t.floatingWhatsapp} title={t.floatingWhatsapp} className="animate-pulse-ring fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white transition hover:scale-110 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
