import { Suspense } from "react";
import { CallbackClient } from "./CallbackClient";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-10 text-white/70">
          Завършваме входа...
        </div>
      }
    >
      <CallbackClient />
    </Suspense>
  );
}

