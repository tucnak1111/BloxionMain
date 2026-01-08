const steps = ["Community", "Setup", "Access", "Review"];

export default function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {steps.map((label, i) => {
        const index = i + 1;
        const active = index === step;
        const done = index < step;

        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
                ${done ? "bg-teal-500 text-black" :
                  active ? "border border-teal-400 text-teal-400" :
                  "border border-neutral-700 text-neutral-500"}`}
            >
              {done ? "✓" : index}
            </div>
            <span
              className={`text-sm ${
                active ? "text-neutral-100" : "text-neutral-500"
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
