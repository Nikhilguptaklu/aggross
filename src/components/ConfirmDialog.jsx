import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}) {
  const confirmClass =
    variant === "danger" ? "btn-danger" : "btn-primary";

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-secondary text-sm">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`${confirmClass} text-sm`}>
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm text-neutral-600">{message}</p>
    </Modal>
  );
}
