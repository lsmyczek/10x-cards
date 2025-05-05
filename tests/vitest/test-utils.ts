import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

/**
 * Custom render function with common providers and default options
 * @param ui Component to render
 * @param options Additional render options
 * @returns Rendered component
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, {
    // Add global providers here if needed, such as:
    // wrapper: ({ children }) => (
    //   <ThemeProvider>
    //     {children}
    //   </ThemeProvider>
    // ),
    ...options,
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render }; 