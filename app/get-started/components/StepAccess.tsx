"use client";

import styles from "./steps/steps.module.css";
import type Group from "./StepCommunity";

type Role = {
  name: string;
  rank: number;
};

export default function StepAccess({
  group,
  value,
  onBack,
  onNext,
}: {
  group: Group;
  value: Role | null;
  onBack: () => void;
  onNext: (role: Role) => void;
}) {
  // Only roles the user can manage
  const selectableRoles = group.roles
    .filter((r) => r.rank <= group.userRole.rank)
    .sort((a, b) => b.rank - a.rank);

  return (
    <section className={styles.card}>
      <h1 className={styles.title}>Workspace Permissions</h1>
      <p className={styles.subtitle}>
        Select the minimum Roblox role required to access this workspace.
      </p>

      {selectableRoles.map((role) => (
        <div
          key={role.rank}
          className={`${styles.communityCard} ${
            value?.rank === role.rank ? styles.communitySelected : ""
          }`}
          onClick={() =>
            onNext({
              name: role.name,
              rank: role.rank,
            })
          }
        >
          <strong>{role.name}</strong>
          <div className={styles.subtitle}>
            Rank {role.rank} and above
          </div>
        </div>
      ))}

      <div className={styles.actions}>
        <button onClick={onBack} className={styles.secondary}>
          Back
        </button>
      </div>
    </section>
  );
}