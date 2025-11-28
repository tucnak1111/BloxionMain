"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

type Step = "select-group" | "select-roles" | "creating";

export default function GetStartedPage() {
  const [step, setStep] = useState<Step>("select-group");
  const [groups, setGroups] = useState<Group[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch user's groups on initial load
  useEffect(() => {
    const fetchGroups = async () => {
      console.log("Attempting to fetch groups...");
      try {
        const response = await fetch("/api/roblox/groups");
        console.log("API Response Status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched groups data:", data);
          setGroups(data);
        } else {
          console.error("API responded with an error:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch groups (catch block):", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
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
      }
    } catch (error) {
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
    if (!selectedGroup) return;
    setStep("creating");
    setIsLoading(true);

    try {
      const response = await fetch("/api/workspace/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: selectedGroup.id.toString(),
          groupName: selectedGroup.name,
          trackedRoleIds: Array.from(selectedRoleIds),
        }),
      });

      if (response.ok) {
        // On success, redirect to checkout
        router.push("/checkout");
      } else {
        // Handle error
        console.error("Failed to create workspace");
        setStep("select-roles"); // Go back to previous step on failure
      }
    } catch (error) {
      console.error("Error during workspace creation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    if (isLoading) return <div>Loading...</div>;

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