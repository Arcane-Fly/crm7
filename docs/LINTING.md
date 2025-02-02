# Linting Strategy

This document outlines our comprehensive linting and code quality strategy.

## Overview

We employ a multi-layered approach to code quality:

1. Local development checks (pre-commit)
1. CI/CD pipeline validation
1. Configuration synchronization

## Tools

### 1. ESLint

- TypeScript-aware linting
- React best practices
- Security rules
- Accessibility checks
- Import ordering

### 2. Prettier

- Consistent code formatting
- Tailwind CSS class sorting
- Markdown formatting
- JSON/YAML formatting

### 3. Super-linter

- Multi-language validation
- Security scanning
- HTML validation
- Environment file checking

## Pre-commit Hooks

We use `lint-staged` to run checks on staged files:

```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write",
    "tsc --noEmit",
    "jest --bail --findRelatedTests"
  ]
}
```

This ensures:

- Code is properly formatted
- TypeScript types are valid
- Tests pass for changed files
- ESLint rules are satisfied

## CI/CD Pipeline

Our GitHub Actions workflow uses super-linter to provide comprehensive validation:

- TypeScript/JavaScript linting
- CSS validation
- HTML checking
- Security scanning
- Configuration validation
- Markdown consistency
- YAML/JSON formatting

## Configuration Files

### ESLint (.eslintrc.json)

- Extends multiple configurations
- Includes security plugin
- Custom TypeScript rules
- React-specific settings

### Prettier (.prettierrc.json)

- Project-wide formatting rules
- Tailwind CSS integration
- Consistent quote style
- Proper comma handling

### Markdown (.markdownlint.json)

- Documentation consistency
- Heading structure
- Link validation
- Code block formatting

## Validation Script

We include a configuration validation script (`scripts/validate-configs.ts`) that ensures:

- All required plugins are present
- Configurations are consistent
- Essential rules are enabled

## Best Practices

1. **Always Run Local Checks**

   ```bash
   pnpm lint
   ```

2. **Validate Configuration Changes**

   ```bash
   pnpm validate-configs
   ```

3. **Review CI Results**
   - Check GitHub Actions output
   - Review super-linter findings
   - Address security warnings

## Common Issues and Solutions

### 1. ESLint/Prettier Conflicts

- Prettier takes precedence for formatting
- ESLint handles code quality
- Use `eslint-config-prettier` to avoid conflicts

### 2. TypeScript Strictness

- `strict: true` in tsconfig.json
- Explicit return types
- No unsafe assignments

### 3. Security Considerations

- No eval() or dangerouslySetInnerHTML
- Proper dependency management
- Input validation

## Maintenance

1. **Regular Updates**
   - Keep dependencies current
   - Review new rules
   - Update configurations

2. **Performance Optimization**
   - Use .gitignore and .eslintignore
   - Cache lint results
   - Selective file checking

3. **Documentation**
   - Keep this guide updated
   - Document new rules
   - Explain configuration changes
