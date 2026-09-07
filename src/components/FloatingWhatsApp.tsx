import { DEFAULT_WA_MESSAGE, DEFAULT_WA_MESSAGE_ES, waLink } from "../data/site";
import { useLanguage } from "../i18n/LanguageContext";
import { WhatsAppIcon } from "./icons";

export default function FloatingWhatsApp() {
  const { lang } = useLanguage();
  const waMsg = lang === "es" ? DEFAULT_WA_MESSAGE_ES : DEFAULT_WA_MESSAGE;

  return (
    <a href={waLink(waMsg)} target="_blank" rel="noopener noreferrer" aria-label={lang === "es" ? "Chatear con nosotros en WhatsApp" : "Chat with us on WhatsApp"} title="Chat on WhatsApp" className="animate-pulse-ring fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white transition hover:scale-110 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
