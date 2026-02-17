"use client";

import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "@mlc-ai/web-llm";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LoaderCircleIcon, SendHorizonalIcon } from "lucide-react";
import { useRef, useState } from "react";
import Markdown, { type Components } from "react-markdown";
import userPhoto from "@/assets/images/user_photo.webp";
import { AnimatedEllipses } from "@/components/progress/AnimatedEllipses";
import { type UIMessage, useLLMChat } from "@/contexts/WebLLM";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/design/base/input-group";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

export interface ChatBoxProps {
  className?: string;
}

export const ChatBox = ({ className }: ChatBoxProps) => {
  const [message, setMessage] = useState("");
  const { isThinking, status, progress, messages, sendMessage } = useLLMChat();

  const formRef = useRef<HTMLFormElement>(null);

  const canUserType = status === "ready" && !isThinking;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg bg-slate-100",
        className,
      )}
    >
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {status === "ready" ? (
          <div className="flex size-full flex-col-reverse overflow-y-auto overflow-x-hidden p-4">
            {messages.toReversed().map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        ) : (
          <div className="w-full max-w-lg px-4">
            {status === "loading" ? (
              <>
                <p className="text-center text-sm">Loading model...</p>
                <progress
                  className={cn("progress w-full", {
                    "progress-secondary": progress !== 100,
                    "progress-success": progress === 100,
                  })}
                  value={progress}
                  max={100}
                />
              </>
            ) : (
              <>
                <p className="text-center text-sm">
                  Initializing chat
                  <AnimatedEllipses />
                </p>
                <progress
                  className="progress progress-success w-full animate-pulse"
                  value={100}
                  max={100}
                />
              </>
            )}
          </div>
        )}
      </div>

      <form
        ref={formRef}
        className={cn("w-full")}
        onSubmit={(ev) => {
          ev.preventDefault();

          sendMessage(message);
          setMessage("");
        }}
      >
        <InputGroup>
          <InputGroupTextarea
            autoFocus
            placeholder={
              !isThinking ? "Ask AI anything..." : "Wait your turn..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (isThinking) return;

                formRef.current?.dispatchEvent(
                  new Event("submit", {
                    cancelable: true,
                    bubbles: true,
                  }),
                );
              }
            }}
          />

          <InputGroupAddon align="block-end">
            <InputGroupButton
              disabled={!canUserType}
              type="submit"
              size="sm"
              className="ml-auto"
              variant="default"
            >
              {canUserType ? (
                <SendHorizonalIcon />
              ) : (
                <LoaderCircleIcon className="animate-spin" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
};

const MARKDOWN_COMPONENTS: Partial<Components> = {
  li: ({ node, ...props }) => <li {...props} className=""></li>,
  ol: ({ node, ...props }) => (
    <ol {...props} className="list-outside list-decimal pl-6"></ol>
  ),
  pre: ({ node, ...props }) => (
    <pre {...props} className="my-4 rounded-lg bg-slate-700 p-4"></pre>
  ),
};

interface ChatMessageProps {
  message: UIMessage;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { model, timestamp } = message;

  return (
    <div
      className={cn(
        "chat",
        message.params.role === "user" ? "chat-end" : "chat-start",
      )}
    >
      <div className="avatar chat-image">
        <div
          className={cn(
            "w-10 rounded-full",
            model.theme.ring,
            message.params.role !== "user" ? "ring ring-offset-1" : "",
          )}
        >
          {/** biome-ignore lint/performance/noImgElement: not necessary */}
          <img
            src={
              message.params.role === "user" ? userPhoto.src : model.imageUrl
            }
            alt={`profile pic for ${message.params.role === "user" ? "the user" : model.displayName}`}
          />
        </div>
      </div>

      <div className="chat-header">
        {message.params.role === "user" ? "You" : model.displayName}{" "}
        {timestamp ? (
          <time className="text-slate-500 text-xs">
            {dayjs(timestamp).fromNow()}
          </time>
        ) : (
          <span className="text-slate-500 text-xs">
            typing
            <AnimatedEllipses />
          </span>
        )}
      </div>

      <div className="chat-bubble">
        {message.params.role === "user"
          ? normalizeMessageContents(message.params.content).map(
              (part, index) =>
                part.type === "text" ? (
                  <p key={`${message.id}-${index}`}>{part.text}</p>
                ) : (
                  <p key={`${message.id}-${index}`}>{part.image_url.url}</p>
                ),
            )
          : normalizeMessageContents(message.params.content).map(
              (part, index) =>
                part.type === "text" ? (
                  <div
                    key={`${message.id}-${index}`}
                    className="prose dark:prose-invert"
                  >
                    <Markdown components={MARKDOWN_COMPONENTS}>
                      {part.text}
                    </Markdown>
                  </div>
                ) : (
                  <div
                    key={`${message.id}-${index}`}
                    className="prose dark:prose-invert"
                  >
                    <Markdown components={MARKDOWN_COMPONENTS}>
                      {part.image_url.url}
                    </Markdown>
                  </div>
                ),
            )}
      </div>
    </div>
  );
};

function normalizeMessageContents(
  contents: ChatCompletionMessageParam["content"],
): ChatCompletionContentPart[] {
  if (typeof contents === "string") {
    return [{ type: "text", text: contents }];
  } else if (Array.isArray(contents)) {
    return contents;
  } else {
    return [];
  }
}
