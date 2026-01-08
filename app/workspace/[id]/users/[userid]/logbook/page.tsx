export default async function UserLogbookPage({ params }: { params: Promise<{ id: string; userid: string }> }) {
  const { id, userid } = await params;
  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">User Logbook</h1>
        <p>Logbook for user {userid} in workspace {id}</p>
      </div>
    </div>
  );
}