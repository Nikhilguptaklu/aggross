import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit3,
  Save,
  X,
  Loader2,
  Package as PackageIcon,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { getGeneratedSummaries, updateGeneratedSummary } from "../services/releaseService";
import { ReviewStatusBadge } from "../components/StatusBadge";
import ReviewActions from "../components/ReviewActions";
import Tabs from "../components/Tabs";
import { LoadingState } from "../components/EmptyState";
import { useToast } from "../components/Toast";
import Modal from "../components/Modal";

export default function GeneratedSummaries() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPackage, selectPackage, setSummaryReviewStatus, loading } = useApp();
  const [summaries, setSummaries] = useState(null);
  const [summariesLoading, setSummariesLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (id) selectPackage(id);
  }, [id, selectPackage]);

  useEffect(() => {
    if (id) {
      setSummariesLoading(true);
      getGeneratedSummaries(id).then((data) => {
        setSummaries(data);
        setSummariesLoading(false);
      });
    }
  }, [id]);

  const handleEdit = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveEdit = async () => {
    if (!editingField) return;
    const [type, key] = editingField.split(".");
    const updated = { ...summaries[type], [key]: editValue };
    await updateGeneratedSummary(id, type, updated);
    setSummaries({ ...summaries, [type]: updated });
    setEditingField(null);
    toast("Content updated. Marked as edited — requires re-approval.", "info");
    await setSummaryReviewStatus(id, type === "technical" ? "technicalSummary" : "stakeholderSummary", "edited");
  };

  const handleApprove = async (type) => {
    const statusKey = type === "technical" ? "technicalSummary" : "stakeholderSummary";
    await setSummaryReviewStatus(id, statusKey, "approved");
    toast(`${type === "technical" ? "Technical" : "Stakeholder"} summary approved`, "success");
  };

  const handleReject = (type) => {
    setRejectModal(type);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      toast("Please provide a reason for rejection", "warning");
      return;
    }
    const statusKey = rejectModal === "technical" ? "technicalSummary" : "stakeholderSummary";
    await setSummaryReviewStatus(id, statusKey, "rejected");
    toast(`${rejectModal === "technical" ? "Technical" : "Stakeholder"} summary rejected`, "info");
    setRejectModal(null);
    setRejectReason("");
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

  if (summariesLoading) {
    return <LoadingState message="Loading summaries..." />;
  }

  if (!summaries) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/packages")} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Generated Summaries</h1>
            <p className="text-sm text-neutral-500 mt-0.5">{pkg.name} • {pkg.version}</p>
          </div>
        </div>
        <div className="card p-8 text-center">
          <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-base font-semibold text-neutral-900 mb-2">No summaries generated yet</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Run the AI analysis first to generate summaries.
          </p>
          <button onClick={() => navigate(`/analysis/${pkg.id}`)} className="btn-primary text-sm">
            Go to Analysis
          </button>
        </div>
      </div>
    );
  }

  const techStatus = pkg.summaryStatus?.technicalSummary || "pending";
  const stakeStatus = pkg.summaryStatus?.stakeholderSummary || "pending";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/packages")} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neutral-900">Generated Summaries</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{pkg.name} • {pkg.version}</p>
        </div>
        <button onClick={() => navigate(`/final-review/${pkg.id}`)} className="btn-primary text-sm">
          Go to Final Review
        </button>
      </div>

      {/* AI banner */}
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <p className="text-sm text-amber-700">
          AI-generated content requires human review before finalization. AI cannot automatically approve content.
        </p>
      </div>

      <Tabs
        tabs={[
          {
            id: "technical",
            label: "Internal Technical Summary",
            icon: <FileText className="h-4 w-4" />,
            content: (
              <SummaryContent
                type="technical"
                data={summaries.technical}
                status={techStatus}
                onEdit={handleEdit}
                onApprove={() => handleApprove("technical")}
                onReject={() => handleReject("technical")}
                fields={technicalFields}
                evidence={pkg.qaEvidence}
              />
            ),
          },
          {
            id: "stakeholder",
            label: "Stakeholder / Client Summary",
            icon: <Users className="h-4 w-4" />,
            content: (
              <SummaryContent
                type="stakeholder"
                data={summaries.stakeholder}
                status={stakeStatus}
                onEdit={handleEdit}
                onApprove={() => handleApprove("stakeholder")}
                onReject={() => handleReject("stakeholder")}
                fields={stakeholderFields}
                evidence={pkg.qaEvidence}
              />
            ),
          },
        ]}
      />

      {/* Edit Modal */}
      <Modal
        open={!!editingField}
        onClose={() => setEditingField(null)}
        title={`Edit: ${editingField?.split(".")[1]?.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}`}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditingField(null)} className="btn-secondary text-sm">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button onClick={handleSaveEdit} className="btn-primary text-sm">
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        }
      >
        <textarea
          className="input min-h-[200px]"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          autoFocus
        />
        <p className="text-xs text-neutral-400 mt-2">
          Saving will mark this section as edited and require re-approval.
        </p>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Reject Summary"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setRejectModal(null)} className="btn-secondary text-sm">
              Cancel
            </button>
            <button onClick={confirmReject} className="btn-danger text-sm">
              <XCircle className="h-4 w-4" /> Confirm Rejection
            </button>
          </div>
        }
      >
        <label className="label">Reason for rejection <span className="text-red-500">*</span></label>
        <textarea
          className="input min-h-[80px]"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Explain why this summary is being rejected..."
          autoFocus
        />
      </Modal>
    </div>
  );
}

