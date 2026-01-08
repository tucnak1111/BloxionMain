export default function StepAccess({ data, onBack, onNext }: any) {
  return (
    <section className="space-y-6 bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
      <h1 className="text-2xl font-semibold">Access Rules</h1>

      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            checked={data.access === "open"}
            onChange={() => onNext({ access: "open", minRank: null })}
            className="accent-teal-500 h-4 w-4"
          />
          <span className="text-neutral-200">Open to community</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="radio"
            checked={data.access === "restricted"}
            onChange={() =>
              onNext({
                access: "restricted",
                minRank: { name: "Business Partner", rank: 50 },
              })
            }
            className="accent-teal-500 h-4 w-4"
          />
          <span className="text-neutral-200">Restricted by rank</span>
        </label>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="text-neutral-400 hover:text-neutral-200 transition"
        >
          Back
        </button>
        <button
          onClick={() => onNext({})}
          className="bg-teal-500 hover:bg-teal-400 transition
                     text-black px-4 py-2 rounded-lg font-medium"
        >
          Continue
        </button>
      </div>
    </section>
  );
}