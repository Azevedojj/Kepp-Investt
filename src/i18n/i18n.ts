import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ptTranslations from './translations/pt.json';
import enTranslations from './translations/en.json';
import esTranslations from './translations/es.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': {
        translation: ptTranslations
      },
      'en': {
        translation: enTranslations
      },
      'es': {
        translation: esTranslations
      }
    },
    lng: 'pt-BR',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;