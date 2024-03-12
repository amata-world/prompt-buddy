"use client";

import * as webllm from "@mlc-ai/web-llm";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface ChatEntry {
  username: string;
  message: string;
  timestamp: number;
}

export interface WebLLMContextValue {
  ai: "Llama-2";
  status: "loading" | "initializing" | "ready";
  progress: number;
  chatHistory: ChatEntry[];
  sendMessage: (message: string) => void;
  aiTyping: string;
}

const WebLLMContext = createContext<WebLLMContextValue>(0 as never);

export const WebLLMProvider = ({ children }: { children: ReactNode }) => {
  const chatRef = useRef<webllm.ChatModule>();
  const [chatState, setChatState] = useState<{
    status: WebLLMContextValue["status"];
    progress: number;
  }>({ status: "loading", progress: 0 });
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [aiTyping, setAITyping] = useState("");

  const sendMessage = useCallback<WebLLMContextValue["sendMessage"]>(
    async (message) => {
      const chat = chatRef.current;

      if (!chat)
        throw new Error(
          "tried to send a message before the chat module is ready",
        );

      setChatHistory((ch) => [
        ...ch,
        {
          username: "user",
          message,
          timestamp: new Date().getTime(),
        },
      ]);
      setAITyping("*thinking*");

      let currMsg = "";
      await chat.generate(message, (step, msg) => {
        currMsg = msg;
        setAITyping(msg);
      });

      setAITyping("");
      setChatHistory((ch) => [
        ...ch,
        {
          username: "llama-2",
          message: currMsg,
          timestamp: new Date().getTime(),
        },
      ]);
    },
    [],
  );

  const sendMessageRef = useRef(sendMessage);
  sendMessageRef.current = sendMessage;

  useEffect(() => {
    if (chatRef.current) return;

    const chat = new webllm.ChatModule();
    chatRef.current = chat;
    main();

    async function main() {
      chat.setInitProgressCallback((report) => {
        console.log("webllm:", report.text);

        if (report.progress === 1) {
          setChatState({ status: "initializing", progress: 100 });
        } else {
          setChatState({
            status: "loading",
            progress: Math.floor(report.progress * 100),
          });
        }
      });

      await chat.reload("Llama-2-7b-chat-hf-q4f32_1");

      setChatState({ status: "ready", progress: 100 });

      sendMessageRef.current("Hello, please introduce yourself");
    }
  }, []);

  const value = useMemo<WebLLMContextValue>(() => {
    const ai = "Llama-2";
    return {
      ai,
      aiTyping,
      sendMessage,
      ...chatState,
      chatHistory,
    };
  }, [chatState, aiTyping, chatHistory, sendMessage]);

  return (
    <WebLLMContext.Provider value={value}>{children}</WebLLMContext.Provider>
  );
};

export function useLLMChat() {
  return useContext(WebLLMContext);
}
