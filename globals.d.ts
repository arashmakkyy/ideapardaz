// This file provides type definitions for Firebase loaded from a CDN,
// which is available as a global `firebase` object at runtime.
// This resolves TypeScript compilation errors without changing application logic.

declare namespace firebase {
  /**
   * Represents a user credential.
   */
  interface UserCredential {
    user: User | null;
  }

  /**
   * A user record from Firebase Authentication.
   */
  interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    updateProfile(profile: { displayName?: string | null; photoURL?: string | null; }): Promise<void>;
  }

  /**
   * The Firebase Authentication service.
   */
  interface Auth {
    /**
     * Creates a new user account.
     */
    createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;

    /**
     * Signs in a user with an email and password.
     */
    signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;

    /**
     * Listens for changes to the user's sign-in state.
     */
    onAuthStateChanged(callback: (user: User | null) => void): () => void;

    /**
     * Signs out the current user.
     */
    signOut(): Promise<void>;
  }

  /**
   * Returns the `Auth` service instance.
   */
  function auth(): Auth;
  
  function initializeApp(options: object, name?: string): any;
  
  function firestore(): any; // Simplified for this context
}
