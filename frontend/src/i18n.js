import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations for Settings Modal
const resources = {
  'en-IN': {
    translation: {
      settings: {
        title: "Settings",
        subtitle: "Local Preferences",
        tabs: {
          general: "General",
          appearance: "Appearance",
          security: "Security"
        },
        localization: {
          title: "Localization",
          systemLanguage: "System Language",
          change: "Change"
        },
        dataManagement: {
          title: "Data Management",
          localCache: "Local Cache",
          cacheUsing: "Currently using {{size}} of temporary storage.",
          cacheCleared: "Cache cleared successfully.",
          clearBtn: "Clear",
          doneBtn: "Done"
        },
        theme: {
          title: "Theme Preferences",
          system: "System",
          light: "Light",
          dark: "Dark"
        },
        accessibility: {
          title: "Accessibility",
          highContrast: "High Contrast Mode",
          highContrastDesc: "Increase visual legibility across UI.",
          reduceMotion: "Reduce Motion",
          reduceMotionDesc: "Minimize animations and transitions."
        },
        security: {
          changePassword: "Change Password",
          currentPassword: "Current Password",
          newPassword: "New Password",
          confirmPassword: "Confirm New Password",
          weak: "Weak",
          fair: "Fair",
          good: "Good",
          strong: "Strong",
          updateBtn: "Update Password",
          auth: "Authentication",
          twoFA: "Two-Factor Auth",
          twoFAActive: "Active — your account is protected.",
          twoFAInactive: "Not enabled. Highly recommended for clinical data.",
          enableBtn: "Enable",
          onBtn: "On",
          session: "Session Control",
          autoLogout: "Auto-Logout Timeout",
          autoLogoutDesc: "Inactivity period before session expires.",
          min: "min",
          hour: "hour",
          hours: "hours"
        }
      }
    }
  },
  'hi-IN': {
    translation: {
      settings: {
        title: "सेटिंग्स",
        subtitle: "स्थानीय प्राथमिकताएँ",
        tabs: {
          general: "सामान्य",
          appearance: "दिखावट",
          security: "सुरक्षा"
        },
        localization: {
          title: "स्थानीयकरण",
          systemLanguage: "सिस्टम भाषा",
          change: "बदलें"
        },
        dataManagement: {
          title: "डेटा प्रबंधन",
          localCache: "स्थानीय कैश",
          cacheUsing: "वर्तमान में अस्थायी भंडारण का {{size}} उपयोग कर रहा है।",
          cacheCleared: "कैश सफलतापूर्वक साफ कर दिया गया।",
          clearBtn: "साफ़ करें",
          doneBtn: "हो गया"
        },
        theme: {
          title: "थीम प्राथमिकताएँ",
          system: "सिस्टम",
          light: "रोशन",
          dark: "अंधेरा"
        },
        accessibility: {
          title: "अभिगम्यता",
          highContrast: "उच्च विपर्यास मोड",
          highContrastDesc: "पूरे UI में दृश्य पठनीयता बढ़ाएँ।",
          reduceMotion: "गति कम करें",
          reduceMotionDesc: "एनिमेशन और ट्रांज़िशन कम करें।"
        },
        security: {
          changePassword: "पासवर्ड बदलें",
          currentPassword: "वर्तमान पासवर्ड",
          newPassword: "नया पासवर्ड",
          confirmPassword: "नया पासवर्ड पुष्ट करें",
          weak: "कमजोर",
          fair: "ठीक-ठाक",
          good: "अच्छा",
          strong: "मज़बूत",
          updateBtn: "पासवर्ड अपडेट करें",
          auth: "प्रमाणीकरण",
          twoFA: "दो-चरणीय प्रमाणीकरण",
          twoFAActive: "सक्रिय - आपका खाता सुरक्षित है।",
          twoFAInactive: "सक्षम नहीं है। नैदानिक डेटा के लिए अत्यधिक अनुशंसित।",
          enableBtn: "सक्षम करें",
          onBtn: "चालू",
          session: "सत्र नियंत्रण",
          autoLogout: "स्वचालित लॉगआउट समय",
          autoLogoutDesc: "सत्र समाप्त होने से पहले निष्क्रियता की अवधि।",
          min: "मिनट",
          hour: "घंटा",
          hours: "घंटे"
        }
      }
    }
  }
};

const savedLang = localStorage.getItem('system-language') || 'en-IN';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en-IN',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
