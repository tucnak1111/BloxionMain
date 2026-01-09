"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./workspaces.css";

interface Workspace {
  id: string;
  groupName: string | null;
  groupId: string;
  memberCount: number;
  groupOwner: string;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch("/api/workspace");
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

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Loading workspaces…</p>
      </div>
    );
  }

  if (workspaces.length > 0) {
    return (
      <div className="workspaces-container">
        <div className="workspaces-content">
          <div className="workspaces-header">
            <h1 className="workspaces-title">Workspaces</h1>
            <p className="workspaces-subtitle">
              Manage and access your communities.
            </p>
          </div>

          <div className="workspaces-grid">
            <Link href="/get-started" className="create-workspace-card">
              <div className="create-workspace-content">
                <div className="create-workspace-icon">+</div>
                <p className="create-workspace-title">Create workspace</p>
                <p className="create-workspace-subtitle">
                  Start managing a new group
                </p>
              </div>
            </Link>

            {workspaces.map((ws) => (
              <Link key={ws.id} href={`/workspace/${ws.id}/home`} className="workspace-card">
                <div className="workspace-icon">
                  {ws.groupName?.[0] ?? "W"}
                </div>
                <div className="workspace-info">
                  <h2 className="workspace-name">
                    {ws.groupName || "Unnamed Workspace"}
                  </h2>
                  <p className="workspace-group-id">
                    Group ID: {ws.groupId}
                  </p>
                  <p className="workspace-meta">
                    Owner: {ws.groupOwner} | Members: {ws.memberCount}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="empty-fallback-container">
      <div className="empty-fallback-content">
        <h1 className="empty-fallback-title">No workspaces yet</h1>
        <p className="empty-fallback-subtitle">
          Create a workspace to start managing your community.
        </p>
        <Link href="/get-started">
          <button className="create-workspace-button">
            Create workspace
          </button>
        </Link>

      </div>
    </div>
  );
}