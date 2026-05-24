/**
 * Google Sign Up Button Component
 * Uses the same Google Identity Services flow as sign-in.
 */

import { GoogleIdentityButton } from "../../auth/GoogleIdentityButton";
import { useI18n } from "@/shared/lib/hooks/useI18n";

interface GoogleSignUpButtonProps {
  onCredential: (idToken: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function GoogleSignUpButton({
  onCredential,
  isLoading = false,
}: GoogleSignUpButtonProps) {
  const { t } = useI18n();
  const label = t('auth.signUp.continueWithGoogle');
  
  return (
    <div className="w-full">
      <GoogleIdentityButton
        label={label}
        onCredential={onCredential}
        isLoading={isLoading}
        className="rounded-2xl"
        buttonText="signup_with"
      />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#dce8df]" />
        <span className="text-sm font-semibold text-[#789083]">{t('auth.signUp.orSignUpWith')}</span>
        <div className="h-px flex-1 bg-[#dce8df]" />
      </div>
    </div>
  );
}
