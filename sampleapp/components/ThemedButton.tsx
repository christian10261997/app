import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { ThemedText } from "./ThemedText";

export type ThemedButtonProps = TouchableOpacityProps & {
  lightColor?: string;
  darkColor?: string;
  textLightColor?: string;
  textDarkColor?: string;
  variant?: "primary" | "secondary" | "danger" | "success" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  children: React.ReactNode;
};

export function ThemedButton({ style, lightColor, darkColor, textLightColor, textDarkColor, variant = "primary", size = "medium", loading = false, disabled, children, ...rest }: ThemedButtonProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "tint");
  const textColor = useThemeColor({ light: textLightColor, dark: textDarkColor }, "background");

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: backgroundColor,
          borderWidth: 0,
        };
      case "secondary":
        return {
          backgroundColor: useThemeColor({}, "background"),
          borderWidth: 1,
          borderColor: useThemeColor({}, "tint"),
        };
      case "danger":
        return {
          backgroundColor: "#FF3B30",
          borderWidth: 0,
        };
      case "success":
        return {
          backgroundColor: "#28a745",
          borderWidth: 0,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: useThemeColor({}, "tint"),
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: backgroundColor,
          borderWidth: 0,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 6,
        };
      case "medium":
        return {
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 8,
        };
      case "large":
        return {
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderRadius: 10,
        };
      default:
        return {
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: 8,
        };
    }
  };

  const getTextColor = () => {
    if (variant === "secondary" || variant === "outline" || variant === "ghost") {
      return useThemeColor({}, "tint");
    }
    return textColor;
  };

  const getTextSize = () => {
    switch (size) {
      case "small":
        return 14;
      case "medium":
        return 16;
      case "large":
        return 18;
      default:
        return 16;
    }
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        {
          opacity: isDisabled ? 0.7 : 1,
        },
        style,
      ]}
      disabled={isDisabled}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <ThemedText
          style={{
            color: getTextColor(),
            fontSize: getTextSize(),
            fontWeight: "600",
            textAlign: "center",
          }}>
          {children}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
});
