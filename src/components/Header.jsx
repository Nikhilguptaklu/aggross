import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, Menu, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function getInitials(email) {
  if (!email) return "?";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function Header({ releaseName, versionBadge, onMenuClick }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch {
      // session already cleared — redirect anyway
      navigate("/login");
    }
  };

  const notifications = [
    { id: 1, text: "Release v2.4.0 analysis completed", time: "1h ago", unread: true },
    { id: 2, text: "QA evidence updated for rel-001", time: "3h ago", unread: true },
    { id: 3, text: "Authentication Security Patch approved", time: "2d ago", unread: false },
  ];

  const userEmail = user?.email || "";
  const userInitials = getInitials(userEmail);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-neutral-900 truncate max-w-[200px] sm:max-w-xs">
                {releaseName || "ReleaseReady"}
              </h1>
              {versionBadge && (
                <span className="badge bg-primary-100 text-primary-700 border border-primary-200">
                  {versionBadge}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search releases..."
            className="w-48 rounded-lg border border-neutral-300 bg-neutral-50 py-2 pl-9 pr-3 text-sm placeholder-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 lg:w-64"
          />
        </div>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-lg p-2 text-neutral-500 hover:bg-neutral-100"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-neutral-200 bg-white shadow-lg z-50">
              <div className="px-4 py-3 border-b border-neutral-200">
                <span className="text-sm font-semibold text-neutral-900">Notifications</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-neutral-100 last:border-0 ${
                      n.unread ? "bg-primary-50/50" : ""
                    }`}
                  >
                    <p className="text-sm text-neutral-700">{n.text}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-neutral-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
              {userInitials}
            </div>
            <ChevronDown className="h-4 w-4 text-neutral-400 hidden sm:block" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-neutral-200 bg-white shadow-lg z-50">
              <div className="px-4 py-3 border-b border-neutral-200">
                <p className="text-sm font-semibold text-neutral-900 truncate">{userEmail}</p>
              </div>
              <div className="py-1">
                <button className="w-full px-4 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-50">
                  Profile Settings
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-50">
                  Preferences
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-50">
                  Help & Support
                </button>
              </div>
              <div className="border-t border-neutral-200 py-1">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
