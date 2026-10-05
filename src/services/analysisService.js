import { mockAnalysisResults, mockStaleStatements } from "./mockData";

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (data) => JSON.parse(JSON.stringify(data));

let analysisResults = clone(mockAnalysisResults);
let staleStatements = clone(mockStaleStatements);

export async function analyzeRelease(releaseId) {
  await delay(2000);

  if (analysisResults[releaseId]) {
    return clone(analysisResults[releaseId]);
  }

  return {
    id: `anl-${Date.now()}`,
    releaseId,
    timestamp: new Date().toISOString(),
    userImpact: [
      {
        id: `ui-${Date.now()}-1`,
        change: "No data available",
        impactLevel: "No User Impact",
        explanation:
          "Analysis could not classify user impact because the release package does not contain sufficient detail.",
        evidence: [],
      },
    ],
    missingInformation: [
      {
        id: `mi-${Date.now()}-1`,
        missing: "Insufficient data for AI analysis",
        whyItMatters:
          "The release package does not have enough structured information for the AI to generate a meaningful analysis.",
        suggestedAction:
          "Add more features, bug fixes, and QA evidence to the release package.",
      },
    ],
    unsupportedClaims: [],
    risks: [],
  };
}

export async function getAnalysisResult(releaseId) {
  await delay();
  return clone(analysisResults[releaseId] || null);
}

export async function getStaleStatements(releaseId) {
  await delay();
  return clone(staleStatements[releaseId] || []);
}

const impactLevelStyles = {
  "High Impact": { color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  "Medium Impact": { color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  "Low Impact": { color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  "No User Impact": { color: "bg-neutral-100 text-neutral-600 border-neutral-200", dot: "bg-neutral-400" },
};

export function getImpactStyle(level) {
  return impactLevelStyles[level] || impactLevelStyles["No User Impact"];
}

const severityStyles = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-blue-100 text-blue-700",
};

export function getSeverityStyle(severity) {
  return severityStyles[severity] || "bg-neutral-100 text-neutral-600";
}
