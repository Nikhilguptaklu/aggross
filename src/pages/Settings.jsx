import { useState } from "react";
import { useToast } from "../components/Toast";
import { Bell, Shield, Sliders, Database, Save } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    aiModel: "gpt-4",
    analysisDepth: "standard",
    autoRunAnalysis: false,
    requireEvidenceForClaims: true,
    notifyOnAnalysisComplete: true,
    notifyOnApprovalRequired: true,
    defaultSeverityThreshold: "Medium",
    retentionDays: 90,
  });

  const handleSave = () => {
    toast("Settings saved successfully", "success");
  };

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Configure your release communication preferences</p>
      </div>

      {/* AI Configuration */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="h-4 w-4 text-primary-500" />
          <h2 className="text-sm font-semibold text-neutral-900">AI Analysis Configuration</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">AI Model</label>
            <select
              className="input"
              value={settings.aiModel}
              onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
            >
              <option value="gpt-4">GPT-4 (Recommended)</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
              <option value="claude-3">Claude 3 Opus</option>
            </select>
          </div>
          <div>
            <label className="label">Analysis Depth</label>
            <select
              className="input"
              value={settings.analysisDepth}
              onChange={(e) => setSettings({ ...settings, analysisDepth: e.target.value })}
            >
              <option value="quick">Quick (Impact classification only)</option>
              <option value="standard">Standard (Full analysis)</option>
              <option value="thorough">Thorough (Deep evidence verification)</option>
            </select>
          </div>
          <ToggleRow
            label="Automatically run analysis after validation passes"
            description="When enabled, analysis starts automatically once all required sections are complete."
            checked={settings.autoRunAnalysis}
            onChange={() => toggle("autoRunAnalysis")}
          />
          <ToggleRow
            label="Require evidence for all impact claims"
            description="Claims without QA evidence will be flagged as unsupported."
            checked={settings.requireEvidenceForClaims}
            onChange={() => toggle("requireEvidenceForClaims")}
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-4 w-4 text-primary-500" />
          <h2 className="text-sm font-semibold text-neutral-900">Notifications</h2>
        </div>
        <div className="space-y-4">
          <ToggleRow
            label="Notify when analysis is complete"
            description="Receive a notification when AI analysis finishes."
            checked={settings.notifyOnAnalysisComplete}
            onChange={() => toggle("notifyOnAnalysisComplete")}
          />
          <ToggleRow
            label="Notify when human approval is required"
            description="Get alerted when summaries are ready for review."
            checked={settings.notifyOnApprovalRequired}
            onChange={() => toggle("notifyOnApprovalRequired")}
          />
        </div>
      </div>

      {/* Security & Compliance */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-primary-500" />
          <h2 className="text-sm font-semibold text-neutral-900">Security & Compliance</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Default severity threshold for risks</label>
            <select
              className="input"
              value={settings.defaultSeverityThreshold}
              onChange={(e) => setSettings({ ...settings, defaultSeverityThreshold: e.target.value })}
            >
              <option value="Low">Low — Show all risks</option>
              <option value="Medium">Medium — Hide low-severity risks</option>
              <option value="High">High — Only show high-severity risks</option>
            </select>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-xs text-amber-700">
              Human approval is always required for release finalization. This setting cannot be disabled.
            </p>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-4 w-4 text-primary-500" />
          <h2 className="text-sm font-semibold text-neutral-900">Data Management</h2>
        </div>
        <div>
          <label className="label">Version snapshot retention (days)</label>
          <input
            type="number"
            className="input"
            value={settings.retentionDays}
            onChange={(e) => setSettings({ ...settings, retentionDays: parseInt(e.target.value) || 90 })}
          />
          <p className="text-xs text-neutral-400 mt-1">Older version snapshots will be archived after this period.</p>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary">
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary-600" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
