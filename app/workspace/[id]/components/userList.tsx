"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`/api/workspace/members?workspaceId=${workspaceId}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load users");
        }
        setMembers(data.members);
      } catch (err) {
        console.error("Failed to fetch members:", err);
        setError("Could not load users.");
      } finally {
        setLoading(false);
      }
    }

    fetchMembers();
  }, [workspaceId]);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((member) => {
      return (
        member.username.toLowerCase().includes(q) ||
        member.rankName.toLowerCase().includes(q) ||
        String(member.rankId).includes(q)
      );
    });
  }, [members, query]);

  if (loading) return <p className="text-zinc-400">Loading users...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (!members.length) return <p className="text-zinc-500">No users found.</p>;

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide text-zinc-400">
        {members.length} {members.length === 1 ? "member" : "members"}
      </p>
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
    </div>
  );
}
