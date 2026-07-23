// field-registry.mjs
// Single source of truth mapping [Bracket Syntax] placeholders in the .docx
// FORM templates to fillable docxtemplater fields for the PSAP Artifact Library.
//
// SEED generated from all 33 docx forms in public/templates/forms/.
// Distinct normalized brackets: 258 -> field:74  enum:19  instructional:103
//                                        ignore:5  ambiguous:57
//
// This module is imported by BOTH the Node build scripts (scripts/*.mjs) and the
// Next/TS app (@/lib/field-registry.mjs). Keep it dependency-free ESM. Types live
// in field-registry.d.mts.
/** @typedef {import('./field-registry.d.mts').FieldDef} FieldDef */
/** @typedef {import('./field-registry.d.mts').LoopDef}  LoopDef */
/** @typedef {import('./field-registry.d.mts').BracketClass} BracketClass */

/**
 * Normalize a raw bracket so aliases match regardless of case / entity / quote
 * form: strip [], decode XML entities, fold curly quotes -> straight, collapse
 * whitespace, trim, lowercase. Idempotent on already-normalized input.
 * @param {string} raw
 * @returns {string}
 */
export function normalizeBracket(raw) {
  let s = String(raw).replace(/^\[/, '').replace(/\]$/, '');
  s = s
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    // Decode &amp; LAST: unescaping the '&' meta-entity first would let a
    // literally-encoded entity like "&amp;lt;" (text "&lt;") be re-decoded
    // into "<". (CodeQL js/double-escaping.)
    .replace(/&amp;/g, '&');
  s = s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  s = s.replace(/\s+/g, ' ').trim().toLowerCase();
  return s;
}

