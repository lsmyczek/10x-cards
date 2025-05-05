# Testing in 10x Cards

This directory contains the testing setup for the 10x Cards application. We use two main testing frameworks:

1. **Vitest** - For unit and component tests
2. **Playwright** - For end-to-end (E2E) testing

## Requirements

- Node.js v22.14.0 or higher
- npm v10.9.2 or higher

## Directory Structure

```
tests/
├── vitest/             # Unit and component test utilities
│   ├── setup.ts        # Global test setup for Vitest
│   └── test-utils.ts   # Shared test utilities
├── e2e/                # End-to-end tests with Playwright
│   ├── pages/          # Page Object Models
│   │   └── HomePage.ts # Home page POM
│   ├── screenshots/    # Visual comparison screenshots
│   └── home.spec.ts    # Home page test
└── README.md           # This file
```

## Running Tests

### Unit and Component Tests

We use Vitest for unit and component testing. These commands are available:

- `npm test` - Run all unit tests once
- `npm run test:watch` - Run tests in watch mode (useful during development)
- `npm run test:ui` - Run tests with the Vitest UI
- `npm run test:coverage` - Generate a test coverage report

Component tests should be placed next to the component they're testing with the `.test.tsx` extension.

### End-to-End Tests

We use Playwright for E2E testing. These commands are available:

- `npm run test:e2e` - Run all E2E tests
- `npm run test:e2e:ui` - Run tests with the Playwright UI
- `npm run test:e2e:debug` - Run tests in debug mode
- `npm run test:e2e:codegen` - Generate tests using Playwright's codegen tool

## Test Guidelines

### Unit Tests (Vitest)

1. Use the `vi` object for test doubles:
   - `vi.fn()` for function mocks
   - `vi.spyOn()` to monitor existing functions
   - `vi.mock()` for module mocks

2. Follow the Arrange-Act-Assert pattern for clear test structure.

3. Use the custom render function from `test-utils.ts` for React components to ensure consistent provider setup.

4. Leverage inline snapshots with `expect(value).toMatchInlineSnapshot()` for readable assertions.

### E2E Tests (Playwright)

1. Use the Page Object Model pattern for maintainable tests.

2. Only test with Chromium browser as configured.

3. Use locators for resilient element selection:
   ```typescript
   // Prefer this:
   page.getByRole('button', { name: 'Submit' })
   
   // Over this:
   page.locator('.submit-button')
   ```

4. Take advantage of visual comparison with `expect(page).toHaveScreenshot()`.

5. Implement trace viewer for debugging test failures.

## Tips

- Write focused, small tests that test one thing.
- Prefer functional testing (behavior) over implementation details.
- Keep selectors resilient to UI changes.
- Avoid flaky tests with proper waiting and assertions.
- Generate tests with Playwright codegen when appropriate. 