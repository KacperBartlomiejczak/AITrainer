import * as React from "react";
import { Text, type TextProps } from "react-native";
import { cn } from "@/lib/utils";

export const H1 = React.forwardRef<React.ElementRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("text-2xl font-extrabold tracking-tight text-white", className)}
      {...props}
    />
  )
);
H1.displayName = "H1";

export const H2 = React.forwardRef<React.ElementRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("text-xl font-bold tracking-tight text-white", className)}
      {...props}
    />
  )
);
H2.displayName = "H2";

export const H3 = React.forwardRef<React.ElementRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("text-base font-semibold tracking-tight text-white", className)}
      {...props}
    />
  )
);
H3.displayName = "H3";

export const TextLead = React.forwardRef<React.ElementRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("text-base text-[#A1A1AA] leading-relaxed", className)}
      {...props}
    />
  )
);
TextLead.displayName = "TextLead";

export const TextMuted = React.forwardRef<React.ElementRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("text-xs text-[#71717A]", className)}
      {...props}
    />
  )
);
TextMuted.displayName = "TextMuted";

export const TextSmall = React.forwardRef<React.ElementRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn("text-xs font-medium text-[#A1A1AA]", className)}
      {...props}
    />
  )
);
TextSmall.displayName = "TextSmall";