/** @type {FieldDef[]} */
export const FIELDS = [
  // ── 10 EXISTING canonical fields (verbatim ids/labels/autoFill) ──────────
  // `shared: true` = one document-wide value; repeats intentionally collapse to
  // one tag. Everything else disambiguates per occurrence (see the converter).
  { id: 'agencyName',            label: 'Agency Name',               type: 'text', autoFill: 'name',          shared: true, aliases: ['agency name'] },
  // A ROLE, not a person: [Director / Coordinator] is the responsible role, so it
  // is NOT auto-filled with the director's name — the user confirms the role text.
  { id: 'directorName',          label: 'Director / Coordinator',    type: 'text', shared: true, placeholder: 'a role, e.g. PSAP Director — not a person’s name', aliases: ['director / coordinator', 'the director', 'director', 'director / coordinator or designated adjudicating authority'] },
  { id: 'directorEmail',         label: 'Director Email',            type: 'text', autoFill: 'directorEmail', shared: true, aliases: [] }, // no bracket in corpus; autofill only
  { id: 'signingOfficialTitle',  label: 'Signing Official & Title',  type: 'text', shared: true, placeholder: 'e.g. Jane Smith, PSAP Director', aliases: ['signing official / title', 'signing official'] },
  // NOT shared: [Date] / [#] are reused for distinct cells (Effective Date vs
  // Next Review vs revision date; Version vs table counts). Non-shared means each
  // occurrence disambiguates into its own field; the builder labels them from the
  // adjacent document text (see docx-view context labels).
  { id: 'effectiveDate',         label: 'Effective Date',            type: 'date', aliases: ['date'] },
  { id: 'version',               label: 'Version',                   type: 'text', placeholder: '1.0', aliases: ['#'] },
  { id: 'ownerRole',             label: 'Owner Role',                type: 'text', placeholder: 'e.g. PSAP Director', aliases: ['owner role'] },
  { id: 'reviewerRole',          label: 'Reviewer Role',             type: 'text', placeholder: 'e.g. IT Supervisor', aliases: ['role'] }, // broad token; per-table it may be a loop column — override in LoopDefs
  { id: 'approvingOfficialTitle',label: 'Approving Official & Title',type: 'text', shared: true, placeholder: 'e.g. County Manager', aliases: ['approving official / title'] },
  { id: 'revisionNote',          label: 'Initial Revision Note',     type: 'text', shared: true, placeholder: 'Initial issue', aliases: ['initial issue'] },

  // ── Curated recurring head (>=3 templates) ───────────────────────────────
  { id: 'roleTitle',             label: 'Role Title',                type: 'text', aliases: ['role title', 'role / title'] },
  { id: 'allPersonnel',          label: 'All Personnel (scope)',     type: 'text', placeholder: 'e.g. All telecommunicators and staff', aliases: ['all personnel'] },
  { id: 'itSupport',             label: 'IT Support Model',          type: 'select', options: ['County IT', 'Vendor', 'In-house'], aliases: ['it support (county / vendor / in-house)', 'it support', 'it provider: county it / contractor / in-house'] }, // composite: options curated by hand, NOT '/'-split
  { id: 'period',                label: 'Reporting Period',          type: 'text', placeholder: 'e.g. Q3 2026', aliases: ['period'] },
  { id: 'dispatchSupervisor',    label: 'Dispatch Supervisor',       type: 'text', aliases: ['dispatch supervisor', 'dispatch supervisor or operations lead', 'operations supervisor'] },
  { id: 'entryName',             label: 'Name',                      type: 'text', aliases: ['name'] }, // ambiguous person-vs-system; kept generic
  { id: 'timeframe',             label: 'Timeframe',                 type: 'text', placeholder: 'e.g. within 24 hours', aliases: ['timeframe'] },
  { id: 'action',                label: 'Action',                    type: 'textarea', aliases: ['action'] },
  { id: 'notes',                 label: 'Notes',                     type: 'textarea', aliases: ['notes'] },
  { id: 'recommendation',        label: 'Recommendation',            type: 'textarea', aliases: ['recommendation'] },
  { id: 'finding',               label: 'Finding',                   type: 'textarea', aliases: ['finding'] },
  { id: 'systemOwnerRole',       label: 'System Owner (role)',       type: 'text', aliases: ['system owner (role)', 'system owner role', 'system / data owner'] },
  { id: 'securityReviewerRole',  label: 'Security Reviewer (role)',  type: 'text', aliases: ['security reviewer (role)', 'security reviewer', 'security coordinator / log reviewer'] },

  // ── Curated reusable roles / values (1-2 templates, clearly reusable) ─────
  { id: 'assessorRole',          label: 'Assessor (role)',           type: 'text', aliases: ['assessor (role)'] },
  { id: 'reviewedByRole',        label: 'Reviewed By (role)',        type: 'text', aliases: ['reviewed by (role)'] },
  { id: 'preparedByRole',        label: 'Prepared By (role)',        type: 'text', aliases: ['prepared by (role)'] },
  { id: 'recordedByRole',        label: 'Recorded By (role)',        type: 'text', aliases: ['recorded by (role)'] },
  { id: 'acknowledgedByRole',    label: 'Acknowledged By (Board / leadership chair)', type: 'text', aliases: ['acknowledged by (board / leadership chair)'] },
  { id: 'chairRole',             label: 'Chair / Presiding Official', type: 'text', aliases: ['chair / presiding official'] },
  { id: 'authorizingOfficialTitle', label: 'Authorizing Official & Title', type: 'text', aliases: ['authorizing official / title'] },
  { id: 'authorizedRepresentative', label: 'Authorized Representative', type: 'text', aliases: ['authorized representative'] },
  { id: 'boardLeadershipBody',   label: 'Board / Leadership Body',   type: 'text', aliases: ['board / leadership body', 'the board / leadership'] },
  { id: 'facilityAdmin',         label: 'Facility / Access Administrator', type: 'text', aliases: ['facility / access administrator'] },
  { id: 'hrTrainingCoordinator', label: 'HR / Training Coordinator', type: 'text', aliases: ['hr / training coordinator', 'hr / training coordinator role', 'training / security coordinator'] },
  { id: 'dataGovernanceRole',    label: 'Data Governance Role',      type: 'text', aliases: ['data governance role'] },
  { id: 'changeApproverRole',    label: 'Change Approver / Advisory Role', type: 'text', aliases: ['change approver / advisory role'] },
  { id: 'itLead',                label: 'County IT / Vendor Lead',   type: 'text', aliases: ['county it or vendor lead', 'county or contracted it lead'] },
  { id: 'location',              label: 'Location',                  type: 'text', aliases: ['location', 'room / video bridge'] },
  { id: 'startTime',             label: 'Start Time',                type: 'text', aliases: ['start'] },
  { id: 'endTime',               label: 'End Time',                  type: 'text', aliases: ['end'] },
  { id: 'assetId',               label: 'Asset ID (Master Asset Inventory)', type: 'text', aliases: ['id from master asset inventory'] },
  { id: 'systemName',            label: 'System Name',               type: 'text', aliases: ['system name'] },
  { id: 'vendorName',            label: 'Vendor / Contractor Name',  type: 'text', aliases: ['vendor', 'vendor name', 'vendor / contractor name', 'vendor / product name'] },
  { id: 'fullName',              label: 'Full Name',                 type: 'text', aliases: ['full name', 'full name of person acknowledging', 'acknowledging individual'] },
  { id: 'partyA',                label: 'Party A (Agency)',          type: 'text', aliases: ['party a', 'party a (agency)'] },
  { id: 'partyB',                label: 'Party B (Vendor)',          type: 'text', aliases: ['party b', 'party b (vendor)'] },
  { id: 'riskRef',               label: 'Risk / POA&M Reference',    type: 'text', placeholder: 'RISK-### / POA&M-###', aliases: ['risk ref', 'risk-### / poa&m-###'] },
  { id: 'changeRef',             label: 'Change Reference',          type: 'text', aliases: ['change ref'] },
  { id: 'allowedTraffic',        label: 'Allowed Traffic / ACL Summary', type: 'textarea', aliases: ['allowed traffic / acl summary'] },

  // ── ENUMS (closed choice sets → select) ──────────────────────────────────
  { id: 'yesNo',                 label: 'Yes / No',                  type: 'select', options: ['Y', 'N'], aliases: ['y / n', 'y/n'] },
  { id: 'severityHml',           label: 'Severity',                  type: 'select', options: ['High', 'Med', 'Low'], aliases: ['high / med / low', 'h/m/l'] },
  { id: 'impactLevel',           label: 'Impact Level',              type: 'select', options: ['High', 'Moderate', 'Low'], aliases: ['high / moderate / low'] },
  { id: 'reviewCadence',         label: 'Review Cadence',            type: 'select', options: ['Weekly', 'Monthly', 'Quarterly', 'Annually'], aliases: ['quarterly', 'annually', 'monthly', 'weekly'] },
  { id: 'conformance',           label: 'Conformance',               type: 'select', options: ['Conforms', 'Gap', 'N/A'], aliases: ['conforms / gap / n/a'] },
  { id: 'statusOpen',            label: 'Status',                    type: 'select', options: ['Open', 'In progress', 'Closed'], aliases: ['open / in progress / closed', 'open / in progress', 'open'] },
  { id: 'environment',           label: 'Environment',               type: 'select', options: ['Production', 'Test', 'DR'], aliases: ['production / test / dr'] },
  { id: 'hostingModel',          label: 'Hosting Model',             type: 'select', options: ['On-prem', 'Cloud', 'Site'], aliases: ['on-prem / cloud / site'] },
  { id: 'implementationStatus',  label: 'Implementation Status',     type: 'select', options: ['In place', 'Partial', 'Planned'], aliases: ['in place / partial / planned'] },
  { id: 'currentDue',            label: 'Current / Due',             type: 'select', options: ['Current', 'Due'], aliases: ['current / due'] },
  { id: 'trendArrow',            label: 'Trend',                     type: 'select', options: ['↑', '↓', 'flat'], aliases: ['↑ / ↓ / flat'] },
  { id: 'criticality',           label: 'Criticality',               type: 'select', options: ['Critical', 'Important', 'Supporting'], aliases: ['critical / important / supporting: from the asset criticality ranking matrix'] },
  // A mandated two-way choice on the access-request form: the outer "[Permanent /
  // Temporary]" bracket is the decision; the temporary end date is its own field.
  { id: 'accessDuration',        label: 'Access Duration',           type: 'select', options: ['Permanent', 'Temporary'], aliases: ['permanent / temporary', 'permanent or temporary'] },

  // ── Dates (beyond the shared [Date] → effectiveDate) ─────────────────────
  { id: 'temporaryEndDate',      label: 'Temporary End Date',        type: 'date', aliases: ['temporary end date'] },

  // ── Ambiguous-bracket triage (2026-07-23, adversarially verified) ─────────
  // Enum choices that had been left literal → dropdowns.
  { id: 'routingMethod',   label: 'Routing Method',   type: 'select', options: ['ESInet re-route', 'Ten-digit transfer', 'Radio patch'], aliases: ['the agreed method: esinet re-route, ten-digit transfer, or radio patch'] }, // A-021
  { id: 'mfaMethod',       label: 'MFA Method',       type: 'select', options: ['Authenticator app', 'Hardware token', 'One-time code'], aliases: ['authenticator app / hardware token / one-time code'] }, // A-040
  { id: 'deviceClass',     label: 'Device Class',     type: 'select', options: ['General endpoint', 'Email server', 'VoIP or multimedia server'], aliases: ['general endpoint / email server / voip or multimedia server'] }, // A-119
  { id: 'timeSourceType',  label: 'Time Source Type', type: 'select', options: ['Internal NTP', 'GPS', 'External NTP'], aliases: ['internal ntp / gps / external ntp'] }, // A-138
  // Genuine fill-in prompts that had been left literal → labeled fields.
  { id: 'systemsInScope',               label: 'Systems in Scope',                type: 'textarea', aliases: ['name the public-safety systems in scope: cad, esinet/ngcs, radio, ali/gis, recording, network'] }, // A-008
  { id: 'alternateSiteLocationAndSetup', label: 'Alternate Site Location and Setup', type: 'textarea', aliases: ['location, and how call taking and dispatch are stood up there'] }, // A-019
  { id: 'mobileOrFallbackOption',       label: 'Mobile or Fallback Option',       type: 'text',     aliases: ['mobile command unit or radio dispatch, if any'] }, // A-019
  { id: 'excludedSystems',              label: 'Excluded Systems',                type: 'textarea', aliases: ['systems another agency owns and backs up under a separate agreement. if none, state none'] }, // A-022
  { id: 'providersAndAssessmentPeriod', label: 'Providers and Assessment Period', type: 'textarea', aliases: ['providers assessed and period; itemize in the providers assessed table below'] }, // A-076
  { id: 'vendorServiceType',            label: 'Service',                         type: 'text',     aliases: ['cad / gis / voip / cloud storage'] }, // A-076
  { id: 'monitoringMethod',             label: 'Monitoring Method',               type: 'text',     aliases: ['vendor soc report / posture tool / attestations / advisories'] }, // A-076
  { id: 'toolMethodology',              label: 'Tool / Methodology',              type: 'textarea', aliases: ['scanner, authenticated scan, or penetration test; rules of engagement'] }, // A-081
  { id: 'deliveryMethods',              label: 'Delivery Methods',                type: 'textarea', aliases: ['methods, for example short online modules, briefings at shift change, tabletop participation, and phishing simulations'] }, // A-086
  { id: 'completionTargets',            label: 'Completion Targets',              type: 'textarea', aliases: ['for example, all staff complete annual awareness training; new hires complete the baseline before system access is granted'] }, // A-086
  { id: 'dataSensitivity',              label: 'Data Sensitivity',                type: 'textarea', aliases: ['classification tier(s) the system handles: from the data classification policy; note if cjis-regulated data is in scope'] }, // A-092
  { id: 'ntpServiceAndVersion',         label: 'NTP Service and Version',         type: 'textarea', aliases: ['service and version, on all synchronized hosts'] }, // A-138
  { id: 'failoverBehavior',             label: 'Failover Behavior',               type: 'textarea', aliases: ['automatic to gps or secondary; holdover period'] }, // A-138
  { id: 'cadPrimaryAndCounterpart',     label: 'CAD Primary and Counterpart',     type: 'text',     aliases: ['primary cad; backup cad or manual procedures'] }, // A-143
  // Recurring fields (curated once they recurred across >=3 forms).
  { id: 'itSupportLead',                    label: 'IT Support Lead',                     type: 'text', aliases: ['it support lead'] },
  { id: 'personnelCorrectiveActionProcess', label: 'Personnel Corrective Action Process', type: 'text', aliases: ['personnel corrective action process'] },
  { id: 'completedByRole',                  label: 'Completed By (role)',                 type: 'text', aliases: ['completed by role'] },
];

