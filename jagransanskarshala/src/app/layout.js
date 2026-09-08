import { Anek_Devanagari, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";
import SurveyPopup from "@/components/SurveyPopup/SurveyPopup";
import WelcomePopup from "@/components/WelcomePopup/WelcomePopup";
import { SurveyModalProvider } from "@/context/SurveyModalContext";
import SurveySelectionModal from "@/components/SurveySelectionModal/SurveySelectionModal";

const anekDevanagari = Anek_Devanagari({
  subsets: ["latin", "devanagari"],
  variable: "--font-primary",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Jagran Sanskarshaala | बातें हमारे डिजिटल आचरण की",
  description:
    "Jagran Sanskarshaala — talking about our digital conduct. Understanding the small habits, behaviours, and experiences of our digital lives, together.",
  icons: {
    icon: [
      { url: "/icon.png" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/icon.png"],
    apple: [{ url: "/apple-icon.png" }],
  },
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi" translate="no" className="notranslate" suppressHydrationWarning>
      <body className={`${anekDevanagari.variable} ${inter.variable} font-semibold antialiased notranslate`}>
        <LanguageProvider>
          <SurveyModalProvider>
            {children}
            <LanguageSwitcher />
            <SurveyPopup />
            <WelcomePopup />
            <SurveySelectionModal />
          </SurveyModalProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
