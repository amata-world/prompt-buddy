"use client";

import { type ChatCompletionMessageParam, MLCEngine } from "@mlc-ai/web-llm";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { type AIModel, AVAILABLE_AI_MODELS } from "../models";

export interface UIMessage {
  id: string;
  model?: AIModel;
  params: ChatCompletionMessageParam;
  timestamp: number;
}

export interface WebLLMContextValue {
  status: "loading" | "initializing" | "ready";
  progress: number;
  messages: UIMessage[];
  sendMessage: (message: string) => void;
  currentModel: AIModel;
  isThinking: boolean;
  setModel: (model: AIModel) => void;
}

const WebLLMContext = createContext<WebLLMContextValue>(0 as never);

export const WebLLMProvider = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [engine] = useState(
    () =>
      new MLCEngine({
        initProgressCallback: (report) => {
          console.log("webllm:", report.text);

          if (report.progress === 1) {
            setChatState({ status: "initializing", progress: 100 });
          } else {
            setChatState({
              status: "loading",
              progress: Math.floor(report.progress * 100),
            });
          }
        },
      }),
  );
  const [chatState, setChatState] = useState<{
    status: WebLLMContextValue["status"];
    progress: number;
  }>({ status: "loading", progress: 0 });
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isThinking, startThinking] = useTransition();
  const [model, setModel] = useState<AIModel>(() => {
    const modelId = searchParams.get("model");

    return (
      AVAILABLE_AI_MODELS.find((model) => model.model_id === modelId) ||
      AVAILABLE_AI_MODELS[0]
    );
  });

  const modelRef = useRef(model);
  modelRef.current = model;

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const isThinkingRef = useRef(isThinking);
  isThinkingRef.current = isThinking;

  useEffect(() => {
    const modelId = searchParams.get("model");
    if (modelId !== modelRef.current.model_id) {
      const preferredModel = AVAILABLE_AI_MODELS.find(
        (model) => model.model_id === modelId,
      );

      if (preferredModel) {
        setMessages([]);
        setModel(preferredModel);
      }
    }
  }, [searchParams]);

  const sendMessage = useCallback<WebLLMContextValue["sendMessage"]>(
    async (message) => {
      if (isThinkingRef.current) return;

      startThinking(async () => {
        const newMessages: typeof messages = [
          ...messagesRef.current,
          {
            id: Math.random().toString(),
            model: modelRef.current,
            timestamp: Date.now(),
            params: {
              role: "user",
              content: message,
            },
          },
        ];

        setMessages(newMessages);

        const chunks = await engine.chat.completions.create({
          messages: newMessages.map((msg) => msg.params),
          stream: true,
          stream_options: { include_usage: true },
        });

        const messageId = Math.random().toString();
        const model = modelRef.current;
        const timestamp = Date.now();

        let reply = "";
        for await (const chunk of chunks) {
          reply += chunk.choices[0]?.delta.content || "";
          if (chunk.usage) {
            console.log("token usage:", chunk.usage); // only last chunk has usage
          }

          setMessages([
            ...newMessages,
            {
              id: messageId,
              model,
              timestamp,
              params: {
                role: "assistant",
                content: reply,
              },
            },
          ]);
        }

        const fullReply = await engine.getMessage();
        setMessages([
          ...newMessages,
          {
            id: messageId,
            model,
            timestamp,
            params: {
              role: "assistant",
              content: fullReply,
            },
          },
        ]);
      });
    },
    [engine.chat.completions.create, engine.getMessage],
  );

  const sendMessageRef = useRef(sendMessage);
  sendMessageRef.current = sendMessage;

  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(main, 300);

    async function main() {
      await engine.reload(model.model_id);

      setChatState({ status: "ready", progress: 100 });

      sendMessageRef.current("Hello, please introduce yourself");
    }
  }, [model, engine.reload]);

  const value = useMemo<WebLLMContextValue>(() => {
    return {
      currentModel: model,
      isThinking,
      messages,
      sendMessage,
      setModel: (model) => {
        router.push(`?model=${model.model_id}`);
      },
      ...chatState,
    };
  }, [model, chatState, isThinking, messages, sendMessage, router.push]);

  return (
    <WebLLMContext.Provider value={value}>{children}</WebLLMContext.Provider>
  );
};

export function useLLMChat() {
  return useContext(WebLLMContext);
}