/**
 * PROPOSED loops for matrix-heavy forms. Each requires template authoring
 * ({#loopId}...{/loopId} sections) before activation. Sub-fields reuse FIELDS
 * ids/aliases where possible; row-only sub-fields are inlined.
 * @type {LoopDef[]}
 */
export const LOOPS = [
  {
    id: 'systems', label: 'System inventory rows', proposed: true, maxRows: 50,
    templateHint: 'A-093 / A-092 — system profile table',
    fields: [
      { id: 'systemName',  label: 'System Name', type: 'text', aliases: ['system name'] },
      { id: 'assetId',     label: 'Asset ID',    type: 'text', aliases: ['id from master asset inventory'] },
      { id: 'environment', label: 'Environment', type: 'select', options: ['Production', 'Test', 'DR'], aliases: ['production / test / dr'] },
      { id: 'hostingModel',label: 'Hosting',     type: 'select', options: ['On-prem', 'Cloud', 'Site'], aliases: ['on-prem / cloud / site'] },
      { id: 'ownerRole',   label: 'Owner',       type: 'text', aliases: [] },
    ],
  },
  {
    // AUTHORED demo loop (proposed:false): the RBAC data row in A-093 is wrapped
    // with {#accessEntitlements}...{/accessEntitlements}. Fields match the row's
    // actual columns so the builder labels them cleanly.
    id: 'accessEntitlements', label: 'Access Entitlement Rows', proposed: false, maxRows: 100,
    templateHint: 'A-093 — role-based access control matrix (authored demo loop)',
    fields: [
      { id: 'roleGroup',                  label: 'Role / Group',        type: 'text',     aliases: [] },
      { id: 'entitlementRef',             label: 'Entitlement Ref',     type: 'text',     aliases: [] },
      { id: 'permissionsActuallyGranted', label: 'Permissions Granted', type: 'textarea', aliases: [] },
      { id: 'groupInheritance',           label: 'Group / Inheritance', type: 'text',     aliases: [] },
    ],
  },
  {
    id: 'interconnections', label: 'Interconnection rows', proposed: true, maxRows: 40,
    templateHint: 'A-092 — system interconnections table',
    fields: [
      { id: 'party',          label: 'System or Party',      type: 'text', aliases: ['system or party'] },
      { id: 'dataDirection',  label: 'Direction / Data',     type: 'text', aliases: ['inbound / outbound / both: what data'] },
      { id: 'protocolPort',   label: 'Protocol / Port',      type: 'text', aliases: ['protocol / port'] },
      { id: 'connectionType', label: 'Connection Type',      type: 'text', aliases: ['connection type'] },
      { id: 'date',           label: 'Date',                 type: 'date', aliases: ['date'] },
    ],
  },
  {
    id: 'controls', label: 'Control implementation rows', proposed: true, maxRows: 60,
    templateHint: 'A-092 — control implementation table',
    fields: [
      { id: 'controlArea',          label: 'Control Area',          type: 'text', aliases: ['control area'] },
      { id: 'implementationStatus', label: 'Status', type: 'select', options: ['In place', 'Partial', 'Planned'], aliases: ['in place / partial / planned'] },
      { id: 'notes',                label: 'Notes',                 type: 'textarea', aliases: ['notes'] },
    ],
  },
  {
    id: 'baselineSettings', label: 'Baseline setting rows', proposed: true, maxRows: 60,
    templateHint: 'A-117 — configuration baseline table',
    fields: [
      { id: 'setting',       label: 'Setting',        type: 'text', aliases: ['setting'] },
      { id: 'approvedValue', label: 'Approved Value', type: 'text', aliases: ['approved value'] },
      { id: 'conforms',      label: 'Conforms', type: 'select', options: ['Y', 'N'], aliases: ['y / n'] },
      { id: 'notes',         label: 'Notes',          type: 'textarea', aliases: ['notes'] },
    ],
  },
  {
    id: 'networkZones', label: 'Network zone rows', proposed: true, maxRows: 40,
    templateHint: 'A-117 / A-148 — network zone & controlled-area map',
    fields: [
      { id: 'zone',           label: 'Zone',                 type: 'text', aliases: ['zone'] },
      { id: 'purpose',        label: 'Purpose',              type: 'text', aliases: ['purpose'] },
      { id: 'allowedTraffic', label: 'Allowed Traffic / ACL',type: 'textarea', aliases: ['allowed traffic / acl summary'] },
      { id: 'accessMethod',   label: 'Access Method',        type: 'text', aliases: [] }, // A-148 sample cells are instructional
      { id: 'ownerRole',      label: 'Owner',                type: 'text', aliases: [] },
      { id: 'changeRef',      label: 'Change Ref',           type: 'text', aliases: ['change ref'] },
    ],
  },
  {
    id: 'leadershipDecisions', label: 'Leadership decision rows', proposed: true, maxRows: 30,
    templateHint: 'A-023 / A-028 — decisions & actions log',
    fields: [
      { id: 'item',      label: 'Decision Item', type: 'text', aliases: ['decision or priority', 'decision'] },
      { id: 'ownerRole', label: 'Owner',         type: 'text', aliases: [] },
      { id: 'action',    label: 'Action',        type: 'textarea', aliases: ['action'] },
      { id: 'riskRef',   label: 'Reference',     type: 'text', aliases: ['ref'] },
      { id: 'date',      label: 'Date',          type: 'date', aliases: ['date'] },
    ],
  },
  {
    id: 'openFindings', label: 'Open finding rows', proposed: true, maxRows: 50,
    templateHint: 'A-023 / A-165 — open findings register',
    fields: [
      { id: 'finding',        label: 'Finding',        type: 'textarea', aliases: ['finding'] },
      { id: 'severityHml',    label: 'Severity', type: 'select', options: ['High', 'Med', 'Low'], aliases: ['high / med / low'] },
      { id: 'recommendation', label: 'Recommendation', type: 'textarea', aliases: ['recommendation'] },
      { id: 'action',         label: 'Remediation',    type: 'textarea', aliases: ['action'] },
      { id: 'statusOpen',     label: 'Status', type: 'select', options: ['Open', 'In progress', 'Closed'], aliases: ['open / in progress / closed', 'open / in progress'] },
      { id: 'date',           label: 'Date',           type: 'date', aliases: ['date'] },
    ],
  },
  {
    id: 'attendees', label: 'Meeting attendee rows', proposed: true, maxRows: 40,
    templateHint: 'A-028 — leadership review attendees',
    fields: [
      { id: 'entryName', label: 'Name',      type: 'text', aliases: ['name'] },
      { id: 'roleTitle', label: 'Role / Title', type: 'text', aliases: ['role / title'] },
      { id: 'present',   label: 'Present', type: 'select', options: ['Y', 'N'], aliases: ['y/n'] },
    ],
  },
  {
    id: 'coLocation', label: 'Co-location / equipment rows', proposed: true, maxRows: 30,
    templateHint: 'A-165 — server-room co-location assessment',
    fields: [
      { id: 'equipment',           label: 'Equipment',            type: 'text', aliases: ['equipment'] },
      { id: 'otherParty',          label: 'Other Agency / Dept',  type: 'text', aliases: ['other agency / department'] },
      { id: 'coLocationRisk',      label: 'Co-location Risk',     type: 'textarea', aliases: ['risk from co-location'] },
      { id: 'compensatingControl', label: 'Compensating Control', type: 'textarea', aliases: ['compensating control'] },
    ],
  },
  {
    id: 'assessmentItems', label: 'Hardening assessment rows', proposed: true, maxRows: 60,
    templateHint: 'A-165 — hardening checklist',
    fields: [
      { id: 'controlArea', label: 'Check / Control',  type: 'text', aliases: ['control area'] },
      { id: 'conformance', label: 'Result', type: 'select', options: ['Conforms', 'Gap', 'N/A'], aliases: ['conforms / gap / n/a'] },
      { id: 'notes',       label: 'Notes',            type: 'textarea', aliases: ['notes'] },
    ],
  },
];

