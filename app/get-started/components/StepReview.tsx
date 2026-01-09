import styles from "./steps/steps.module.css";

export default function StepReview({ data, onBack, onCreate, loading }: any) {
  return (
    <section className={styles.card}>
      <h1 className={styles.title}>Review & Create</h1>

      <div className={styles.reviewBox}>
        <div><strong>Community:</strong> {data.community.name}</div>
        <div><strong>Workspace:</strong> {data.name}</div>
        <div>
          <strong>
            {data.minRank.name} and above
          </strong>
        </div>
      </div>

      <div className={styles.actions}>
        <button onClick={onBack} className={styles.secondary} disabled={loading}>
          Back
        </button>
        <button onClick={onCreate} className={styles.primary} disabled={loading}>
          {loading ? "Creating..." : "Create Workspace"}
        </button>
      </div>
    </section>
  );
}