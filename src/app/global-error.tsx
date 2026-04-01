"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error.digest ?? "", error.message);
  }, [error]);

  return (
    <html lang="id">
      <body className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h1>
          <p className="text-gray-500 mb-6">
            Aplikasi mengalami error tak terduga. Silakan coba lagi.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mb-4 font-mono">Error ID: {error.digest}</p>
          )}
          <button
            onClick={() => unstable_retry()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
