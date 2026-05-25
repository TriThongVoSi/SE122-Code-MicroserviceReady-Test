// Test setup file for Vitest
import '@testing-library/jest-dom';

// Global test configuration
// Add any global mocks or setup here
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverMock as typeof ResizeObserver;
