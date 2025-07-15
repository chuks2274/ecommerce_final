//Mock Firebase auth and Firestore methods for testing without connecting to the real Firebase services
export const auth = {
  currentUser: null,
};

export const db = {
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
};