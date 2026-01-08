export default function StepReview({ data, onBack, onCreate }: any) {
  return (
    <section className="space-y-6 bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
      <h1 className="text-2xl font-semibold">Review & Create</h1>

      <div className="border border-neutral-800 rounded-xl p-4 space-y-2 text-sm">
        <div>
          <span className="text-neutral-400">Community:</span>{" "}
          <span className="text-neutral-100">{data.community.name}</span>
        </div>
        <div>
          <span className="text-neutral-400">Workspace:</span>{" "}
          <span className="text-neutral-100">{data.name}</span>
        </div>
        <div>
          <span className="text-neutral-400">Access:</span>{" "}
          <span className="text-neutral-100 capitalize">{data.access}</span>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="text-neutral-400 hover:text-neutral-200 transition"
        >
          Back
        </button>
        <button
          onClick={onCreate}
          className="bg-teal-500 hover:bg-teal-400 transition
                     text-black px-4 py-2 rounded-lg font-medium"
        >
          Create Workspace
        </button>
      </div>
    </section>
  );
}