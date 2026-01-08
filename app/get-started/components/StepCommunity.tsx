import styles from "./steps.module.css";

export default function StepCommunity({ onNext }: any) {
  const mockCommunity = {
    name: "Example Group",
    members: 12,
    role: "Executive Board",
  };

  return (
    <section className={styles.card}>
      <h1 className={styles.title}>Select Community</h1>
      <p className={styles.subtitle}>
        Choose which community this workspace belongs to.
      </p>

      <div
        className={styles.communityCard}
        onClick={() => onNext(mockCommunity)}
      >
        <strong>{mockCommunity.name}</strong>
        <div className={styles.subtitle}>
          {mockCommunity.members} members · Your role: {mockCommunity.role}
        </div>
      </div>
    </section>
  );
}