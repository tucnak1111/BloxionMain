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
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {group.iconUrl ? (
                <img
                  src={group.iconUrl}
                  alt={group.name}
                  width={40}
                  height={40}
                  style={{
                    borderRadius: 8,
                    background: "#111",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: "#1f1f1f",
                  }}
                />
              )}

              <strong>{group.name}</strong>
            </div>
          </div>
        ))}
    </section>
  );
}