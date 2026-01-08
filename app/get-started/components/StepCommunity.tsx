export function StepCommunity({
  value,
  onNext,
}: {
  value: any;
  onNext: (community: any) => void;
}) {
  const mockCommunity = {
    id: "1",
    name: "Example Group",
    members: 12,
    role: "Executive Board",
  };

  return (
    <section className="space-y-6 bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
      <div>
        <h1 className="text-2xl font-semibold">Select Community</h1>
        <p className="text-neutral-400 mt-1">
          Choose which community this workspace belongs to.
        </p>
      </div>

      <button
        onClick={() => onNext(mockCommunity)}
        className="w-full text-left border border-neutral-800 rounded-xl p-4
                   hover:border-teal-500 hover:bg-neutral-900 transition"
      >
        <div className="font-medium text-neutral-100">
          {mockCommunity.name}
        </div>
        <div className="text-sm text-neutral-400 mt-1">
          {mockCommunity.members} members · Your role: {mockCommunity.role}
        </div>
      </button>
    </section>
  );
}