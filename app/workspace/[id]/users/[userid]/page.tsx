import UserCard from "../../components/userCard";
import { prisma } from "../../../../../prisma/Client";

export default async function UserPage({ params }: { params: Promise<{ id: string; userid: string }> }) {
  const { id, userid } = await params;

  // Fetch user data from database
  const user = await prisma.user.findUnique({
    where: { id: userid },
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  });

  if (!user) {
    return (
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">User Not Found</h1>
          <p>The requested user could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">User Details</h1>
        <UserCard
          username={user.displayName || user.username || "Unknown"}
          avatarUrl={user.avatarUrl || undefined}
          rankName="Member" // TODO: Fetch actual rank
          rankId={0} // TODO: Fetch actual rank ID
        />
      </div>
    </div>
  );
}