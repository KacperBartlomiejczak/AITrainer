import * as React from "react";
import { View, type ViewProps } from "react-native";
import { cn } from "@/lib/utils";

export interface ProgressProps extends ViewProps {
  value?: number; // 0 to 100
  indicatorClassName?: string;
  testID?: string;
}

export const Progress = React.forwardRef<React.ElementRef<typeof View>, ProgressProps>(
  ({ className, value = 0, indicatorClassName, testID = "progress-bar", ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
      <View
        ref={ref}
        testID={testID}
        role="progressbar"
        accessibilityRole="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        accessibilityValue={{ min: 0, max: 100, now: clampedValue }}
        className={cn(
          "relative h-2.5 w-full overflow-hidden rounded-full bg-[#27272A]",
          className
        )}
        {...props}
      >
        <View
          testID={`${testID}-indicator`}
          className={cn(
            "h-full rounded-full bg-[#007AFF] transition-all",
            indicatorClassName
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </View>
    );
  }
);

Progress.displayName = "Progress";
