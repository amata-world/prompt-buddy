import type { Metadata } from "next";
import { Inter, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { generateSocialMetaTags } from "@/utils/metatags";
import { Suspense } from "react";

const nunitoSans = Nunito_Sans({ variable: "--font-sans" });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://promptbuddy.amata.world"),
  alternates: {
    canonical: "/",
  },
  ...generateSocialMetaTags({
    type: "website",
    title: "PromptBuddy | Amata World",
    description:
      "A free tool to play and learn more about how to write prompts for LLMs",
    images: {
      url: "/images/logo.webp",
      type: "image/webp",
      width: 1024,
      height: 1024,
      alt: "The default photo for the web app",
    },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunitoSans.variable}>
      <body className={inter.className}>
        <main>
          <Suspense>{children}</Suspense>
        </main>
      </body>
    </html>
  );
}
