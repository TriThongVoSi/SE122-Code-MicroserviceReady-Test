import type { LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Calendar, Clock, User } from 'lucide-react';

export type ProfileHeroLabels = {
  userId: string;
  joinedDate: string;
  lastLogin: string;
  status: string;
};

export type ProfileHeroCardProps = {
  displayName: string;
  username: string;
  initials: string;
  roleIcon: LucideIcon;
  roleLabel: string;
  isActive: boolean;
  userId: number | string;
  joinedDate: string;
  lastLogin: string;
  labels: ProfileHeroLabels;
};

export function ProfileHeroCard({
  displayName,
  username,
  initials,
  roleIcon: RoleIcon,
  roleLabel,
  isActive,
  userId,
  joinedDate,
  lastLogin,
  labels,
}: ProfileHeroCardProps) {
  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(16,185,129,0.10)]">
      {/* Zone A: Banner */}
      <div className="relative h-36 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600">
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }}
          aria-hidden
        />
        <div
          className="absolute -right-8 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
      </div>

      <CardContent className="px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
        {/* Zone B: Identity row, overlapping the banner */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-6">
          <Avatar className="-mt-12 h-24 w-24 shrink-0 ring-4 ring-white shadow-lg sm:h-28 sm:w-28">
            <AvatarFallback className="bg-emerald-600 text-2xl font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col gap-2 pt-1 sm:pb-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {displayName}
              </h2>
              <p className="text-sm text-slate-500">@{username}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="border-slate-200 bg-slate-100 text-slate-700"
              >
                <RoleIcon className="mr-1 h-3 w-3" />
                {roleLabel}
              </Badge>
              <Badge
                className={
                  isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-100 text-slate-600'
                }
              >
                <span
                  className={
                    'mr-1.5 inline-block h-2 w-2 rounded-full ' +
                    (isActive ? 'bg-emerald-500' : 'bg-slate-400')
                  }
                />
                {labels.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Zone C: Stat tile strip */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatTile
            tone="slate"
            icon={User}
            label={labels.userId}
            value={`#${userId}`}
            mono
          />
          <StatTile
            tone="emerald"
            icon={Calendar}
            label={labels.joinedDate}
            value={joinedDate}
          />
          <StatTile
            tone="sky"
            icon={Clock}
            label={labels.lastLogin}
            value={lastLogin}
          />
        </div>
      </CardContent>
    </Card>
  );
}

type Tone = 'slate' | 'emerald' | 'sky';

const TONE_STYLES: Record<
  Tone,
  { tile: string; chip: string; icon: string }
> = {
  slate: {
    tile: 'bg-slate-50 border-slate-200',
    chip: 'bg-white text-slate-600 ring-1 ring-slate-200',
    icon: 'text-slate-600',
  },
  emerald: {
    tile: 'bg-emerald-50/70 border-emerald-100',
    chip: 'bg-white text-emerald-600 ring-1 ring-emerald-100',
    icon: 'text-emerald-600',
  },
  sky: {
    tile: 'bg-sky-50/70 border-sky-100',
    chip: 'bg-white text-sky-600 ring-1 ring-sky-100',
    icon: 'text-sky-600',
  },
};

type StatTileProps = {
  tone: Tone;
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
};

function StatTile({ tone, icon: Icon, label, value, mono }: StatTileProps) {
  const styles = TONE_STYLES[tone];
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 ${styles.tile}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.chip}`}
      >
        <Icon className={`h-5 w-5 ${styles.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p
          className={`mt-0.5 truncate text-base font-semibold text-slate-900 ${
            mono ? 'font-mono' : ''
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
