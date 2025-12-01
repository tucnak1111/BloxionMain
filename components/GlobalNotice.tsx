// components/GlobalNotice.tsx (client)
"use client";
import React, { useEffect, useState } from "react";

type Notice = {
  id: string;
  type: "notice" | "warning" | "error";
  text: string;
  author_name?: string;
  author_avatar?: string;
  updatedAt: string;
};

function relativeTime(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const sec = Math.round(diff / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);

  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  return `${day}d ago`;
}

export default function GlobalNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("notice-dismissed-id");
    if (stored) setDismissedId(stored);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/notices/get");
        if (!res.ok) return setNotice(null);
        const data = await res.json();
        if (!mounted) return;
        if (!data) return setNotice(null);

        // if a new notice shows up with different updatedAt, reset dismissal
        const dismissedAtId = localStorage.getItem("notice-dismissed-id");
        if (dismissedAtId && dismissedAtId !== data.id) {
          localStorage.removeItem("notice-dismissed-id");
          setDismissedId(null);
        }

        setNotice(data);
      } catch (e) {
        console.error(e);
      }
    }

    load();
    const interval = setInterval(load, 10000); // poll every 10s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!notice) return null;
  if (dismissedId === notice.id) return null;

  const bg =
    notice.type === "error" ? "bg-red-900/60 text-red-200" :
    notice.type === "warning" ? "bg-yellow-900/50 text-yellow-200" :
    "bg-sky-900/50 text-sky-200";

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[1000] w-[min(980px,95%)] rounded-lg shadow-lg ${bg} px-4 py-3 flex items-start gap-3`}>
      {/* Icon */}
      <div className="mt-1">
        {notice.type === "error" && <span className="text-red-400">❗</span>}
        {notice.type === "warning" && <span className="text-yellow-300">⚠️</span>}
        {notice.type === "notice" && <span className="text-sky-300">❝</span>}
      </div>

      {/* Avatar */}
      <img
        src={notice.author_avatar || "/default-avatar.png"}
        alt={notice.author_name}
        className="h-10 w-10 rounded-full object-cover"
      />

      {/* Content */}
      <div className="flex-1">
        <div className="text-sm font-semibold">
          {notice.author_name ?? "System"} <span className="text-xs font-normal text-muted">· {relativeTime(notice.updatedAt)}</span>
        </div>
        <div className="mt-1 text-sm">{notice.text}</div>
      </div>

      {/* Dismiss / Close */}
      <div className="ml-3 flex items-center gap-2">
        <button
          onClick={() => {
            localStorage.setItem("notice-dismissed-id", notice.id);
            setDismissedId(notice.id);
          }}
          className="text-sm px-3 py-1 rounded bg-black/20"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}