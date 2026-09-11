import * as React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  type GestureResponderEvent,
  type PressableProps,
} from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-xl active:opacity-85 transition-opacity",
  {
    variants: {
      variant: {
        default: "bg-[#007AFF] active:bg-[#0062CC]",
        secondary: "bg-[#1E1E22] active:bg-[#27272A] border border-[#27272A]",
        destructive: "bg-[#EF4444] active:bg-[#DC2626]",
        outline: "border border-[#3F3F46] bg-transparent active:bg-[#27272A]",
        ghost: "bg-transparent active:bg-[#1E1E22]",
        link: "bg-transparent",
        pr: "bg-[#22C55E] active:opacity-90",
      },
      size: {
        default: "h-12 px-5 py-3",
        sm: "h-9 px-3.5 py-1.5 rounded-lg",
        lg: "h-14 px-7 py-4 rounded-2xl",
        icon: "h-11 w-11 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("font-semibold text-center tracking-tight", {
  variants: {
    variant: {
      default: "text-white font-bold",
      secondary: "text-white",
      destructive: "text-white font-bold",
      outline: "text-white",
      ghost: "text-white",
      link: "text-[#007AFF] underline",
      pr: "text-black font-extrabold",
    },
    size: {
      default: "text-base",
      sm: "text-xs",
      lg: "text-lg font-bold",
      icon: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends Omit<PressableProps, "children">,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  textClassName?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  (
    {
      className,
      textClassName,
      variant,
      size,
      loading = false,
      disabled = false,
      children,
      onPress,
      ...props
    },
    ref
  ) => {
    const handlePress = (e: GestureResponderEvent) => {
      if (loading || disabled) return;
      onPress?.(e);
    };

    const isString = typeof children === "string";

    return (
      <Pressable
        ref={ref}
        disabled={disabled || loading}
        onPress={handlePress}
        className={cn(
          buttonVariants({ variant, size }),
          (disabled || loading) && "opacity-50",
          className
        )}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        {...props}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === "pr" ? "#000000" : "#FFFFFF"}
          />
        ) : isString ? (
          <Text className={cn(buttonTextVariants({ variant, size }), textClassName)}>
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);

Button.displayName = "Button";
export { buttonVariants, buttonTextVariants };
