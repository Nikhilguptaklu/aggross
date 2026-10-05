import { useNavigate } from "react-router-dom";
import { Plus, Package, MoreVertical, Pencil, Brain, FileText, GitBranch, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { StatusBadge, ReadinessBadge } from "../components/StatusBadge";
import { LoadingState, EmptyState } from "../components/EmptyState";
import { useToast } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

export default function ReleasePackages() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { packages, loading, selectPackage, deletePackage } = useApp();
  const [openMenu, setOpenMenu] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRowClick = async (id) => {
    await selectPackage(id);
    navigate(`/packages/${id}`);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deletePackage(confirmDelete);
    toast("Release package deleted", "success");
    setConfirmDelete(null);
  };

  if (loading && packages.length === 0) {
    return <LoadingState message="Loading release packages..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Release Packages</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Manage all your release packages</p>
        </div>
        <button onClick={() => navigate("/packages/new")} className="btn-primary">
          <Plus className="h-4 w-4" />
          New Release Package
        </button>
      </div>

      {packages.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No release packages yet"
          description="Create your first release package to start the workflow."
          action={
            <button onClick={() => navigate("/packages/new")} className="btn-primary text-sm">
              <Plus className="h-4 w-4" />
              New Release Package
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="px-5 py-3 text-left font-medium text-neutral-500">Release</th>
                  <th className="px-5 py-3 text-left font-medium text-neutral-500">Version</th>
                  <th className="px-5 py-3 text-left font-medium text-neutral-500">Status</th>
                  <th className="px-5 py-3 text-left font-medium text-neutral-500">Readiness</th>
                  <th className="px-5 py-3 text-left font-medium text-neutral-500">Owner</th>
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
                      <p className="font-medium text-neutral-900">{pkg.name}</p>
                      <p className="text-xs text-neutral-400 truncate max-w-[240px]">{pkg.description}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-neutral-600">{pkg.version}</span>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={pkg.status} /></td>
                    <td className="px-5 py-3"><ReadinessBadge readiness={pkg.readiness} /></td>
                    <td className="px-5 py-3 text-neutral-600">{pkg.owner}</td>
                    <td className="px-5 py-3 text-xs text-neutral-500">
                      {new Date(pkg.lastUpdated).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3 text-right" ref={openMenu === pkg.id ? menuRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenu(openMenu === pkg.id ? null : pkg.id);
                        }}
                        className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenu === pkg.id && (
                        <div className="absolute right-0 mt-2 w-44 rounded-lg border border-neutral-200 bg-white shadow-lg z-50 text-left">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenu(null); handleRowClick(pkg.id); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenu(null); selectPackage(pkg.id); navigate(`/analysis/${pkg.id}`); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                          >
                            <Brain className="h-3.5 w-3.5" /> Analyze
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenu(null); selectPackage(pkg.id); navigate(`/summaries/${pkg.id}`); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                          >
                            <FileText className="h-3.5 w-3.5" /> Summaries
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenu(null); selectPackage(pkg.id); navigate(`/versions/${pkg.id}`); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                          >
                            <GitBranch className="h-3.5 w-3.5" /> Versions
                          </button>
                          <div className="border-t border-neutral-100 my-1" />
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenu(null); setConfirmDelete(pkg.id); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Release Package"
        message="Are you sure you want to delete this release package? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
