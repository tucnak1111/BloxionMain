export default function StepSetup({
  data,
  onBack,
  onNext,
}: any) {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Workspace Setup</h1>

      <div>
        <label className="text-sm text-neutral-400">Workspace name</label>
        <input
          value={data.name}
          onChange={(e) => onNext({ name: e.target.value })}
          className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm text-neutral-400">Description</label>
        <textarea
          value={data.description}
          onChange={(e) => onNext({ description: e.target.value })}
          className="mt-1 w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2"
        />
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
