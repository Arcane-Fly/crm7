# Contributing to CRM7

Thank you for your interest in contributing to CRM7! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

1. Fork the repository

2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/crm7.git
   ```

3. Add upstream remote:

   ```bash
   git remote add upstream https://github.com/Arcane-Fly/crm7.git
   ```

## Development Process

### 1. Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical fixes
- `release/*`: Release preparation

### 2. Creating a Branch

```bash
# For new features
git checkout -b feature/your-feature-name develop

# For bug fixes
git checkout -b bugfix/issue-description develop

# For hotfixes
git checkout -b hotfix/critical-fix main
```

### 3. Development Workflow

1. Create your branch

2. Make your changes

3. Write or update tests

4. Update documentation

5. Submit a pull request

## Coding Standards

### TypeScript Guidelines

- Use TypeScript strict mode
- Follow the [Code Style Guide](CODE_STYLE.md)
- Use proper type definitions
- Avoid using `any`

### React Best Practices

- Use functional components
- Implement proper error boundaries
- Follow React hooks rules
- Maintain component purity

### Testing Requirements

- Write unit tests for new features
- Update affected tests when modifying code
- Maintain >80% test coverage
- Include integration tests when needed

## Pull Request Process

### 1. Preparation

- [ ] Update documentation
- [ ] Add/update tests
- [ ] Follow code style guidelines
- [ ] Resolve merge conflicts
- [ ] Run local tests

### 2. Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots

(if applicable)

## Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No new warnings generated
```

### 3. Review Process

1. Submit PR to `develop` branch

2. Address reviewer comments

3. Maintain thread resolution

4. Update based on feedback

5. Obtain required approvals

## Documentation

### When to Update Documentation

- Adding new features
- Modifying existing functionality
- Fixing bugs with user-facing changes
- Updating dependencies
- Making breaking changes

### Documentation Standards

1. **Code Comments**

   - Use JSDoc for functions/methods
   - Explain complex logic
   - Document type definitions

2. **README Updates**

   - Keep installation steps current
   - Update feature list
   - Maintain troubleshooting guide

3. **API Documentation**
   - Document new endpoints
   - Update changed responses
   - Include example requests/responses

## Testing Guidelines

### Unit Tests

```typescript
describe('Component', () => {
  it('should render correctly', () => {
    const { container } = render(<Component />);
    expect(container).toMatchSnapshot();
  });

  it('should handle user interaction', async () => {
    const { getByRole } = render(<Component />);
    await userEvent.click(getByRole('button'));
    // Assert expected behavior
  });
});
```

### Integration Tests

```typescript
describe('Feature', () => {
  it('should work end-to-end', async () => {
    // Setup
    const { getByText, findByRole } = render(<Feature />);

    // Interaction
    await userEvent.click(getByText('Submit'));

    // Assertion
    expect(await findByRole('alert')).toBeInTheDocument();
  });
});
```

## Commit Guidelines

### Commit Message Format

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Example

```
feat(auth): implement OAuth2 login flow

- Add OAuth2 client configuration
- Implement login callback handler
- Add user session management

Closes #123
```

## Release Process

1. Create release branch

2. Update version numbers

3. Generate changelog

4. Create release PR

5. Deploy to staging

6. Verify functionality

7. Merge to main

8. Tag release

9. Deploy to production

## Getting Help

- Check existing issues

- Join our Discord channel

- Contact maintainers

- Review documentation

## Recognition

Contributors will be:

- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Recognized in project documentation

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

Last Updated: 2025-01-22
