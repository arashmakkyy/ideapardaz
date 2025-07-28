// This file provides type definitions for Firebase and reCAPTCHA loaded from CDNs,
// which are available as global variables (`firebase` and `grecaptcha`) at runtime.
// This resolves TypeScript compilation errors without changing application logic.

/**
 * Declares the global `firebase` object provided by the Firebase SDK.
 */
declare namespace firebase {
  /**
   * A user record from Firebase Authentication.
   */
  interface User {
    uid: string;
    phoneNumber: string | null;
    // Add any other user properties your app uses here.
  }

  /**
   * The Firebase Authentication service.
   */
  interface Auth {
    /**
     * Signs in with a phone number.
     */
    signInWithPhoneNumber(
      phoneNumber: string,
      verifier: auth.RecaptchaVerifier
    ): Promise<auth.ConfirmationResult>;

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
   * The namespace for Firebase Authentication types and classes.
   */
  namespace auth {
    /**
     * An object returned by `signInWithPhoneNumber` to complete the sign-in process.
     */
    interface ConfirmationResult {
      confirm(verificationCode: string): Promise<any>; // Can be more specific if UserCredential type is defined
    }

    /**
     * The reCAPTCHA verifier class.
     */
    class RecaptchaVerifier {
      constructor(
        container: string | HTMLElement,
        parameters?: {
          size?: 'invisible' | 'normal' | 'compact';
          callback?: (response: any) => void;
          'expired-callback'?: () => void;
          'error-callback'?: (error: any) => void;
        }
      );
      render(): Promise<number>;
    }
  }

  /**
   * Returns the `Auth` service instance.
   */
  function auth(): Auth;
  
  function initializeApp(options: object, name?: string): any;
}

/**
 * Declares the global `grecaptcha` object provided by the reCAPTCHA API.
 */
declare const grecaptcha: {
  /**
   * Resets the reCAPTCHA widget.
   */
  reset(widgetId?: number): void;
};
