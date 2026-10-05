import {
  mockReleasePackages,
  mockVersions,
  mockVersionSnapshots,
  mockGeneratedSummaries,
} from "./mockData";

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const clone = (data) => JSON.parse(JSON.stringify(data));

let packages = clone(mockReleasePackages);
let versions = clone(mockVersions);
let snapshots = clone(mockVersionSnapshots);
let summaries = clone(mockGeneratedSummaries);

export async function getReleasePackages() {
  await delay();
  return clone(packages);
}

export async function getReleasePackage(id) {
  await delay();
  const pkg = packages.find((p) => p.id === id);
  return pkg ? clone(pkg) : null;
}

export async function createReleasePackage(data) {
  await delay(500);
  const id = `rel-${Date.now()}`;
  const newPkg = {
    id,
    name: data.releaseInfo?.releaseName || "Untitled Release",
    version: data.releaseInfo?.version || "v0.1.0",
    releaseDate: data.releaseInfo?.releaseDate || new Date().toISOString(),
    owner: data.releaseInfo?.owner || "Unknown",
    status: "Draft",
    readiness: "Needs Attention",
    lastUpdated: new Date().toISOString(),
    description: "",
    ...data,
    analysisId: null,
    summaryStatus: {
      technicalSummary: "pending",
      stakeholderSummary: "pending",
    },
  };
  packages = [newPkg, ...packages];
  versions[id] = [
    {
      id: `ver-${id}-init`,
      releaseId: id,
      version: "v0.1",
      createdDate: new Date().toISOString(),
      author: newPkg.owner,
      status: "Draft",
      changeSummary: "Initial release package created.",
      snapshot: null,
    },
  ];
  return clone(newPkg);
}

export async function updateReleasePackage(id, data) {
  await delay(400);
  const idx = packages.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  packages[idx] = { ...packages[idx], ...data, lastUpdated: new Date().toISOString() };
  return clone(packages[idx]);
}

export async function saveVersionSnapshot(id, versionLabel, changeSummary, author) {
  await delay(300);
  if (!versions[id]) versions[id] = [];
  const newVersion = {
    id: `ver-${id}-${Date.now()}`,
    releaseId: id,
    version: versionLabel,
    createdDate: new Date().toISOString(),
    author: author || "System",
    status: "Draft",
    changeSummary: changeSummary || "Version saved.",
    snapshot: clone(packages.find((p) => p.id === id) || {}),
  };
  versions[id] = [...versions[id], newVersion];
  return clone(newVersion);
}

export async function getVersions(releaseId) {
  await delay();
  return clone(versions[releaseId] || []);
}

export async function getGeneratedSummaries(releaseId) {
  await delay();
  return clone(summaries[releaseId] || null);
}

export async function updateGeneratedSummary(releaseId, type, data) {
  await delay(300);
  if (!summaries[releaseId]) summaries[releaseId] = {};
  summaries[releaseId][type] = { ...summaries[releaseId][type], ...data };
  return clone(summaries[releaseId][type]);
}

export async function setSummaryStatus(releaseId, type, status) {
  await delay(200);
  const idx = packages.findIndex((p) => p.id === releaseId);
  if (idx !== -1) {
    packages[idx].summaryStatus = {
      ...packages[idx].summaryStatus,
      [type]: status,
    };
  }
  return clone(packages[idx]);
}

export async function setReleaseStatus(releaseId, status) {
  await delay(200);
  const idx = packages.findIndex((p) => p.id === releaseId);
  if (idx !== -1) {
    packages[idx].status = status;
    if (status === "Approved") {
      packages[idx].readiness = "Ready";
    } else if (status === "Rejected") {
      packages[idx].readiness = "Blocked";
    }
    packages[idx].lastUpdated = new Date().toISOString();
  }
  return clone(packages[idx]);
}

