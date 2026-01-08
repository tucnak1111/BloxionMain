import styles from "./steps.module.css";

export default function StepAccess({ data, onBack, onNext }: any) {
  return (
    <section className={styles.card}>
      <h1 className={styles.title}>Access Rules</h1>

      <label className={styles.radio}>
        <input
          type="radio"
          checked={data.access === "open"}
          onChange={() => onNext({ access: "open", minRank: null })}
        />
        Open to community
      </label>

      <label className={styles.radio}>
        <input
          type="radio"
          checked={data.access === "restricted"}
          onChange={() =>
            onNext({
              access: "restricted",
              minRank: { name: "Business Partner", rank: 50 },
            })
          }
        />
        Restricted by rank
      </label>

      <div className={styles.actions}>
        <button onClick={onBack} className={styles.secondary}>
          Back
        </button>
        <button onClick={() => onNext({})} className={styles.primary}>
          Continue
        </button>
      </div>
    </section>
  );
}