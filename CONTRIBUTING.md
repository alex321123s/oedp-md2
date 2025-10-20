# Contributing to ÖDP-MD²

Thank you for your interest in contributing to ÖDP-MD²! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:
1. Check if the bug has already been reported
2. Collect information about the bug (steps to reproduce, expected vs actual behavior)
3. Include screenshots if applicable

**Submit bug reports to:** it-support@oedp.de

Include:
- Clear title and description
- Steps to reproduce
- Expected behavior
- Actual behavior
- System information (OS, browser, versions)
- Screenshots/logs if applicable

### Suggesting Features

Feature suggestions are welcome! Please include:
- Clear description of the feature
- Use case and benefits
- Potential implementation approach (if you have ideas)

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the code style guidelines
   - Add tests for new features
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```
   
   Use conventional commits:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation changes
   - `style:` formatting changes
   - `refactor:` code restructuring
   - `test:` adding tests
   - `chore:` maintenance

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Provide clear description
   - Reference related issues
   - Include screenshots for UI changes

## Development Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

Quick start:
```bash
docker-compose up -d
docker-compose exec backend npm run seed:dev
```

## Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript strict mode
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Avoid `any` type unless necessary
- Use async/await over promises

### Backend

- Use repository pattern for database access
- Validate all inputs with Zod schemas
- Create audit logs for important actions
- Use transactions for multi-step operations
- Return consistent response format:
  ```typescript
  {
    success: boolean,
    message: string,
    data: any
  }
  ```

### Frontend

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use Zustand for global state
- Use TailwindCSS for styling

### Naming Conventions

- **Files:** kebab-case (`motion-card.tsx`)
- **Components:** PascalCase (`MotionCard`)
- **Functions:** camelCase (`fetchMotions`)
- **Constants:** UPPER_SNAKE_CASE (`API_URL`)
- **Types:** PascalCase (`Motion`, `User`)

## Testing

### Backend Tests

```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Test Guidelines

- Write tests for new features
- Maintain at least 70% code coverage
- Test edge cases and error scenarios
- Use descriptive test names

## Documentation

Update documentation when:
- Adding new features
- Changing API endpoints
- Modifying configuration
- Changing user workflows

Documentation files:
- `README.md` - Project overview
- `docs/development.md` - Development guide
- `docs/api-docs.md` - API documentation
- `docs/user-guide.md` - User manual

## Database Changes

### Creating Migrations

```bash
cd backend
npm run migration:generate -- -n MigrationName
```

### Guidelines

- Never modify existing migrations
- Always test migrations (up and down)
- Include rollback logic
- Document complex migrations

## Commit Messages

Follow conventional commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Example:
```
feat(motions): add signature collection feature

Implements digital signature collection for motions
as per §10.1 Satzung requirement.

Closes #123
```

## Review Process

1. **Automated Checks**
   - Linting passes
   - Tests pass
   - Build succeeds

2. **Code Review**
   - At least one approval required
   - Address reviewer comments
   - Keep changes focused

3. **Testing**
   - Manual testing for UI changes
   - Database migration testing
   - Cross-browser testing (if applicable)

## Security

### Reporting Security Issues

**Do NOT open public issues for security vulnerabilities.**

Email: security@oedp.de

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Guidelines

- Never commit secrets or credentials
- Use environment variables for configuration
- Validate and sanitize all inputs
- Use parameterized queries
- Keep dependencies up to date
- Follow OWASP guidelines

## License

By contributing, you agree that your contributions will be licensed under the project's proprietary license.

## Questions?

- **Email:** it-support@oedp.de
- **Wiki:** https://wiki.oedp.de/md2
- **Documentation:** See `docs/` folder

## Recognition

Contributors will be acknowledged in:
- CHANGELOG.md
- Project documentation
- Release notes

Thank you for contributing to ÖDP-MD²! 🎉
