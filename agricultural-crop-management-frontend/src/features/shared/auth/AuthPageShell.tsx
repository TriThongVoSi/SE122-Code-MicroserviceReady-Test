import { useI18n } from "@/shared/lib/hooks/useI18n";
import type { SupportedLocale } from "@/i18n";
import { cn } from "@/shared/lib";
import { BadgeCheck, CloudSun, Globe2, Leaf, ShieldCheck, Sprout } from "lucide-react";
import type { ReactNode } from "react";

interface AuthPageShellProps {
  children: ReactNode;
  mode: "sign-in" | "sign-up";
}

const BENEFITS = [
  { key: "harvest", icon: Sprout },
  { key: "traceability", icon: BadgeCheck },
  { key: "weather", icon: CloudSun },
] as const;

const LOCALES: Array<{ locale: SupportedLocale; label: string }> = [
  { locale: "en-US", label: "EN" },
  { locale: "vi-VN", label: "VI" },
];

export function AuthPageShell({ children, mode }: AuthPageShellProps) {
  const { t, locale, setLocale } = useI18n();
  const isSignUp = mode === "sign-up";

  return (
    <main
      className="h-dvh overflow-x-hidden overflow-y-auto bg-[#f4fbf6] bg-cover bg-center p-3 text-[#143222] sm:p-4 lg:p-6"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(247, 252, 249, 0.94), rgba(232, 248, 239, 0.9)), url('/background.png')",
      }}
      data-name={isSignUp ? "auth.sign-up" : "auth.sign-in"}
    >
      <div className="mx-auto grid min-h-full w-full min-w-0 max-w-[1440px] gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(460px,0.95fr)] lg:gap-6">
        <section
          className="relative hidden overflow-hidden rounded-[28px] bg-cover bg-center p-8 text-white shadow-[0_24px_90px_rgba(18,74,43,0.28)] lg:flex lg:flex-col lg:justify-between xl:p-10"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(12, 61, 31, 0.84), rgba(17, 117, 63, 0.42) 46%, rgba(244, 197, 66, 0.18)), url('/background.png')",
          }}
          aria-label={t("auth.shell.visualLabel")}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(255,255,255,0.32),transparent_28%),linear-gradient(180deg,transparent,rgba(6,40,22,0.52))]" />
          <div className="relative flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl border border-white/35 bg-white/20 backdrop-blur-md">
              <Leaf className="size-6 text-[#d8ff8c]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/75">
                {t("auth.shell.brandKicker")}
              </p>
              <p className="text-xl font-bold leading-tight">{t("common.appName")}</p>
            </div>
          </div>

          <div className="relative max-w-2xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/18 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-md">
              <ShieldCheck className="size-4 text-[#d8ff8c]" aria-hidden="true" />
              {t("auth.shell.eyebrow")}
            </span>
            <h1 className="max-w-[680px] text-5xl font-bold leading-[1.02] text-white xl:text-6xl">
              {t("auth.shell.heroTitle")}
            </h1>
            <p className="mt-6 max-w-[570px] text-lg leading-8 text-white/86">
              {t("auth.shell.heroDescription")}
            </p>
          </div>

          <div className="relative grid gap-3 xl:grid-cols-3">
            {BENEFITS.map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="rounded-2xl border border-white/22 bg-white/16 p-4 shadow-sm backdrop-blur-md"
              >
                <Icon className="mb-3 size-5 text-[#F4C542]" aria-hidden="true" />
                <p className="text-sm font-bold text-white">{t(`auth.shell.benefits.${key}.title`)}</p>
                <p className="mt-1 text-xs leading-5 text-white/76">
                  {t(`auth.shell.benefits.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-[calc(100dvh-24px)] min-w-0 items-center justify-center py-5 sm:min-h-[calc(100dvh-32px)] sm:py-8 lg:min-h-[calc(100dvh-48px)]">
          <div className={cn("w-full min-w-0 max-w-full", isSignUp ? "sm:max-w-[610px]" : "sm:max-w-[500px]")}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0 truncate inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/76 px-3 py-2 text-sm font-semibold text-[#24583a] shadow-sm backdrop-blur-md lg:hidden">
                <Leaf className="size-4 text-[#3BA55D]" aria-hidden="true" />
                {t("common.appName")}
              </div>

              <div
                className="ml-auto shrink-0 inline-flex rounded-full border border-white/70 bg-white/78 p-1 shadow-sm backdrop-blur-md"
                aria-label={t("auth.shell.languageLabel")}
              >
                <Globe2 className="ml-2 mr-1 mt-1.5 hidden size-4 text-[#3BA55D] min-[420px]:block" aria-hidden="true" />
                {LOCALES.map((item) => {
                  const isActive = locale === item.locale;
                  return (
                    <button
                      key={item.locale}
                      type="button"
                      onClick={() => void setLocale(item.locale)}
                      aria-pressed={isActive}
                      className={cn(
                        "min-w-9 rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3BA55D]/50 min-[420px]:min-w-10 min-[420px]:px-3",
                        isActive
                          ? "bg-[#3BA55D] text-white shadow-sm"
                          : "text-[#315941] hover:bg-[#e9f7ee]",
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="max-w-full overflow-hidden rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_24px_80px_rgba(19,96,52,0.18)] backdrop-blur-xl sm:p-7 lg:p-8">
              {children}
            </div>

            <p className="mt-4 text-center text-xs font-medium text-[#45634f]">
              {t("auth.shell.footerNote")}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
