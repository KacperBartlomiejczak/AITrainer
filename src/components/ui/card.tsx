import * as React from "react";
import { View, Text, type ViewProps, type TextProps } from "react-native";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  React.ElementRef<typeof View>,
  ViewProps & { elevated?: boolean }
>(({ className, elevated = false, ...props }, ref) => (
  <View
    ref={ref}
    className={cn(
      "rounded-2xl border border-[#27272A] p-4",
      elevated ? "bg-[#1E1E22]" : "bg-[#121214]",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn("flex-col gap-1.5 pb-3", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<React.ElementRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("text-lg font-bold tracking-tight text-white", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<React.ElementRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("text-xs text-[#A1A1AA] leading-relaxed", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn("pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("flex-row items-center pt-3 border-t border-[#27272A]", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
