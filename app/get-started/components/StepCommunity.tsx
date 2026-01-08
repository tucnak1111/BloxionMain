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
  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
    {group.iconUrl ? (
      <img
        src={group.iconUrl}
        alt={group.name}
        width={44}
        height={44}
        style={{ borderRadius: 10 }}
      />
    ) : (
<div
  style={{
    width: 44,
    height: 44,
    borderRadius: 10,
    background: "#1f1f1f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    fontSize: 12,
    fontWeight: 600,
  }}
>
  {group.name.charAt(0).toUpperCase()}
</div>

    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600 }}>{group.name}</div>

      <div className={styles.subtitle}>
        {group.memberCount.toLocaleString()} members
        {" · "}
        Rank: {group.roleName} ({group.roleRank})
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