export function validateReleasePackage(pkg) {
  const checks = [
    {
      key: "releaseName",
      label: "Release name",
      section: "Release Information",
      passed: !!pkg.releaseInfo?.releaseName?.trim(),
    },
    {
      key: "version",
      label: "Version",
      section: "Release Information",
      passed: !!pkg.releaseInfo?.version?.trim(),
    },
    {
      key: "completedFeatures",
      label: "Completed features OR bug fixes",
      section: "Features & Fixes",
      passed:
        (pkg.completedFeatures && pkg.completedFeatures.length > 0) ||
        (pkg.bugFixes && pkg.bugFixes.length > 0),
    },
    {
      key: "qaSummary",
      label: "QA summary",
      section: "QA Summary",
      passed: !!pkg.qaSummary?.trim(),
    },
    {
      key: "knownLimitations",
      label: "Known limitations",
      section: "Known Limitations",
      passed: pkg.knownLimitations && pkg.knownLimitations.length > 0,
    },
    {
      key: "affectedUserGroups",
      label: "Affected user groups",
      section: "Affected User Groups",
      passed: pkg.affectedUserGroups && pkg.affectedUserGroups.length > 0,
    },
  ];
  const allPassed = checks.every((c) => c.passed);
  return { checks, allPassed };
}

export async function compareVersions(releaseId, versionA, versionB) {
  await delay(400);
  const snapA = snapshots[releaseId]?.[versionA];
  const snapB = snapshots[releaseId]?.[versionB];

  if (!snapA || !snapB) {
    return { added: [], removed: [], changed: [], staleStatements: [] };
  }

  const added = [];
  const removed = [];
  const changed = [];

  const compareArrays = (arrA, arrB, key, label) => {
    const mapA = new Map((arrA || []).map((item) => [item[key] || item.title || item.name || JSON.stringify(item), item]));
    const mapB = new Map((arrB || []).map((item) => [item[key] || item.title || item.name || JSON.stringify(item), item]));
    for (const [k, item] of mapB) {
      if (!mapA.has(k)) {
        added.push({ section: label, item: item.title || item.name || item.risk || k });
      }
    }
    for (const [k, item] of mapA) {
      if (!mapB.has(k)) {
        removed.push({ section: label, item: item.title || item.name || item.risk || k });
      }
    }
  };

  compareArrays(snapA.completedFeatures, snapB.completedFeatures, "title", "Completed Features");
  compareArrays(snapA.bugFixes, snapB.bugFixes, "title", "Bug Fixes");
  compareArrays(snapA.changedBehaviours, snapB.changedBehaviours, "title", "Changed Behaviours");
  compareArrays(snapA.knownLimitations, snapB.knownLimitations, "title", "Known Limitations");
  compareArrays(snapA.affectedUserGroups, snapB.affectedUserGroups, "name", "Affected User Groups");
  compareArrays(snapA.risks, snapB.risks, "risk", "Risks");

  if (snapA.qaSummary !== snapB.qaSummary) {
    changed.push({ section: "QA Summary", from: snapA.qaSummary, to: snapB.qaSummary });
  }
  if (snapA.migrationNotes !== snapB.migrationNotes) {
    changed.push({ section: "Migration Notes", from: snapA.migrationNotes, to: snapB.migrationNotes });
  }

  const featureTitlesA = new Set((snapA.completedFeatures || []).map((f) => f.title));
  const featureTitlesB = new Set((snapB.completedFeatures || []).map((f) => f.title));

  const staleStatements = [];
  if (snapA.completedFeatures) {
    for (const feat of snapA.completedFeatures) {
      const matchingB = (snapB.completedFeatures || []).find((f) => f.title === feat.title);
      if (matchingB && feat.userImpact !== matchingB.userImpact) {
        staleStatements.push({
          statement: `${feat.title}: "${feat.userImpact}"`,
          status: "Stale",
          reason: `User impact description changed from version ${versionA} to ${versionB}.`,
          evidenceRef: feat.evidenceRef || "N/A",
        });
      }
    }
  }
  if (!featureTitlesB.has("Payment Retry Logic Fails Silently") && snapA.bugFixes?.some((b) => b.title === "Payment Retry Logic Fails Silently")) {
    staleStatements.push({
      statement: "Payment retry is fully supported.",
      status: "Stale",
      reason: "The release package changed and the latest QA evidence no longer supports this statement.",
      evidenceRef: "QA-04",
    });
  }

  return { added, removed, changed, staleStatements };
}

export async function deleteReleasePackage(id) {
  await delay(300);
  packages = packages.filter((p) => p.id !== id);
  delete versions[id];
  delete snapshots[id];
  delete summaries[id];
  return true;
}
