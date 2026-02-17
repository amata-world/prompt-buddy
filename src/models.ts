import { type ModelRecord, prebuiltAppConfig } from "@mlc-ai/web-llm";
import aiDefaultPhoto from "@/assets/images/ai_default_photo.webp";

import { type ModelMetadata, parseModelId } from "@/utils/parseModelId";

export interface AIModel {
  id: string;
  metadata: ModelMetadata;
  record: ModelRecord;
  imageUrl: string;
  displayName: string;
  theme: {
    bg: string;
    ring: string;
  };
}

const FAMILY_THEMES: Record<string, { bg: string; ring: string }> = {
  Llama: { bg: "bg-blue-400", ring: "ring-blue-400" },
  Qwen: { bg: "bg-purple-400", ring: "ring-purple-400" },
  Phi: { bg: "bg-teal-400", ring: "ring-teal-400" },
  Mistral: { bg: "bg-orange-400", ring: "ring-orange-400" },
  Gemma: { bg: "bg-rose-400", ring: "ring-rose-400" },
  SmolLM: { bg: "bg-lime-400", ring: "ring-lime-400" },
  StableLM: { bg: "bg-cyan-400", ring: "ring-cyan-400" },
  TinyLlama: { bg: "bg-sky-400", ring: "ring-sky-400" },
  RedPajama: { bg: "bg-red-400", ring: "ring-red-400" },
  Snowflake: { bg: "bg-indigo-400", ring: "ring-indigo-400" },
};

const DEFAULT_THEME = { bg: "bg-slate-400", ring: "ring-slate-400" };

function getThemeForFamily(family: string) {
  return FAMILY_THEMES[family] ?? DEFAULT_THEME;
}

const allModels = prebuiltAppConfig.model_list.map((record) => {
  const model = parseModelId(record.model_id);

  const displayName = `${model.family}${model.version ? ` ${model.version}` : ""}${model.variant ? ` ${model.variant}` : ""}${model.modelType !== "base" ? ` ${model.modelType}` : ""}${model.contextVariant ? ` (${model.contextVariant})` : ""}`;

  return {
    id: record.model_id,
    record,
    metadata: model,
    imageUrl: aiDefaultPhoto.src,
    displayName: model.distillation
      ? `${model.distillation.sourceModel} (${displayName})`
      : model.finetune
        ? `${model.finetune.name} (${displayName})`
        : displayName,
    theme: getThemeForFamily(model.family),
  };
});

export const AVAILABLE_AI_MODELS: AIModel[] = allModels.filter(
  (model) => model.metadata.modelType !== "embedding",
);
