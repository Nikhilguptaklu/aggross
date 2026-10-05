import { useNavigate } from "react-router-dom";
import {
  Package,
  FileEdit,
  Eye,
  CheckCircle2,
  Plus,
  MoreVertical,
  ArrowRight,
  Sparkles,
  UserCheck,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { StatusBadge, ReadinessBadge } from "../components/StatusBadge";
import { LoadingState, EmptyState } from "../components/EmptyState";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function AIWorkflowCard() {
  const steps = [
    { icon: Sparkles, label: "AI Analyzes", desc: "Classifies impact, detects gaps", color: "text-primary-600 bg-primary-50" },
    { icon: UserCheck, label: "Human Reviews", desc: "Edits and validates content", color: "text-amber-600 bg-amber-50" },
    { icon: ShieldCheck, label: "Human Approves", desc: "Final sign-off required", color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-neutral-900 mb-1">AI Workflow</h3>
      <p className="text-xs text-neutral-500 mb-4">
        Every release follows a structured review pipeline
      </p>
      <div className="space-y-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${step.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-800">{step.label}</p>
                <p className="text-xs text-neutral-500">{step.desc}</p>
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-neutral-300" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { packages, loading, selectPackage } = useApp();

  const stats = {
    total: packages.length,
    drafts: packages.filter((p) => p.status === "Draft").length,
    awaitingReview: packages.filter((p) => p.status === "Needs Review" || p.status === "Analyzing").length,
    approved: packages.filter((p) => p.status === "Approved").length,
  };

  const handleRowClick = async (id) => {
    await selectPackage(id);
    navigate(`/packages/${id}`);
  };

  if (loading && packages.length === 0) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Overview of your release packages and readiness</p>
        </div>
        <button
          onClick={() => navigate("/packages/new")}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          New Release Package
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Package} label="Total Release Packages" value={stats.total} color="bg-primary-50 text-primary-600" />
        <StatCard icon={FileEdit} label="Drafts" value={stats.drafts} color="bg-neutral-100 text-neutral-600" />
        <StatCard icon={Eye} label="Awaiting Review" value={stats.awaitingReview} color="bg-amber-50 text-amber-600" />
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900">Recent Release Packages</h3>
              <button
                onClick={() => navigate("/packages")}
                className="text-xs font-medium text-primary-600 hover:text-primary-700"
              >
                View all
              </button>
            </div>
            {packages.length === 0 ? (
              <EmptyState
                icon={<Package className="h-12 w-12" />}
                title="No release packages yet"
                description="Create your first release package to get started."
                action={
                  <button onClick={() => navigate("/packages/new")} className="btn-primary text-sm">
                    <Plus className="h-4 w-4" />
                    New Release Package
                  </button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="px-5 py-3 text-left font-medium text-neutral-500">Release</th>
                      <th className="px-5 py-3 text-left font-medium text-neutral-500">Version</th>
                      <th className="px-5 py-3 text-left font-medium text-neutral-500">Status</th>
                      <th className="px-5 py-3 text-left font-medium text-neutral-500">Readiness</th>
                      <th className="px-5 py-3 text-left font-medium text-neutral-500">Last Updated</th>
                      <th className="px-5 py-3 text-right font-medium text-neutral-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((pkg) => (
                      <tr
                        key={pkg.id}
                        className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 cursor-pointer"
                        onClick={() => handleRowClick(pkg.id)}
                      >
                        <td className="px-5 py-3">
                          <div>
                            <p className="font-medium text-neutral-900">{pkg.name}</p>
                            <p className="text-xs text-neutral-400 truncate max-w-[200px]">{pkg.owner}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-mono text-xs text-neutral-600">{pkg.version}</span>
                        </td>
                        <td className="px-5 py-3"><StatusBadge status={pkg.status} /></td>
                        <td className="px-5 py-3"><ReadinessBadge readiness={pkg.readiness} /></td>
                        <td className="px-5 py-3 text-xs text-neutral-500">
                          {new Date(pkg.lastUpdated).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(pkg.id);
                            }}
                            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <AIWorkflowCard />
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary-500" />
              <h3 className="text-sm font-semibold text-neutral-900">Readiness Summary</h3>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Ready</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {packages.filter((p) => p.readiness === "Ready").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Needs Attention</span>
                <span className="text-sm font-semibold text-amber-600">
                  {packages.filter((p) => p.readiness === "Needs Attention").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">Blocked</span>
                <span className="text-sm font-semibold text-red-600">
                  {packages.filter((p) => p.readiness === "Blocked").length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
