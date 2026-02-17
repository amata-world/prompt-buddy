export interface QuantizationInfo {
  /** Weight quantization bits (0 = original precision, 3, 4) */
  weightBits: number;
  /** Float computation bits (16, 32) */
  floatBits: number;
  /** Quantization scheme variant (e.g., the "1" in q4f16_1) */
  schemeVariant: number | null;
  /** Raw quantization string (e.g., "q4f16_1") */
  raw: string;
}

export type ModelType = "base" | "instruct" | "embedding";

export interface ModelMetadata {
  /** Original model_id */
  rawModelId: string;
  /** Base architecture family: Llama, Qwen, Phi, Mistral, Gemma, SmolLM, StableLM, etc. */
  family: string;
  /** Model version: "3.2" for Llama-3.2, "2.5" for Qwen2.5, "v0.3" for Mistral-v0.3 */
  version: string | null;
  /** Specialization variant: "Coder", "Math", "mini", "vision", "zephyr", etc. */
  variant: string | null;
  /** Parameter count: "7B", "0.5B", "70B", "360M" */
  parameterSize: string | null;
  /** Model type: base pretrained, instruction-tuned, or embedding */
  modelType: ModelType;
  /** Quantization details */
  quantization: QuantizationInfo;
  /** Reduced context variant: "1k" */
  contextVariant: string | null;
  /** Distillation info (e.g., DeepSeek-R1-Distill-Llama) */
  distillation: {
    sourceModel: string;
    targetArchitecture: string;
  } | null;
  /** Fine-tune provenance, if this model is a fine-tune of another */
  finetune: {
    name: string;
    baseModel: string;
  } | null;
}

const SIZE_RE = /\b(\d+(?:[._]\d+)?[BbMm])\b/;
const VERSION_RE = /\b([vV]\d+(?:\.\d+)?)\b/;
const INSTRUCT_TOKENS = new Set(["instruct", "chat", "it"]);

function normalizeSize(s: string): string {
  return s.replace("_", ".").toUpperCase();
}

function detectModelType(tokens: string[]): ModelType {
  return tokens.some((t) => INSTRUCT_TOKENS.has(t.toLowerCase()))
    ? "instruct"
    : "base";
}

function parseQuantization(raw: string): QuantizationInfo {
  const match = raw.match(/^q(\d+)f(\d+)(?:_(\d+))?$/);
  if (!match) {
    return { weightBits: 0, floatBits: 0, schemeVariant: null, raw };
  }
  return {
    weightBits: Number.parseInt(match[1]),
    floatBits: Number.parseInt(match[2]),
    schemeVariant: match[3] ? Number.parseInt(match[3]) : null,
    raw,
  };
}

type FamilyParser = (descriptor: string) => Partial<ModelMetadata> | null;

