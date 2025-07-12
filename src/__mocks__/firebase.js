// src/__mocks__/firebase.ts
export const auth = {
    currentUser: null,
    // add mocked auth methods if needed
};
export const db = {
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    collection: jest.fn(),
    addDoc: jest.fn(),
};
