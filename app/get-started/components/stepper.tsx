import styles from "./steps/stepper.module.css";

const steps = ["Community", "Setup", "Access", "Review"];

export default function Stepper({ step }: { step: number }) {
  return (
    <div className={styles.stepper}>
      {steps.map((label, i) => {
        const index = i + 1;
        const done = index < step;
        const active = index === step;

        return (
          <div key={label} className={styles.step}>
            <div
              className={`${styles.circle} ${
                done
                  ? styles.done
                  : active
                  ? styles.active
                  : styles.inactive
              }`}
            >
              {done ? "✓" : index}
            </div>

            <span
              className={`${styles.label} ${
                active ? styles.labelActive : styles.labelInactive
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}