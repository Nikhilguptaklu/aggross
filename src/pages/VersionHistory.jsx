import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  GitBranch,
  Eye,
  Plus,
  Save,
  Loader2,
  Package as PackageIcon,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { getVersions } from "../services/releaseService";
import { StatusBadge } from "../components/StatusBadge";
import { LoadingState, EmptyState } from "../components/EmptyState";
import { useToast } from "../components/Toast";
import Modal from "../components/Modal";

export default function VersionHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPackage, selectPackage, saveVersion, loading } = useApp();
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newVersion, setNewVersion] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) selectPackage(id);
  }, [id, selectPackage]);

  const loadVersions = async () => {
    setVersionsLoading(true);
    const data = await getVersions(id);
    setVersions(data);
    setVersionsLoading(false);
  };

  useEffect(() => {
    if (id) loadVersions();
  }, [id]);

  const handleSaveVersion = async () => {
    if (!newVersion.trim() || !changeSummary.trim()) {
      toast("Version number and change summary are required", "warning");
      return;
    }
    setSaving(true);
    await saveVersion(id, newVersion, changeSummary, currentPackage?.owner || "Unknown");
    toast("Version saved successfully", "success");
    setShowSaveModal(false);
    setNewVersion("");
    setChangeSummary("");
    setSaving(false);
    loadVersions();
  };

  if (loading && !currentPackage) {
    return <LoadingState message="Loading release package..." />;
  }

  if (!currentPackage) {
    return (
      <div className="text-center py-12">
        <PackageIcon className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
        <p className="text-neutral-500">Release package not found.</p>
      </div>
    );
  }

  const pkg = currentPackage;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/packages")} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neutral-900">Version History</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{pkg.name} • {pkg.version}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/compare/${pkg.id}`)} className="btn-secondary text-sm">
            Compare Versions
          </button>
          <button onClick={() => setShowSaveModal(true)} className="btn-primary text-sm">
            <Plus className="h-4 w-4" />
            Save Version
          </button>
        </div>
      </div>

      {versionsLoading ? (
        <LoadingState message="Loading versions..." />
      ) : versions.length === 0 ? (
        <EmptyState
          icon={<GitBranch className="h-12 w-12" />}
          title="No versions saved"
          description="Save a version snapshot to preserve the current state of this release package."
          action={
            <button onClick={() => setShowSaveModal(true)} className="btn-primary text-sm">
              <Plus className="h-4 w-4" />
              Save Version
            </button>
          }
        />
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-neutral-200" />

          <div className="space-y-4">
            {versions.map((version, idx) => (
              <div key={version.id} className="relative flex gap-4">
                {/* Timeline dot */}
                <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                  version.status === "Approved" ? "border-emerald-300 bg-emerald-50" :
                  version.status === "Rejected" ? "border-red-300 bg-red-50" :
                  version.status === "Needs Review" ? "border-amber-300 bg-amber-50" :
                  version.status === "Analyzing" ? "border-blue-300 bg-blue-50" :
                  "border-neutral-300 bg-white"
                }`}>
                  <GitBranch className="h-4 w-4 text-neutral-500" />
                </div>

                {/* Content */}
                <div className="flex-1 card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-neutral-900">{version.version}</span>
                      <StatusBadge status={version.status} />
                    </div>
                    <button
                      onClick={() => navigate(`/compare/${pkg.id}?a=${version.version}`)}
                      className="btn-ghost text-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Version
                    </button>
                  </div>
                  <p className="text-sm text-neutral-600 mb-2">{version.changeSummary}</p>
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span>{new Date(version.createdDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span>•</span>
                    <span>{version.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Version Modal */}
      <Modal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Version Snapshot"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowSaveModal(false)} className="btn-secondary text-sm">
              Cancel
            </button>
            <button onClick={handleSaveVersion} disabled={saving} className="btn-primary text-sm">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Version
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">Version number <span className="text-red-500">*</span></label>
            <input
              className="input"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              placeholder="e.g. v2.1"
            />
          </div>
          <div>
            <label className="label">Change summary <span className="text-red-500">*</span></label>
            <textarea
              className="input min-h-[80px]"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Describe what changed in this version..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
