import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  FileText,
  GitBranch,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  Package as PackageIcon,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { StatusBadge, ReadinessBadge, SeverityBadge, EvidenceResultBadge } from "../components/StatusBadge";
import { EvidenceChipGroup } from "../components/EvidenceChip";
import { LoadingState } from "../components/EmptyState";

export default function ReleaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentPackage, selectPackage, loading } = useApp();

  useEffect(() => {
    if (id) selectPackage(id);
  }, [id, selectPackage]);

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/packages")} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-neutral-900">{pkg.name}</h1>
            <StatusBadge status={pkg.status} />
            <ReadinessBadge readiness={pkg.readiness} />
          </div>
          <p className="text-sm text-neutral-500 mt-0.5">
            {pkg.version} • {pkg.owner} • Updated {new Date(pkg.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => navigate(`/packages/${pkg.id}/edit`)} className="btn-secondary text-sm">
          <Pencil className="h-4 w-4" /> Edit Package
        </button>
        <button onClick={() => navigate(`/analysis/${pkg.id}`)} className="btn-secondary text-sm">
          <Brain className="h-4 w-4" /> View Analysis
        </button>
        <button onClick={() => navigate(`/summaries/${pkg.id}`)} className="btn-secondary text-sm">
          <FileText className="h-4 w-4" /> View Summaries
        </button>
        <button onClick={() => navigate(`/versions/${pkg.id}`)} className="btn-secondary text-sm">
          <GitBranch className="h-4 w-4" /> Version History
        </button>
        <button onClick={() => navigate(`/final-review/${pkg.id}`)} className="btn-primary text-sm">
          <CheckCircle2 className="h-4 w-4" /> Final Review
        </button>
      </div>

      {pkg.description && (
        <div className="card p-5">
          <p className="text-sm text-neutral-600">{pkg.description}</p>
        </div>
      )}

      {/* Completed Features */}
      {pkg.completedFeatures?.length > 0 && (
        <DetailSection title="Completed Features" items={pkg.completedFeatures} type="feature" />
      )}

      {/* Bug Fixes */}
      {pkg.bugFixes?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">Bug Fixes</h2>
          <div className="space-y-3">
            {pkg.bugFixes.map((bug, idx) => (
              <div key={bug.id || idx} className="rounded-lg border border-neutral-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400">Bug #{idx + 1}</span>
                    <SeverityBadge severity={bug.severity} />
                  </div>
                </div>
                <p className="font-medium text-neutral-900 text-sm">{bug.title}</p>
                <p className="text-sm text-neutral-600 mt-1">{bug.description}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
                  <span>Affected: {bug.affectedUsers}</span>
                  {bug.qaEvidence && <EvidenceChipGroup items={[bug.qaEvidence]} evidence={pkg.qaEvidence} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Changed Behaviours */}
      {pkg.changedBehaviours?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">Changed Behaviour</h2>
          <div className="space-y-3">
            {pkg.changedBehaviours.map((change, idx) => (
              <div key={change.id || idx} className="rounded-lg border border-neutral-200 p-4">
                <p className="font-medium text-neutral-900 text-sm">{change.title}</p>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-red-50/50 p-3">
                    <p className="text-xs font-medium text-red-600 mb-1">Previous</p>
                    <p className="text-sm text-neutral-600">{change.previousBehaviour}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50/50 p-3">
                    <p className="text-xs font-medium text-emerald-600 mb-1">New</p>
                    <p className="text-sm text-neutral-600">{change.newBehaviour}</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 mt-2">Impact: {change.userImpact}</p>
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
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-neutral-500">Evidence Items:</p>
              {pkg.qaEvidence.map((ev, idx) => (
                <div key={ev.id || idx} className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3">
                  <span className="font-mono text-xs text-primary-600">{ev.id}</span>
                  <span className="text-sm text-neutral-700 flex-1">{ev.testName}</span>
                  <EvidenceResultBadge result={ev.result} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Known Limitations */}
      {pkg.knownLimitations?.length > 0 && (
        <DetailSection title="Known Limitations" items={pkg.knownLimitations} type="limitation" />
      )}

      {/* Migration Notes */}
      {pkg.migrationNotes && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">Migration / Configuration Notes</h2>
          <p className="text-sm text-neutral-600 whitespace-pre-wrap">{pkg.migrationNotes}</p>
        </div>
      )}

      {/* Affected User Groups */}
      {pkg.affectedUserGroups?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">Affected User Groups</h2>
          <div className="flex flex-wrap gap-2">
            {pkg.affectedUserGroups.map((group, idx) => (
              <span key={group.id || idx} className="badge bg-neutral-100 text-neutral-700 border border-neutral-200">
                {group.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Risks */}
      {pkg.risks?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-4">Risks</h2>
          <div className="space-y-3">
            {pkg.risks.map((risk, idx) => (
              <div key={risk.id || idx} className="rounded-lg border border-neutral-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-neutral-900 text-sm">{risk.risk}</p>
                  <SeverityBadge severity={risk.severity} />
                </div>
                <p className="text-sm text-neutral-600">{risk.description}</p>
                {risk.mitigation && (
                  <div className="mt-2 rounded-lg bg-blue-50/50 p-3">
                    <p className="text-xs font-medium text-blue-600 mb-1">Mitigation</p>
                    <p className="text-sm text-neutral-600">{risk.mitigation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailSection({ title, items, type }) {
  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-neutral-900 mb-4">{title}</h2>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-neutral-400">
                {type === "feature" ? "Feature" : "Limitation"} #{idx + 1}
              </span>
            </div>
            <p className="font-medium text-neutral-900 text-sm">{item.title}</p>
            <p className="text-sm text-neutral-600 mt-1">{item.description}</p>
            {item.userImpact && (
              <p className="text-sm text-neutral-500 mt-2">
                <span className="text-xs font-medium text-neutral-400">User impact:</span> {item.userImpact}
              </p>
            )}
            {item.evidenceRef && (
              <div className="mt-2">
                <EvidenceChipGroup items={[item.evidenceRef]} evidence={[]} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