const familyParsers: FamilyParser[] = [
  // DeepSeek distillation: DeepSeek-R1-Distill-{Arch}-{Size}
  (desc) => {
    const m = desc.match(/^(DeepSeek-R1)-Distill-(\w+)-(\d+(?:\.\d+)?[BbMm])$/);
    if (!m) return null;
    return {
      family: m[2],
      distillation: { sourceModel: m[1], targetArchitecture: m[2] },
      parameterSize: normalizeSize(m[3]),
    };
  },

  // Hermes fine-tunes on Llama/Mistral: Hermes-{v}[-Pro]-{Base}-{baseVer}-{Size}
  (desc) => {
    const m = desc.match(
      /^(Hermes-\d+(?:-Pro)?)-(\w+)-(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?[BbMm])(.*)$/,
    );
    if (!m) return null;
    return {
      family: m[2],
      version: m[3],
      finetune: { name: m[1], baseModel: `${m[2]}-${m[3]}` },
      parameterSize: normalizeSize(m[4]),
      modelType: detectModelType(m[5]?.split("-") ?? []),
    };
  },

  // *Hermes fine-tunes: {Open,Neural}Hermes-{v}-{Base}-{Size}
  (desc) => {
    const m = desc.match(
      /^(\w*Hermes-\d+(?:\.\d+)?)-(\w+)-(\d+(?:\.\d+)?[BbMm])(.*)$/,
    );
    if (!m) return null;
    return {
      family: m[2],
      finetune: { name: m[1], baseModel: m[2] },
      parameterSize: normalizeSize(m[3]),
      modelType: detectModelType(m[4]?.split("-") ?? []),
    };
  },

  // WizardMath: WizardMath-{Size}-{Version}
  (desc) => {
    const m = desc.match(
      /^(WizardMath)-(\d+(?:\.\d+)?[BbMm])-([vV]\d+(?:\.\d+)?)$/,
    );
    if (!m) return null;
    return {
      family: "Llama",
      finetune: { name: m[1], baseModel: "Llama" },
      parameterSize: normalizeSize(m[2]),
      version: m[3],
      modelType: "instruct",
    };
  },

  // Llama: Llama-{ver}-{Size}-{tuning}[-hf]
  (desc) => {
    const m = desc.match(
      /^Llama-(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?[BbMm])-(.+?)(?:-hf)?$/,
    );
    if (!m) return null;
    return {
      family: "Llama",
      version: m[1],
      parameterSize: normalizeSize(m[2]),
      modelType: detectModelType(m[3].split("-")),
    };
  },

  // Qwen with variant: Qwen{ver}[-Variant]-{Size}[-Instruct]
  (desc) => {
    const m = desc.match(
      /^Qwen(\d+(?:\.\d+)?)-(\w+)-(\d+(?:\.\d+)?[BbMm])(?:-(Instruct))?$/,
    );
    if (!m) return null;
    const maybeVariant = m[2];
    if (INSTRUCT_TOKENS.has(maybeVariant.toLowerCase())) return null;
    return {
      family: "Qwen",
      version: m[1],
      variant: maybeVariant,
      parameterSize: normalizeSize(m[3]),
      modelType: m[4] ? "instruct" : "base",
    };
  },

  // Qwen base: Qwen{ver}-{Size}[-Instruct]
  (desc) => {
    const m = desc.match(
      /^Qwen(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?[BbMm])(?:-(Instruct))?$/,
    );
    if (!m) return null;
    return {
      family: "Qwen",
      version: m[1],
      parameterSize: normalizeSize(m[2]),
      modelType: m[3] ? "instruct" : "base",
    };
  },

  // Phi v3+: Phi-{ver}[-variant][-{ctx}k]-instruct
  (desc) => {
    const m = desc.match(
      /^Phi-(\d+(?:\.\d+)?)(?:-(\w+))?(?:-(\d+k))?-instruct$/i,
    );
    if (!m) return null;
    return {
      family: "Phi",
      version: m[1],
      variant: m[2] ?? null,
      modelType: "instruct",
    };
  },

  // Phi v1-2: phi-{ver}
  (desc) => {
    const m = desc.match(/^phi-(\d+(?:\.\d+)?)$/i);
    if (!m) return null;
    return {
      family: "Phi",
      version: m[1],
    };
  },

  // Gemma: gemma-{ver}-{size}[-it]
  (desc) => {
    const m = desc.match(/^gemma-(\d+)-(\d+(?:\.\d+)?[BbMm])(?:-(it))?(.*)$/i);
    if (!m) return null;
    return {
      family: "Gemma",
      version: m[1],
      parameterSize: normalizeSize(m[2]),
      modelType: m[3] === "it" ? "instruct" : "base",
    };
  },

  // Mistral: Mistral-{Size}-Instruct-{version}
  (desc) => {
    const m = desc.match(
      /^Mistral-(\d+(?:\.\d+)?[BbMm])-Instruct-([vV]\d+(?:\.\d+)?)$/,
    );
    if (!m) return null;
    return {
      family: "Mistral",
      parameterSize: normalizeSize(m[1]),
      version: m[2],
      modelType: "instruct",
    };
  },

  // SmolLM: SmolLM{ver}-{Size}[-Instruct]
  (desc) => {
    const m = desc.match(/^SmolLM(\d+)-(\d+(?:\.\d+)?[BbMm])(?:-(Instruct))?$/);
    if (!m) return null;
    return {
      family: "SmolLM",
      version: m[1],
      parameterSize: normalizeSize(m[2]),
      modelType: m[3] ? "instruct" : "base",
    };
  },

  // StableLM: stablelm-{ver}-{variant}-{size}
  (desc) => {
    const m = desc.match(/^stablelm-(\d+)-(\w+)-(\d+(?:[._]\d+)?[BbMm])$/i);
    if (!m) return null;
    return {
      family: "StableLM",
      version: m[1],
      variant: m[2],
      parameterSize: normalizeSize(m[3]),
      modelType: "instruct",
    };
  },

  // TinyLlama: TinyLlama-{Size}-Chat-{version}
  (desc) => {
    const m = desc.match(
      /^TinyLlama-(\d+(?:\.\d+)?[BbMm])-Chat-([vV]\d+(?:\.\d+)?)$/,
    );
    if (!m) return null;
    return {
      family: "TinyLlama",
      parameterSize: normalizeSize(m[1]),
      version: m[2],
      modelType: "instruct",
    };
  },

  // RedPajama: RedPajama-INCITE-Chat-{Size}-{version}
  (desc) => {
    const m = desc.match(
      /^RedPajama-(\w+)-(\w+)-(\d+(?:\.\d+)?[BbMm])-([vV]\d+(?:\.\d+)?)$/,
    );
    if (!m) return null;
    return {
      family: "RedPajama",
      variant: m[1],
      parameterSize: normalizeSize(m[3]),
      version: m[4],
      modelType: m[2].toLowerCase() === "chat" ? "instruct" : "base",
    };
  },

  // Snowflake embedding: snowflake-arctic-embed-{variant}-{version}
  (desc) => {
    const m = desc.match(/^snowflake-arctic-embed-(\w+)-([vV]\d+(?:\.\d+)?)$/i);
    if (!m) return null;
    return {
      family: "Snowflake",
      variant: `arctic-embed-${m[1]}`,
      version: m[2],
      modelType: "embedding",
    };
  },
];

