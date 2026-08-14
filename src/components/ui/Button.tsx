import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "md" | "lg" | "sm";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-200 disabled:text-white/70",
  secondary:
    "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 disabled:bg-accent-200",
  outline:
    "border border-border bg-surface text-foreground hover:bg-canvas disabled:text-muted",
  ghost: "text-brand-700 hover:bg-brand-50 disabled:text-muted",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-12 px-4 text-[15px] rounded-xl",
  lg: "h-14 px-5 text-base rounded-2xl",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  icon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

interface LinkButtonProps {
  href: string;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  fullWidth,
  icon,
  className = "",
  children,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {icon}
      {children}
    </Link>
  );
}
