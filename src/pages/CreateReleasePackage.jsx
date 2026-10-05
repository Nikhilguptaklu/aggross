import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Save,
  ArrowLeft,
  Brain,
  Info,
  Package as PackageIcon,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useToast } from "../components/Toast";
import { validateReleasePackage } from "../services/releaseService";
import { LoadingState } from "../components/EmptyState";

const emptyPackage = {
  releaseInfo: { releaseName: "", version: "", releaseDate: "", owner: "" },
  completedFeatures: [],
  bugFixes: [],
  changedBehaviours: [],
  qaSummary: "",
  qaEvidence: [],
  knownLimitations: [],
  migrationNotes: "",
  affectedUserGroups: [],
  risks: [],
};

export default function CreateReleasePackage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPackage, selectPackage, createPackage, updatePackage, saveVersion, loading } = useApp();
  const [formData, setFormData] = useState(emptyPackage);
  const [validation, setValidation] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  const loadPackage = useCallback(async () => {
    if (id) {
      const pkg = await selectPackage(id);
      if (pkg) {
        setFormData({
          releaseInfo: pkg.releaseInfo || emptyPackage.releaseInfo,
          completedFeatures: pkg.completedFeatures || [],
          bugFixes: pkg.bugFixes || [],
          changedBehaviours: pkg.changedBehaviours || [],
          qaSummary: pkg.qaSummary || "",
          qaEvidence: pkg.qaEvidence || [],
          knownLimitations: pkg.knownLimitations || [],
          migrationNotes: pkg.migrationNotes || "",
          affectedUserGroups: pkg.affectedUserGroups || [],
          risks: pkg.risks || [],
        });
      }
    }
  }, [id, selectPackage]);

  useEffect(() => {
    loadPackage();
  }, [loadPackage]);

  useEffect(() => {
    setValidation(validateReleasePackage(formData));
  }, [formData]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateReleaseInfo = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      releaseInfo: { ...prev.releaseInfo, [key]: value },
    }));
  };

  const addItem = (field, item) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], item] }));
  };

  const removeItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateItem = (field, index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isEdit) {
        await updatePackage(id, formData);
        await saveVersion(id, formData.releaseInfo.version, "Package updated", formData.releaseInfo.owner);
        toast("Release package updated successfully", "success");
      } else {
        const pkg = await createPackage(formData);
        toast("Release package created successfully", "success");
        navigate(`/packages/${pkg.id}`);
      }
    } catch {
      toast("Failed to save release package", "error");
    }
    setSaving(false);
  };

  const handleRunAnalysis = async () => {
    if (!validation?.allPassed) return;
    if (!isEdit) {
      const pkg = await createPackage(formData);
      await saveVersion(pkg.id, formData.releaseInfo.version, "Initial version before analysis", formData.releaseInfo.owner);
      toast("Release package created. Starting analysis...", "success");
      navigate(`/analysis/${pkg.id}`);
    } else {
      await updatePackage(id, formData);
      await saveVersion(id, formData.releaseInfo.version, "Updated before analysis", formData.releaseInfo.owner);
      toast("Starting analysis...", "success");
      navigate(`/analysis/${id}`);
    }
  };

  if (isEdit && loading && !currentPackage) {
    return <LoadingState message="Loading release package..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            {isEdit ? "Edit Release Package" : "Create Release Package"}
          </h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Fill in the release details below. Required sections are marked.
          </p>
        </div>
      </div>

      {/* Release Information */}
      <FormSection
        title="Release Information"
        required
        complete={!!formData.releaseInfo.releaseName && !!formData.releaseInfo.version}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Release name <span className="text-red-500">*</span></label>
            <input
              className="input"
              value={formData.releaseInfo.releaseName}
              onChange={(e) => updateReleaseInfo("releaseName", e.target.value)}
              placeholder="e.g. Customer Portal Reliability Release"
            />
          </div>
          <div>
            <label className="label">Version <span className="text-red-500">*</span></label>
            <input
              className="input"
              value={formData.releaseInfo.version}
              onChange={(e) => updateReleaseInfo("version", e.target.value)}
              placeholder="e.g. v2.4.0"
            />
          </div>
          <div>
            <label className="label">Release date</label>
            <input
              type="date"
              className="input"
              value={formData.releaseInfo.releaseDate ? formData.releaseInfo.releaseDate.split("T")[0] : ""}
              onChange={(e) => updateReleaseInfo("releaseDate", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Owner</label>
            <input
              className="input"
              value={formData.releaseInfo.owner}
              onChange={(e) => updateReleaseInfo("owner", e.target.value)}
              placeholder="e.g. Sarah Chen"
            />
          </div>
        </div>
      </FormSection>

      {/* Completed Features */}
      <FormSection
        title="Completed Features"
        required
        complete={formData.completedFeatures.length > 0 || formData.bugFixes.length > 0}
        addAction={() => addItem("completedFeatures", { id: Date.now().toString(), title: "", description: "", userImpact: "", evidenceRef: "" })}
        actionLabel="Add Feature"
      >
        <DynamicList
          items={formData.completedFeatures}
          fields={[
            { key: "title", label: "Title", placeholder: "Feature title" },
            { key: "description", label: "Description", placeholder: "What this feature does", textarea: true },
            { key: "userImpact", label: "User Impact", placeholder: "How this affects users" },
            { key: "evidenceRef", label: "Evidence Reference (optional)", placeholder: "e.g. QA-01" },
          ]}
          onUpdate={(idx, key, val) => updateItem("completedFeatures", idx, key, val)}
          onRemove={(idx) => removeItem("completedFeatures", idx)}
          emptyMessage="No features added yet."
        />
      </FormSection>

      {/* Bug Fixes */}
      <FormSection
        title="Bug Fixes"
        addAction={() => addItem("bugFixes", { id: Date.now().toString(), title: "", description: "", severity: "Medium", affectedUsers: "", qaEvidence: "" })}
        actionLabel="Add Bug Fix"
      >
        <DynamicList
          items={formData.bugFixes}
          fields={[
            { key: "title", label: "Bug title", placeholder: "Bug title" },
            { key: "description", label: "Description", placeholder: "What was wrong", textarea: true },
            { key: "severity", label: "Severity", select: ["High", "Medium", "Low"] },
            { key: "affectedUsers", label: "Affected users", placeholder: "Who was affected" },
            { key: "qaEvidence", label: "QA Evidence", placeholder: "e.g. QA-04" },
          ]}
          onUpdate={(idx, key, val) => updateItem("bugFixes", idx, key, val)}
          onRemove={(idx) => removeItem("bugFixes", idx)}
          emptyMessage="No bug fixes added yet."
        />
      </FormSection>

      {/* Changed Behaviours */}
      <FormSection
        title="Changed Behaviour"
        addAction={() => addItem("changedBehaviours", { id: Date.now().toString(), title: "", previousBehaviour: "", newBehaviour: "", userImpact: "" })}
        actionLabel="Add Change"
      >
        <DynamicList
          items={formData.changedBehaviours}
          fields={[
            { key: "title", label: "Change title", placeholder: "What changed" },
            { key: "previousBehaviour", label: "Previous behaviour", placeholder: "How it worked before", textarea: true },
            { key: "newBehaviour", label: "New behaviour", placeholder: "How it works now", textarea: true },
            { key: "userImpact", label: "User impact", placeholder: "How this affects users" },
          ]}
          onUpdate={(idx, key, val) => updateItem("changedBehaviours", idx, key, val)}
          onRemove={(idx) => removeItem("changedBehaviours", idx)}
          emptyMessage="No changed behaviours added yet."
        />
      </FormSection>

      {/* QA Summary + Evidence */}
      <FormSection
        title="QA Summary"
        required
        complete={!!formData.qaSummary?.trim()}
      >
        <label className="label">QA Summary <span className="text-red-500">*</span></label>
        <textarea
          className="input min-h-[100px]"
          value={formData.qaSummary}
          onChange={(e) => updateField("qaSummary", e.target.value)}
          placeholder="Summarize the QA testing process, test coverage, and results..."
        />
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">QA Evidence Items</label>
            <button
              onClick={() => addItem("qaEvidence", { id: Date.now().toString(), id_label: "", testName: "", result: "Pass", notes: "" })}
              className="btn-ghost text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Evidence
            </button>
          </div>
          <DynamicList
            items={formData.qaEvidence}
            fields={[
              { key: "id", label: "Evidence ID", placeholder: "e.g. QA-01" },
              { key: "testName", label: "Test name", placeholder: "Test description" },
              { key: "result", label: "Result", select: ["Pass", "Fail", "In Progress"] },
              { key: "notes", label: "Notes", placeholder: "Additional details", textarea: true },
            ]}
            onUpdate={(idx, key, val) => updateItem("qaEvidence", idx, key, val)}
            onRemove={(idx) => removeItem("qaEvidence", idx)}
            emptyMessage="No QA evidence items added yet."
          />
        </div>
      </FormSection>

      {/* Known Limitations */}
      <FormSection
        title="Known Limitations"
        required
        complete={formData.knownLimitations.length > 0}
        addAction={() => addItem("knownLimitations", { id: Date.now().toString(), title: "", description: "" })}
        actionLabel="Add Limitation"
      >
        <DynamicList
          items={formData.knownLimitations}
          fields={[
            { key: "title", label: "Title", placeholder: "Limitation title" },
            { key: "description", label: "Description", placeholder: "What is limited and why", textarea: true },
          ]}
          onUpdate={(idx, key, val) => updateItem("knownLimitations", idx, key, val)}
          onRemove={(idx) => removeItem("knownLimitations", idx)}
          emptyMessage="No known limitations added yet."
        />
      </FormSection>

      {/* Migration Notes */}
      <FormSection title="Migration / Configuration Notes">
        <textarea
          className="input min-h-[80px]"
          value={formData.migrationNotes}
          onChange={(e) => updateField("migrationNotes", e.target.value)}
          placeholder="Document any migration steps, configuration changes, or deployment notes..."
        />
      </FormSection>

      {/* Affected User Groups */}
      <FormSection
        title="Affected User Groups"
        required
        complete={formData.affectedUserGroups.length > 0}
        addAction={() => addItem("affectedUserGroups", { id: Date.now().toString(), name: "" })}
        actionLabel="Add User Group"
      >
        <DynamicList
          items={formData.affectedUserGroups}
          fields={[{ key: "name", label: "Group name", placeholder: "e.g. Admins, End users, Developers" }]}
          onUpdate={(idx, key, val) => updateItem("affectedUserGroups", idx, key, val)}
          onRemove={(idx) => removeItem("affectedUserGroups", idx)}
          emptyMessage="No user groups added yet."
        />
      </FormSection>

      {/* Validation Panel */}
      <ValidationPanel validation={validation} />

      {/* Actions */}
      <div className="sticky bottom-0 flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary"
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-secondary"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={handleRunAnalysis}
            disabled={!validation?.allPassed || saving}
            className="btn-primary"
            title={!validation?.allPassed ? "Complete all required sections first" : ""}
          >
            <Brain className="h-4 w-4" />
            Run Release Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, required, complete, children, addAction, actionLabel }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
          {required && (
            <span className="text-xs text-neutral-400">(required)</span>
          )}
          {complete !== undefined && (
            complete ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            )
          )}
        </div>
        {addAction && actionLabel && (
          <button onClick={addAction} className="btn-ghost text-xs">
            <Plus className="h-3.5 w-3.5" />
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function DynamicList({ items, fields, onUpdate, onRemove, emptyMessage }) {
  if (items.length === 0) {
    return <p className="text-sm text-neutral-400 py-3">{emptyMessage}</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.id || idx} className="rounded-lg border border-neutral-200 p-4 bg-neutral-50/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-400">#{idx + 1}</span>
            <button
              onClick={() => onRemove(idx)}
              className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className={field.textarea ? "sm:col-span-2" : ""}>
                <label className="text-xs font-medium text-neutral-600">{field.label}</label>
                {field.select ? (
                  <select
                    className="input mt-0.5"
                    value={item[field.key] || ""}
                    onChange={(e) => onUpdate(idx, field.key, e.target.value)}
                  >
                    {field.select.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.textarea ? (
                  <textarea
                    className="input mt-0.5 min-h-[60px]"
                    value={item[field.key] || ""}
                    onChange={(e) => onUpdate(idx, field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    className="input mt-0.5"
                    value={item[field.key] || ""}
                    onChange={(e) => onUpdate(idx, field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ValidationPanel({ validation }) {
  if (!validation) return null;
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-4 w-4 text-primary-500" />
        <h2 className="text-sm font-semibold text-neutral-900">Validation Checklist</h2>
        <span className="text-xs text-neutral-400">— Deterministic checks (not AI)</span>
      </div>
      <div className="space-y-2">
        {validation.checks.map((check) => (
          <div
            key={check.key}
            className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${
              check.passed
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-amber-200 bg-amber-50/50"
            }`}
          >
            <div className="flex items-center gap-3">
              {check.passed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
              <div>
                <p className="text-sm font-medium text-neutral-800">{check.label}</p>
                <p className="text-xs text-neutral-500">{check.section}</p>
              </div>
            </div>
            <span className={`text-xs font-medium ${check.passed ? "text-emerald-600" : "text-amber-600"}`}>
              {check.passed ? "Complete" : "Missing"}
            </span>
          </div>
        ))}
      </div>
      {validation.allPassed ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          All required sections are complete. You can run the analysis.
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
          <AlertTriangle className="h-4 w-4" />
          {validation.checks.filter((c) => !c.passed).length} section(s) need attention before analysis.
        </div>
      )}
    </div>
  );
}
