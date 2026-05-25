/**
 * SignInHeader - Header section with title and subtitle
 */

import { useI18n } from "@/shared/lib/hooks/useI18n";
import { Sprout } from 'lucide-react';

export function SignInHeader() {
    const { t } = useI18n();
    
    return (
        <div className="mb-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#3BA55D]/15 bg-[#ecf9f1] px-3 py-1.5 text-sm font-semibold text-[#267241]">
                <Sprout className="size-4" aria-hidden="true" />
                {t('auth.shell.formBadge')}
            </div>
            <h1 className="text-3xl font-bold leading-tight text-[#173422] sm:text-4xl">
                {t('auth.signIn.title')}
            </h1>
            <p className="mt-3 text-base leading-7 text-[#5f7668]">
                {t('auth.signIn.subtitle')}
            </p>
        </div>
    );
}