/**
 * Prose brackets that instruct a human author — leave literal on conversion,
 * never turn into fields. (Explicit list for the current corpus; new brackets
 * fall back to the heuristic in classifyBracket.)
 * @type {string[]}
 */
export const INSTRUCTIONAL = [
  'a defined period', 'a majority of seats', 'a set number of', 'a set period',
  'accept residual risk?',
  'add agency-specific requirements.', 'add agency-specific roles', 'add agency-specific rules.',
  'add agency-specific statements.', 'add agency-specific systems.',
  'add exclusions if any; if none, write "none."', 'add findings as needed.',
  'add items needing a leadership decision',
  'add open findings, summary only; detail lives in the poa&m',
  'add seats as needed', 'add statements as needed.',
  "adjust this appetite statement to the agency's tolerance.",
  'all personnel who request, approve, or implement changes, including county or vendor it',
  'and any system operated solely by another agency under a separate agreement',
  'any change to cjis screening requirements or indiana statute',
  'appendix a / the vendor & contractor inventory entry', 'approve resources for x?',
  'approved banner text. example: "this is a [agency name', // NESTED: inner [agency name] truncated here
  'areas owned and controlled solely by another agency under a separate agreement',
  'background check; audit training', 'background check; incident-response training',
  'background check; monitoring and detection training',
  'badge + pin; authorized staff only', 'badge; authorized staff only',
  'cad / call-handling workstations', 'cad / esinet servers; core network',
  "confirm leadership-set completion targets and the agency's delivery methods.",
  "confirm the agency's approved remote-access methods and permitted device types.",
  'confirm the systems in scope and the identity/directory source for each.',
  'control area: e.g., access control, logging, endpoint protection, encryption, patching',
  'data owned and controlled solely by another agency under a separate agreement, if any',
  'date the tier and impacts were last confirmed', 'define approved device types.',
  'directory groups / application roles / local groups',
  'directory, application, or local accounts', 'dispatch floor',
  'e.g., 1 business day', 'e.g., 1 hour', 'e.g., 30 minutes, 24/7', 'e.g., 4 hours',
  'e.g., 72 hours', 'e.g., escalation to provider management',
  'e.g., insider error, untrained staff, vendor access misuse',
  'e.g., quarterly leadership security review',
  'e.g., ransomware, credential compromise, cad/esinet outage, tdos/dos, misconfiguration',
  'e.g., site-to-site vpn, api, peer-to-peer',
  'e.g., vendor outage, compromised update, single-carrier dependency', 'e.g., weekly',
  'emerging threats or intelligence briefed to leadership',
  'exclusions, if any', 'exclusions, if any; if none, write "none."', 'executive summary.',
  'fire, flood, temperature, utility/power loss, emp, physical intrusion',
  'fire, flood, temperature, utility/power, emp, and other facility hazards assessed',
  'from the poa&m', 'highest-rated open risks',
  'how it is implemented; reference the governing policy',
  'idf / mdf closets; cable pathways', 'if applicable',
  'inbound / outbound / both: what data', 'independent of day-to-day operations',
  'iot reports under hea 1169, if any', 'items past their due date',
  'key metrics and trend since last review',
  'list any systems or data outside this policy. if none, write "none."',
  'list any systems outside this policy. if none, write "none."',
  'list finding ids in priority order, or state the prioritization rule applied',
  'list positions and the check required for each',
  'network distribution; transmission lines',
  'networks and systems this connects to: summarize; detail in interconnections below',
  'none', 'other exclusions, if any.',
  'public information systems that hold no agency or cjis data, if any',
  'public lobby / reception', 'public; no credential',
  'purely operational roles with no security duty, if the agency chooses to list them',
  'risk acceptance request', 'role / title; mark employee or contractor',
  'screening & training', 'senior official, e.g., agency director or county liaison',
  'server room / equipment area',
  'setting, e.g., logging', 'setting, e.g., open/closed ports', 'setting, e.g., password rules',
  "significant change to the agency's systems or change process", 'staff badge',
  'state the committed budget line or allocation, or reference where it is set.',
  'stated minimum security practices', 'stated service',
  'summary of where the program stands', 'supervisor / hr: verified complete',
  'systems owned and operated solely by another agency under a separate agreement, if any',
  "the agency's telecommunicator training program",
  'the designated lead named in the cybersecurity charter',
  'the executive sponsor', 'the executive sponsor or the county board',
  'top risks and any change in priority', 'zone, e.g., dispatch vlan',
];

