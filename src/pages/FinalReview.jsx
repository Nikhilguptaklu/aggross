import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  FileText,
  Send,
  Loader2,
  Package as PackageIcon,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { getGeneratedSummaries } from "../services/releaseService";
import { getAnalysisResult } from "../services/analysisService";
import {
  StatusBadge,
  ReadinessBadge,
  SeverityBadge,
  ImpactBadge,
  EvidenceResultBadge,
} from "../components/StatusBadge";
import { EvidenceChipGroup } from "../components/EvidenceChip";
import { LoadingState } from "../components/EmptyState";
import { useToast } from "../components/Toast";
import Modal from "../components/Modal";

export default function FinalReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPackage, selectPackage, setPackageStatus, loading } = useApp();
  const [summaries, setSummaries] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  useEffect(() => {
    if (id) selectPackage(id);
  }, [id, selectPackage]);

  useEffect(() => {
    if (id) {
      Promise.all([getGeneratedSummaries(id), getAnalysisResult(id)]).then(([s, a]) => {
        setSummaries(s);
        setAnalysis(a);
        setDataLoading(false);
      });
    }
  }, [id]);

  const handleApprove = async () => {
    setApproving(true);
    await setPackageStatus(id, "Approved");
    toast("Release has been human approved", "success");
    setApproving(false);
    setShowApproveModal(false);
  };

  const handleReject = async () => {
    await setPackageStatus(id, "Rejected");
    toast("Release has been rejected", "info");
  };

  if (loading || dataLoading) {
    return <LoadingState message="Loading final review..." />;
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

  const techStatus = pkg.summaryStatus?.technicalSummary || "pending";
  const stakeStatus = pkg.summaryStatus?.stakeholderSummary || "pending";
  const allApproved = techStatus === "approved" && stakeStatus === "approved";
  const hasAnalysis = !!analysis;
  const hasSummaries = !!summaries;

  let overallStatus = "NEEDS ATTENTION";
  let statusColor = "amber";
  let statusIcon = <AlertTriangle className="h-5 w-5" />;

  if (pkg.status === "Approved") {
    overallStatus = "HUMAN APPROVED";
    statusColor = "emerald";
    statusIcon = <CheckCircle2 className="h-5 w-5" />;
  } else if (pkg.status === "Rejected") {
    overallStatus = "BLOCKED";
    statusColor = "red";
    statusIcon = <XCircle className="h-5 w-5" />;
  } else if (!hasAnalysis || !hasSummaries) {
    overallStatus = "NEEDS ATTENTION";
    statusColor = "amber";
  } else if (allApproved) {
    overallStatus = "READY FOR HUMAN APPROVAL";
    statusColor = "emerald";
    statusIcon = <ShieldCheck className="h-5 w-5" />;
  } else {
    overallStatus = "NEEDS ATTENTION";
    statusColor = "amber";
  }

  const statusClasses = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/packages")} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neutral-900">Final Release Brief</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{pkg.name} • {pkg.version}</p>
        </div>
      </div>

      {/* Status banner */}
      <div className={`flex items-center justify-between rounded-xl border px-5 py-4 ${statusClasses[statusColor]}`}>
        <div className="flex items-center gap-3">
          {statusIcon}
          <div>
            <p className="text-base font-bold">{overallStatus}</p>
            {overallStatus === "READY FOR HUMAN APPROVAL" && (
              <p className="text-xs opacity-80 mt-0.5">All summaries have been reviewed. Submit for human approval to finalize.</p>
            )}
            {overallStatus === "NEEDS ATTENTION" && (
              <p className="text-xs opacity-80 mt-0.5">
                {!hasAnalysis ? "Analysis has not been run yet. " : ""}
                {!hasSummaries ? "Summaries have not been generated yet. " : ""}
                {!allApproved && hasSummaries ? "Some summaries are not yet approved. " : ""}
                Complete the review process before submitting.
              </p>
            )}
            {overallStatus === "HUMAN APPROVED" && (
              <p className="text-xs opacity-80 mt-0.5">This release has been explicitly approved by a human reviewer.</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={pkg.status} />
          <ReadinessBadge readiness={pkg.readiness} />
        </div>
      </div>

      {/* Summary review status */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-neutral-900 mb-3">Review Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ReviewStatusCard
            label="Technical Summary"
            status={techStatus}
            onNavigate={() => navigate(`/summaries/${pkg.id}`)}
          />
          <ReviewStatusCard
            label="Stakeholder Summary"
            status={stakeStatus}
            onNavigate={() => navigate(`/summaries/${pkg.id}`)}
          />
        </div>
      </div>

      {/* Release Overview */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-neutral-900 mb-3">Release Overview</h2>
        <p className="text-sm text-neutral-600">{pkg.description || pkg.releaseInfo?.releaseName}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <InfoItem label="Version" value={pkg.version} />
          <InfoItem label="Owner" value={pkg.owner} />
          <InfoItem label="Release Date" value={pkg.releaseInfo?.releaseDate ? new Date(pkg.releaseInfo.releaseDate).toLocaleDateString() : "Not set"} />
          <InfoItem label="Last Updated" value={new Date(pkg.lastUpdated).toLocaleDateString()} />
        </div>
      </div>

      {/* User Impact Summary */}
      {analysis?.userImpact && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">User Impact</h2>
          <div className="space-y-2">
            {analysis.userImpact.map((item, idx) => (
              <div key={item.id || idx} className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-2.5">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-800">{item.change}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{item.explanation}</p>
                </div>
                <ImpactBadge level={item.impactLevel} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      {pkg.completedFeatures?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">Features ({pkg.completedFeatures.length})</h2>
          <div className="space-y-2">
            {pkg.completedFeatures.map((f, idx) => (
              <div key={f.id || idx} className="rounded-lg border border-neutral-200 p-3">
                <p className="text-sm font-medium text-neutral-800">{f.title}</p>
                <p className="text-sm text-neutral-600 mt-0.5">{f.description}</p>
                {f.evidenceRef && <div className="mt-2"><EvidenceChipGroup items={[f.evidenceRef]} evidence={pkg.qaEvidence} /></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bug Fixes */}
      {pkg.bugFixes?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">Bug Fixes ({pkg.bugFixes.length})</h2>
          <div className="space-y-2">
            {pkg.bugFixes.map((b, idx) => (
              <div key={b.id || idx} className="flex items-start justify-between rounded-lg border border-neutral-200 p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-800">{b.title}</p>
                  <p className="text-sm text-neutral-600 mt-0.5">{b.description}</p>
                </div>
                <SeverityBadge severity={b.severity} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Changed Behaviour */}
      {pkg.changedBehaviours?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">Changed Behaviour ({pkg.changedBehaviours.length})</h2>
          <div className="space-y-2">
            {pkg.changedBehaviours.map((c, idx) => (
              <div key={c.id || idx} className="rounded-lg border border-neutral-200 p-3">
                <p className="text-sm font-medium text-neutral-800">{c.title}</p>
                <p className="text-xs text-neutral-500 mt-1">Previous: {c.previousBehaviour}</p>
                <p className="text-xs text-neutral-500">New: {c.newBehaviour}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QA Summary */}
      {pkg.qaSummary && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">QA Summary</h2>
          <p className="text-sm text-neutral-600 whitespace-pre-wrap">{pkg.qaSummary}</p>
          {pkg.qaEvidence?.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {pkg.qaEvidence.map((ev, idx) => (
                <div key={ev.id || idx} className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-xs text-primary-600">{ev.id}</span>
                  <span className="text-neutral-700 flex-1">{ev.testName}</span>
                  <EvidenceResultBadge result={ev.result} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Known Limitations */}
      {pkg.knownLimitations?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">Known Limitations</h2>
          <div className="space-y-2">
            {pkg.knownLimitations.map((l, idx) => (
              <div key={l.id || idx} className="rounded-lg border border-neutral-200 p-3">
                <p className="text-sm font-medium text-neutral-800">{l.title}</p>
                <p className="text-sm text-neutral-600 mt-0.5">{l.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Migration Notes */}
      {pkg.migrationNotes && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">Migration / Configuration</h2>
          <p className="text-sm text-neutral-600 whitespace-pre-wrap">{pkg.migrationNotes}</p>
        </div>
      )}

      {/* Affected User Groups */}
      {pkg.affectedUserGroups?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">Affected User Groups</h2>
          <div className="flex flex-wrap gap-2">
            {pkg.affectedUserGroups.map((g, idx) => (
              <span key={g.id || idx} className="badge bg-neutral-100 text-neutral-700 border border-neutral-200">{g.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {(pkg.risks?.length > 0 || analysis?.risks?.length > 0) && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">Risks</h2>
          <div className="space-y-2">
            {pkg.risks?.map((r, idx) => (
              <div key={r.id || idx} className="flex items-start justify-between rounded-lg border border-neutral-200 p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-800">{r.risk}</p>
                  <p className="text-sm text-neutral-600 mt-0.5">{r.description}</p>
                  {r.mitigation && <p className="text-xs text-blue-600 mt-1">Mitigation: {r.mitigation}</p>}
                </div>
                <SeverityBadge severity={r.severity} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence */}
      {pkg.qaEvidence?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">Evidence</h2>
          <div className="space-y-1.5">
            {pkg.qaEvidence.map((ev, idx) => (
              <div key={ev.id || idx} className="flex items-center gap-3 rounded-lg border border-neutral-200 p-2.5">
                <span className="font-mono text-xs text-primary-600">{ev.id}</span>
                <span className="text-sm text-neutral-700 flex-1">{ev.testName}</span>
                <EvidenceResultBadge result={ev.result} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action bar */}
      {pkg.status !== "Approved" && pkg.status !== "Rejected" && (
        <div className="sticky bottom-0 flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            AI cannot auto-approve. Human approval is required.
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleReject} className="btn-danger text-sm">
              <XCircle className="h-4 w-4" /> Reject
            </button>
            <button
              onClick={() => setShowApproveModal(true)}
              disabled={overallStatus !== "READY FOR HUMAN APPROVAL"}
              className="btn-primary text-sm"
              title={overallStatus !== "READY FOR HUMAN APPROVAL" ? "All summaries must be approved first" : ""}
            >
              <Send className="h-4 w-4" />
              Submit for Human Approval
            </button>
          </div>
        </div>
      )}

      {pkg.status === "Approved" && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 py-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">Human Approved — This release is ready for deployment.</span>
        </div>
      )}

      {pkg.status === "Rejected" && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 py-4">
          <XCircle className="h-5 w-5 text-red-600" />
          <span className="text-sm font-semibold text-red-700">Rejected — This release requires changes before resubmission.</span>
        </div>
      )}

      {/* Approve confirmation modal */}
      <Modal
        open={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Confirm Human Approval"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowApproveModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleApprove} disabled={approving} className="btn-primary text-sm">
              {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Approve Release
            </button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">
          You are about to approve <strong>{pkg.name} {pkg.version}</strong> for release.
          This confirms that a human reviewer has reviewed all AI-generated content and evidence.
        </p>
        <p className="text-xs text-neutral-400 mt-2">
          This action is performed by a human. AI cannot automatically approve releases.
        </p>
      </Modal>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-sm font-medium text-neutral-800">{value}</p>
    </div>
  );
}

function ReviewStatusCard({ label, status, onNavigate }) {
  const configs = {
    pending: { icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, text: "Pending Review", color: "text-amber-600" },
    approved: { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, text: "Human Approved", color: "text-emerald-600" },
    rejected: { icon: <XCircle className="h-4 w-4 text-red-500" />, text: "Rejected", color: "text-red-600" },
    edited: { icon: <FileText className="h-4 w-4 text-blue-500" />, text: "Edited — Needs Re-approval", color: "text-blue-600" },
  };
  const config = configs[status] || configs.pending;

  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-800">{label}</p>
          <div className={`flex items-center gap-1.5 mt-1 ${config.color}`}>
            {config.icon}
            <span className="text-xs">{config.text}</span>
          </div>
        </div>
        {status !== "approved" && (
          <button onClick={onNavigate} className="text-xs text-primary-600 hover:text-primary-700">
            Review →
          </button>
        )}
      </div>
    </div>
  );
}
