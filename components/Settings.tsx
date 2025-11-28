"use client";

import { useState } from "react";
import "./settings.css";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "profile" | "billing" | "appearance" | "security";

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  if (!isOpen) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <div><h2>Profile Settings</h2><p>Edit your profile information here.</p></div>;
      case "billing":
        return <div><h2>Billing</h2><p>Manage your subscription and payment methods.</p></div>;
      case "appearance":
        return <div><h2>Appearance</h2><p>Customize the look and feel of the application.</p></div>;
      case "security":
        return <div><h2>Security</h2><p>Change your password and manage account security.</p></div>;
      default:
        return null;
    }
  };

  return (
    <div className={`settings-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="settings-close-btn">&times;</button>
        
        <aside className="settings-sidebar">
          <button 
            className={activeTab === 'profile' ? 'active' : ''} 
            onClick={() => setActiveTab('profile')}>
            Profile
          </button>
          <button 
            className={activeTab === 'billing' ? 'active' : ''} 
            onClick={() => setActiveTab('billing')}>
            Billing
          </button>
          <button 
            className={activeTab === 'appearance' ? 'active' : ''} 
            onClick={() => setActiveTab('appearance')}>
            Appearance
          </button>
          <button 
            className={activeTab === 'security' ? 'active' : ''} 
            onClick={() => setActiveTab('security')}>
            Security
          </button>
        </aside>

        <main className="settings-content">{renderContent()}</main>
      </div>
    </div>
  );
}