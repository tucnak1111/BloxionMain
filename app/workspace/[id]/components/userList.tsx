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
  const [query, setQuery] = useState("");

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
    <section className="rounded-xl border border-zinc-700/70 bg-zinc-900/40">
      <div className="border-b border-zinc-700/70 p-4">
        <div className="relative max-w-sm">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-md border border-zinc-600 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse">
          <thead>
            <tr className="border-b border-zinc-700/70 bg-zinc-900/60 text-left text-xs uppercase tracking-wide text-zinc-400">
              <th className="px-4 py-3 font-semibold">User</th>
              <th className="px-4 py-3 font-semibold">Username</th>
              <th className="px-4 py-3 font-semibold">Rank</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id} className="border-b border-zinc-800/80 last:border-b-0 hover:bg-zinc-800/40">
                <td className="px-4 py-3">
                  <Avatar username={member.username} avatarUrl={member.avatarUrl} />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-100">{member.username}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-200">
                    {member.rankName} (#{member.rankId})
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-zinc-700/70 px-4 py-3 text-xs text-zinc-400">
        <span>
          Showing {filteredMembers.length} of {members.length} users
        </span>
        <span>Page 1 of 1</span>
      </div>
    </section>
  );
}

function Avatar({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  const [failed, setFailed] = useState(false);
  const initials = username.slice(0, 2).toUpperCase();
  const showImage = !!avatarUrl && !failed;

  return (
    <div className="h-10 w-10 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-600">
      {showImage ? (
        <img
          src={avatarUrl}
          alt={`${username} avatar`}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-200">
          {initials}
        </div>
      )}
    </div>
  );
}
