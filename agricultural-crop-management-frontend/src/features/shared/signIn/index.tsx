/**
 * SignIn - Main container component
 * Orchestrates sign-in functionality by composing sub-components with business logic
 */

import type { SignInProps } from "./types";
import { useSignIn } from "./hooks/useSignIn";
import { AuthPageShell } from "../auth/AuthPageShell";
import { SignInHeader } from "./components/SignInHeader";
import { GoogleSignInButton } from "./components/GoogleSignInButton";
import { SignInForm } from "./components/SignInForm";


export function SignIn({ onSignIn, onGoogleSignIn }: SignInProps) {
    const {
        email,
        password,
        keepLoggedIn,
        showPassword,
        isLoading,
        isGoogleLoading,
        setEmail,
        setPassword,
        handleSubmit,
        handleGoogleCredential,
        toggleShowPassword,
        toggleKeepLoggedIn,
    } = useSignIn({ onSignIn, onGoogleSignIn });

    return (
        <AuthPageShell mode="sign-in">
            <SignInHeader />

            <GoogleSignInButton
                onCredential={handleGoogleCredential}
                isLoading={isGoogleLoading}
                disabled={isLoading}
            />

            <SignInForm
                email={email}
                password={password}
                keepLoggedIn={keepLoggedIn}
                showPassword={showPassword}
                isLoading={isLoading}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onToggleKeepLoggedIn={toggleKeepLoggedIn}
                onToggleShowPassword={toggleShowPassword}
                onSubmit={handleSubmit}
            />
        </AuthPageShell>
    );
}
