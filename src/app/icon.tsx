import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="aim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="96" fill="url(#aim)" />
        <circle cx="256" cy="256" r="140" fill="none" stroke="#e2e8f0" strokeWidth="10" opacity="0.7" />
        <rect x="196" y="186" width="24" height="140" rx="12" fill="#ffffff" />
        <rect x="244" y="160" width="24" height="192" rx="12" fill="#ffffff" />
        <rect x="292" y="186" width="24" height="140" rx="12" fill="#ffffff" />
      </svg>
    ),
    {
      width: size.width,
      height: size.height,
    }
  );
}
