const now = new Date();
const daysAgo = (n) => {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
};
const daysAhead = (n) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

export const mockReleasePackages = [
  {
    id: "rel-001",
    name: "Customer Portal Reliability Release",
    version: "v2.4.0",
    releaseDate: daysAhead(7),
    owner: "Sarah Chen",
    status: "Needs Review",
    readiness: "Needs Attention",
    lastUpdated: daysAgo(1),
    description:
      "Improves reliability of the customer portal with retry logic, session handling fixes, and performance optimizations for large datasets.",
    releaseInfo: {
      releaseName: "Customer Portal Reliability Release",
      version: "v2.4.0",
      releaseDate: daysAhead(7),
      owner: "Sarah Chen",
    },
    completedFeatures: [
      {
        id: "f1",
        title: "Automatic Session Token Refresh",
        description:
          "Session tokens now refresh automatically in the background before expiry, preventing unexpected logouts during active use.",
        userImpact: "Reduces unexpected logouts by an estimated 95% for active users.",
        evidenceRef: "QA-01",
      },
      {
        id: "f2",
        title: "Batch Data Export for Enterprise Accounts",
        description:
          "Enterprise customers can now export up to 100,000 records in a single operation, up from the previous 10,000 limit.",
        userImpact:
          "Enterprise customers no longer need to split exports into multiple batches.",
        evidenceRef: "QA-02",
      },
      {
        id: "f3",
        title: "Inline Error Recovery for Failed Requests",
        description:
          "Failed API requests now show inline retry buttons with contextual error messages instead of generic error pages.",
        userImpact:
          "Users can retry failed actions without navigating away or losing form data.",
        evidenceRef: "QA-03",
      },
      {
        id: "f4",
        title: "Dark Mode Support for Dashboard",
        description:
          "The customer dashboard now supports a dark mode theme that follows system preferences.",
        userImpact: "Improves readability in low-light environments.",
        evidenceRef: null,
      },
    ],
    bugFixes: [
      {
        id: "b1",
        title: "Payment Retry Logic Fails Silently",
        description:
          "Retry attempts for failed payments were not surfacing errors to the user, causing confusion about payment status.",
        severity: "High",
        affectedUsers: "All customers with recurring billing",
        qaEvidence: "QA-04",
      },
      {
        id: "b2",
        title: "Session Timeout Redirects to Wrong Page",
        description:
          "After session timeout, users were redirected to the marketing homepage instead of the login page.",
        severity: "Medium",
        affectedUsers: "All authenticated users",
        qaEvidence: "QA-05",
      },
      {
        id: "b3",
        title: "Export Button Disabled on Large Datasets",
        description:
          "The export button was incorrectly disabled when a dataset exceeded 10,000 rows, even for enterprise accounts with higher limits.",
        severity: "Medium",
        affectedUsers: "Enterprise customers",
        qaEvidence: "QA-06",
      },
    ],
    changedBehaviours: [
      {
        id: "c1",
        title: "Default Session Duration Reduced",
        previousBehaviour:
          "Sessions lasted 24 hours regardless of activity, requiring a re-login only once per day.",
        newBehaviour:
          "Sessions now last 8 hours of inactivity, refreshing automatically for active users.",
        userImpact:
          "Inactive users will be logged out sooner. Active users will see no difference due to auto-refresh.",
      },
      {
        id: "c2",
        title: "Export File Format Defaults to CSV",
        previousBehaviour: "Exports defaulted to XLSX format.",
        newBehaviour:
          "Exports now default to CSV, with XLSX available as a secondary option.",
        userImpact:
          "Users accustomed to XLSX will need to manually select that format.",
      },
    ],
    qaSummary:
      "QA completed full regression testing on staging environment. 142 test cases executed, 139 passed, 3 known failures documented. Payment retry logic verified with simulated gateway failures. Session token refresh tested across 5 browser environments. Large dataset export validated with 100,000 record sample. Dark mode visual regression passed on all major dashboard pages.",
    qaEvidence: [
      {
        id: "QA-01",
        testName: "Session Token Auto-Refresh — Active User",
        result: "Pass",
        notes:
          "Token refreshed 5 minutes before expiry across Chrome, Firefox, Safari, Edge, and mobile Safari.",
      },
      {
        id: "QA-02",
        testName: "Enterprise Batch Export — 100K Records",
        result: "Pass",
        notes:
          "Export completed in 47 seconds. File integrity verified with row count checksum.",
      },
      {
        id: "QA-03",
        testName: "Inline Error Recovery — Network Failure",
        result: "Pass",
        notes:
          "Retry button appeared within 200ms of failure. Form data preserved on retry.",
      },
      {
        id: "QA-04",
        testName: "Payment Retry — Gateway Timeout Simulation",
        result: "Pass",
        notes:
          "Error surfaced to user after 3 retry attempts. Payment status updated correctly.",
      },
      {
        id: "QA-05",
        testName: "Session Timeout Redirect",
        result: "Pass",
        notes: "Users redirected to login page with return URL preserved.",
      },
      {
        id: "QA-06",
        testName: "Export Button — Enterprise Large Dataset",
        result: "Pass",
        notes: "Button enabled for enterprise accounts with datasets up to 100K rows.",
      },
    ],
    knownLimitations: [
      {
        id: "l1",
        title: "Dark mode not available on billing pages",
        description:
          "Dark mode is supported on the main dashboard but not yet on billing and invoice pages.",
      },
      {
        id: "l2",
        title: "Auto-refresh requires JavaScript enabled",
        description:
          "Session token auto-refresh will not work if JavaScript is disabled in the browser.",
      },
    ],
    migrationNotes:
      "No database migration required. Configuration change: set TOKEN_REFRESH_THRESHOLD_MINUTES to 5 in environment variables. Enable FEATURE_DARK_MODE flag in feature toggle service. Enterprise export limit can be configured per-tenant via admin settings.",
    affectedUserGroups: [
      { id: "g1", name: "Admins" },
      { id: "g2", name: "End users" },
      { id: "g3", name: "Enterprise customers" },
    ],
    risks: [
      {
        id: "r1",
        risk: "Session duration change may confuse inactive users",
        severity: "Medium",
        description:
          "Reducing session timeout from 24h to 8h could surprise users who leave tabs open overnight.",
        mitigation:
          "Add a toast notification 10 minutes before session expiry with option to extend.",
      },
      {
        id: "r2",
        risk: "Export format default change may disrupt existing workflows",
        severity: "Low",
        description:
          "Users with automated pipelines expecting XLSX will need to update their processes.",
        mitigation:
          "Document the change in release notes. Provide a setting to change default format.",
      },
    ],
    analysisId: null,
    summaryStatus: {
      technicalSummary: "pending",
      stakeholderSummary: "pending",
    },
  },
  {
    id: "rel-002",
    name: "API Rate Limiting v2",
    version: "v1.3.0",
    releaseDate: daysAhead(14),
    owner: "Marcus Johnson",
    status: "Draft",
    readiness: "Blocked",
    lastUpdated: daysAgo(3),
    description:
      "Overhauled rate limiting system with per-endpoint quotas and burst handling.",
    releaseInfo: {
      releaseName: "API Rate Limiting v2",
      version: "v1.3.0",
      releaseDate: daysAhead(14),
      owner: "Marcus Johnson",
    },
    completedFeatures: [
      {
        id: "f1",
        title: "Per-Endpoint Rate Quotas",
        description:
          "API consumers can now have different rate limits per endpoint rather than a single global limit.",
        userImpact: "Allows finer control over API usage costs.",
        evidenceRef: "QA-10",
      },
      {
        id: "f2",
        title: "Burst Capacity Headers",
        description:
          "API responses now include X-RateLimit-Burst-Remaining headers.",
        userImpact: "Developers can programmatically adjust request pacing.",
        evidenceRef: null,
      },
    ],
    bugFixes: [
      {
        id: "b1",
        title: "Rate limit counter not resetting at midnight UTC",
        description:
          "The daily rate limit counter was resetting at local server time instead of midnight UTC.",
        severity: "Medium",
        affectedUsers: "All API consumers",
        qaEvidence: "QA-11",
      },
    ],
    changedBehaviours: [
      {
        id: "c1",
        title: "Default rate limit reduced from 10,000 to 5,000 requests/hour",
        previousBehaviour: "10,000 requests per hour for standard tier.",
        newBehaviour: "5,000 requests per hour for standard tier.",
        userImpact:
          "High-volume consumers may hit limits more frequently unless upgraded.",
      },
    ],
    qaSummary:
      "Partial QA completed. Rate limiting core logic tested. Per-endpoint quota configuration still needs regression testing on production-like data volumes.",
    qaEvidence: [
      {
        id: "QA-10",
        testName: "Per-Endpoint Quota — Mixed Endpoint Load",
        result: "Pass",
        notes: "Independent quotas enforced correctly across 5 endpoints simultaneously.",
      },
      {
        id: "QA-11",
        testName: "Rate Limit Counter — UTC Midnight Reset",
        result: "Pass",
        notes: "Counter reset correctly at midnight UTC across 3 time zone simulations.",
      },
    ],
    knownLimitations: [
      {
        id: "l1",
        title: "Burst capacity not configurable per consumer",
        description:
          "Burst capacity is a global setting. Per-consumer burst configuration is planned for a future release.",
      },
    ],
    migrationNotes:
      "Update API gateway configuration to use new rate limit middleware. No schema changes required.",
    affectedUserGroups: [
      { id: "g1", name: "Developers" },
      { id: "g2", name: "Enterprise customers" },
    ],
    risks: [
      {
        id: "r1",
        risk: "Default rate limit reduction may break high-volume consumers",
        severity: "High",
        description:
          "Existing consumers hitting close to 10,000 requests/hour will be throttled under the new default.",
        mitigation:
          "Notify all API consumers 30 days in advance. Offer temporary grace period for tier upgrades.",
      },
    ],
    analysisId: null,
    summaryStatus: {
      technicalSummary: "pending",
      stakeholderSummary: "pending",
    },
  },
  {
    id: "rel-003",
    name: "Authentication Security Patch",
    version: "v3.1.1",
    releaseDate: daysAgo(2),
    owner: "Priya Patel",
    status: "Approved",
    readiness: "Ready",
    lastUpdated: daysAgo(2),
    description:
      "Critical security patch addressing CVE-2024-3812 and improving OAuth flow resilience.",
    releaseInfo: {
      releaseName: "Authentication Security Patch",
      version: "v3.1.1",
      releaseDate: daysAgo(2),
      owner: "Priya Patel",
    },
    completedFeatures: [
      {
        id: "f1",
        title: "CVE-2024-3812 Mitigation",
        description:
          "Patches token validation vulnerability that could allow session hijacking via crafted JWT headers.",
        userImpact: "No visible change. Security posture significantly improved.",
        evidenceRef: "QA-20",
      },
    ],
    bugFixes: [
      {
        id: "b1",
        title: "OAuth callback fails with special characters in state parameter",
        description:
          "OAuth state parameters containing encoded special characters were rejected by the callback handler.",
        severity: "High",
        affectedUsers: "Users with SSO providers using complex state encoding",
        qaEvidence: "QA-21",
      },
    ],
    changedBehaviours: [],
    qaSummary:
      "Full security audit completed by external team. 67 test cases passed. Penetration testing verified mitigation of CVE-2024-3812. OAuth flow tested with 8 major SSO providers.",
    qaEvidence: [
      {
        id: "QA-20",
        testName: "CVE-2024-3812 — Crafted JWT Header Attack",
        result: "Pass",
        notes: "Malicious JWT headers rejected. Session hijack attempt blocked.",
      },
      {
        id: "QA-21",
        testName: "OAuth Callback — Special Character State",
        result: "Pass",
        notes: "State parameters with encoded special characters handled correctly.",
      },
    ],
    knownLimitations: [
      {
        id: "l1",
        title: "Legacy SSO providers may need configuration update",
        description:
          "Providers using outdated OAuth 1.0a flows are not affected but should be migrated to OAuth 2.0.",
      },
    ],
    migrationNotes:
      "No configuration changes required. Deploy is a drop-in replacement for v3.1.0.",
    affectedUserGroups: [
      { id: "g1", name: "Admins" },
      { id: "g2", name: "End users" },
      { id: "g3", name: "Developers" },
    ],
    risks: [],
    analysisId: "anl-003",
    summaryStatus: {
      technicalSummary: "approved",
      stakeholderSummary: "approved",
    },
  },
  {
    id: "rel-004",
    name: "Reporting Engine Overhaul",
    version: "v4.0.0",
    releaseDate: daysAhead(21),
    owner: "David Kim",
    status: "Analyzing",
    readiness: "Needs Attention",
    lastUpdated: daysAgo(0),
    description:
      "Complete rewrite of the reporting engine with support for scheduled reports, custom templates, and PDF export.",
    releaseInfo: {
      releaseName: "Reporting Engine Overhaul",
      version: "v4.0.0",
      releaseDate: daysAhead(21),
      owner: "David Kim",
    },
    completedFeatures: [
      {
        id: "f1",
        title: "Scheduled Report Delivery",
        description:
          "Reports can now be scheduled for automatic generation and email delivery on daily, weekly, or monthly cadences.",
        userImpact: "Eliminates manual report generation for recurring needs.",
        evidenceRef: "QA-30",
      },
      {
        id: "f2",
        title: "Custom Report Templates",
        description:
          "Users can create and save custom report templates with selected metrics and visualizations.",
        userImpact: "Reduces report setup time by an estimated 60%.",
        evidenceRef: "QA-31",
      },
      {
        id: "f3",
        title: "PDF Export with Branding",
        description: "All reports can be exported as branded PDF documents.",
        userImpact: "Reports can be shared directly with external stakeholders.",
        evidenceRef: null,
      },
    ],
    bugFixes: [
      {
        id: "b1",
        title: "Report generation times out on large date ranges",
        description:
          "Reports covering more than 90 days of data would timeout and fail.",
        severity: "High",
        affectedUsers: "All reporting users",
        qaEvidence: "QA-32",
      },
    ],
    changedBehaviours: [
      {
        id: "c1",
        title: "Report API response format changed",
        previousBehaviour: "Reports returned as flat JSON arrays.",
        newBehaviour:
          "Reports returned as paginated responses with metadata envelope.",
        userImpact:
          "API consumers must update parsing logic to handle the new envelope format.",
      },
    ],
    qaSummary:
      "Core reporting engine tested. Scheduled delivery validated. PDF export tested on 5 template variations. Large date range regression still in progress.",
    qaEvidence: [
      {
        id: "QA-30",
        testName: "Scheduled Report — Weekly Delivery",
        result: "Pass",
        notes: "Report generated and emailed at configured time. 7/7 deliveries successful.",
      },
      {
        id: "QA-31",
        testName: "Custom Template — Save and Reuse",
        result: "Pass",
        notes: "Template saved correctly. Reused template produced identical report structure.",
      },
      {
        id: "QA-32",
        testName: "Large Date Range — 180 Days",
        result: "Pass",
        notes: "Report generated in 12 seconds without timeout.",
      },
    ],
    knownLimitations: [
      {
        id: "l1",
        title: "PDF export limited to 500 pages",
        description:
          "Reports exceeding 500 pages will be truncated. Pagination metadata is included.",
      },
    ],
    migrationNotes:
      "Database migration required: add report_templates table. Update API client SDK to v4.0.0 for new response format. Scheduled report jobs require Redis-backed queue worker.",
    affectedUserGroups: [
      { id: "g1", name: "Admins" },
      { id: "g2", name: "End users" },
      { id: "g3", name: "Developers" },
      { id: "g4", name: "Enterprise customers" },
    ],
    risks: [
      {
        id: "r1",
        risk: "API response format change is a breaking change",
        severity: "High",
        description:
          "Existing API consumers will break if they do not update their parsing logic.",
        mitigation:
          "Provide a compatibility mode flag for 90 days. Document migration in API changelog.",
      },
    ],
    analysisId: "anl-004",
    summaryStatus: {
      technicalSummary: "pending",
      stakeholderSummary: "pending",
    },
  },
  {
    id: "rel-005",
    name: "Mobile App Sync Improvements",
    version: "v1.8.0",
    releaseDate: daysAhead(5),
    owner: "Sarah Chen",
    status: "Rejected",
    readiness: "Blocked",
    lastUpdated: daysAgo(5),
    description:
      "Improves mobile data synchronization with delta sync and conflict resolution.",
    releaseInfo: {
      releaseName: "Mobile App Sync Improvements",
      version: "v1.8.0",
      releaseDate: daysAhead(5),
      owner: "Sarah Chen",
    },
    completedFeatures: [
      {
        id: "f1",
        title: "Delta Sync",
        description:
          "Mobile app now syncs only changed records instead of full dataset, reducing bandwidth usage by 80%.",
        userImpact: "Faster sync times on mobile networks. Reduced data usage.",
        evidenceRef: "QA-40",
      },
    ],
    bugFixes: [],
    changedBehaviours: [],
    qaSummary:
      "Delta sync tested on iOS and Android. Conflict resolution testing incomplete.",
    qaEvidence: [
      {
        id: "QA-40",
        testName: "Delta Sync — 10,000 Record Dataset",
        result: "Pass",
        notes: "Sync completed in 3 seconds vs 25 seconds with full sync.",
      },
    ],
    knownLimitations: [
      {
        id: "l1",
        title: "Conflict resolution not yet implemented",
        description:
          "When two devices edit the same record, the latest write wins without merge options.",
      },
    ],
    migrationNotes: "Requires mobile app update. No backend schema changes.",
    affectedUserGroups: [{ id: "g1", name: "End users" }],
    risks: [
      {
        id: "r1",
        risk: "Conflict resolution incomplete",
        severity: "High",
        description:
          "Last-write-wins may cause data loss when users edit on multiple devices simultaneously.",
        mitigation: "Delay release until merge conflict UI is implemented.",
      },
    ],
    analysisId: null,
    summaryStatus: {
      technicalSummary: "rejected",
      stakeholderSummary: "rejected",
    },
  },
];

