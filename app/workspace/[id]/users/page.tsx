import UserList from "../components/UserList";

export default function WorkspaceUsersPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Users</h1>
        <UserList workspaceId={params.id} />
      </div>
    </main>
  );
}