import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { generateSocialMetaTags } from "@utils/metatags";

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
    <html lang="en">
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}
