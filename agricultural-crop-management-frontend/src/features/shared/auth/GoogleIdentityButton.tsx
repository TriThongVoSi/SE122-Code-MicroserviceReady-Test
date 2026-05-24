import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/lib";

type GoogleCredentialResponse = {
  credential?: string;
  select_by?: string;
};

type GoogleButtonConfiguration = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  width?: number;
};

type GoogleIdentityServices = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        ux_mode?: "popup" | "redirect";
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: GoogleButtonConfiguration,
      ) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentityServices;
  }
}

interface GoogleIdentityButtonProps {
  label: string;
  onCredential: (idToken: string) => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  buttonText?: GoogleButtonConfiguration["text"];
}

const GOOGLE_IDENTITY_SCRIPT_ID = "google-identity-services-script";
const GOOGLE_IDENTITY_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Identity Services requires a browser"));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      GOOGLE_IDENTITY_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Identity Services")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_IDENTITY_SCRIPT_ID;
    script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export function GoogleIdentityButton({
  label,
  onCredential,
  isLoading = false,
  disabled = false,
  className,
  buttonText = "continue_with",
}: GoogleIdentityButtonProps) {
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId) return;

    let isMounted = true;
    setScriptFailed(false);

    loadGoogleIdentityScript()
      .then(() => {
        if (isMounted) setScriptReady(true);
      })
      .catch(() => {
        if (isMounted) setScriptFailed(true);
      });

    return () => {
      isMounted = false;
    };
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !scriptReady || !buttonContainerRef.current) return;
    if (!window.google?.accounts?.id) return;

    const container = buttonContainerRef.current;
    container.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      ux_mode: "popup",
      callback: (response) => {
        if (response.credential) {
          void onCredential(response.credential);
        }
      },
    });

    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: buttonText,
      width: Math.min(Math.max(container.clientWidth || 320, 240), 420),
    });
  }, [buttonText, clientId, onCredential, scriptReady]);

  if (!clientId || scriptFailed || !scriptReady) {
    return (
      <Button
        variant="ghost"
        type="button"
        disabled
        className={cn(
          "h-12 w-full rounded-2xl border border-[#dce8df] bg-white text-sm font-bold text-[#173422] shadow-sm",
          className,
        )}
      >
        {scriptFailed ? "Google sign-in unavailable" : label}
      </Button>
    );
  }

  return (
    <div className={cn("relative h-12 w-full", className)}>
      <div
        ref={buttonContainerRef}
        className={cn(
          "h-12 w-full overflow-hidden rounded-2xl",
          (disabled || isLoading) && "pointer-events-none opacity-60",
        )}
        aria-disabled={disabled || isLoading}
      />

      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl border border-[#dce8df] bg-white/90 text-sm font-bold text-[#173422]">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2">Signing in...</span>
        </div>
      ) : null}
    </div>
  );
}
