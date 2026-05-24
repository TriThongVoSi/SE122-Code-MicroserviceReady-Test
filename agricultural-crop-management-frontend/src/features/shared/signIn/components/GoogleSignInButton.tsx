/**
 * GoogleSignInButton - Google Identity Services sign-in button with separator
 */

import { GoogleIdentityButton } from "../../auth/GoogleIdentityButton";
import { useI18n } from "@/shared/lib/hooks/useI18n";

interface GoogleSignInButtonProps {
    onCredential: (idToken: string) => void | Promise<void>;
    isLoading?: boolean;
    disabled?: boolean;
}

export function GoogleSignInButton({
    onCredential,
    isLoading = false,
    disabled = false,
}: GoogleSignInButtonProps) {
    const { t } = useI18n();
    const label = t('auth.signIn.continueWithGoogle');
    
    return (
        <>
            <GoogleIdentityButton
                label={label}
                onCredential={onCredential}
                isLoading={isLoading}
                disabled={disabled}
                className="rounded-2xl"
                buttonText="continue_with"
            />

            <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#dce8df]" />
                <p className="text-sm font-semibold text-[#789083]">
                    {t('auth.signIn.orSignInWith')}
                </p>
                <div className="h-px flex-1 bg-[#dce8df]" />
            </div>
        </>
    );
}
