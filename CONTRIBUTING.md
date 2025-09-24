# Contributing Guidelines

## Code of Conduct

- Be respectful and professional
- Write clean, maintainable code
- Document your changes
- Test before committing

## Development Process

### 1. Setting Up Development Environment

```bash
# Install dependencies
npm install

# Set up pre-commit hooks
npm run prepare

# Start development server
npm run dev
```

### 2. Creating a Feature

1. Create feature branch from `develop`:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

2. Make your changes following our coding standards

3. Write/update tests as needed

4. Commit with conventional commit message:
```bash
git commit -m "feat: add photo upload component"
```

5. Push and create pull request to `develop`

### 3. Code Standards

#### TypeScript
- Use strict TypeScript settings
- Define interfaces for all data structures
- Avoid `any` type
- Use proper type imports

#### React/Next.js
- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Implement error boundaries

#### Styling
- Use Tailwind CSS utilities
- Follow mobile-first approach
- Maintain consistent spacing
- Use CSS variables for themes

#### Testing
- Write unit tests for utilities
- Write integration tests for API routes
- Test critical user flows
- Maintain >80% coverage

### 4. File Naming Conventions

- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `types.ts` or `ComponentName.types.ts`
- Tests: `ComponentName.test.tsx`
- API Routes: `route.ts`

### 5. Pull Request Process

1. **Title**: Use conventional commit format
2. **Description**: Include:
   - What changed and why
   - How to test
   - Screenshots (if UI changes)
   - Breaking changes
3. **Checklist**:
   - [ ] Tests pass
   - [ ] Lint passes
   - [ ] Types check
   - [ ] Documentation updated
   - [ ] PR reviewed

### 6. Code Review Guidelines

#### For Reviewers
- Test the changes locally
- Check for security issues
- Verify performance impact
- Ensure code follows standards

#### For Authors
- Respond to all comments
- Make requested changes
- Re-request review after changes
- Keep PR scope focused

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

### Writing Tests

```typescript
// Example test structure
describe('Component/Feature', () => {
  it('should do expected behavior', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Documentation

- Update README for new features
- Document API endpoints
- Add JSDoc comments for complex functions
- Update type definitions

## Release Process

1. Merge feature branches to `develop`
2. Create release branch from `develop`
3. Update version in `package.json`
4. Update CHANGELOG
5. Create PR to `main`
6. Tag release after merge

## Questions?

Contact the team lead or open a discussion in GitHub.