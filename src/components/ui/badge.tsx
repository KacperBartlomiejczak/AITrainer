import * as React from "react";
import { View, Text, type ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "flex-row items-center self-start gap-1 rounded-full px-2.5 py-0.5 border",
  {
    variants: {
      variant: {
        default: "bg-[rgba(0,122,255,0.15)] border-[rgba(0,122,255,0.35)]",
        secondary: "bg-[#1E1E22] border-[#27272A]",
        pr: "bg-[rgba(34,197,94,0.18)] border-[rgba(34,197,94,0.4)]",
        warmup: "bg-[rgba(245,158,11,0.18)] border-[rgba(245,158,11,0.4)]",
        destructive: "bg-[rgba(239,68,68,0.18)] border-[rgba(239,68,68,0.4)]",
        rest: "bg-[rgba(139,92,246,0.18)] border-[rgba(139,92,246,0.4)]",
        outline: "border-[#3F3F46] bg-transparent",
      },
      size: {
        default: "px-2.5 py-1",
        sm: "px-2 py-0.5",
        lg: "px-3.5 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const badgeTextVariants = cva("font-bold tracking-tight text-center", {
  variants: {
    variant: {
      default: "text-[#007AFF]",
      secondary: "text-[#A1A1AA]",
      pr: "text-[#22C55E]",
      warmup: "text-[#F59E0B]",
      destructive: "text-[#EF4444]",
      rest: "text-[#8B5CF6]",
      outline: "text-white",
    },
    size: {
      default: "text-xs",
      sm: "text-[10px]",
      lg: "text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface BadgeProps extends ViewProps, VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
  textClassName?: string;
}

export const Badge = React.forwardRef<React.ElementRef<typeof View>, BadgeProps>(
  ({ className, textClassName, variant, size, children, ...props }, ref) => {
    const isString = typeof children === "string";

    return (
      <View
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {isString ? (
          <Text className={cn(badgeTextVariants({ variant, size }), textClassName)}>
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    );
  }
);

Badge.displayName = "Badge";
export { badgeVariants, badgeTextVariants };
