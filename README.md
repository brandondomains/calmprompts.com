# Calm Prompts (`calmprompts.com`)

[![Support Open Work](https://img.shields.io/badge/Support-Open%20Work-0A0A0A?style=flat&logo=github)](https://github.com/brandonhimpfen/support) 
[![GitHub Sponsor](https://srv-cdn.himpfen.io/badges/github/github-flat.svg)](https://github.com/sponsors/brandonhimpfen) 
[![Buy Me a Coffee](https://srv-cdn.himpfen.io/badges/buymeacoffee/buymeacoffee-flat.svg)](https://buymeacoffee.com/brandonhimpfen) 
[![Ko-Fi](https://srv-cdn.himpfen.io/badges/kofi/kofi-flat.svg)](https://ko-fi.com/brandonhimpfen) 
[![PayPal](https://srv-cdn.himpfen.io/badges/paypal/paypal-flat.svg)](https://paypal.me/brandonhimpfen)

**Calm Prompts** (`calmprompts.com`) is a structured, distraction-free library of copy-ready AI prompt templates and an interactive prompt builder for writing, work, study, travel, creator workflows, and everyday tasks.

## Features

- **Beginner + Power User Modes:** Every template includes a plain-language Beginner prompt and a structured XML-tagged Power User prompt.
- **Interactive Prompt Builder (`/builder/`):** Dynamically detects `[bracketed placeholders]` inside any template and renders dedicated input fields alongside live preview, example inputs, and one-click copy.
- **Collection-Driven Architecture:** Built with Jekyll collections (`_prompts` and `_prompt_categories`) so `prompts-data.js` stays automatically synced with all templates at build time.
- **Calm, Focused Workspace UI:** Clean typography, subtle sage-and-slate palette, instant search, and zero clutter.

## Local Development

```bash
bundle install
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000` in your browser.
