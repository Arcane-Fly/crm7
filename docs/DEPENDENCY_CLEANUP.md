# Dependency Strategy and Cleanup

This document outlines the strategy for evaluating, retaining, and segmenting dependencies in the project. It is intended to help ensure that the core codebase remains lean and maintainable while supporting future feature development and modularization.

## Overview

Based on the results from pnpm depcheck and the current project roadmap outlined in PROJECT_PLAN.md, many dependencies are reported as "unused." However, a closer review indicates that a number of these packages support upcoming features and enhancements.

## Dependency Classification

The dependencies can be categorized as follows:

### Essential Dependencies (Retained in Core)

- **Authentication & Security:**
  - @auth/prisma-adapter
  - @auth0/auth0-react
  - @auth0/auth0-spa-js
  - next-auth

- **UI Components & Visualization:**
  - @radix-ui/* packages
  - react-chartjs-2, chart.js, d3
  - react-dropzone, react-pdf, xlsx
  - tailwind-merge (for Tailwind CSS enhancements)

- **Monitoring & Logging:**
  - @sentry/node, @sentry/profiling-node
  - web-vitals

### Dependencies for Future Segmentation or External Modules

- **ML/OCR and Document Parsing Enhancements:**
  - puppeteer, puppeteer-core
  - Additional ML libraries (if needed) can be isolated into a separate module or repository.

- **Auxiliary UI Components & Experimental Features:**
  - Certain UI libraries that are not part of the core experience can be moved into optional plugins/extensions.

- **Tooling and Dev Utilities:**
  - Tools such as commander, ora, chalk, etc., may be retained for development purposes or moved to separate CLI tools if they do not directly support core application functionality.

### DevDependencies

Many devDependencies play a key role in maintaining code quality, running tests, and performing linting. They will remain as part of the overall development workflow:

- @eslint/js, @ianvs/prettier-plugin-sort-imports, eslint plugins, etc.
- Testing utilities and reporters.

## Future Roadmap and Modularization

### Short Term (Q1 2025)

- Retain essential dependencies in the main repository to support imminent features such as Fair Work API integrations and enhanced compliance validation.

### Mid to Long Term

- Evaluate dependencies that are not critical for the core functionality. Consider extracting features such as ML-based document parsing, peripheral UI components, and experimental integrations into separate, independent modules or repositories.
- Establish clear API boundaries between the core system and these segmented packages. This will simplify maintenance, testing, and future integration.

## Action Items

1. **Retain Essential Dependencies:**
   Maintain the dependencies identified as crucial for security, UI components, and monitoring within the core `package.json`.

2. **Document Rationale:**
   This document serves to justify the retention of "unused" dependencies that are marked for future feature support. Update this document as dependencies evolve.

3. **Plan for Segmentation:**
   Identify dependencies that could be candidates for extraction. Create a roadmap for transitioning these into separate integrated packages in subsequent project phases.

4. **Continuous Evaluation:**
   Periodically re-run pnpm depcheck, update this document, and adjust the dependency strategy in response to evolving project requirements and technological advancements.

---

This strategy is a living document and should be updated as the project matures and the feature set evolves.
