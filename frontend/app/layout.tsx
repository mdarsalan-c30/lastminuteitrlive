import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Manrope } from "next/font/google";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { HashScrollHandler } from "@/components/navigation/HashScrollHandler";
import { SessionBootstrap } from "@/components/SessionBootstrap";
import Script from "next/script";
import { defaultOpenGraphImages, getSiteUrl } from "@/lib/seo";
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
    default: "File ITR Online - LastMinute ITR | Fast, Secure & Smart AI",
    template: "%s · LastMinute ITR",
  },
  description:
    "File your Income Tax Return (ITR) online effortlessly with LastMinute ITR. Upload Form 16, reconcile AIS, compare tax regimes automatically, and file on incometax.gov.in securely.",
  keywords: [
    "ITR filing 2026",
    "income tax return e-filing",
    "file ITR online",
    "Form 16 upload",
    "AIS reconciliation",
    "old vs new tax regime India",
    "AI tax assistant India",
    "Income Tax India",
    "tax calculator",
  ],
  openGraph: {
    title: "File ITR Online - LastMinute ITR | Fast, Secure & Smart AI",
    description:
      "File your Income Tax Return (ITR) online effortlessly with LastMinute ITR. Upload Form 16, reconcile AIS, compare tax regimes automatically.",
    type: "website",
    locale: "en_IN",
    images: defaultOpenGraphImages,
  },
  twitter: {
    card: "summary_large_image",
    title: "File ITR Online - LastMinute ITR",
    description:
      "Your tax companion for Form 16, AIS, and regime choice — you file on incometax.gov.in.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "xP0DgxeUNab32kzoTF4I1N7E0rYPGcjssQ0DBidRkqY",
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "name": "LastMinute ITR",
                  "url": "https://lastminuteitr.in/",
                  "description":
                    "File your Income Tax Return (ITR) online effortlessly with LastMinute ITR. Upload Form 16, reconcile AIS, compare tax regimes automatically.",
                  "publisher": {
                    "@type": "Organization",
                    "name": "LastMinute ITR",
                    "logo": {
                      "@type": "ImageObject",
                      "url": "https://lastminuteitr.in/brand/lastminuteitr-logo.png",
                    },
                  },
                },
                {
                  "@type": "SoftwareApplication",
                  "name": "LastMinute ITR Platform",
                  "applicationCategory": "FinanceApplication",
                  "operatingSystem": "Web",
                  "offers": {
                    "@type": "Offer",
                    "price": "349.00",
                    "priceCurrency": "INR",
                  },
                },
              ],
            }),
          }}
        />
      </head>
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
