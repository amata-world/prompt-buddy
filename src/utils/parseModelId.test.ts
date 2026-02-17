import { describe, expect, it } from "vitest";
import { parseModelId } from "./parseModelId";

describe("parseModelId", () => {
  describe("Llama family", () => {
    it("parses Llama-3.2-3B-Instruct", () => {
      const result = parseModelId("Llama-3.2-3B-Instruct-q4f16_1-MLC");
      expect(result.family).toBe("Llama");
      expect(result.version).toBe("3.2");
      expect(result.parameterSize).toBe("3B");
      expect(result.modelType).toBe("instruct");
      expect(result.quantization.weightBits).toBe(4);
      expect(result.quantization.floatBits).toBe(16);
      expect(result.quantization.schemeVariant).toBe(1);
      expect(result.quantization.raw).toBe("q4f16_1");
      expect(result.contextVariant).toBeNull();
      expect(result.distillation).toBeNull();
      expect(result.finetune).toBeNull();
    });

    it("parses context variant suffix", () => {
      const result = parseModelId("Llama-3.2-1B-Instruct-q4f16_1-MLC-1k");
      expect(result.family).toBe("Llama");
      expect(result.version).toBe("3.2");
      expect(result.parameterSize).toBe("1B");
      expect(result.modelType).toBe("instruct");
      expect(result.contextVariant).toBe("1k");
    });

    it("parses Llama-2 with chat-hf suffix", () => {
      const result = parseModelId("Llama-2-7b-chat-hf-q4f16_1-MLC");
      expect(result.family).toBe("Llama");
      expect(result.version).toBe("2");
      expect(result.parameterSize).toBe("7B");
      expect(result.modelType).toBe("instruct");
    });
  });

  describe("DeepSeek distillation", () => {
    it("parses DeepSeek-R1-Distill-Qwen", () => {
      const result = parseModelId("DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC");
      expect(result.family).toBe("Qwen");
      expect(result.parameterSize).toBe("7B");
      expect(result.distillation).toEqual({
        sourceModel: "DeepSeek-R1",
        targetArchitecture: "Qwen",
      });
      expect(result.modelType).toBe("base");
    });

    it("parses DeepSeek-R1-Distill-Llama", () => {
      const result = parseModelId("DeepSeek-R1-Distill-Llama-8B-q4f16_1-MLC");
      expect(result.family).toBe("Llama");
      expect(result.parameterSize).toBe("8B");
      expect(result.distillation).toEqual({
        sourceModel: "DeepSeek-R1",
        targetArchitecture: "Llama",
      });
    });
  });

  describe("Qwen family", () => {
    it("parses Qwen2.5 with Coder variant", () => {
      const result = parseModelId("Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC");
      expect(result.family).toBe("Qwen");
      expect(result.version).toBe("2.5");
      expect(result.variant).toBe("Coder");
      expect(result.parameterSize).toBe("1.5B");
      expect(result.modelType).toBe("instruct");
    });

    it("parses Qwen3 without Instruct suffix", () => {
      const result = parseModelId("Qwen3-8B-q4f16_1-MLC");
      expect(result.family).toBe("Qwen");
      expect(result.version).toBe("3");
      expect(result.parameterSize).toBe("8B");
      expect(result.modelType).toBe("base");
      expect(result.variant).toBeNull();
    });

    it("parses Qwen2 with Instruct", () => {
      const result = parseModelId("Qwen2-7B-Instruct-q4f16_1-MLC");
      expect(result.family).toBe("Qwen");
      expect(result.version).toBe("2");
      expect(result.parameterSize).toBe("7B");
      expect(result.modelType).toBe("instruct");
    });

    it("parses Qwen2.5-Math variant", () => {
      const result = parseModelId("Qwen2.5-Math-1.5B-Instruct-q4f16_1-MLC");
      expect(result.family).toBe("Qwen");
      expect(result.version).toBe("2.5");
      expect(result.variant).toBe("Math");
      expect(result.parameterSize).toBe("1.5B");
      expect(result.modelType).toBe("instruct");
    });
  });

  describe("Hermes fine-tunes", () => {
    it("parses Hermes-3-Llama-3.1", () => {
      const result = parseModelId("Hermes-3-Llama-3.1-8B-q4f16_1-MLC");
      expect(result.family).toBe("Llama");
      expect(result.version).toBe("3.1");
      expect(result.finetune).toEqual({ name: "Hermes-3", baseModel: "Llama-3.1" });
      expect(result.parameterSize).toBe("8B");
    });

    it("parses NeuralHermes-2.5-Mistral", () => {
      const result = parseModelId("NeuralHermes-2.5-Mistral-7B-q4f16_1-MLC");
      expect(result.family).toBe("Mistral");
      expect(result.finetune).toEqual({
        name: "NeuralHermes-2.5",
        baseModel: "Mistral",
      });
      expect(result.parameterSize).toBe("7B");
    });

    it("parses OpenHermes-2.5-Mistral", () => {
      const result = parseModelId("OpenHermes-2.5-Mistral-7B-q4f16_1-MLC");
      expect(result.family).toBe("Mistral");
      expect(result.finetune).toEqual({
        name: "OpenHermes-2.5",
        baseModel: "Mistral",
      });
      expect(result.parameterSize).toBe("7B");
    });

    it("parses Hermes-2-Pro-Llama-3", () => {
      const result = parseModelId("Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC");
      expect(result.family).toBe("Llama");
      expect(result.version).toBe("3");
      expect(result.finetune).toEqual({ name: "Hermes-2-Pro", baseModel: "Llama-3" });
      expect(result.parameterSize).toBe("8B");
    });
  });

  describe("Phi family", () => {
    it("parses Phi-3.5-vision-instruct with context variant", () => {
      const result = parseModelId("Phi-3.5-vision-instruct-q4f16_1-MLC-1k");
      expect(result.family).toBe("Phi");
      expect(result.version).toBe("3.5");
      expect(result.variant).toBe("vision");
      expect(result.modelType).toBe("instruct");
      expect(result.contextVariant).toBe("1k");
    });

    it("parses phi-2 (lowercase, no instruct)", () => {
      const result = parseModelId("phi-2-q4f16_1-MLC");
      expect(result.family).toBe("Phi");
      expect(result.version).toBe("2");
      expect(result.modelType).toBe("base");
      expect(result.parameterSize).toBeNull();
    });

    it("parses Phi-3-mini-4k-instruct", () => {
      const result = parseModelId("Phi-3-mini-4k-instruct-q4f16_1-MLC");
      expect(result.family).toBe("Phi");
      expect(result.version).toBe("3");
      expect(result.variant).toBe("mini");
      expect(result.modelType).toBe("instruct");
    });

    it("parses Phi-3.5-mini-instruct", () => {
      const result = parseModelId("Phi-3.5-mini-instruct-q4f16_1-MLC");
      expect(result.family).toBe("Phi");
      expect(result.version).toBe("3.5");
      expect(result.variant).toBe("mini");
      expect(result.modelType).toBe("instruct");
    });
  });

  describe("Gemma family", () => {
    it("parses gemma-2-9b-it", () => {
      const result = parseModelId("gemma-2-9b-it-q4f16_1-MLC");
      expect(result.family).toBe("Gemma");
      expect(result.version).toBe("2");
      expect(result.parameterSize).toBe("9B");
      expect(result.modelType).toBe("instruct");
    });

    it("parses gemma-2-2b-it", () => {
      const result = parseModelId("gemma-2-2b-it-q4f16_1-MLC");
      expect(result.family).toBe("Gemma");
      expect(result.version).toBe("2");
      expect(result.parameterSize).toBe("2B");
      expect(result.modelType).toBe("instruct");
    });
  });

  describe("Mistral family", () => {
    it("parses Mistral-7B-Instruct-v0.3", () => {
      const result = parseModelId("Mistral-7B-Instruct-v0.3-q4f16_1-MLC");
      expect(result.family).toBe("Mistral");
      expect(result.parameterSize).toBe("7B");
      expect(result.modelType).toBe("instruct");
      expect(result.version).toBe("v0.3");
    });
  });

  describe("SmolLM family", () => {
    it("parses SmolLM2-1.7B-Instruct", () => {
      const result = parseModelId("SmolLM2-1.7B-Instruct-q4f16_1-MLC");
      expect(result.family).toBe("SmolLM");
      expect(result.version).toBe("2");
      expect(result.parameterSize).toBe("1.7B");
      expect(result.modelType).toBe("instruct");
    });
  });

  describe("StableLM family", () => {
    it("parses stablelm-2-zephyr-1_6b", () => {
      const result = parseModelId("stablelm-2-zephyr-1_6b-q4f16_1-MLC");
      expect(result.family).toBe("StableLM");
      expect(result.version).toBe("2");
      expect(result.variant).toBe("zephyr");
      expect(result.parameterSize).toBe("1.6B");
      expect(result.modelType).toBe("instruct");
    });
  });

  describe("TinyLlama family", () => {
    it("parses TinyLlama-1.1B-Chat-v1.0", () => {
      const result = parseModelId("TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC");
      expect(result.family).toBe("TinyLlama");
      expect(result.parameterSize).toBe("1.1B");
      expect(result.modelType).toBe("instruct");
      expect(result.version).toBe("v1.0");
    });
  });

  describe("RedPajama family", () => {
    it("parses RedPajama-INCITE-Chat-3B-v1", () => {
      const result = parseModelId("RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC");
      expect(result.family).toBe("RedPajama");
      expect(result.variant).toBe("INCITE");
      expect(result.parameterSize).toBe("3B");
      expect(result.modelType).toBe("instruct");
      expect(result.version).toBe("v1");
    });
  });

  describe("WizardMath fine-tune", () => {
    it("parses WizardMath-7B-V1.1", () => {
      const result = parseModelId("WizardMath-7B-V1.1-q4f16_1-MLC");
      expect(result.family).toBe("Llama");
      expect(result.finetune).toEqual({ name: "WizardMath", baseModel: "Llama" });
      expect(result.parameterSize).toBe("7B");
      expect(result.version).toBe("V1.1");
      expect(result.modelType).toBe("instruct");
    });
  });

  describe("Snowflake embedding", () => {
    it("parses snowflake-arctic-embed-m-v1.5", () => {
      const result = parseModelId("snowflake-arctic-embed-m-v1.5-q0f32-MLC");
      expect(result.family).toBe("Snowflake");
      expect(result.variant).toBe("arctic-embed-m");
      expect(result.version).toBe("v1.5");
      expect(result.modelType).toBe("embedding");
      expect(result.quantization.weightBits).toBe(0);
      expect(result.quantization.floatBits).toBe(32);
      expect(result.quantization.schemeVariant).toBeNull();
    });
  });

  describe("quantization parsing", () => {
    it("parses q4f16_1", () => {
      const result = parseModelId("Llama-3.2-3B-Instruct-q4f16_1-MLC");
      expect(result.quantization).toEqual({
        weightBits: 4,
        floatBits: 16,
        schemeVariant: 1,
        raw: "q4f16_1",
      });
    });

    it("parses q0f16 (no scheme variant)", () => {
      const result = parseModelId("Llama-3.2-1B-Instruct-q0f16-MLC");
      expect(result.quantization).toEqual({
        weightBits: 0,
        floatBits: 16,
        schemeVariant: null,
        raw: "q0f16",
      });
    });

    it("parses q3f16_1", () => {
      const result = parseModelId("Llama-3-70B-Instruct-q3f16_1-MLC");
      expect(result.quantization).toEqual({
        weightBits: 3,
        floatBits: 16,
        schemeVariant: 1,
        raw: "q3f16_1",
      });
    });

    it("parses q4f32_1", () => {
      const result = parseModelId("Llama-3.1-8B-Instruct-q4f32_1-MLC");
      expect(result.quantization).toEqual({
        weightBits: 4,
        floatBits: 32,
        schemeVariant: 1,
        raw: "q4f32_1",
      });
    });
  });

  describe("rawModelId preservation", () => {
    it("preserves the original model_id", () => {
      const id = "Llama-3.2-3B-Instruct-q4f16_1-MLC";
      const result = parseModelId(id);
      expect(result.rawModelId).toBe(id);
    });
  });

  describe("generic fallback", () => {
    it("extracts what it can from an unknown model", () => {
      const result = parseModelId("SomeNewModel-7B-Instruct-v2.0-q4f16_1-MLC");
      expect(result.family).toBe("SomeNewModel");
      expect(result.parameterSize).toBe("7B");
      expect(result.modelType).toBe("instruct");
      expect(result.version).toBe("v2.0");
      expect(result.quantization.raw).toBe("q4f16_1");
    });
  });
});
