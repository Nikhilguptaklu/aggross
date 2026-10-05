import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Brain,
  GitBranch,
  GitCompareArrows,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/packages", label: "Release Packages", icon: Package },
  { to: "/analysis", label: "Analysis", icon: Brain },
  { to: "/versions", label: "Versions", icon: GitBranch },
  { to: "/compare", label: "Compare", icon: GitCompareArrows },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-neutral-900/30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-neutral-200 bg-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-neutral-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-neutral-900">ReleaseReady</span>
            <p className="text-xs text-neutral-400">Release Communication</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-neutral-400">
            Workspace
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-neutral-200 p-3">
          <div className="rounded-lg bg-neutral-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary-500" />
              <span className="text-xs font-semibold text-neutral-700">AI-assisted workflow</span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              AI analyzes and drafts content. Human review and approval is always required.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
