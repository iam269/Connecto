# Contributing to Connecto

Thank you for your interest in contributing to Connecto! We welcome contributions from the community to make our social media platform even better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or later
- **Bun** (recommended) or npm/yarn
- **Git**
- A code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Connecto.git
   cd Connecto
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/Connecto.git
   ```

4. **Install dependencies**
   ```bash
   bun install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

6. **Start the development server**
   ```bash
   bun dev
   ```

---

## Development Workflow

### 1. Keep your fork updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make your changes

- Write your code
- Add tests if applicable
- Update documentation

### 4. Commit your changes

```bash
git add .
git commit -m "feat: add new feature"
```

### 5. Push to your fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

- Go to the original repository
- Click "New Pull Request"
- Fill in the template
- Submit

---

## Reporting Bugs

### Before Reporting

- Check if the bug has already been reported
- Try to reproduce the bug
- Check the [issues](https://github.com/your-org/Connecto/issues) page

### How to Report

Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- **Description**: Clear description of the bug
- **Steps to Reproduce**: Numbered steps to reproduce the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Environment**: OS, browser, Node.js version

---

## Suggesting Features

### Before Suggesting

- Check existing features and plans
- Consider if it aligns with project goals

### How to Suggest

Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- **Feature Description**: Clear description of the feature
- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Additional Context**: Any other relevant information

---

## Pull Request Guidelines

### PR Title Format

Use one of these prefixes:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

Example: `feat: add dark mode support`

### PR Description

Include:

1. **Summary**: What does this PR do?
2. **Related Issue**: Link to the issue (e.g., "Closes #123")
3. **Type of Change**: Bug fix / Feature / Documentation
4. **Testing**: How was it tested?
5. **Screenshots**: If UI changes

### PR Checklist

- [ ] My code follows the code style of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` type - use `unknown` if necessary
- Use proper type annotations for function parameters and return types
- Export types that are used externally

### React/Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Use proper prop typing with TypeScript interfaces
- Extract reusable logic into custom hooks

### File Organization

```
src/
├── components/     # React components
│   ├── feature/   # Feature-specific components
│   └── ui/        # Reusable UI components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── lib/           # Utility functions
├── contexts/      # React contexts
└── integrations/  # External service integrations
```

### Naming Conventions

- **Components**: PascalCase (e.g., `PostCard.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `usePosts.ts`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case for non-component files

### CSS/Tailwind

- Use Tailwind CSS utility classes
- Avoid custom CSS when possible
- Use semantic class names for complex custom styles

---

## Commit Messages

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process, dependencies, etc.

### Examples

```
feat(posts): add image upload functionality

fix(comments): resolve comment sorting issue

docs(readme): update installation instructions

refactor(auth): simplify login logic

test(hooks): add tests for usePosts hook
```

---

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test:watch

# Run tests with coverage
bun test:coverage
```

### Writing Tests

- Write tests for new features
- Write tests for bug fixes
- Follow the existing test structure
- Use descriptive test names

### Test File Location

Place tests in the `src/test/` directory:

```
src/test/
├── setup.ts          # Test setup and utilities
└── example.test.ts   # Example test file
```

---

## Documentation

### Code Documentation

- Use JSDoc comments for exported functions
- Document complex logic with comments
- Keep comments up-to-date with code changes

### README Updates

- Update README.md for significant changes
- Document new features
- Update installation/setup instructions if changed

### API Documentation

If you add new API endpoints, document:

- Endpoint URL
- HTTP method
- Request parameters
- Response format
- Error codes

---

## Questions?

If you have any questions, feel free to:

1. Open an issue for discussion
2. Join our community chat
3. Contact the maintainers

---

Thank you for contributing to Connecto! 🚀