export const mockAnalysisResults = {
  "rel-001": {
    id: "anl-001",
    releaseId: "rel-001",
    timestamp: daysAgo(1),
    userImpact: [
      {
        id: "ui1",
        change: "Automatic Session Token Refresh",
        impactLevel: "High Impact",
        explanation:
          "Eliminates unexpected logouts for all active users. This is a core workflow improvement affecting every authenticated session.",
        evidence: ["Feature #1", "QA-01"],
      },
      {
        id: "ui2",
        change: "Batch Data Export for Enterprise Accounts",
        impactLevel: "High Impact",
        explanation:
          "Enterprise customers can now export 10x more data in a single operation, removing a major workflow bottleneck.",
        evidence: ["Feature #2", "QA-02"],
      },
      {
        id: "ui3",
        change: "Inline Error Recovery for Failed Requests",
        impactLevel: "Medium Impact",
        explanation:
          "Improves user experience during network errors but does not change core functionality.",
        evidence: ["Feature #3", "QA-03"],
      },
      {
        id: "ui4",
        change: "Dark Mode Support for Dashboard",
        impactLevel: "Low Impact",
        explanation:
          "Nice-to-have visual improvement. Does not affect functionality or workflows.",
        evidence: ["Feature #4"],
      },
      {
        id: "ui5",
        change: "Default Session Duration Reduced",
        impactLevel: "Medium Impact",
        explanation:
          "Inactive users will be logged out sooner. Active users are unaffected due to auto-refresh.",
        evidence: ["Changed #1", "QA-01"],
      },
      {
        id: "ui6",
        change: "Export File Format Defaults to CSV",
        impactLevel: "Low Impact",
        explanation:
          "Minor workflow adjustment. Users can still select XLSX manually.",
        evidence: ["Changed #2"],
      },
    ],
    missingInformation: [
      {
        id: "mi1",
        missing: "Dark mode QA evidence",
        whyItMatters:
          "No QA evidence reference is provided for the dark mode feature. Visual regression testing results are not documented.",
        suggestedAction:
          "Add a QA evidence item covering dark mode visual regression across all supported dashboard pages.",
      },
      {
        id: "mi2",
        missing: "Rollback plan",
        whyItMatters:
          "No rollback or rollback procedure is documented. If the release causes issues, the team has no defined revert path.",
        suggestedAction:
          "Document rollback steps including feature flag toggles and database state considerations.",
      },
    ],
    unsupportedClaims: [
      {
        id: "uc1",
        claim: "Reduces unexpected logouts by an estimated 95% for active users.",
        problem:
          "The claim states 95% reduction but QA evidence only confirms that token refresh works. No metric or baseline data is provided to support the 95% figure.",
        availableEvidence: "QA-01 — confirms token refresh functions correctly.",
        confidence: "Low",
      },
      {
        id: "uc2",
        claim: "Enterprise customers no longer need to split exports into multiple batches.",
        problem:
          "While the 100K export limit is tested, there is no evidence testing edge cases where enterprise accounts have more than 100,000 records.",
        availableEvidence: "QA-02 — tested with exactly 100,000 records.",
        confidence: "Medium",
      },
    ],
    risks: [
      {
        id: "ar1",
        risk: "Session duration change may confuse inactive users",
        severity: "Medium",
        description:
          "Reducing session timeout from 24h to 8h could surprise users who leave tabs open overnight.",
        mitigation:
          "Add a toast notification 10 minutes before session expiry with option to extend.",
      },
      {
        id: "ar2",
        risk: "Export format default change may disrupt existing workflows",
        severity: "Low",
        description:
          "Users with automated pipelines expecting XLSX will need to update their processes.",
        mitigation:
          "Document the change in release notes. Provide a setting to change default format.",
      },
      {
        id: "ar3",
        risk: "Dark mode incomplete coverage",
        severity: "Low",
        description:
          "Dark mode is not available on billing pages, which may create an inconsistent visual experience.",
        mitigation:
          "Document the limitation clearly. Add dark mode to billing pages in the next release.",
      },
    ],
  },
  "rel-003": {
    id: "anl-003",
    releaseId: "rel-003",
    timestamp: daysAgo(2),
    userImpact: [
      {
        id: "ui1",
        change: "CVE-2024-3812 Mitigation",
        impactLevel: "No User Impact",
        explanation:
          "Security patch with no visible user-facing change. Critical for system integrity.",
        evidence: ["Feature #1", "QA-20"],
      },
      {
        id: "ui2",
        change: "OAuth callback special character fix",
        impactLevel: "Low Impact",
        explanation:
          "Fixes a bug affecting SSO users with complex state encoding. Improves login reliability.",
        evidence: ["Bug #1", "QA-21"],
      },
    ],
    missingInformation: [],
    unsupportedClaims: [],
    risks: [
      {
        id: "ar1",
        risk: "Legacy SSO providers may need configuration update",
        severity: "Low",
        description:
          "Providers using OAuth 1.0a are not affected but should be migrated.",
        mitigation: "Notify affected customers and provide migration documentation.",
      },
    ],
  },
  "rel-004": {
    id: "anl-004",
    releaseId: "rel-004",
    timestamp: daysAgo(0),
    userImpact: [
      {
        id: "ui1",
        change: "Scheduled Report Delivery",
        impactLevel: "High Impact",
        explanation:
          "Eliminates manual report generation. Major time saver for all reporting users.",
        evidence: ["Feature #1", "QA-30"],
      },
      {
        id: "ui2",
        change: "Custom Report Templates",
        impactLevel: "Medium Impact",
        explanation:
          "Reduces setup time but requires initial template creation effort.",
        evidence: ["Feature #2", "QA-31"],
      },
      {
        id: "ui3",
        change: "PDF Export with Branding",
        impactLevel: "Medium Impact",
        explanation:
          "Enables direct sharing with external stakeholders. No QA evidence provided yet.",
        evidence: ["Feature #3"],
      },
      {
        id: "ui4",
        change: "Report API response format changed",
        impactLevel: "High Impact",
        explanation:
          "Breaking change for all API consumers. Requires client SDK update.",
        evidence: ["Changed #1"],
      },
    ],
    missingInformation: [
      {
        id: "mi1",
        missing: "PDF export QA evidence",
        whyItMatters:
          "PDF export feature has no associated QA evidence. Visual fidelity and formatting have not been verified.",
        suggestedAction:
          "Add QA evidence items for PDF export across all template variations.",
      },
    ],
    unsupportedClaims: [
      {
        id: "uc1",
        claim: "Reduces report setup time by an estimated 60%.",
        problem:
          "No baseline measurement or comparison data is provided to support the 60% figure.",
        availableEvidence: "QA-31 — confirms template save/reuse works.",
        confidence: "Low",
      },
    ],
    risks: [
      {
        id: "ar1",
        risk: "API response format change is a breaking change",
        severity: "High",
        description:
          "Existing API consumers will break if they do not update their parsing logic.",
        mitigation:
          "Provide a compatibility mode flag for 90 days. Document migration in API changelog.",
      },
    ],
  },
};

