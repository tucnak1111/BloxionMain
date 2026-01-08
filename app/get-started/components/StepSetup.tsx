export function StepSetup({
  data,
  onBack,
  onNext,
}: any) {
  return (
    <section className="space-y-6 bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
      <h1 className="text-2xl font-semibold">Workspace Setup</h1>

      <div>
        <label className="text-sm text-neutral-400">Workspace name</label>
        <input
          value={data.name}
          onChange={(e) => onNext({ name: e.target.value })}
          className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2
                     focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="text-sm text-neutral-400">Description</label>
        <textarea
          value={data.description}
          onChange={(e) => onNext({ description: e.target.value })}
          className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2
                     focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          rows={4}
        />
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