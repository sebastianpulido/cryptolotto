# Code Quality Guidelines

This document outlines the code quality tools and practices used in the CryptoLotto project.

## Tools Overview

### 🔧 Core Tools

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Husky**: Git hooks management
- **lint-staged**: Run linters on staged files
- **TypeScript**: Static type checking
- **Jest**: Testing framework
- **Commitlint**: Conventional commit messages

### 📦 ESLint Plugins

- `@typescript-eslint/*`: TypeScript-specific rules
- `eslint-plugin-import`: Import/export syntax
- `eslint-plugin-promise`: Promise best practices
- `eslint-plugin-security`: Security vulnerability detection
- `eslint-plugin-react-hooks`: React hooks rules (frontend)
- `eslint-plugin-jsx-a11y`: Accessibility rules (frontend)
- `eslint-plugin-node`: Node.js specific rules (backend)

## Available Scripts

### Root Level Commands

```bash
# Linting
npm run lint              # Lint all workspaces
npm run lint:fix          # Fix linting issues

# Formatting
npm run format            # Format all files
npm run format:check      # Check formatting

# Type checking
npm run type-check        # Type check all workspaces

# Testing
npm run test              # Run all tests

# Validation (runs before push)
npm run validate          # Run all quality checks
```

### Workspace-Specific Commands

```bash
# Frontend
cd frontend
npm run lint              # Lint frontend code
npm run type-check        # Type check frontend
npm run test              # Run frontend tests
npm run test:coverage     # Run tests with coverage

# Backend
cd backend
npm run lint              # Lint backend code
npm run type-check        # Type check backend
npm run test              # Run backend tests
npm run test:coverage     # Run tests with coverage
```

## Git Hooks

### Pre-commit Hook

Automatically runs on every commit:

- Lints and formats staged files
- Fixes auto-fixable issues
- Prevents commit if unfixable issues exist

### Pre-push Hook

Runs before pushing to remote:

- Type checking
- Full linting
- Format checking
- All tests
- Prevents push if any check fails

### Commit Message Hook

Enforces conventional commit format:

## Code Quality Rules

### TypeScript Rules

- Strict type checking enabled
- No `any` types (warnings)
- Unused variables not allowed
- Explicit return types for functions (backend)

### Import Organization

```typescript
// 1. Node.js built-ins
import { readFile } from 'fs';

// 2. External libraries
import express from 'express';
import React from 'react';

// 3. Internal modules
import { UserService } from '../services/UserService';

// 4. Relative imports
import './styles.css';
```

### Security Rules

- Object injection detection
- Unsafe regex detection
- Buffer security checks
- Child process warnings
- Timing attack detection

### React-Specific Rules (Frontend)

- Hooks rules enforcement
- Accessibility requirements
- Next.js best practices
- JSX accessibility

### Node.js-Specific Rules (Backend)

- Node.js best practices
- Security considerations
- Promise handling
- Error handling patterns

## Testing Standards

### Coverage Requirements

- Minimum 70% coverage for:
  - Branches
  - Functions
  - Lines
  - Statements

### Test File Naming

### Test Categories

- **Unit Tests**: Individual functions/components
- **Integration Tests**: Component interactions
- **API Tests**: Backend endpoint testing
- **E2E Tests**: Full user workflows (future)

## Configuration Files

### ESLint Configuration

- `.eslintrc.json` (root): Base configuration
- `frontend/.eslintrc.json`: React/Next.js specific
- `backend/.eslintrc.json`: Node.js specific

### Prettier Configuration

- `.prettierrc`: Formatting rules
- `.prettierignore`: Files to ignore

### Jest Configuration

- `frontend/jest.config.js`: Frontend test setup
- `backend/jest.config.js`: Backend test setup

### Editor Configuration

- `.editorconfig`: Consistent editor settings

## Best Practices

### Code Style

1. Use meaningful variable names
2. Keep functions small and focused
3. Add comments for complex logic
4. Use TypeScript types effectively
5. Follow the single responsibility principle

### Git Workflow

1. Create feature branches from `main`
2. Use conventional commit messages
3. Keep commits atomic and focused
4. Run quality checks before pushing
5. Use pull requests for code review

### Error Handling

```typescript
// ✅ Good
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  logger.error('Operation failed:', error);
  throw new Error('Specific error message');
}

// ❌ Bad
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.log(error);
  throw error;
}
```

### Type Safety

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // Implementation
}

// ❌ Bad
function getUser(id: any): any {
  // Implementation
}
```

## IDE Setup

### VS Code Extensions

Recommended extensions for optimal development experience:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "streetsidesoftware.code-spell-checker",
    "editorconfig.editorconfig",
    "ms-vscode.vscode-jest"
  ]
}
```

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "jest.autoRun": "watch"
}
```

## Continuous Integration

### GitHub Actions (Future)

Quality checks that should run on CI:

- Linting
- Type checking
- Testing with coverage
- Build verification
- Security scanning
- Dependency auditing

## Troubleshooting

### Common Issues

#### ESLint Errors

```bash
# Fix auto-fixable issues
npm run lint:fix

# Check specific file
npx eslint src/file.ts
```

#### Prettier Conflicts

```bash
# Format specific file
npx prettier --write src/file.ts

# Check formatting
npx prettier --check src/file.ts
```

#### Type Errors

```bash
# Check types without emitting
npm run type-check

# Check specific workspace
cd frontend && npm run type-check
```

#### Test Failures

```bash
# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npx jest Button.test.tsx
```

### Performance Tips

1. Use `--cache` flag for ESLint in CI
2. Run tests in parallel when possible
3. Use `lint-staged` to only check changed files
4. Configure IDE for real-time feedback

## Maintenance

### Regular Tasks

- Update dependencies monthly
- Review and update ESLint rules quarterly
- Audit security vulnerabilities weekly
- Review test coverage reports
- Update documentation as needed

### Dependency Updates

```bash
# Check outdated packages
npm outdated

# Update dependencies
npm update

# Audit security issues
npm audit
npm audit fix
```

---

_This document should be updated as the project evolves and new quality tools are added._
