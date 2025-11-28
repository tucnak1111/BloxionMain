"use client";

import Link from "next/link";

interface SuspendedCardProps {
  reason: string | null;
}

export function SuspendedCard({ reason }: SuspendedCardProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-md p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-500">
            Account Suspended
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Your access to Bloxion has been restricted.
          </p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Reason for Suspension:</h2>
          <div className="mt-2 rounded-md bg-gray-100 dark:bg-gray-700 p-4">
            <p className="text-gray-700 dark:text-gray-300">{reason || "No reason was provided."}</p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">If you believe this is a mistake, please contact support.</p>
      </div>
    </main>
  );
}