export const mockVersions = {
  "rel-001": [
    {
      id: "ver-001-d",
      releaseId: "rel-001",
      version: "v1.0",
      createdDate: daysAgo(10),
      author: "Sarah Chen",
      status: "Draft",
      changeSummary: "Initial release package created with 4 features and 3 bug fixes.",
      snapshot: null,
    },
    {
      id: "ver-001-c",
      releaseId: "rel-001",
      version: "v1.1",
      createdDate: daysAgo(7),
      author: "Sarah Chen",
      status: "Draft",
      changeSummary: "Updated QA evidence — added QA-04 and QA-05 for payment retry and session timeout tests.",
      snapshot: null,
    },
    {
      id: "ver-001-b",
      releaseId: "rel-001",
      version: "v1.2",
      createdDate: daysAgo(4),
      author: "Marcus Johnson",
      status: "Draft",
      changeSummary: "Changed user impact description for session token refresh feature. Added dark mode feature.",
      snapshot: null,
    },
    {
      id: "ver-001-a",
      releaseId: "rel-001",
      version: "v2.0",
      createdDate: daysAgo(1),
      author: "Sarah Chen",
      status: "Needs Review",
      changeSummary: "Final review version. Added migration notes, risks, and affected user groups. Ready for analysis.",
      snapshot: null,
    },
  ],
  "rel-003": [
    {
      id: "ver-003-b",
      releaseId: "rel-003",
      version: "v1.0",
      createdDate: daysAgo(5),
      author: "Priya Patel",
      status: "Draft",
      changeSummary: "Initial security patch package.",
      snapshot: null,
    },
    {
      id: "ver-003-a",
      releaseId: "rel-003",
      version: "v2.0",
      createdDate: daysAgo(2),
      author: "Priya Patel",
      status: "Approved",
      changeSummary: "Final reviewed version after external security audit. Approved for release.",
      snapshot: null,
    },
  ],
  "rel-004": [
    {
      id: "ver-004-b",
      releaseId: "rel-004",
      version: "v1.0",
      createdDate: daysAgo(5),
      author: "David Kim",
      status: "Draft",
      changeSummary: "Initial reporting engine overhaul package.",
      snapshot: null,
    },
    {
      id: "ver-004-a",
      releaseId: "rel-004",
      version: "v2.0",
      createdDate: daysAgo(0),
      author: "David Kim",
      status: "Analyzing",
      changeSummary: "Added PDF export feature and updated QA evidence. Submitted for analysis.",
      snapshot: null,
    },
  ],
};

