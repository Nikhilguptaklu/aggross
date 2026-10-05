import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  AlertTriangle,
  FileWarning,
  ShieldAlert,
  Loader2,
  FileText,
  ArrowRight,
  Package as PackageIcon,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { analyzeRelease, getAnalysisResult } from "../services/analysisService";
import { ImpactBadge, SeverityBadge } from "../components/StatusBadge";
import { EvidenceChipGroup } from "../components/EvidenceChip";
import { LoadingState } from "../components/EmptyState";
import { useToast } from "../components/Toast";

export default function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPackage, selectPackage, loading } = useApp();
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    if (id) selectPackage(id);
  }, [id, selectPackage]);

  useEffect(() => {
    if (id) {
      setAnalysisLoading(true);
      getAnalysisResult(id).then((result) => {
        setAnalysis(result);
        setAnalysisLoading(false);
      });
    }
  }, [id]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeRelease(id);
      setAnalysis(result);
      toast("Analysis completed successfully", "success");
    } catch {
      toast("Analysis failed. Please try again.", "error");
    }
    setAnalyzing(false);
  };

  if (loading && !currentPackage) {
    return <LoadingState message="Loading release package..." />;
  }

  if (!currentPackage) {
    return (
      <div className="text-center py-12">
        <PackageIcon className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
        <p className="text-neutral-500">Release package not found.</p>
        <button onClick={() => navigate("/packages")} className="btn-secondary mt-4 text-sm">
          Back to Packages
        </button>
      </div>
    );
  }

  const pkg = currentPackage;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/packages")} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neutral-900">Release Readiness Analysis</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {pkg.name} • {pkg.version}
            {analysis && (
              <> • Analyzed {new Date(analysis.timestamp).toLocaleString()}</>
            )}
          </p>
        </div>
      </div>

      {/* AI banner */}
      <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <p className="text-sm text-amber-700">
          AI-generated content requires human review before finalization.
        </p>
      </div>

      {!analysis && !analyzing && !analysisLoading && (
        <div className="card p-8 text-center">
          <Brain className="h-12 w-12 text-primary-300 mx-auto mb-4" />
          <h2 className="text-base font-semibold text-neutral-900 mb-2">No analysis yet</h2>
          <p className="text-sm text-neutral-500 mb-4 max-w-md mx-auto">
            Run the AI analysis to classify user impact, detect missing information, identify unsupported claims, and assess risks.
          </p>
          <button onClick={handleAnalyze} className="btn-primary">
            <Brain className="h-4 w-4" />
            Run Release Analysis
          </button>
        </div>
      )}

      {(analyzing || analysisLoading) && !analysis && (
        <div className="card p-8 text-center">
          <Loader2 className="h-8 w-8 text-primary-500 mx-auto mb-3 animate-spin" />
          <h2 className="text-base font-semibold text-neutral-900 mb-1">
            {analyzing ? "Analyzing release package..." : "Loading analysis..."}
          </h2>
          <p className="text-sm text-neutral-500">
            AI is classifying user impact, detecting gaps, and checking claims against evidence.
          </p>
        </div>
      )}

      {analysis && (
        <>
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={handleAnalyze} className="btn-secondary text-sm" disabled={analyzing}>
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                Re-run Analysis
              </button>
            </div>
            <button
              onClick={() => navigate(`/summaries/${pkg.id}`)}
              className="btn-primary text-sm"
            >
              View Generated Summaries
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* 1. User Impact */}
          <AnalysisSectionCard
            number="1"
            title="User Impact Classification"
            icon={<Brain className="h-4 w-4" />}
            count={analysis.userImpact?.length}
          >
            <div className="space-y-3">
              {analysis.userImpact?.map((item, idx) => (
                <div key={item.id || idx} className="rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 text-sm">{item.change}</p>
                      <p className="text-sm text-neutral-600 mt-1">{item.explanation}</p>
                    </div>
                    <ImpactBadge level={item.impactLevel} />
                  </div>
                  {item.evidence && item.evidence.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-neutral-100">
                      <span className="text-xs text-neutral-400 mr-2">Evidence:</span>
                      <EvidenceChipGroup items={item.evidence} evidence={pkg.qaEvidence} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AnalysisSectionCard>

          {/* 2. Missing Information */}
          <AnalysisSectionCard
            number="2"
            title="Missing Information"
            icon={<FileWarning className="h-4 w-4" />}
            count={analysis.missingInformation?.length}
            variant={analysis.missingInformation?.length > 0 ? "warning" : "success"}
          >
            {analysis.missingInformation?.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <FileText className="h-4 w-4" />
                No missing information detected. All required sections are well-documented.
              </div>
            ) : (
              <div className="space-y-3">
                {analysis.missingInformation?.map((item, idx) => (
                  <div key={item.id || idx} className="rounded-lg border border-amber-200 bg-amber-50/30 p-4">
                    <p className="font-medium text-neutral-900 text-sm">{item.missing}</p>
                    <p className="text-sm text-neutral-600 mt-1"><span className="text-xs font-medium text-neutral-400">Why it matters: </span>{item.whyItMatters}</p>
                    <div className="mt-2 rounded-lg bg-primary-50/50 p-3">
                      <p className="text-xs font-medium text-primary-600 mb-1">Suggested Action</p>
                      <p className="text-sm text-neutral-600">{item.suggestedAction}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnalysisSectionCard>

          {/* 3. Unsupported Claims */}
          <AnalysisSectionCard
            number="3"
            title="Unsupported Claims"
            icon={<AlertTriangle className="h-4 w-4" />}
            count={analysis.unsupportedClaims?.length}
            variant={analysis.unsupportedClaims?.length > 0 ? "warning" : "success"}
          >
            {analysis.unsupportedClaims?.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <FileText className="h-4 w-4" />
                All claims are supported by QA evidence.
              </div>
            ) : (
              <div className="space-y-3">
                {analysis.unsupportedClaims?.map((claim, idx) => (
                  <div key={claim.id || idx} className="rounded-lg border border-amber-300 bg-amber-50/30 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-neutral-900 text-sm italic">"{claim.claim}"</p>
                      <span className={`badge ${
                        claim.confidence === "Low" ? "bg-red-100 text-red-700" :
                        claim.confidence === "Medium" ? "bg-amber-100 text-amber-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        Confidence: {claim.confidence}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <p className="text-neutral-600"><span className="text-xs font-medium text-amber-600">Problem: </span>{claim.problem}</p>
                      <p className="text-neutral-600"><span className="text-xs font-medium text-neutral-400">Available evidence: </span>{claim.availableEvidence}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnalysisSectionCard>

          {/* 4. Risks & Limitations */}
          <AnalysisSectionCard
            number="4"
            title="Risks & Limitations"
            icon={<ShieldAlert className="h-4 w-4" />}
            count={analysis.risks?.length}
          >
            {analysis.risks?.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <FileText className="h-4 w-4" />
                No additional risks detected beyond what's documented.
              </div>
            ) : (
              <div className="space-y-3">
                {analysis.risks?.map((risk, idx) => (
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
            )}
          </AnalysisSectionCard>

          {/* 5. Evidence Reference */}
          <AnalysisSectionCard
            number="5"
            title="Evidence References"
            icon={<FileText className="h-4 w-4" />}
          >
            <p className="text-sm text-neutral-500 mb-3">
              Click any evidence chip above to see details. All QA evidence items:
            </p>
            <div className="space-y-2">
              {pkg.qaEvidence?.map((ev, idx) => (
                <div key={ev.id || idx} className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3">
                  <span className="font-mono text-xs text-primary-600">{ev.id}</span>
                  <span className="text-sm text-neutral-700 flex-1">{ev.testName}</span>
                  <span className={`badge ${
                    ev.result === "Pass" ? "bg-emerald-100 text-emerald-700" :
                    ev.result === "Fail" ? "bg-red-100 text-red-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {ev.result}
                  </span>
                </div>
              ))}
            </div>
          </AnalysisSectionCard>
        </>
      )}
    </div>
  );
}

function AnalysisSectionCard({ number, title, icon, count, children, variant }) {
  const borderColor =
    variant === "warning" ? "border-amber-200" :
    variant === "success" ? "border-emerald-200" :
    "border-neutral-200";

  return (
    <div className={`card p-5 border ${borderColor}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600 text-xs font-bold">
          {number}
        </div>
        <div className="flex items-center gap-2 flex-1">
          {icon}
          <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
          {count !== undefined && (
            <span className="badge bg-neutral-100 text-neutral-600">{count}</span>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