/**
 * Edge-case brackets to skip entirely (banner tokens, empty, pure numeric/symbol).
 * @type {string[]}
 */
export const IGNORE = ['bracketed', 'required', '', '5.9', '%'];

// ── Indexes (built once at module load) ─────────────────────────────────────
const _aliasIndex = (() => {
  /** @type {Map<string, FieldDef>} */
  const m = new Map();
  for (const f of FIELDS) for (const a of f.aliases) if (!m.has(a)) m.set(a, f);
  return m;
})();
const _idIndex = new Map(FIELDS.map((f) => [f.id, f]));
const _loopIndex = new Map(LOOPS.map((l) => [l.id, l]));
const _instructionalSet = new Set(INSTRUCTIONAL);
const _ignoreSet = new Set(IGNORE);

// Curated strong-imperative verbs. Kept small and unambiguous (excludes nouns
// like "note"/"record"/"name") so the growing-library fallback rarely mislabels
// a value bracket as prose.
const _imperatives = new Set([
  'add', 'replace', 'describe', 'list', 'insert', 'delete', 'enter', 'summarize',
  'summarise', 'explain', 'attach', 'provide', 'specify', 'include', 'adapt',
  'confirm', 'define', 'state', 'adjust', 'indicate', 'select', 'choose',
]);

