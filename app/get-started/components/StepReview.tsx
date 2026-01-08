export default function StepReview({ data, onBack, onCreate }: any) {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Review & Create</h1>

      <div className="border border-neutral-800 rounded-lg p-4 space-y-2">
        <div><strong>Community:</strong> {data.community.name}</div>
        <div><strong>Workspace:</strong> {data.name}</div>
        <div><strong>Access:</strong> {data.access}</div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="text-neutral-400">
          Back
        </button>
        <button
          onClick={onCreate}
          className="bg-teal-500 text-black px-4 py-2 rounded"
        >
          Create Workspace
        </button>
      </div>
    </section>
  );
}
