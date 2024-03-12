"use client";

import { ChatBox } from "./ChatBox";

export default function HomePage() {
  return (
    <div className="flex h-screen min-h-screen w-full flex-col bg-blue-400">
      <div className="flex flex-1 flex-col items-center overflow-hidden lg:h-full lg:flex-row">
        <section className="pt-2 lg:flex-1 lg:p-4">
          <h1 className="text-center text-xl lg:text-3xl">Prompt Buddy</h1>
        </section>

        <section className="flex w-full flex-1 items-center justify-center overflow-hidden p-2 lg:h-[640px] lg:max-h-full lg:w-auto lg:px-4 lg:pt-4">
          <ChatBox className="size-full" />
        </section>
      </div>

      <footer className="flex flex-row justify-end px-2 pb-2 lg:p-2">
        <div className="text-xs">
          made by{" "}
          <a
            href="https://amata.world"
            target="_blank"
            rel="noreferrer nofollow"
            className="link link-primary"
          >
            amata.world
          </a>
        </div>
      </footer>
    </div>
  );
}