/**
 * Heuristic for brackets not in any explicit list (i.e. new templates):
 * treat as prose when it reads like an instruction.
 * @param {string} n normalized bracket
 */
function _looksInstructional(n) {
  if (!n) return false;
  const words = n.split(' ');
  if (words.length < 2) return false;
  if (n.endsWith('.') || n.endsWith('?')) return true;
  if (n.startsWith('e.g')) return true;
  if (_imperatives.has(words[0])) return true;
  return false;
}

/**
 * Heuristic for a clean fill-in value (short noun phrase, no terminal
 * punctuation, not imperative-led) → convert to a generic fillable tag.
 * @param {string} n normalized bracket
 */
function _looksLikeValue(n) {
  if (!n) return false;
  const words = n.split(' ');
  if (words.length > 6) return false;
  if (/[.?:]$/.test(n)) return false;
  if (_imperatives.has(words[0])) return false;
  return true;
}

/**
 * Classify a raw bracket for conversion / linting.
 * @param {string} raw
 * @returns {BracketClass}
 */
export function classifyBracket(raw) {
  const n = normalizeBracket(raw);
  if (_ignoreSet.has(n)) return 'ignore';
  if (_aliasIndex.has(n)) return 'field-registry';
  if (_instructionalSet.has(n)) return 'instructional';
  if (_looksInstructional(n)) return 'instructional';
  if (_looksLikeValue(n)) return 'field-generic';
  return 'ambiguous';
}