export const mockVersionSnapshots = {
  "rel-001": {
    "v1.0": {
      completedFeatures: [
        { title: "Automatic Session Token Refresh", userImpact: "Reduces unexpected logouts.", evidenceRef: "QA-01" },
        { title: "Batch Data Export for Enterprise Accounts", userImpact: "Enterprise customers can export more data.", evidenceRef: "QA-02" },
        { title: "Inline Error Recovery for Failed Requests", userImpact: "Users can retry failed actions.", evidenceRef: "QA-03" },
      ],
      bugFixes: [
        { title: "Payment Retry Logic Fails Silently", severity: "High", qaEvidence: "QA-04" },
        { title: "Session Timeout Redirects to Wrong Page", severity: "Medium", qaEvidence: "QA-05" },
      ],
      changedBehaviours: [
        { title: "Default Session Duration Reduced", newBehaviour: "Sessions now last 8 hours of inactivity." },
      ],
      qaSummary: "QA completed 100 test cases, 98 passed.",
      knownLimitations: [{ title: "Dark mode not available on billing pages" }],
      affectedUserGroups: [{ name: "Admins" }, { name: "End users" }],
      risks: [],
    },
    "v1.1": {
      completedFeatures: [
        { title: "Automatic Session Token Refresh", userImpact: "Reduces unexpected logouts.", evidenceRef: "QA-01" },
        { title: "Batch Data Export for Enterprise Accounts", userImpact: "Enterprise customers can export more data.", evidenceRef: "QA-02" },
        { title: "Inline Error Recovery for Failed Requests", userImpact: "Users can retry failed actions.", evidenceRef: "QA-03" },
      ],
      bugFixes: [
        { title: "Payment Retry Logic Fails Silently", severity: "High", qaEvidence: "QA-04" },
        { title: "Session Timeout Redirects to Wrong Page", severity: "Medium", qaEvidence: "QA-05" },
        { title: "Export Button Disabled on Large Datasets", severity: "Medium", qaEvidence: "QA-06" },
      ],
      changedBehaviours: [
        { title: "Default Session Duration Reduced", newBehaviour: "Sessions now last 8 hours of inactivity." },
      ],
      qaSummary: "QA completed 120 test cases, 118 passed.",
      knownLimitations: [{ title: "Dark mode not available on billing pages" }],
      affectedUserGroups: [{ name: "Admins" }, { name: "End users" }],
      risks: [],
    },
    "v1.2": {
      completedFeatures: [
        { title: "Automatic Session Token Refresh", userImpact: "Reduces unexpected logouts by an estimated 95% for active users.", evidenceRef: "QA-01" },
        { title: "Batch Data Export for Enterprise Accounts", userImpact: "Enterprise customers no longer need to split exports into multiple batches.", evidenceRef: "QA-02" },
        { title: "Inline Error Recovery for Failed Requests", userImpact: "Users can retry failed actions without navigating away or losing form data.", evidenceRef: "QA-03" },
        { title: "Dark Mode Support for Dashboard", userImpact: "Improves readability in low-light environments.", evidenceRef: null },
      ],
      bugFixes: [
        { title: "Payment Retry Logic Fails Silently", severity: "High", qaEvidence: "QA-04" },
        { title: "Session Timeout Redirects to Wrong Page", severity: "Medium", qaEvidence: "QA-05" },
        { title: "Export Button Disabled on Large Datasets", severity: "Medium", qaEvidence: "QA-06" },
      ],
      changedBehaviours: [
        { title: "Default Session Duration Reduced", newBehaviour: "Sessions now last 8 hours of inactivity, refreshing automatically for active users." },
        { title: "Export File Format Defaults to CSV", newBehaviour: "Exports now default to CSV, with XLSX available as a secondary option." },
      ],
      qaSummary: "QA completed 142 test cases, 139 passed, 3 known failures documented.",
      knownLimitations: [
        { title: "Dark mode not available on billing pages" },
        { title: "Auto-refresh requires JavaScript enabled" },
      ],
      affectedUserGroups: [{ name: "Admins" }, { name: "End users" }],
      risks: [],
    },
    "v2.0": {
      completedFeatures: [
        { title: "Automatic Session Token Refresh", userImpact: "Reduces unexpected logouts by an estimated 95% for active users.", evidenceRef: "QA-01" },
        { title: "Batch Data Export for Enterprise Accounts", userImpact: "Enterprise customers no longer need to split exports into multiple batches.", evidenceRef: "QA-02" },
        { title: "Inline Error Recovery for Failed Requests", userImpact: "Users can retry failed actions without navigating away or losing form data.", evidenceRef: "QA-03" },
        { title: "Dark Mode Support for Dashboard", userImpact: "Improves readability in low-light environments.", evidenceRef: null },
      ],
      bugFixes: [
        { title: "Payment Retry Logic Fails Silently", severity: "High", qaEvidence: "QA-04" },
        { title: "Session Timeout Redirects to Wrong Page", severity: "Medium", qaEvidence: "QA-05" },
        { title: "Export Button Disabled on Large Datasets", severity: "Medium", qaEvidence: "QA-06" },
      ],
      changedBehaviours: [
        { title: "Default Session Duration Reduced", newBehaviour: "Sessions now last 8 hours of inactivity, refreshing automatically for active users." },
        { title: "Export File Format Defaults to CSV", newBehaviour: "Exports now default to CSV, with XLSX available as a secondary option." },
      ],
      qaSummary: "QA completed 142 test cases, 139 passed, 3 known failures documented. Payment retry logic verified with simulated gateway failures. Session token refresh tested across 5 browser environments.",
      knownLimitations: [
        { title: "Dark mode not available on billing pages" },
        { title: "Auto-refresh requires JavaScript enabled" },
      ],
      affectedUserGroups: [{ name: "Admins" }, { name: "End users" }, { name: "Enterprise customers" }],
      risks: [
        { risk: "Session duration change may confuse inactive users", severity: "Medium" },
        { risk: "Export format default change may disrupt existing workflows", severity: "Low" },
      ],
    },
  },
};

