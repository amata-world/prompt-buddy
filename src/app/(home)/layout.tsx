"use client";

import { WebLLMProvider } from "@contexts/WebLLM";
import type { ReactNode } from "react";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <WebLLMProvider>{children}</WebLLMProvider>;
}
