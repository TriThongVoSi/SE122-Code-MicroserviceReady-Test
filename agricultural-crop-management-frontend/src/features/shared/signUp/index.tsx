/**
 * Sign Up Main Container Component
 * Enterprise-grade card layout with subtle gradient background
 */

import { GoogleSignUpButton } from "./components/GoogleSignUpButton";
import { AuthPageShell } from "../auth/AuthPageShell";
import { SignUpForm } from "./components/SignUpForm";
import { SignUpHeader } from "./components/SignUpHeader";
import { useSignUp } from "./hooks/useSignUp";
import type { SignUpProps } from "./types";

export function SignUp({ onSignUp, onGoogleSignIn }: SignUpProps) {
  const {
    form,
    showPassword,
    showConfirmPassword,
    isGoogleLoading,
    handleSubmit,
    handleGoogleCredential,
    toggleShowPassword,
    toggleShowConfirmPassword,
  } = useSignUp({ onSignUp, onGoogleSignIn });

  return (
    <AuthPageShell mode="sign-up">
      <SignUpHeader />

      <GoogleSignUpButton
        onCredential={handleGoogleCredential}
        isLoading={isGoogleLoading}
      />

      <SignUpForm
        form={form}
        showPassword={showPassword}
        showConfirmPassword={showConfirmPassword}
        onToggleShowPassword={toggleShowPassword}
        onToggleShowConfirmPassword={toggleShowConfirmPassword}
        onSubmit={handleSubmit}
      />
    </AuthPageShell>
  );
}
