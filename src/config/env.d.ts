// Declare types for the 'src/config/env' module and its firebaseEnv export.
declare module 'src/config/env' {
  export const firebaseEnv: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}