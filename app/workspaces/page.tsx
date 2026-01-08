"use client";

import { useEffect, useState } from "react";

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
        const response = await fetch("/api/workspaces");
        if (response.ok) {
          const data = await response.json();
          setWorkspaces(data);
        }
      } catch (error) {
        console.error("Failed to fetch workspaces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-900 text-zinc-100 flex items-center justify-center p-6">
        <p className="text-zinc-400">Loading workspaces...</p>
      </main>
    );
  }

  if (workspaces.length > 0) {
    return (
      <main className="min-h-screen bg-zinc-900 text-zinc-100 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Workspaces</h1>
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              Create New
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((ws) => (
              <div key={ws.id} className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 hover:border-zinc-600 transition-colors">
                <h2 className="text-xl font-semibold mb-2">{ws.groupName || "Unnamed Workspace"}</h2>
                <p className="text-zinc-400 text-sm">Group ID: {ws.groupId}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-800 p-8 rounded-xl shadow-lg border border-zinc-700 text-center">
        <h1 className="text-2xl font-bold mb-2">No workspaces available</h1>
        <p className="text-zinc-400 mb-6">
          You don't have any workspaces yet. Create one to get started.
        </p>
        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Create Workspace
        </button>
      </div>
    </main>
  );
}