import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:opacity-100 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default: "acm-button-primary border border-transparent",
                destructive:
                    "acm-button-danger border border-transparent focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
                outline:
                    "acm-button-secondary border",
                secondary:
                    "acm-button-secondary-filled border border-transparent",
                ghost:
                    "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
                link: "text-primary underline-offset-4 hover:underline",
                success:
                    "acm-status-measured focus-visible:ring-success/20",
                warning:
                    "acm-status-estimated focus-visible:ring-warning/20",
                accent:
                    "bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent/20",
            },
            size: {
                default: "h-9 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
                icon: "size-9 rounded-md",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

const Button = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        disabledHint?: string;
    }
>(({ className, variant, size, asChild = false, disabledHint, title, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const resolvedTitle = title ?? (disabled ? disabledHint ?? "Action unavailable" : undefined);

    return (
        <Comp
            ref={ref}
            data-slot="button"
            data-disabled={disabled ? "true" : undefined}
            aria-disabled={disabled || undefined}
            title={resolvedTitle}
            className={cn(buttonVariants({ variant, size, className }))}
            disabled={disabled}
            {...props}
        />
    );
});
Button.displayName = "Button";

export { Button, buttonVariants };
