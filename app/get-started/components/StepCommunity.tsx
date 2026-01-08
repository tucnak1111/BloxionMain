export default function StepCommunity({
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
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Select Community</h1>
      <p className="text-neutral-400">
        Choose which community this workspace belongs to.
      </p>

      <button
        onClick={() => onNext(mockCommunity)}
        className="w-full text-left border border-neutral-800 rounded-lg p-4 hover:border-teal-500 transition"
      >
        <div className="font-medium">{mockCommunity.name}</div>
        <div className="text-sm text-neutral-400">
          {mockCommunity.members} members · Your role: {mockCommunity.role}
        </div>
      </button>
    </section>
  );
}
