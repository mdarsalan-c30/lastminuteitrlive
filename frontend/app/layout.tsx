import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Manrope } from "next/font/google";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { HashScrollHandler } from "@/components/navigation/HashScrollHandler";
import { SessionBootstrap } from "@/components/SessionBootstrap";
import Script from "next/script";
import { defaultOpenGraphImages, getSiteUrl } from "@/lib/seo";
import { BRAND_ICON_PATH } from "@/lib/brand";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "LastMinute ITR — your calm tax filing companion",
    template: "%s · LastMinute ITR",
  },
  description:
    "Evidence-linked ITR prep for ordinary Indians. Import Form 16 & AIS, reconcile mismatches, compare regimes — then file yourself on incometax.gov.in.",
  keywords: [
    "ITR filing",
    "income tax return",
    "old vs new regime",
    "AIS mismatch",
    "Form 16",
    "India tax",
    "ITR companion",
  ],
  openGraph: {
    title: "LastMinute ITR — your calm tax filing companion",
    description:
      "Prepare with Form 16 and AIS, see an honest estimate, file on the government portal yourself.",
    type: "website",
    locale: "en_IN",
    images: defaultOpenGraphImages,
  },
  twitter: {
    card: "summary_large_image",
    title: "LastMinute ITR",
    description:
      "Your tax companion for Form 16, AIS, and regime choice — you file on incometax.gov.in.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "xP0DgxeUNab32kzoTF4I1N7E0rYPGcjssQ0DBidRkqY",
  },
  icons: {
    icon: BRAND_ICON_PATH,
    apple: "/brand/favicon-180.png",
  },
};

import { cookies } from "next/headers";
import { B2C_SESSION_COOKIE, readB2CSession } from "@/lib/auth/b2c";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(B2C_SESSION_COOKIE)?.value;
  const session = readB2CSession(token);

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${display.variable} ${manrope.variable} overflow-x-hidden font-sans`}
      >
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-02SK257800" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-02SK257800');
          `}
        </Script>
        <AnalyticsProvider>
          <SessionBootstrap session={session} />
          <HashScrollHandler />
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
