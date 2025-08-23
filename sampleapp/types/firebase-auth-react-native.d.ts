declare module 'firebase/auth/react-native' {
  import type { Auth, Persistence } from 'firebase/auth';

  export function initializeAuth(app: any, options: { persistence: Persistence }): Auth;
  export function getReactNativePersistence(storage: any): Persistence;
}

