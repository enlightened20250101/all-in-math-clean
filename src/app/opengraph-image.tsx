import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "radial-gradient(1200px 600px at 90% 10%, #e2e8f0 0%, #f8fafc 50%, #ffffff 100%)",
          color: "#0f172a",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 18px",
            borderRadius: "999px",
            background: "rgba(15, 23, 42, 0.06)",
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "0.2em",
          }}
        >
          ORUMA
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1 }}>
            オルマ
          </div>
          <div style={{ fontSize: 34, color: "#334155" }}>
            数学の学習・質問・記事が一体化した学習コミュニティ
          </div>
        </div>
        <div style={{ fontSize: 22, color: "#64748b" }}>
          all-in-math.com
        </div>
      </div>
    ),
    size
  );
}
