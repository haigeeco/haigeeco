"use client";

import { useEffect } from "react";

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
          background: "#fffaf3",
          color: "#2a211c",
        }}
      >
        <div style={{ maxWidth: 420, padding: "0 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600 }}>Terjadi kesalahan</h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "#6b5e54" }}>
            Aplikasi gagal dimuat. Coba muat ulang halaman.
          </p>
          <button
            onClick={() => retry()}
            style={{
              marginTop: 20,
              border: 0,
              borderRadius: 9999,
              background: "#e76f51",
              color: "#ffffff",
              padding: "10px 16px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
