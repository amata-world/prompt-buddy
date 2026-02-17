# PromptBuddy

A browser-based LLM chat app that runs models entirely client-side using WebGPU. No data leaves your browser — all inference happens locally on your device.

**Live site: [prompt-buddy.amata.world](https://prompt-buddy.amata.world)**

## How It Works

PromptBuddy uses [MLC-AI WebLLM](https://github.com/mlc-ai/web-llm) to load and run open-source language models directly in your browser via WebGPU. On first use, model weights are downloaded and cached locally. After that, everything runs offline with no server required.

## Requirements

- A browser with [WebGPU support](https://caniuse.com/webgpu) (Chrome 113+, Edge 113+, or Firefox Nightly)
- Enough GPU memory for the selected model (varies by model size)

## Development

### Prerequisites

- [Bun](https://bun.sh) runtime

### Getting Started

```sh
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in a WebGPU-capable browser.

### Commands

| Command | Description |
| --- | --- |
| `bun install` | Install dependencies |
| `bun run dev` | Start dev server |
| `bun run build` | Production build (static export) |
| `bun run lint` | Lint with Biome |

## Tech Stack

- [Next.js](https://nextjs.org) (static export)
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org) (strict)
- [Tailwind CSS](https://tailwindcss.com) + [DaisyUI](https://daisyui.com) + [shadcn/ui](https://ui.shadcn.com)
- [MLC-AI WebLLM](https://github.com/mlc-ai/web-llm) for client-side inference
- [Biome](https://biomejs.dev) for linting and formatting

## Deployment

The site is deployed to GitHub Pages as a fully static site via the included GitHub Actions workflow. Every push to `main` triggers a build and deploy automatically.
