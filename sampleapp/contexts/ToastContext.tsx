import React, { createContext, useContext, ReactNode } from "react";
import Toast from "react-native-toast-message";

export interface ToastConfig {
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = (config: ToastConfig) => {
    Toast.show({
      type: config.type,
      text1: config.title,
      text2: config.message,
      visibilityTime: config.duration || 4000,
      autoHide: true,
      topOffset: 60,
      bottomOffset: 40,
    });
  };

  const hideToast = () => {
    Toast.hide();
  };

  return <ToastContext.Provider value={{ showToast, hideToast }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
