export default function StepAccess({ data, onBack, onNext }: any) {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Access Rules</h1>

      <div className="space-y-3">
        <label className="flex gap-2 items-center">
          <input
            type="radio"
            checked={data.access === "open"}
            onChange={() => onNext({ access: "open", minRank: null })}
          />
          Open to community
        </label>

        <label className="flex gap-2 items-center">
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
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="text-neutral-400">
          Back
        </button>
        <button
          onClick={() => onNext({})}
          className="bg-teal-500 text-black px-4 py-2 rounded"
        >
          Continue
        </button>
      </div>
    </section>
  );
}
