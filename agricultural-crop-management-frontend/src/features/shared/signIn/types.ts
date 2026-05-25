/**
 * Type definitions for SignIn feature
 */

export interface SignInProps {
    onSignIn: (email: string, password: string, rememberMe: boolean) => Promise<void>;
    onGoogleSignIn: (idToken: string, rememberMe: boolean) => Promise<void>;
}

export interface SignInFormData {
    email: string;
    password: string;
    keepLoggedIn: boolean;
}
