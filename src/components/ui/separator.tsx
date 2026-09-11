import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

export interface SeparatorProps extends ViewProps {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

export const Separator = React.forwardRef<React.ElementRef<typeof View>, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <View
      ref={ref}
      aria-orientation={orientation}
      accessibilityRole={decorative ? "none" : undefined}
      className={cn(
        "shrink-0 bg-[#27272A]",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
    />
  )
);

Separator.displayName = "Separator";
