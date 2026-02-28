"use client";

import { useTheme } from "next-themes@0.4.6";
import { Toaster as Sonner, ToasterProps } from "sonner@2.0.3";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      expand={true}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:p-4',
          description: 'group-[.toast]:text-slate-600 group-[.toast]:text-sm',
          actionButton: 'group-[.toast]:bg-gradient-to-r group-[.toast]:from-blue-500 group-[.toast]:to-blue-600 group-[.toast]:text-white group-[.toast]:shadow-md',
          cancelButton: 'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-900',
          closeButton: 'group-[.toast]:bg-white group-[.toast]:text-slate-400 group-[.toast]:border-slate-200 group-[.toast]:hover:text-slate-900',
          success: 'group-[.toast]:border-green-200 group-[.toast]:bg-gradient-to-r group-[.toast]:from-green-50 group-[.toast]:to-emerald-50',
          error: 'group-[.toast]:border-red-200 group-[.toast]:bg-gradient-to-r group-[.toast]:from-red-50 group-[.toast]:to-rose-50',
          warning: 'group-[.toast]:border-yellow-200 group-[.toast]:bg-gradient-to-r group-[.toast]:from-yellow-50 group-[.toast]:to-amber-50',
          info: 'group-[.toast]:border-blue-200 group-[.toast]:bg-gradient-to-r group-[.toast]:from-blue-50 group-[.toast]:to-indigo-50',
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };