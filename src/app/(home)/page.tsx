"use client";

import { useLLMChat } from "@contexts/WebLLM";
import { cn } from "@lib/utils";
import { ChatBox } from "./ChatBox";
import { PageHeader } from "./PageHeader";

export default function HomePage() {
  const { currentModel } = useLLMChat();

  return (
    <div
      className={cn(
        "flex h-screen min-h-screen w-full flex-col transition-colors duration-700",
        currentModel.theme.bg,
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center overflow-hidden px-4 pb-4 lg:h-full">
        <PageHeader />

        <ChatBox className="size-full" />
      </div>
    </div>
  );
}
