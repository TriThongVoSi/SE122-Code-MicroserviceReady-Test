/**
 * Page-level hook for SignIn page
 * Handles navigation, redirects, and orchestrates the sign-in flow
 */

import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth, type AuthError } from '@/features/auth/context/AuthContext';
import { marketplaceApi } from '@/shared/api';
import {
    buildGuestCartMergeRequest,
    clearGuestCartItems,
    hasGuestCartItems,
} from '@/features/marketplace/state/guestCart';

function getRoleHomePath(role?: string | null): string {
    if (!role) return '/';
    if (role === 'employee') return '/employee/tasks';
    if (role === 'buyer') return '/marketplace';
    return `/${role}/dashboard`;
}

function getRedirectPath(redirectTo?: string): string {
    if (!redirectTo || redirectTo === '/') return '/';
    if (redirectTo === '/employee') return '/employee/tasks';
    if (redirectTo === '/buyer' || redirectTo === '/marketplace') return '/marketplace';
    return `${redirectTo}/dashboard`;
}

/**
 * Map auth error types to user-friendly toast messages
 */
function getErrorToast(error: AuthError): { title: string; description: string } {
    switch (error.type) {
        case 'invalid_credentials':
            return {
                title: 'Invalid credentials',
                description: 'Please check your email and password.',
            };
        case 'user_locked':
            return {
                title: 'Account locked',
                description: 'Your account is locked. Please contact support.',
            };
        case 'user_inactive':
            return {
                title: 'Account inactive',
                description: 'Your account is not active. Please contact support.',
            };
        case 'role_missing':
            return {
                title: 'No role assigned',
                description: 'Your account has no role assigned. Please contact support.',
            };
        case 'google_auth_failed':
            return {
                title: 'Google sign-in failed',
                description: 'Unable to sign in with Google. Please try again.',
            };
        case 'google_email_not_verified':
            return {
                title: 'Google email not verified',
                description: 'Please verify your Google account email before signing in.',
            };
        case 'google_account_conflict':
            return {
                title: 'Google account conflict',
                description: 'This email is already linked to another Google account.',
            };
        case 'google_auth_not_configured':
            return {
                title: 'Google sign-in unavailable',
                description: 'Google sign-in is not configured for this environment.',
            };
        case 'api_not_found':
            return {
                title: 'Server unavailable',
                description: 'The login service is not responding. Is the backend running on port 8080?',
            };
        case 'network_error':
            return {
                title: 'Connection failed',
                description: 'Cannot reach the server. Please check your network connection.',
            };
        case 'server_error':
        default:
            return {
                title: 'Login failed',
                description: error.message || 'An unexpected error occurred. Please try again.',
            };
    }
}

export function useSignInPage() {
    const { login, loginWithGoogle, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Track if we've already performed the redirect to prevent infinite loops
    const hasRedirected = useRef(false);
    // Track if we've shown the locked toast to prevent duplicate toasts
    const hasShownLockedToast = useRef(false);

    // Check for ?locked=true query param on mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('locked') === 'true' && !hasShownLockedToast.current) {
            hasShownLockedToast.current = true;
            toast.error('Tài khoản bị khóa', {
                description: 'Tài khoản của bạn đã bị khóa do vi phạm chính sách hệ thống. Vui lòng liên hệ quản trị viên để được hỗ trợ.',
                duration: 8000,
            });
            // Clean up the URL
            navigate('/sign-in', { replace: true });
        }
    }, [location.search, navigate]);

    // Redirect if already authenticated (only once)
    useEffect(() => {
        if (isAuthenticated && user && user.role && !hasRedirected.current) {
            hasRedirected.current = true;
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

            if (from && from !== '/sign-in') {
                navigate(from, { replace: true });
            } else {
                navigate(getRoleHomePath(user.role), { replace: true });
            }
        }
        
        // Reset the redirect flag if user logs out
        if (!isAuthenticated) {
            hasRedirected.current = false;
        }
    }, [isAuthenticated, user, navigate, location]);

    /**
     * Handle sign-in form submission.
     * Uses email + password based login.
     * 
     * @param email - User email
     * @param password - User password
     * @param rememberMe - Whether to persist session
     */
    const mergeGuestCartAfterLogin = async () => {
        if (!hasGuestCartItems()) return;

        try {
            const mergeRequest = buildGuestCartMergeRequest();
            if (mergeRequest.items.length > 0) {
                await marketplaceApi.mergeCart(mergeRequest);
                clearGuestCartItems();
            }
        } catch (error) {
            console.error('Failed to merge guest marketplace cart after login', error);
        }
    };

    const navigateAfterLogin = (redirectTo?: string) => {
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

        if (from && from !== '/sign-in') {
            navigate(from, { replace: true });
        } else if (redirectTo && redirectTo !== '/') {
            navigate(getRedirectPath(redirectTo), { replace: true });
        } else if (user?.role) {
            navigate(getRoleHomePath(user.role), { replace: true });
        } else {
            navigate('/', { replace: true });
        }
    };

    const handleSignIn = async (email: string, password: string, rememberMe: boolean) => {
        const result = await login(email, password, rememberMe);

        if (result.success) {
            await mergeGuestCartAfterLogin();
            // Mark as redirected to prevent useEffect from also navigating
            hasRedirected.current = true;
            
            toast.success('Welcome back!', {
                description: `Signed in as ${email}`,
            });

            navigateAfterLogin(result.redirectTo);
        } else if (result.error) {
            const { title, description } = getErrorToast(result.error);
            toast.error(title, { description });
        }
    };

    const handleGoogleSignIn = async (idToken: string, rememberMe: boolean) => {
        const result = await loginWithGoogle(idToken, rememberMe);

        if (result.success) {
            await mergeGuestCartAfterLogin();
            hasRedirected.current = true;

            toast.success('Welcome back!', {
                description: 'Signed in with Google',
            });

            navigateAfterLogin(result.redirectTo);
        } else if (result.error) {
            const { title, description } = getErrorToast(result.error);
            toast.error(title, { description });
        }
    };

    return {
        isAuthenticated,
        handleSignIn,
        handleGoogleSignIn,
    };
}
