import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  GitCompareArrows,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  FileWarning,
  Loader2,
  Package as PackageIcon,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { getVersions, compareVersions } from "../services/releaseService";
import { LoadingState, EmptyState } from "../components/EmptyState";
import { EvidenceChip } from "../components/EvidenceChip";

export default function CompareVersions() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentPackage, selectPackage, loading } = useApp();
  const [versions, setVersions] = useState([]);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [versionA, setVersionA] = useState("");
  const [versionB, setVersionB] = useState("");
  const [comparison, setComparison] = useState(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    if (id) selectPackage(id);
  }, [id, selectPackage]);

  useEffect(() => {
    if (id) {
      setVersionsLoading(true);
      getVersions(id).then((data) => {
        setVersions(data);
        setVersionsLoading(false);
        const preselectA = searchParams.get("a");
        if (preselectA) setVersionA(preselectA);
        else if (data.length >= 2) setVersionA(data[0].version);
        if (data.length >= 2) setVersionB(data[data.length - 1].version);
      });
    }
  }, [id, searchParams]);

  const handleCompare = async () => {
    if (!versionA || !versionB || versionA === versionB) return;
    setComparing(true);
    const result = await compareVersions(id, versionA, versionB);
    setComparison(result);
    setComparing(false);
  };

  useEffect(() => {
    if (versionA && versionB && versionA !== versionB) {
      handleCompare();
    }
  }, [versionA, versionB]);

  if (loading && !currentPackage) {
    return <LoadingState message="Loading..." />;
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
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Compare Versions</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{pkg.name} • {pkg.version}</p>
        </div>
      </div>

      {/* Version selectors */}
      <div className="card p-5">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="label">Version A</label>
            <select
              className="input"
              value={versionA}
              onChange={(e) => setVersionA(e.target.value)}
            >
              <option value="">Select version...</option>
              {versions.map((v) => (
                <option key={v.id} value={v.version}>{v.version} — {v.changeSummary.slice(0, 40)}</option>
              ))}
            </select>
          </div>
          <div className="pb-2">
            <GitCompareArrows className="h-5 w-5 text-neutral-400" />
          </div>
          <div className="flex-1">
            <label className="label">Version B</label>
            <select
              className="input"
              value={versionB}
              onChange={(e) => setVersionB(e.target.value)}
            >
              <option value="">Select version...</option>
              {versions.map((v) => (
                <option key={v.id} value={v.version}>{v.version} — {v.changeSummary.slice(0, 40)}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCompare}
            disabled={!versionA || !versionB || versionA === versionB || comparing}
            className="btn-primary"
          >
            {comparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Compare
          </button>
        </div>
        {versionA && versionB && versionA === versionB && (
          <p className="text-xs text-amber-600 mt-2">Select two different versions to compare.</p>
        )}
      </div>

      {versionsLoading ? (
        <LoadingState message="Loading versions..." />
      ) : versions.length < 2 ? (
        <EmptyState
          icon={<GitCompareArrows className="h-12 w-12" />}
          title="Not enough versions to compare"
          description="You need at least two saved versions to run a comparison."
        />
      ) : comparison ? (
        <div className="space-y-4">
          {/* Added */}
          <ComparisonSection
            title="Added"
            icon={<Plus className="h-4 w-4" />}
            color="emerald"
            items={comparison.added}
            emptyMessage="Nothing was added."
            renderItem={(item) => (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/30 px-4 py-2.5">
                <Plus className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-sm text-neutral-700">{item.item}</span>
                <span className="text-xs text-neutral-400 ml-auto">{item.section}</span>
              </div>
            )}
          />

          {/* Removed */}
          <ComparisonSection
            title="Removed"
            icon={<Minus className="h-4 w-4" />}
            color="red"
            items={comparison.removed}
            emptyMessage="Nothing was removed."
            renderItem={(item) => (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/30 px-4 py-2.5">
                <Minus className="h-3.5 w-3.5 text-red-500" />
                <span className="text-sm text-neutral-700">{item.item}</span>
                <span className="text-xs text-neutral-400 ml-auto">{item.section}</span>
              </div>
            )}
          />

          {/* Changed */}
          <ComparisonSection
            title="Changed"
            icon={<RefreshCw className="h-4 w-4" />}
            color="amber"
            items={comparison.changed}
            emptyMessage="Nothing was changed."
            renderItem={(item) => (
              <div className="rounded-lg border border-amber-200 bg-amber-50/30 px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-sm font-medium text-neutral-800">{item.section}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="rounded bg-red-50/50 p-2">
                    <p className="text-xs text-red-500 font-medium mb-1">Before</p>
                    <p className="text-xs text-neutral-600 line-clamp-3">{String(item.from || "").slice(0, 200)}</p>
                  </div>
                  <div className="rounded bg-emerald-50/50 p-2">
                    <p className="text-xs text-emerald-500 font-medium mb-1">After</p>
                    <p className="text-xs text-neutral-600 line-clamp-3">{String(item.to || "").slice(0, 200)}</p>
                  </div>
                </div>
              </div>
            )}
          />

          {/* Stale Statements */}
          <ComparisonSection
            title="Statements That Became Stale"
            icon={<FileWarning className="h-4 w-4" />}
            color="amber"
            items={comparison.staleStatements}
            emptyMessage="No stale statements detected."
            renderItem={(item) => (
              <div className="rounded-lg border border-amber-300 bg-amber-50/40 p-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900 italic">"{item.statement}"</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge bg-amber-100 text-amber-700 border border-amber-200">
                        {item.status}
                      </span>
                      {item.evidenceRef && item.evidenceRef !== "N/A" && (
                        <EvidenceChip label={item.evidenceRef} evidence={pkg.qaEvidence} />
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 ml-6">{item.reason}</p>
              </div>
            )}
          />
        </div>
      ) : null}
    </div>
  );
}

function ComparisonSection({ title, icon, color, items, emptyMessage, renderItem }) {
  const colorClasses = {
    emerald: "text-emerald-600",
    red: "text-red-600",
    amber: "text-amber-600",
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={colorClasses[color]}>{icon}</span>
        <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
        {items && items.length > 0 && (
          <span className="badge bg-neutral-100 text-neutral-600">{items.length}</span>
        )}
      </div>
      {!items || items.length === 0 ? (
        <p className="text-sm text-neutral-400 py-2">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">{items.map((item, idx) => <div key={idx}>{renderItem(item)}</div>)}</div>
      )}
    </div>
  );
}