/**
 * Deterministic camelCase tag for a field-generic bracket.
 * @param {string} normalized
 * @returns {string}
 */
export function genericSlug(normalized) {
  const words = String(normalized).replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter(Boolean);
  if (!words.length) return 'field';
  const camel = words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join('');
  return camel.slice(0, 40);
}

/**
 * The docxtemplater tag a bracket converts to, or null to leave it literal.
 * @param {string} raw
 * @returns {string | null}
 */
export function convertBracket(raw) {
  const cls = classifyBracket(raw);
  if (cls === 'field-registry') {
    const f = _aliasIndex.get(normalizeBracket(raw));
    return f ? `{${f.id}}` : null;
  }
  if (cls === 'field-generic') return `{${genericSlug(normalizeBracket(raw))}}`;
  return null; // instructional / ignore / ambiguous → leave literal
}

/**
 * Resolve a raw-or-normalized bracket to its FieldDef, or null.
 * @param {string} rawOrNormalized
 * @returns {FieldDef | null}
 */
export function resolveField(rawOrNormalized) {
  return _aliasIndex.get(normalizeBracket(rawOrNormalized)) ?? null;
}

/**
 * Resolve a canonical tag id (e.g. from getTags) to its FieldDef, or null.
 * @param {string} id
 * @returns {FieldDef | null}
 */
