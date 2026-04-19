import * as React from "react"
import { cn } from "@/src/shared/lib/helpers"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'danger' | 'success';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white",
          {
            "bg-emerald-600 text-white hover:bg-emerald-700": variant === "default",
            "border border-gray-200 bg-white hover:bg-gray-100 text-gray-900": variant === "outline",
            "hover:bg-gray-100 text-gray-900": variant === "ghost",
            "underline-offset-4 hover:underline text-emerald-600": variant === "link",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
            "bg-green-600 text-white hover:bg-green-700": variant === "success",
            "h-10 py-2 px-4": size === "default",
            "h-9 px-3 rounded-md": size === "sm",
            "h-11 px-8 rounded-md": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
