// src/app/physics/circuits/CircuitStudioClient.tsx
"use client";

import dynamic from "next/dynamic";

const CircuitStudio = dynamic(
  () => import("@/components/physics/CircuitStudio"),
  { ssr: false }
);

export default function CircuitStudioClient() {
  return <CircuitStudio />;
}
