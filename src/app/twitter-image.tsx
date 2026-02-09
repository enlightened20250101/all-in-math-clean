import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "24px",
          padding: "56px 72px",
          background:
            "radial-gradient(900px 500px at 85% 20%, #e2e8f0 0%, #f8fafc 55%, #ffffff 100%)",
          color: "#0f172a",
        }}
      >
        <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>
          オルマ
        </div>
        <div style={{ fontSize: 30, color: "#334155" }}>
          数学の学習・質問・記事が一体化
        </div>
      </div>
    ),
    size
  );
}
