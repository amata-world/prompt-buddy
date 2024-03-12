"use client";

import { useLLMChat } from "@contexts/WebLLM";
import classNames from "classnames";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AnimatedEllipses } from "@components/progress/AnimatedEllipses";
import { useState } from "react";

import userPhoto from "@assets/images/user_photo.webp";
import aiDefaultPhoto from "@assets/images/ai_default_photo.webp";

dayjs.extend(relativeTime);

export interface ChatBoxProps {
  className?: string;
}

export const ChatBox = ({ className }: ChatBoxProps) => {
  const [message, setMessage] = useState("");
  const { ai, aiTyping, status, progress, chatHistory, sendMessage } =
    useLLMChat();

  const canUserType = status === "ready" && !aiTyping;

  return (
    <div
      className={classNames(
        "flex flex-col overflow-hidden rounded-lg bg-slate-100",
        className,
      )}
    >
      <div className="flex flex-1 items-center justify-center overflow-hidden">
        {status === "ready" ? (
          <div className="flex h-full w-full flex-col-reverse overflow-y-auto overflow-x-hidden p-4">
            {aiTyping ? (
              <div className="chat chat-start">
                <div className="avatar chat-image">
                  <div className="w-10 rounded-full">
                    <img
                      src={aiDefaultPhoto.src}
                      alt={`profile pic for ${ai}`}
                    />
                  </div>
                </div>

                <div className="chat-header">
                  {ai}{" "}
                  <span className="text-xs text-slate-500">
                    typing
                    <AnimatedEllipses />
                  </span>
                </div>

                <div className="chat-bubble">{aiTyping}</div>
              </div>
            ) : null}

            {chatHistory.toReversed().map((entry) => (
              <div
                key={entry.timestamp}
                className={classNames(
                  "chat",
                  entry.username === "user" ? "chat-end" : "chat-start",
                )}
              >
                <div className="avatar chat-image">
                  <div className="w-10 rounded-full">
                    <img
                      src={
                        entry.username === "user"
                          ? userPhoto.src
                          : aiDefaultPhoto.src
                      }
                      alt={`profile pic for ${entry.username}`}
                    />
                  </div>
                </div>

                <div className="chat-header">
                  {entry.username}{" "}
                  <time className="text-xs text-slate-500">
                    {dayjs(entry.timestamp).fromNow()}
                  </time>
                </div>

                <div className="chat-bubble">{entry.message}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-lg px-4">
            {status === "loading" ? (
              <>
                <p className="text-center text-sm">Loading model...</p>
                <progress
                  className="progress progress-secondary w-full"
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
                  className="progress progress-success w-full"
                  value={100}
                  max={100}
                />
              </>
            )}
          </div>
        )}
      </div>

      <form
        className="join w-full"
        onSubmit={(ev) => {
          ev.preventDefault();

          sendMessage(message);
          setMessage("");
        }}
      >
        <input
          type="text"
          autoFocus
          className="input join-item input-bordered flex-1"
          placeholder={!aiTyping ? "Ask AI anything..." : "Wait your turn..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          disabled={!canUserType}
          className="btn btn-primary join-item"
        >
          Send
        </button>
      </form>
    </div>
  );
};
