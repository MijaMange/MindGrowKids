/**
 * Jest setup file
 * 
 * Configures testing-library and jest-dom matchers
 * Provides global mocks for browser APIs
 */
import '@testing-library/jest-dom';

// Mock window.matchMedia (used by some components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock navigator.onLine (used by apiFetch) - default to online
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  configurable: true,
  value: true,
});

// Mock window.location for tests
delete (window as any).location;
(window as any).location = {
  origin: 'http://localhost:5173',
  href: 'http://localhost:5173',
};
