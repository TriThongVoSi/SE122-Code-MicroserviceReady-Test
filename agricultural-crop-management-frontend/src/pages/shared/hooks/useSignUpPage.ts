/**
 * Page-level hook for SignUp page
 * Handles navigation, redirects, and orchestrates the sign-up flow
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useAuthSignUp } from '@/entities/session';
import type { SignUpFormData } from '@/features/shared/signUp/types';

function getRoleHomePath(role?: string | null): string {
    if (!role) return '/';
    if (role === 'buyer') return '/marketplace';
    return role === 'employee' ? '/employee/tasks' : `/${role}/dashboard`;
}

function getRedirectPath(redirectTo?: string): string {
    if (!redirectTo || redirectTo === '/') return '/';
    if (redirectTo === '/employee') return '/employee/tasks';
    if (redirectTo === '/buyer' || redirectTo === '/marketplace') return '/marketplace';
    return `${redirectTo}/dashboard`;
}

function getGoogleSignInErrorMessage(type?: string, message?: string): string {
    switch (type) {
        case 'user_locked':
            return 'Your account is locked. Please contact support.';
        case 'user_inactive':
            return 'Your account is not active. Please contact support.';
        case 'google_email_not_verified':
            return 'Please verify your Google account email before signing in.';
        case 'google_account_conflict':
            return 'This email is already linked to another Google account.';
        case 'google_auth_not_configured':
            return 'Google sign-in is not configured for this environment.';
        default:
            return message || 'Unable to sign in with Google. Please try again.';
    }
}

export function useSignUpPage() {
    const { isAuthenticated, user, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const signUpMutation = useAuthSignUp();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

            if (from && from !== '/sign-up') {
                navigate(from, { replace: true });
            } else {
                navigate(getRoleHomePath(user.role), { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate, location]);

    const handleSignUp = async (formData: SignUpFormData) => {
        try {
            const email = formData.email.trim();
            const fullName = formData.fullName.trim();
            const phone = formData.phoneNumber.trim();

            // Call the sign up API
            await signUpMutation.mutateAsync({
                username: email,
                email,
                fullName,
                phone: phone.length ? phone : undefined,
                password: formData.password,
                role: formData.role,
            });

            // Show success message
            toast.success('Account created successfully!', {
                description: `Welcome, ${formData.fullName}!`,
            });

            // Redirect back to sign in after successful registration
            navigate('/sign-in', { replace: true });
        } catch (error: any) {
            // Handle API errors
            const errorMessage =
                error?.response?.data?.message || error?.message || 'Failed to create account';

            toast.error('Sign Up Failed', {
                description: errorMessage,
            });

            console.error('Sign up error:', error);
        }
    };

    const handleGoogleSignIn = async (idToken: string) => {
        const result = await loginWithGoogle(idToken, false);

        if (result.success) {
            toast.success('Welcome!', {
                description: 'Signed in with Google',
            });

            const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
            if (from && from !== '/sign-up') {
                navigate(from, { replace: true });
            } else if (result.redirectTo && result.redirectTo !== '/') {
                navigate(getRedirectPath(result.redirectTo), { replace: true });
            } else {
                navigate('/marketplace', { replace: true });
            }
            return;
        }

        toast.error('Google sign-in failed', {
            description: getGoogleSignInErrorMessage(
                result.error?.type,
                result.error?.message,
            ),
        });
    };

    return {
        isAuthenticated,
        handleSignUp,
        handleGoogleSignIn,
    };
}
