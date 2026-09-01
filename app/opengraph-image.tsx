import { ImageResponse } from "next/og";

import { APP_NAME } from "@/lib/constants";

export const alt = `${APP_NAME} — Briefs claros, en minutos`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6d28d9 0%, #db2777 55%, #f97316 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 56,
            fontWeight: 700,
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "rgba(255,255,255,0.18)",
              fontSize: 40,
              color: "white",
            }}
          >
            B
          </div>
          {APP_NAME}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: "rgba(255,255,255,0.92)",
            textAlign: "center",
          }}
        >
          Briefs claros, en minutos — generados con IA
        </div>
      </div>
    ),
    { ...size },
  );
}
