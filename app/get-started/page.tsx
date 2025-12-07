"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loading from "../loading"; // Import the splash screen component
import "./get-started.css";

interface Group {
  id: number;
  name: string;
  iconUrl: string | null;
}

interface Role {
  id: number;
  name: string;
  rank: number;
}

interface User {
  id: string;
  // other user properties can be added here
}

type Step = "select-group" | "select-roles" | "creating";

export default function GetStartedPage() {
  const [step, setStep] = useState<Step>("select-group");
  const [groups, setGroups] = useState<Group[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Fetch user's groups and session data on initial load
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch groups and user session in parallel for efficiency
        const [groupsResponse, userResponse] = await Promise.all([
          fetch("/api/roblox/groups"),
          fetch("/api/auth/me"),
        ]);

        // Handle groups response
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();
          setGroups(groupsData);
        } else {
          toast.error("Could not load your groups. Please try again later.");
          console.error("API responded with an error:", groupsResponse.statusText);
        }

        // Handle user session response
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        } else {
          toast.error("Could not verify your session. Please log in again.");
          console.error("Failed to fetch user session:", userResponse.statusText);
          // Optional: Redirect to login if session is invalid
          // router.push('/login');
        }
      } catch (error) {
        toast.error("An unexpected error occurred while loading data.");
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch roles when a group is selected
  const handleGroupSelect = async (group: Group) => {
    setSelectedGroup(group);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/roblox/groups/${group.id}/roles`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
        setStep("select-roles");
      } else {
        toast.error("Failed to load roles for this group.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while fetching roles.");
      console.error("Failed to fetch roles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = (roleId: number) => {
    const newSelection = new Set(selectedRoleIds);
    if (newSelection.has(roleId)) {
      newSelection.delete(roleId);
    } else {
      newSelection.add(roleId);
    }
    setSelectedRoleIds(newSelection);
  };

  const handleCreateWorkspace = async () => {
    if (!selectedGroup || !user) return;
    setStep("creating");
    setIsLoading(true);

    try {
      const response = await fetch("/api/workspace/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id, // Use the actual user ID from the fetched session
          groupId: selectedGroup.id.toString(),
          groupName: selectedGroup.name,
          allowedRanks: Array.from(selectedRoleIds),
        }),
      });

      if (response.ok) {
        // On success, redirect to checkout
        router.push("/checkout");
      } else {
        toast.error("Failed to create your workspace. Please try again.");
        // Handle error
        console.error("Failed to create workspace");
        setStep("select-roles"); // Go back to previous step on failure
      }
    } catch (error) {
      toast.error("An unexpected error occurred during workspace creation.");
      console.error("Error during workspace creation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    // Show the splash screen while fetching initial data
    if (step === "select-group" && isLoading) {
      return <Loading />;
    }
    if (isLoading) return <Loading />; // Also show for subsequent loading states

    switch (step) {
      case "select-group":
        return (
          <>
            <div className="step-header">
              <h1>Create Your First Workspace</h1>
              <p>Choose a Roblox group to get started.</p>
            </div>
            <div className="group-grid">
              {groups.map((group) => (
                <div key={group.id} className="group-card" onClick={() => handleGroupSelect(group)}>
                  <img src={group.iconUrl?.replace("http://", "https://") || "/default-group-icon.png"} alt={group.name} />
                  <span>{group.name}</span>
                </div>
              ))}
            </div>
          </>
        );
      case "select-roles":
        return (
          <>
            <div className="step-header">
              <h1>Select Tracked Roles</h1>
              <p>Choose which roles from "{selectedGroup?.name}" you want to monitor.</p>
            </div>
            <div className="roles-list">
              {roles.map((role) => (
                <div key={role.id} className="role-item">
                  <input
                    type="checkbox"
                    id={`role-${role.id}`}
                    checked={selectedRoleIds.has(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                  />
                  <label htmlFor={`role-${role.id}`}>{role.name} (Rank: {role.rank})</label>
                </div>
              ))}
            </div>
            <div className="action-buttons">
                <button className="btn btn-secondary" onClick={() => setStep('select-group')}>Back</button>
                <button className="btn" onClick={handleCreateWorkspace}>Create & Proceed to Checkout</button>
            </div>
          </>
        );
      case "creating":
        return <div>Creating your workspace...</div>;
    }
  };

  return <div className="create-workspace-container">{renderStep()}</div>;
}