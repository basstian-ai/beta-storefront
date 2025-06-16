// vitest.setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

console.log('Vitest global setup: Loading @testing-library/jest-dom.');

// Mock localStorage for all tests
let localStorageStore: Record<string, string> = {};

const localStorageMock: Storage = {
  getItem: vi.fn((key: string) => localStorageStore[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageStore[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    localStorageStore = {};
  }),
  key: vi.fn((index: number) => Object.keys(localStorageStore)[index] || null),
  get length() {
    return Object.keys(localStorageStore).length;
  }
};

vi.stubGlobal('localStorage', localStorageMock);
console.log('Vitest global setup: localStorage mocked globally.');
