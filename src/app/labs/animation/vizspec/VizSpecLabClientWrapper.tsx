// src/app/labs/animation/vizspec/VizSpecLabClientWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const VizSpecLabClient = dynamic(() => import("./VizSpecLabClient"), {
  ssr: false,
});

export default function VizSpecLabClientWrapper() {
  return <VizSpecLabClient />;
}
