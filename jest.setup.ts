// jest.setup.ts

import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';
import '@testing-library/jest-dom';

declare global {
  var TextEncoder: typeof TextEncoder;
  var TextDecoder: typeof TextDecoder;
}

// Use type assertion to bypass readonly errors
(global as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder = TextEncoder;
(global as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;

Object.defineProperty(globalThis, 'import', {
  get: () => ({
    meta: {
      env: {
        VITE_FIREBASE_API_KEY: 'mock-api-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'mock-auth-domain',
        VITE_FIREBASE_PROJECT_ID: 'mock-project-id',
        VITE_FIREBASE_STORAGE_BUCKET: 'mock-storage-bucket',
        VITE_FIREBASE_MESSAGING_SENDER_ID: 'mock-messaging-sender-id',
        VITE_FIREBASE_APP_ID: 'mock-app-id',
      },
    },
  }),
});

// Mock Firebase for all tests
jest.mock('./src/firebase/firebase');