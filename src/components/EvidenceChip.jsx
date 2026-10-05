import { useState } from "react";
import { FileText, CheckCircle2, AlertTriangle, Shield } from "lucide-react";

export function EvidenceChip({ label, evidence, onClick }) {
  const [showDetail, setShowDetail] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(label);
    } else {
      setShowDetail(!showDetail);
    }
  };

  const evidenceData = evidence ? (Array.isArray(evidence) ? evidence : [evidence]) : [];
  const matched = evidenceData.find((e) => e.id === label);

  return (
    <span className="relative inline-block">
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1 rounded-md border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 hover:bg-primary-100 transition-colors"
        title={matched ? `${matched.testName} — ${matched.result}` : label}
      >
        <FileText className="h-3 w-3" />
        {label}
      </button>
      {showDetail && matched && (
        <div className="absolute left-0 top-full z-20 mt-1 w-72 rounded-lg border border-neutral-200 bg-white p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-900">{matched.id}</span>
            {matched.result === "Pass" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <p className="text-sm font-medium text-neutral-800 mb-1">{matched.testName}</p>
          <p className="text-xs text-neutral-500">{matched.notes}</p>
        </div>
      )}
    </span>
  );
}

export function EvidenceChipGroup({ items, evidence }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, idx) => (
        <EvidenceChip key={idx} label={item} evidence={evidence} />
      ))}
    </div>
  );
}

export default EvidenceChip;
