# Neuro-SAN Studio: AI Root Cause Analysis

Neuro-SAN Studio is a multi-agent diagnostic system designed to automate root cause analysis of complex system failures. By processing raw logs and metrics through a specialized agent mesh, it identifies patterns, predicts root causes, and recommends actionable resolutions.

## Features

- **Multi-Agent Orchestration**: Specialized agents for log analysis, pattern detection, and solution generation.
- **AI-Powered Diagnostics**: Utilizes Gemini 1.5 Flash for high-confidence reasoning.
- **Interactive Traceability**: View the internal reasoning chain and logs of each agent in the mesh.
- **Enterprise Ready**: Designed for observability and fast MTTR (Mean Time to Resolution).

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Google Gemini API Key (set as `GEMINI_API_KEY` environment variable)

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Architecture

1. **LogAnalyzerAgent**: Ingests raw data and extracts critical symptoms.
2. **PatternDetectionAgent**: Correlates events across time and services.
3. **RootCausePredictorAgent**: Predicts the primary failure point with a confidence score.
4. **SolutionGeneratorAgent**: Prescribes fixes and preventive measures.

## License

MIT
