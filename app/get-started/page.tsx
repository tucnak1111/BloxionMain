"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Stepper from "./components/stepper";
import StepCommunity from "./components/StepCommunity";
import StepSetup from "./components/StepSetup";
import StepAccess from "./components/StepAccess";
import StepReview from "./components/StepReview";
import styles from "./CreateWorkspacePage.module.css";

export default function CreateWorkspacePage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    community: null as null | {
      id: number;
      name: string;
      iconUrl: string | null;

      memberCount: number;
      ownerName: string | null;

      roleName: string;
      roleRank: number;

      roles: {
        id: number;
        name: string;
        rank: number;
      }[];
    },
    name: "",
    description: "",
    minRank: null as null | { name: string; rank: number },
  });

  const handleCreate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/workspace/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const workspace = await response.json();
        toast.success("Workspace created successfully!");
        router.push(`/workspace/${workspace.id}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create workspace.");
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.createRoot}>
      <div className={styles.createContainer}>
        <Stepper step={step} />

        {step === 1 && (
          <StepCommunity
            value={data.community}
            onNext={(community) => {
              setData({
                ...data,
                community,
                name: community.name,
              });
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <StepSetup
            data={data}
            onBack={() => setStep(1)}
            onNext={(updates) => {
              setData({ ...data, ...updates });
              setStep(3);
            }}
          />
        )}

        {step === 3 && data.community && (
          <StepAccess
            group={data.community}
            value={data.minRank}
            onBack={() => setStep(2)}
            onNext={(role) => {
              setData({
                ...data,
                minRank: role,
              });
              setStep(4);
            }}
          />
        )}

        {step === 4 && data.minRank && (
          <StepReview
            data={data}
            onBack={() => setStep(3)}
            onCreate={handleCreate}
            loading={loading}
          />
        )}
      </div>
    </main>
  );
}