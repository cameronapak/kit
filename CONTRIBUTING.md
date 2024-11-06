# Contributing to kit

First off, thank you for considering contributing to kit! This project aims to help Christian creatives keep in touch with their community, and your help makes that mission possible.

## Code of Conduct

By participating in this project, you agree to maintain a welcoming, respectful environment. Please report unacceptable behavior to [@cameronpak on X/Twitter](https://x.com/cameronpak).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check [existing issues](https://github.com/cameronapak/kit/issues) to avoid duplicates. When creating a bug report, include:

- A clear, descriptive title
- Detailed steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots if applicable
- Your environment details (OS, browser, kit version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear, descriptive title
- Provide a detailed description of the proposed functionality
- Explain why this enhancement would be useful
- Include mockups or examples if applicable

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and formatting:
   ```bash
   npm run format
   npm run build
   ```
5. Commit your changes using conventional commits:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

1. Ensure you have:

   - Node.js >=20.3.0
   - NPM >=10.0.0

2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/kit.git
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Style Guide

### Code Style

- Use 2 spaces for indentation
- Maximum line length: 120 characters
- Format with Prettier (run `npm run format`)
- Follow existing code patterns

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code restructuring
- `test:` adding/updating tests
- `chore:` maintenance tasks

### TypeScript

- Enable strict mode
- Provide proper type definitions
- Avoid `any` types when possible

### Component Guidelines

- Create .astro files for Astro components
- Use framework-specific components when necessary
- Implement proper component composition
- Use Astro's component props for data passing

## Project Structure

```
src/
├── actions/     # Server actions
├── components/  # Reusable components
├── layouts/     # Page layouts
├── pages/       # Route pages
├── db/         # Database models
└── libs/       # Utility functions
```

## Questions?

Feel free to reach out on [X/Twitter](https://x.com/cameronpak) or [open an issue](https://github.com/cameronapak/kit/issues).

## License

By contributing, you agree that your contributions will be licensed under the same [Attribution License](./LICENSE.md) that covers the project.
