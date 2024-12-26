import { cn } from "@/app/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export default function Button({
  className,
  variant = "default",
  size = "md",
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center rounded-md font-medium transition-all duration-300",
        "hover-lift active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500/50",
        {
          "bg-gradient-to-r from-violet-500 to-cyan-500 text-white hover:from-violet-600 hover:to-cyan-600 hover:shadow-lg hover:shadow-violet-500/20": variant === "default",
          "border border-gray-600 bg-transparent hover:bg-gray-800/50 hover:border-violet-500": variant === "outline",
          "bg-transparent hover:bg-gray-800/30": variant === "ghost",
          "text-sm px-3 py-1.5": size === "sm",
          "text-base px-4 py-2": size === "md",
          "text-lg px-6 py-3": size === "lg",
        },
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-md animate-fade">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={cn(
        "flex items-center gap-2 transition-opacity duration-300",
        { "opacity-0": isLoading }
      )}>
        {children}
      </span>
    </button>
  );
} 