const technicalFields = [
  { key: "releaseOverview", label: "Release Overview" },
  { key: "technicalChanges", label: "Technical Changes" },
  { key: "bugFixes", label: "Bug Fixes" },
  { key: "changedBehaviour", label: "Changed Behaviour" },
  { key: "qaStatus", label: "QA Status" },
  { key: "knownLimitations", label: "Known Limitations" },
  { key: "migrationNotes", label: "Migration / Configuration Notes" },
  { key: "risks", label: "Risks" },
  { key: "evidenceRefs", label: "Evidence References", isEvidence: true },
];

const stakeholderFields = [
  { key: "whatChanged", label: "What Changed" },
  { key: "benefits", label: "Benefits / User Impact" },
  { key: "importantFixes", label: "Important Fixes" },
  { key: "knownLimitations", label: "Known Limitations" },
  { key: "actionRequired", label: "Action Required" },
  { key: "readiness", label: "Release Readiness" },
];

function SummaryContent({ type, data, status, onEdit, onApprove, onReject, fields, evidence }) {
  if (!data) {
    return (
      <div className="card p-8 text-center">
        <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
        <p className="text-sm text-neutral-500">No {type} summary available. Run analysis first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Review status banner */}
      <div className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
        status === "approved" ? "border-emerald-200 bg-emerald-50/50" :
        status === "rejected" ? "border-red-200 bg-red-50/50" :
        status === "edited" ? "border-blue-200 bg-blue-50/50" :
        "border-neutral-200 bg-neutral-50"
      }`}>
        <div className="flex items-center gap-3">
          <ReviewStatusBadge status={status} />
          {status === "pending" && (
            <span className="text-xs text-neutral-500">AI-generated — awaiting human review</span>
          )}
          {status === "edited" && (
            <span className="text-xs text-blue-600">Content was edited — needs re-approval</span>
          )}
        </div>
        <ReviewActions
          status={status}
          onEdit={() => {}}
          onApprove={onApprove}
          onReject={onReject}
        />
      </div>

      {/* Content sections */}
      {fields.map((field) => (
        <div key={field.key} className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-neutral-900">{field.label}</h3>
            <button
              onClick={() => onEdit(`${type}.${field.key}`, data[field.key])}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              title="Edit this section"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          </div>
          {field.isEvidence && Array.isArray(data[field.key]) ? (
            <div className="flex flex-wrap gap-2">
              {data[field.key].map((ref, idx) => (
                <span key={idx} className="badge border border-primary-200 bg-primary-50 text-primary-700">
                  <FileText className="h-3 w-3" />
                  {ref}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-600 whitespace-pre-wrap">{data[field.key]}</p>
          )}
        </div>
      ))}
    </div>
  );
}
