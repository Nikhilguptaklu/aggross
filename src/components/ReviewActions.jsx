import { CheckCircle2, XCircle, Edit3 } from "lucide-react";
import { ReviewStatusBadge } from "./StatusBadge";

export default function ReviewActions({
  status,
  onApprove,
  onReject,
  onEdit,
  compact = false,
}) {
  if (status === "approved") {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          Human approved
        </div>
        {!compact && (
          <button onClick={onEdit} className="btn-ghost text-xs">
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-red-600">
          <XCircle className="h-4 w-4" />
          Rejected — reason required
        </div>
        {!compact && (
          <button onClick={onEdit} className="btn-ghost text-xs">
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={onEdit} className="btn-ghost text-xs">
        <Edit3 className="h-3.5 w-3.5" />
        Edit
      </button>
      <button
        onClick={onApprove}
        className="btn text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Approve
      </button>
      <button
        onClick={onReject}
        className="btn text-xs bg-red-50 text-red-700 hover:bg-red-100"
      >
        <XCircle className="h-3.5 w-3.5" />
        Reject
      </button>
    </div>
  );
}
