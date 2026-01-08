"use client";

import { useState } from "react";
import Stepper from "./components/Stepper";
import StepCommunity from "./components/StepCommunity";
import StepSetup from "./components/StepSetup";
import StepAccess from "./components/StepAccess";
import StepReview from "./components/StepReview";

export default function CreateWorkspacePage() {
  const [step, setStep] = useState(1);

  const [data, setData] = useState({
    community: null as null | {
      id: string;
      name: string;
      members: number;
      role: string;
    },
    name: "",
    description: "",
    access: "open" as "open" | "restricted",
    minRank: null as null | { name: string; rank: number },
  });

  return (
    <>
      <Stepper step={step} />

      {step === 1 && (
        <StepCommunity
          value={data.community}
          onNext={(community) => {
            setData({ ...data, community, name: community.name });
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

      {step === 3 && (
        <StepAccess
          data={data}
          onBack={() => setStep(2)}
          onNext={(updates) => {
            setData({ ...data, ...updates });
            setStep(4);
          }}
        />
      )}

      {step === 4 && (
        <StepReview
          data={data}
          onBack={() => setStep(3)}
          onCreate={() => {
            console.log("Create workspace:", data);
          }}
        />
      )}
    </>
  );
}
