"use client"

import { Toaster } from "react-hot-toast"

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "8px",
          background: "#333",
          color: "#fff",
        },
      }}
    />
  )
}
