import styles from "./steps.module.css";

export default function StepSetup({ data, onBack, onNext }: any) {
  return (
    <section className={styles.card}>
      <h1 className={styles.title}>Workspace Setup</h1>

      <div className={styles.section}>
        <label className={styles.subtitle}>Workspace name</label>
        <input
          value={data.name}
          onChange={(e) => onNext({ name: e.target.value })}
          className={styles.input}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.subtitle}>Description</label>
        <textarea
          value={data.description}
          onChange={(e) => onNext({ description: e.target.value })}
          className={styles.textarea}
          rows={4}
        />
      </div>

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