import * as React from "react";
import { View, Text, Image, type ViewProps, type ImageProps } from "react-native";
import { cn } from "@/lib/utils";

export const Avatar = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#27272A] bg-[#1E1E22] items-center justify-center",
        className
      )}
      {...props}
    />
  )
);
Avatar.displayName = "Avatar";

export const AvatarImage = React.forwardRef<React.ElementRef<typeof Image>, ImageProps>(
  ({ className, ...props }, ref) => (
    <Image
      ref={ref}
      className={cn("h-full w-full object-cover", className)}
      {...props}
    />
  )
);
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof View>,
  ViewProps & { textClassName?: string }
>(({ className, textClassName, children, ...props }, ref) => {
  const isString = typeof children === "string";

  return (
    <View
      ref={ref}
      className={cn(
        "h-full w-full items-center justify-center bg-[#1E1E22]",
        className
      )}
      {...props}
    >
      {isString ? (
        <Text className={cn("text-sm font-bold text-white uppercase", textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
});
AvatarFallback.displayName = "AvatarFallback";