export const mockStaleStatements = {
  "rel-001": [
    {
      id: "ss1",
      statement: "Payment retry is fully supported.",
      status: "Stale",
      reason:
        "The release package changed and the latest QA evidence no longer supports this statement. QA-04 was updated to show the retry logic works but with caveats around gateway-specific timeout handling.",
      evidenceRef: "QA-04",
    },
    {
      id: "ss2",
      statement: "Dark mode is available across all portal pages.",
      status: "Stale",
      reason:
        "This statement was made in v1.2 but the known limitations section was updated in v2.0 to clarify that billing pages do not support dark mode.",
      evidenceRef: "Feature #4",
    },
  ],
};

export const mockGeneratedSummaries = {
  "rel-001": {
    technical: {
      releaseOverview:
        "Customer Portal Reliability Release v2.4.0 improves session management, data export capabilities, error recovery, and adds dark mode support. Targeted at reducing unexpected logouts and improving enterprise data workflows.",
      technicalChanges:
        "Session token auto-refresh implemented with a 5-minute pre-expiry threshold. Export limit raised from 10,000 to 100,000 records for enterprise tenants. Inline error recovery uses exponential backoff with max 3 retries.",
      bugFixes:
        "1. Payment Retry Logic Fails Silently (High) — Error now surfaced after 3 retry attempts [QA-04]. 2. Session Timeout Redirect (Medium) — Now redirects to login with return URL [QA-05]. 3. Export Button Disabled on Large Datasets (Medium) — Button correctly enabled for enterprise accounts [QA-06].",
      changedBehaviour:
        "1. Default session duration reduced from 24h to 8h with auto-refresh for active users. 2. Export default format changed from XLSX to CSV.",
      qaStatus:
        "142 test cases executed, 139 passed, 3 known failures documented. Full regression on staging. Payment retry verified with simulated gateway failures.",
      knownLimitations:
        "1. Dark mode not available on billing pages. 2. Auto-refresh requires JavaScript enabled.",
      migrationNotes:
        "Set TOKEN_REFRESH_THRESHOLD_MINUTES=5. Enable FEATURE_DARK_MODE flag. Configure enterprise export limit per-tenant.",
      risks:
        "1. Session duration change may confuse inactive users (Medium). 2. Export format default change may disrupt existing workflows (Low). 3. Dark mode incomplete coverage (Low).",
      evidenceRefs: ["QA-01", "QA-02", "QA-03", "QA-04", "QA-05", "QA-06"],
    },
    stakeholder: {
      whatChanged:
        "This release makes the customer portal more reliable. You will experience fewer unexpected logouts, faster large data exports, and clearer error messages when something goes wrong. We have also added a dark mode option for the dashboard.",
      benefits:
        "Fewer interruptions from unexpected logouts. Enterprise teams can export large datasets in one step instead of multiple batches. When errors occur, you can retry directly without losing your work.",
      importantFixes:
        "Fixed an issue where payment retries failed silently. Fixed session timeout redirecting to the wrong page. Fixed export button being incorrectly disabled for enterprise customers.",
      knownLimitations:
        "Dark mode is not yet available on billing and invoice pages. Session auto-refresh requires JavaScript to be enabled in your browser.",
      actionRequired:
        "No action required for most users. Enterprise administrators may want to configure per-tenant export limits. Users who leave tabs open overnight will now be logged out after 8 hours of inactivity.",
      readiness:
        "The release is ready for human review. All critical features have been tested by QA. Some documentation gaps remain around dark mode testing and rollback procedures.",
    },
  },
  "rel-003": {
    technical: {
      releaseOverview:
        "Authentication Security Patch v3.1.1 addresses CVE-2024-3812 and fixes OAuth callback handling. Drop-in replacement for v3.1.0.",
      technicalChanges:
        "JWT header validation hardened against crafted payloads. OAuth state parameter decoding updated to handle encoded special characters.",
      bugFixes: "OAuth callback fails with special characters in state parameter (High) — Fixed [QA-21].",
      changedBehaviour: "No user-facing behaviour changes.",
      qaStatus: "67 test cases passed. External security audit completed. Penetration testing verified.",
      knownLimitations: "Legacy SSO providers using OAuth 1.0a should be migrated to OAuth 2.0.",
      migrationNotes: "No configuration changes required. Drop-in deployment.",
      risks: "Legacy SSO providers may need configuration update (Low).",
      evidenceRefs: ["QA-20", "QA-21"],
    },
    stakeholder: {
      whatChanged:
        "This is a security update that fixes a critical vulnerability in the login system. There are no visible changes to how the application works.",
      benefits:
        "Improves security of user sessions. Fixes login issues for some single sign-on (SSO) providers.",
      importantFixes: "Fixed login failures for SSO providers using complex security parameters.",
      knownLimitations:
        "Organizations using very old single sign-on configurations may need a minor update.",
      actionRequired: "No action required. This update applies automatically.",
      readiness: "Approved and ready for release. All security tests passed.",
    },
  },
  "rel-004": {
    technical: {
      releaseOverview:
        "Reporting Engine Overhaul v4.0.0 introduces scheduled reports, custom templates, and PDF export. Includes breaking API change.",
      technicalChanges:
        "Report API now returns paginated responses with metadata envelope. Scheduled delivery uses Redis-backed queue. Custom templates stored in new report_templates table.",
      bugFixes: "Report generation times out on large date ranges (High) — Fixed, 180-day range now completes in 12s [QA-32].",
      changedBehaviour:
        "Report API response format changed from flat JSON arrays to paginated responses with metadata envelope. Breaking change for all API consumers.",
      qaStatus: "Core engine tested. Scheduled delivery validated. PDF export tested on 5 templates. Large date range regression in progress.",
      knownLimitations: "PDF export limited to 500 pages.",
      migrationNotes: "Database migration: add report_templates table. Update API client SDK to v4.0.0. Requires Redis-backed queue worker.",
      risks: "API response format change is a breaking change (High).",
      evidenceRefs: ["QA-30", "QA-31", "QA-32"],
    },
    stakeholder: {
      whatChanged:
        "We have completely upgraded the reporting system. You can now schedule reports to be generated and emailed automatically, create custom templates for recurring reports, and export reports as branded PDF documents.",
      benefits:
        "Save time by scheduling recurring reports instead of generating them manually. Create templates once and reuse them. Share professional branded PDF reports directly with clients.",
      importantFixes: "Fixed an issue where reports covering more than 90 days of data would fail to generate.",
      knownLimitations: "PDF reports are limited to 500 pages. Very large reports will be trimmed.",
      actionRequired:
        "If you use the reporting API directly, you will need to update your integration to handle the new response format. We provide a compatibility mode for 90 days.",
      readiness: "Ready for human review. PDF export testing evidence is still being completed.",
    },
  },
};