export function resolveFieldById(id) {
  return _idIndex.get(id) ?? null;
}

/**
 * Resolve a possibly disambiguated tag ("severityHml2") to its base FieldDef and
 * 1-based occurrence index: "severityHml" -> { field, index:1 };
 * "severityHml2" -> { field, index:2 }; unknown -> { field:null, index:1 }.
 * Lets disambiguated cells keep their base type/options with a numbered label.
 * @param {string} name
 * @returns {{ field: FieldDef | null, index: number }}
 */
export function resolveFieldForTag(name) {
  const direct = _idIndex.get(name);
  if (direct) return { field: direct, index: 1 };
  const m = /^(.*?)(\d+)$/.exec(name);
  if (m) {
    const base = _idIndex.get(m[1]);
    if (base) return { field: base, index: Number(m[2]) };
  }
  return { field: null, index: 1 };
}

/**
 * Resolve a loop section id to its LoopDef, or null.
 * @param {string} id
 * @returns {LoopDef | null}
 */
export function resolveLoopById(id) {
  return _loopIndex.get(id) ?? null;
}

/**
 * Human-readable label fallback for an un-curated tag id (camelCase → Title).
 * @param {string} id
 * @returns {string}
 */
export function humanizeTag(id) {
  const s = String(id)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : id;
}