export function parseModelId(modelId: string): ModelMetadata {
  let remaining = modelId;
  let contextVariant: string | null = null;

  // 1. Strip "-MLC[-contextVariant]" suffix
  const ctxMatch = remaining.match(/^(.+)-MLC-(\w+)$/);
  if (ctxMatch) {
    remaining = ctxMatch[1];
    contextVariant = ctxMatch[2];
  } else {
    remaining = remaining.replace(/-MLC$/, "");
  }

  // 2. Extract quantization (last segment matching q_f_ pattern)
  let quantization: QuantizationInfo;
  let descriptor: string;
  const quantMatch = remaining.match(/^(.+)-(q\d+f\d+(?:_\d+)?)$/);

  if (quantMatch) {
    descriptor = quantMatch[1];
    quantization = parseQuantization(quantMatch[2]);
  } else {
    descriptor = remaining;
    quantization = {
      weightBits: 0,
      floatBits: 0,
      schemeVariant: null,
      raw: "unknown",
    };
  }

  // 3. Try each family parser in priority order
  const defaults: ModelMetadata = {
    rawModelId: modelId,
    family: "Unknown",
    version: null,
    variant: null,
    parameterSize: null,
    modelType: "base",
    quantization,
    contextVariant,
    distillation: null,
    finetune: null,
  };

  for (const parser of familyParsers) {
    const result = parser(descriptor);
    if (result) {
      return { ...defaults, ...result };
    }
  }

  // 4. Generic fallback: extract what we can
  const sizeMatch = descriptor.match(SIZE_RE);
  const versionMatch = descriptor.match(VERSION_RE);
  const tokens = descriptor.split("-");

  return {
    ...defaults,
    family: tokens[0],
    parameterSize: sizeMatch ? normalizeSize(sizeMatch[1]) : null,
    version: versionMatch ? versionMatch[1] : null,
    modelType: detectModelType(tokens),
  };
}
