import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
        <rect width="180" height="180" rx="40" fill="#0f172a" />
        <circle cx="90" cy="90" r="52" fill="none" stroke="#e2e8f0" strokeWidth="6" opacity="0.7" />
        <rect x="66" y="60" width="8" height="60" rx="4" fill="#ffffff" />
        <rect x="86" y="50" width="8" height="80" rx="4" fill="#ffffff" />
        <rect x="106" y="60" width="8" height="60" rx="4" fill="#ffffff" />
      </svg>
    ),
    {
      width: size.width,
      height: size.height,
    }
  );
}
