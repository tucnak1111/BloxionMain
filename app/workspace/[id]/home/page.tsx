"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import styles from "./home.module.css"; // Import the CSS module

interface Workspace {
  id: string;
  groupName: string | null;
  groupId: string;
  allowedRanks: number[];
  memberCount: number; // Added
  groupOwner: string; // Added
}

export default function WorkspaceHomepage({ params }: { params: { id: string } }) {
  const { id: workspaceId } = params;
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      try {
        const res = await fetch(`/api/workspace/${workspaceId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch workspace details");
        }
        const data = await res.json();
        setWorkspace(data.workspace); // API returns { success: true, workspace: {...} }
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      fetchWorkspaceDetails();
    }
  }, [workspaceId]);

  if (loading) {
    return (
      <div className={`${styles.container} ${styles.textGray}`}>
        Loading workspace...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} ${styles.textError}`}> {/* Using custom class for error */}
        Error: {error}
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className={`${styles.container} ${styles.textGray}`}>
        Workspace not found.
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {workspace.groupName || "Unnamed Workspace"}
        </h1>
        <div className={styles.groupId}>Group ID: {workspace.groupId}</div>
      </div>

      <div className={styles.grid}>
        {/* Quick Actions */}
        <div className={`${styles.card} ${styles.colSpan1}`}>
          <h2 className={styles.cardTitle}>Quick Actions</h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <Link href={`/workspace/${workspaceId}/users`}>
                Manage Users
              </Link>
            </li>
            <li className={styles.listItem}>
              <Link href={`/workspace/${workspaceId}/logbook`}>
                View Logbook
              </Link>
            </li>
            <li className={styles.listItem}>
              <Link href={`/workspace/${workspaceId}/settings`}>
                Workspace Settings (TODO)
              </Link>
            </li>
          </ul>
        </div>

        {/* Activity Feed */}
        <div className={`${styles.card} ${styles.colSpan2}`}>
          <h2 className={styles.cardTitle}>Recent Activity</h2>
          <div className={styles.textGray}>
            {/* Placeholder for activity feed */}
            No recent activity to display. (TODO: Fetch actual activity data)
          </div>
        </div>

        {/* Workspace Overview/Metrics (Example) */}
        <div className={`${styles.card} ${styles.colSpan1}`}>
          <h2 className={styles.cardTitle}>Overview</h2>
          <div className={`${styles.textLight} ${styles.spaceY3}`}> {/* Using custom class for space-y-3 */}
            <div>Owner: <span className={`${styles.fontMedium} ${styles.textWhite}`}>{workspace.groupOwner}</span></div>
            <div>Members: <span className={`${styles.fontMedium} ${styles.textWhite}`}>{workspace.memberCount}</span></div>
            <div>Open Time Off Requests: <span className={`${styles.fontMedium} ${styles.textWhite}`}>YY</span> (TODO)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
