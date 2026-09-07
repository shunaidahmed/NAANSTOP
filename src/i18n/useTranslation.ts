import { useLanguage } from "./LanguageContext";

export function useTranslation() {
  const { t } = useLanguage();
  return t;
}
