import aiDefaultPhoto from "@assets/images/ai_default_photo.webp";

import { type ModelRecord, prebuiltAppConfig } from "@mlc-ai/web-llm";

export interface AIModel extends ModelRecord {
  imageUrl: string;
  displayName: string;
  theme: {
    bg: string;
    ring: string;
  };
}

export const AVAILABLE_AI_MODELS: AIModel[] = prebuiltAppConfig.model_list.map(
  (record) => ({
    ...record,
    imageUrl: aiDefaultPhoto.src,
    displayName: record.model_id,
    theme: {
      bg: "bg-red-400",
      ring: "ring-red-400",
    },
  }),
);
