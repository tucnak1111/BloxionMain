"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Workspace {
  id: string;
  groupName: string | null;
  groupId: string;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch("/api/workspaces");
        if (res.ok) {
          const data = await res.json();
          setWorkspaces(data);
        }
      } catch (err) {
        console.error("Failed to fetch workspaces:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  /* -------------------- Loading -------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-zinc-400">Loading workspaces…</p>
      </div>
    );
  }

  /* -------------------- Has workspaces -------------------- */
  if (workspaces.length > 0) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-semibold mb-1">Workspaces</h1>
            <p className="text-zinc-400">
              Manage and access your communities.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create workspace card */}
            <Link href="/get-started">
              <div
                className="h-full rounded-xl border border-dashed border-zinc-700
                           bg-zinc-900/40 hover:border-indigo-500 hover:bg-zinc-900
                           transition cursor-pointer flex items-center justify-center"
              >
                <div className="text-center p-6">
                  <div
                    className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-600/10
                               flex items-center justify-center text-indigo-400 text-xl"
                  >
                    +
                  </div>
                  <p className="font-medium">Create workspace</p>
                  <p className="text-sm text-zinc-400 mt-1">
                    Start managing a new group
                  </p>
                </div>
              </div>
            </Link>

            {/* Existing workspaces */}
            {workspaces.map((ws) => (
              <Link key={ws.id} href={`/workspace/${ws.id}/home`}>
                <div
                  className="h-full rounded-xl border border-zinc-700 bg-zinc-900/60
                             hover:border-zinc-500 hover:bg-zinc-900 transition
                             cursor-pointer p-5 flex gap-4"
                >
                  {/* Initial / icon */}
                  <div
                    className="w-10 h-10 rounded-lg bg-zinc-700/50
                               flex items-center justify-center
                               font-semibold text-zinc-300"
                  >
                    {ws.groupName?.[0] ?? "W"}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold truncate">
                      {ws.groupName || "Unnamed Workspace"}
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1">
                      Group ID: {ws.groupId}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* -------------------- Empty fallback -------------------- */
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div
        className="w-full max-w-md bg-zinc-900/60 border border-zinc-700
                   rounded-2xl p-10 text-center"
      >
      

        <h1 className="text-2xl font-semibold mb-2">
          No workspaces yet
        </h1>

        <p className="text-zinc-400 mb-8">
          Create a workspace to start managing your community.
        </p>

        <Link href="/get-started">
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-500
                       text-white font-medium py-3 rounded-lg transition"
          >
            Create workspace
          </button>
        </Link>
      </div>
    </div>
  );
}