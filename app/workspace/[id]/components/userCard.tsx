"use client";

import { useMemo, useState } from "react";

interface UserCardProps {
  username: string;
  avatarUrl?: string;
  rankName: string;
  rankId: number;
}

export default function UserCard({ username, avatarUrl, rankName, rankId }: UserCardProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  const rankStyles: Record<number, string> = {
    255: "bg-amber-500/15 text-amber-300 border border-amber-400/30", // Owner
    254: "bg-sky-500/15 text-sky-300 border border-sky-400/30", // Admin
    253: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30", // Staff
  };

  const avatarFallback = useMemo(() => username.slice(0, 2).toUpperCase(), [username]);
  const showImage = !!avatarUrl && !avatarFailed;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-700/70 bg-zinc-900/40 p-4 transition hover:bg-zinc-900/70">
      <div className="flex min-w-0 items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-600">
          {showImage ? (
            <img
              src={avatarUrl}
              alt={`${username} avatar`}
              className="h-full w-full object-cover"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-200">
              {avatarFallback}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-zinc-100">{username}</p>
          <p className="truncate text-xs text-zinc-400">Rank #{rankId}</p>
        </div>
      </div>
      <span
        className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
          rankStyles[rankId] || "bg-zinc-700/50 text-zinc-200 border border-zinc-600/50"
        }`}
      >
        {rankName}
      </span>
    </div>
  );
}
