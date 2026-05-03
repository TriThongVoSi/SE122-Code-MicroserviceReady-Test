import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';
import { AddressDisplay } from '@/shared/ui';
import { Mail, MapPin, Phone } from 'lucide-react';
import { SectionCardHeader } from './SectionCardHeader';

export type ContactInfoLabels = {
  title: string;
  subtitle?: string;
  email: string;
  phone: string;
  address: string;
};

export type ContactInfoCardProps = {
  email: string;
  phone: string;
  address: string;
  wardCode?: number | null;
  labels: ContactInfoLabels;
};

export function ContactInfoCard({
  email,
  phone,
  address,
  wardCode,
  labels,
}: ContactInfoCardProps) {
  return (
    <Card className="border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)]">
      <SectionCardHeader
        icon={Mail}
        title={labels.title}
        subtitle={labels.subtitle}
      />
      <CardContent className="space-y-6 px-6 pb-6 sm:px-8 sm:pb-8">
        <div className="grid gap-6 md:grid-cols-2">
          <ContactField icon={Mail} label={labels.email} value={email} />
          <ContactField
            icon={Phone}
            label={labels.phone}
            value={phone}
            mono
          />
        </div>
        <div>
          <FieldLabel icon={MapPin} text={labels.address} />
          <AddressDisplay
            wardCode={wardCode ?? null}
            fallback={address}
            className="mt-1.5 text-base text-slate-900"
          />
        </div>
      </CardContent>
    </Card>
  );
}

type ContactFieldProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
};

function ContactField({ icon, label, value, mono }: ContactFieldProps) {
  return (
    <div>
      <FieldLabel icon={icon} text={label} />
      <p
        className={`mt-1.5 break-words text-base text-slate-900 ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FieldLabel({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {text}
      </span>
    </div>
  );
}
