const statusConfig = {
  Draft: { className: "bg-neutral-100 text-neutral-700 border border-neutral-200", dot: "bg-neutral-400" },
  Analyzing: { className: "bg-blue-100 text-blue-700 border border-blue-200", dot: "bg-blue-500" },
  "Needs Review": { className: "bg-amber-100 text-amber-700 border border-amber-200", dot: "bg-amber-500" },
  Approved: { className: "bg-emerald-100 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  Rejected: { className: "bg-red-100 text-red-700 border border-red-200", dot: "bg-red-500" },
};

const readinessConfig = {
  Ready: { className: "bg-emerald-100 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  "Needs Attention": { className: "bg-amber-100 text-amber-700 border border-amber-200", dot: "bg-amber-500" },
  Blocked: { className: "bg-red-100 text-red-700 border border-red-200", dot: "bg-red-500" },
};

export function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig["Draft"];
  return (
    <span className={`badge ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}

export function ReadinessBadge({ readiness }) {
  const config = readinessConfig[readiness] || readinessConfig["Needs Attention"];
  return (
    <span className={`badge ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {readiness}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const configs = {
    High: "bg-red-100 text-red-700 border border-red-200",
    Medium: "bg-amber-100 text-amber-700 border border-amber-200",
    Low: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return <span className={`badge ${configs[severity] || configs.Low}`}>{severity}</span>;
}

export function ImpactBadge({ level }) {
  const configs = {
    "High Impact": "bg-red-100 text-red-700 border border-red-200",
    "Medium Impact": "bg-amber-100 text-amber-700 border border-amber-200",
    "Low Impact": "bg-blue-100 text-blue-700 border border-blue-200",
    "No User Impact": "bg-neutral-100 text-neutral-600 border border-neutral-200",
  };
  return <span className={`badge ${configs[level] || configs["No User Impact"]}`}>{level}</span>;
}

export function ReviewStatusBadge({ status }) {
  const configs = {
    pending: "bg-neutral-100 text-neutral-600 border border-neutral-200",
    approved: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    rejected: "bg-red-100 text-red-700 border border-red-200",
    edited: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  const labels = { pending: "Pending Review", approved: "Human Approved", rejected: "Rejected", edited: "Edited" };
  return <span className={`badge ${configs[status] || configs.pending}`}>{labels[status]}</span>;
}

export function EvidenceResultBadge({ result }) {
  const configs = {
    Pass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    Fail: "bg-red-100 text-red-700 border border-red-200",
    "In Progress": "bg-amber-100 text-amber-700 border border-amber-200",
  };
  return <span className={`badge ${configs[result] || configs["In Progress"]}`}>{result}</span>;
}
