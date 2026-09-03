import { ImageResponse } from "next/og";
import { org } from "@/lib/content";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6d5efc 0%, #ff8a5c 100%)",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "rgba(255,255,255,0.18)",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 36,
          }}
        >
          ESF
        </div>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700 }}>{org.name}</div>
        <div style={{ display: "flex", fontSize: 28, marginTop: 16, opacity: 0.85 }}>
          Campus ministry since 1976
        </div>
      </div>
    ),
    size,
  );
}
