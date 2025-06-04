import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import language files

// English translations
import enCommon from './locales/en/common.json';
import enLanguage from './locales/en/language.json';
import enNavigation from './locales/en/navigation.json';
import enLandingPage from './locales/en/landingPage.json';
import enChapterView from './locales/en/chapterView.json';
import enAdminView from './locales/en/adminView.json';
import enAbout from './locales/en/about.json';
import enDashboard from './locales/en/dashboard.json';
import enAuth from './locales/en/auth.json';
import enSettings from './locales/en/settings.json';
import enApp from './locales/en/app.json';
import enAdmin from './locales/en/admin.json';
import enFooter from './locales/en/footer.json';
import enChatTool from './locales/en/chatTool.json';
import enGeoGebraPlotter from './locales/en/geoGebraPlotter.json';
import enNotesTool from './locales/en/notesTool.json';
import enCourseView from './locales/en/courseView.json';
import enCreateCourse from './locales/en/createCourse.json';
import enImpressum from './locales/en/impressum.json';
import enToolbarContainer from './locales/en/toolbarContainer.json';
import enStatisticsPage from './locales/en/statisticsPage.json';

// German translations
import deCommon from './locales/de/common.json';
import deLanguage from './locales/de/language.json';
import deNavigation from './locales/de/navigation.json';
import deLandingPage from './locales/de/landingPage.json';
import deChapterView from './locales/de/chapterView.json';
import deAdminView from './locales/de/adminView.json';
import deAbout from './locales/de/about.json';
import deDashboard from './locales/de/dashboard.json';
import deAuth from './locales/de/auth.json';
import deSettings from './locales/de/settings.json';
import deApp from './locales/de/app.json';
import deAdmin from './locales/de/admin.json';
import deFooter from './locales/de/footer.json';
import deChatTool from './locales/de/chatTool.json';
import deGeoGebraPlotter from './locales/de/geoGebraPlotter.json';
import deNotesTool from './locales/de/notesTool.json';
import deCourseView from './locales/de/courseView.json';
import deCreateCourse from './locales/de/createCourse.json';
import deImpressum from './locales/de/impressum.json';
import deToolbarContainer from './locales/de/toolbarContainer.json';
import deStatisticsPage from './locales/de/statisticsPage.json';

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    resources: {
      en: {
        common: enCommon,
        language: enLanguage,
        navigation: enNavigation,
        landingPage: enLandingPage,
        chapterView: enChapterView,
        adminView: enAdminView,
        about: enAbout,
        dashboard: enDashboard,
        auth: enAuth,
        settings: enSettings,
        app: enApp,
        admin: enAdmin,
        footer: enFooter,
        chatTool: enChatTool,
        geoGebraPlotter: enGeoGebraPlotter,
        notesTool: enNotesTool,
        courseView: enCourseView,
        createCourse: enCreateCourse,
        impressum: enImpressum,
        toolbarContainer: enToolbarContainer,
        statisticsPage: enStatisticsPage,
      },
      de: {
        common: deCommon,
        language: deLanguage,
        navigation: deNavigation,
        landingPage: deLandingPage,
        chapterView: deChapterView,
        adminView: deAdminView,
        about: deAbout,
        dashboard: deDashboard,
        auth: deAuth,
        settings: deSettings,
        app: deApp,
        admin: deAdmin,
        footer: deFooter,
        chatTool: deChatTool,
        geoGebraPlotter: deGeoGebraPlotter,
        notesTool: deNotesTool,
        courseView: deCourseView,
        createCourse: deCreateCourse,
        impressum: deImpressum,
        toolbarContainer: deToolbarContainer,
        statisticsPage: deStatisticsPage,
      },
    },
    fallbackLng: 'en',
    //debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
