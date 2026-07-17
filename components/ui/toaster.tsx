"use client"

import { Toaster } from "react-hot-toast"

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: "1rem",
          background: "var(--card)",
          color: "var(--card-foreground)",
          boxShadow: "0 20px 60px -12px rgba(0,0,0,0.25)",
          fontSize: "0.875rem",
          padding: "0.75rem 1rem",
          fontWeight: "500",
        },
        success: {
          iconTheme: {
            primary: "var(--success)",
            secondary: "var(--card)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--destructive)",
            secondary: "var(--card)",
          },
        },
      }}
    />
  )
}
