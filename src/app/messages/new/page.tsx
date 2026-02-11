import { Suspense } from "react";
import DirectMessageCreateClient from "./DirectMessageCreateClient";

export default function DirectMessageCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-10 text-center text-sm text-gray-600">
          準備中…
        </div>
      }
    >
      <DirectMessageCreateClient />
    </Suspense>
  );
}
