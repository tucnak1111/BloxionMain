"use client";

import { useEffect, useState } from "react";
import UserCard from "./userCard";

interface Member {
  id: string;
  username: string;
  avatarUrl: string | null;
  rankId: number;
  rankName: string;
}

export default function UserList({ workspaceId }: { workspaceId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`/api/workspace/members?workspaceId=${workspaceId}`);
        const data = await res.json();
        if (data.success) setMembers(data.members);
      } catch (err) {
        console.error("Failed to fetch members:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [workspaceId]);

  if (loading) return <p className="text-zinc-400">Loading users...</p>;
  if (!members.length) return <p className="text-zinc-500">No users found.</p>;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((m) => (
        <UserCard
          key={m.id}
          username={m.username}
          avatarUrl={m.avatarUrl || undefined}
          rankName={m.rankName}
          rankId={m.rankId}
        />
      ))}
    </div>
  );
}