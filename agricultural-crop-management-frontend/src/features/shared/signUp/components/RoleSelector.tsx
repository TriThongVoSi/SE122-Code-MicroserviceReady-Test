/**
 * Role Selector Component
 * Compact horizontal style for narrow form
 */

import { ShoppingBag, Tractor } from "lucide-react";
import { useI18n } from "@/shared/lib/hooks/useI18n";
import { RadioGroup, RadioGroupItem } from "@/shared/ui";
import { ROLE_OPTIONS } from "../constants";
import type { UserRole } from "../types";

interface RoleSelectorProps {
  name: string;
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onBlur?: () => void;
  errorMessage?: string;
}

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  FARMER: <Tractor className="w-4 h-4" />,
  BUYER: <ShoppingBag className="w-4 h-4" />,
};

export function RoleSelector({
  name,
  selectedRole,
  onRoleChange,
  onBlur,
  errorMessage,
}: RoleSelectorProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-[#244332]">
        {t("auth.signUp.iAmA")}<span className="text-[#E74C3C] ml-0.5">*</span>
      </p>

      <RadioGroup
        name={name}
        value={selectedRole}
        onValueChange={(value) => onRoleChange(value as UserRole)}
        onBlur={onBlur}
        className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {ROLE_OPTIONS.map((option) => {
          const isSelected = selectedRole === option.value;
          const label =
            option.value === "FARMER"
              ? t("auth.signUp.roleFarmer")
              : t("auth.signUp.roleBuyer");
          const description =
            option.value === "FARMER"
              ? t("auth.signUp.roleFarmerDescription")
              : t("auth.signUp.roleBuyerDescription");
          const id = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              htmlFor={id}
              className={`relative flex cursor-pointer gap-3 rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? "border-[#3BA55D] bg-[#ecf9f1] shadow-sm"
                    : "border-[#dce8df] bg-white/85 hover:border-[#b9dcc6] hover:bg-[#f8fcf9]"
                }`}
            >
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                  isSelected ? "bg-[#3BA55D] text-white" : "bg-[#edf5f0] text-[#6c8072]"
                }`}
              >
                {ROLE_ICONS[option.value]}
              </div>

              <div className="min-w-0 pr-6">
                <span className={`block text-sm font-bold ${isSelected ? "text-[#24583a]" : "text-[#244332]"}`}>
                  {label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#667a6d]">
                  {description}
                </span>
              </div>

              <RadioGroupItem
                id={id}
                value={option.value}
                className="absolute right-4 top-4 border-[#a8cfb6] text-[#3BA55D] data-[state=checked]:border-[#3BA55D]"
              />
            </label>
          );
        })}
      </RadioGroup>

      {errorMessage && (
        <p className="text-xs font-medium text-[#E74C3C]">{errorMessage}</p>
      )}
    </div>
  );
}
