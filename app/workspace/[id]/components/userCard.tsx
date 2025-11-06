"use client";

import Image from "next/image";

interface UserCardProps {
  username: string;
  avatarUrl?: string;
  rankName: string;
  rankId: number;
}

export default function UserCard({ username, avatarUrl, rankName, rankId }: UserCardProps) {
  const rankColors: Record<number, string> = {
    255: "text-yellow-400", // Owner
    254: "text-blue-400",   // Admin
    253: "text-green-400",  // Staff
  };

  return (
    <div className="flex items-center gap-4 bg-zinc-800/60 hover:bg-zinc-800 transition p-4 rounded-lg">
      <Image
        src={avatarUrl || "/default-avatar.png"}
        alt={username}
        width={48}
        height={48}
        className="rounded-full"
      />
      <div className="flex flex-col">
        <span className="font-medium text-zinc-100">{username}</span>
        <span className={`text-sm ${rankColors[rankId] || "text-zinc-400"}`}>
          {rankName}
        </span>
      </div>
    </div>
  );
}