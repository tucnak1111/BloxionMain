"use client";

import { useEffect, useState } from "react";
import styles from "./steps/steps.module.css";

type Group = {
  id: number;
  name: string;
  iconUrl: string | null;
  memberCount: number;
  ownerName: string | null;
  roleName: string;
  roleRank: number;
};

export default function StepCommunity({
  value,
  onNext,
}: {
  value: Group | null;
  onNext: (community: Group) => void;
}) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await fetch("/api/roblox/groups");

        if (!res.ok) {
          throw new Error("Failed to load groups");
        }

        const data = await res.json();
        setGroups(data);
      } catch (err) {
        setError("Could not load your Roblox groups");
      } finally {
        setLoading(false);
      }
    }

    loadGroups();
  }, []);

  return (
    <section className={styles.card}>
      <h1 className={styles.title}>Select Community</h1>
      <p className={styles.subtitle}>
        Choose which Roblox group this workspace belongs to.
      </p>

      {loading && (
        <p className={styles.subtitle}>Loading your groups…</p>
      )}

      {error && (
        <p className={styles.subtitle}>{error}</p>
      )}

      {!loading && !error && groups.length === 0 && (
        <p className={styles.subtitle}>
          You are not a member of any Roblox groups.
        </p>
      )}

{!loading &&
  !error &&
  groups.map((group) => (
    <div
      key={group.id}
      className={`${styles.communityCard} ${
        value?.id === group.id ? styles.communitySelected : ""
      }`}
      onClick={() => onNext(group)}
    >
      <div className={styles.communityRow}>
        {group.iconUrl ? (
          <img
            src={group.iconUrl}
            alt={group.name}
            width={44}
            height={44}
            className={styles.communityIcon}
          />
        ) : (
          <div className={styles.communityIconFallback}>
            {group.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className={styles.communityInfo}>
          <div className={styles.communityName}>{group.name}</div>

          <div className={styles.subtitle}>
            {group.memberCount.toLocaleString()} members ·{" "}
            {group.roleName} ({group.roleRank})
          </div>

          {group.ownerName && (
            <div className={styles.subtitle}>
              Owner: {group.ownerName}
            </div>
          )}
        </div>
      </div>
    </div>
        ))}
    </section>
  );
}