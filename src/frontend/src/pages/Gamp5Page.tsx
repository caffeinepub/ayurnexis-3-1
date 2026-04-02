import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { callDeepSeekRaw } from "../utils/aiService";

// ---------- Types ----------

interface GampFormData {
  systemName: string;
  systemType: string;
  gampCategory: string;
  intendedUse: string;
  userRequirements: string;
  riskLevel: "Low" | "Medium" | "High";
  validationScope: string[];
}

interface GeneratedDocuments {
  urs: string;
  functionalSpec: string;
  riskAssessment: string;
  dq: string;
  iqProtocol: string;
  oqProtocol: string;
  pqProtocol: string;
  traceabilityMatrix: TraceabilityRow[];
}

interface TraceabilityRow {
  reqId: string;
  requirement: string;
  testType: string;
  testId: string;
  testDescription: string;
  passCriteria: string;
  riskLevel: string;
}

// ---------- Markdown to HTML converter ----------

function markdownToHtml(text: string): string {
  if (!text) return "";
  return (
    text
      // Markdown tables → HTML tables
      .replace(
        /\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g,
        (_: string, header: string, rows: string) => {
          const headerCells = header
            .split("|")
            .filter(Boolean)
            .map(
              (c: string) =>
                `<th style="border:1px solid #cbd5e1;padding:8px 12px;background:#f1f5f9;font-weight:600;text-align:left;">${c.trim()}</th>`,
            )
            .join("");
          const rowsHtml = rows
            .trim()
            .split("\n")
            .filter((r: string) => r.includes("|"))
            .map((row: string) => {
              const cells = row
                .split("|")
                .filter(Boolean)
                .map(
                  (c: string) =>
                    `<td style="border:1px solid #cbd5e1;padding:8px 12px;vertical-align:top;">${c.trim()}</td>`,
                )
                .join("");
              return `<tr>${cells}</tr>`;
            })
            .join("");
          return `<table style="border-collapse:collapse;width:100%;margin:12px 0;font-size:0.875rem;">\n<thead><tr>${headerCells}</tr></thead>\n<tbody>${rowsHtml}</tbody>\n</table>\n`;
        },
      )
      // H1
      .replace(
        /^# (.+)$/gm,
        '<h1 style="font-size:1.4rem;font-weight:700;color:#0f172a;margin:24px 0 12px;border-bottom:2px solid #166534;padding-bottom:8px;">$1</h1>',
      )
      // H2
      .replace(
        /^## (.+)$/gm,
        '<h2 style="font-size:1.1rem;font-weight:700;color:#14532d;margin:20px 0 8px;border-left:3px solid #16a34a;padding-left:8px;">$2</h2>',
      )
      // H3
      .replace(
        /^### (.+)$/gm,
        '<h3 style="font-size:0.95rem;font-weight:600;color:#166534;margin:14px 0 6px;">$1</h3>',
      )
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#1e293b;">$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // Horizontal rule
      .replace(
        /^---+$/gm,
        '<hr style="border:none;border-top:2px solid #dcfce7;margin:20px 0;">',
      )
      // Numbered list items
      .replace(
        /^\d+\. (.+)$/gm,
        '<li style="margin:4px 0;padding-left:4px;list-style-type:decimal;">$1</li>',
      )
      // Bullet list items
      .replace(
        /^[-*•] (.+)$/gm,
        '<li style="margin:4px 0;padding-left:4px;list-style-type:disc;">$1</li>',
      )
      // Wrap consecutive <li> tags in <ul>/<ol>
      .replace(
        /(<li[^>]*>[\s\S]*?<\/li>\n?)+/g,
        (match: string) =>
          `<ul style="margin:8px 0 8px 20px;padding:0;">${match}</ul>`,
      )
      // Line breaks within text
      .replace(
        /\n\n/g,
        '</p><p style="margin:8px 0;line-height:1.75;color:#334155;">',
      )
      // Remaining newlines
      .replace(/\n/g, "<br>")
  );
}

// ---------- DOCX generation (Word-compatible HTML blob) ----------

function generateDocxBlob(
  title: string,
  content: string,
  systemName: string,
): Blob {
  const htmlContent = markdownToHtml(content);
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const wordHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>90</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page { margin: 2.54cm; size: A4; }
    body { font-family: "Times New Roman", Times, serif; font-size: 11pt; color: #000; line-height: 1.6; }
    h1 { font-size: 16pt; font-weight: bold; color: #14532d; border-bottom: 2pt solid #16a34a; padding-bottom: 6pt; margin-top: 0; page-break-after: avoid; }
    h2 { font-size: 13pt; font-weight: bold; color: #166534; margin-top: 18pt; margin-bottom: 6pt; border-left: 3pt solid #16a34a; padding-left: 6pt; }
    h3 { font-size: 11pt; font-weight: bold; color: #166534; margin-top: 12pt; margin-bottom: 4pt; }
    table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
    td, th { border: 1pt solid #94a3b8; padding: 5pt 8pt; font-size: 10pt; vertical-align: top; }
    th { background-color: #dcfce7; font-weight: bold; color: #14532d; }
    tr:nth-child(even) td { background-color: #f8fffe; }
    p { margin: 6pt 0; line-height: 1.6; }
    ul, ol { margin: 6pt 0 6pt 20pt; }
    li { margin: 3pt 0; }
    .header-box { border: 2pt solid #14532d; padding: 12pt; margin-bottom: 18pt; background: #f0fdf4; }
    .header-box h1 { border: none; padding: 0; margin-bottom: 10pt; }
    .header-box table td { border: none; padding: 3pt 6pt; font-size: 10pt; }
    .footer { font-size: 8pt; color: #6b7280; border-top: 1pt solid #94a3b8; padding-top: 6pt; margin-top: 30pt; }
    strong { color: #1e293b; }
  </style>
</head>
<body>
  <div class="header-box">
    <h1>${title}</h1>
    <table>
      <tr><td><strong>System Name:</strong></td><td>${systemName}</td><td><strong>Document No.:</strong></td><td>${title.substring(0, 3).toUpperCase()}-${systemName.replace(/\s+/g, "").substring(0, 6).toUpperCase()}-001</td></tr>
      <tr><td><strong>Version:</strong></td><td>1.0 (Draft)</td><td><strong>Date:</strong></td><td>${date}</td></tr>
      <tr><td><strong>Regulatory Basis:</strong></td><td colspan="3">GAMP 5 Second Edition, FDA 21 CFR Part 11, EU Annex 11, ICH Q10</td></tr>
      <tr><td><strong>Status:</strong></td><td colspan="3">DRAFT — Pending QA Review and Approval</td></tr>
    </table>
  </div>
  <p style="margin:8px 0;line-height:1.75;color:#334155;">${htmlContent}</p>
  <div class="footer">
    AyurNexis 3.1 — GAMP 5 Validation Document Generator &nbsp;|&nbsp; CONFIDENTIAL — FOR VALIDATION USE ONLY &nbsp;|&nbsp; Generated: ${date}
  </div>
</body>
</html>`;
  return new Blob([wordHtml], { type: "application/msword" });
}

// ---------- Excel/XLS Traceability Matrix ----------

function generateXlsxBlob(rows: TraceabilityRow[], systemName: string): Blob {
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const header = [
    "Req ID",
    "Requirement Statement",
    "Risk Level",
    "Test Type",
    "Test ID",
    "Test Description",
    "Pass/Fail Criteria",
    "Execution Status",
    "Tester",
    "Date Executed",
  ];

  const riskStyle = (r: string) => {
    if (r === "High")
      return `style="background:#fee2e2;color:#991b1b;font-weight:bold;"`;
    if (r === "Medium")
      return `style="background:#fef9c3;color:#713f12;font-weight:bold;"`;
    return `style="background:#dcfce7;color:#14532d;font-weight:bold;"`;
  };

  const typeStyle = (t: string) => {
    if (t === "IQ")
      return `style="background:#dbeafe;color:#1e40af;font-weight:bold;"`;
    if (t === "OQ")
      return `style="background:#ede9fe;color:#5b21b6;font-weight:bold;"`;
    return `style="background:#fce7f3;color:#9d174d;font-weight:bold;"`;
  };

  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Calibri, Arial; font-size: 10pt; }
  table { border-collapse: collapse; width: 100%; }
  th { background: #14532d; color: white; padding: 8px 10px; text-align: left; border: 1px solid #0d3520; font-size: 10pt; }
  td { border: 1px solid #d0e8d8; padding: 6px 8px; vertical-align: top; font-size: 9pt; }
  tr:nth-child(even) td { background: #f0fdf4; }
  h2 { color: #14532d; font-size: 14pt; margin-bottom: 4px; }
  .meta { font-size: 9pt; color: #6b7280; margin-bottom: 12px; }
</style>
</head>
<body>
<h2>Validation Traceability Matrix — ${systemName}</h2>
<p class="meta">Generated: ${date} &nbsp;|&nbsp; Version: 1.0 &nbsp;|&nbsp; Regulatory Basis: GAMP 5 Ed.2, FDA 21 CFR Part 11 &nbsp;|&nbsp; Status: Pending Execution</p>
<table>
<tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr>
${rows
  .map(
    (r, _idx) =>
      `<tr>
  <td style="font-family:monospace;font-weight:bold;color:#14532d;">${r.reqId}</td>
  <td>${r.requirement}</td>
  <td ${riskStyle(r.riskLevel)}>${r.riskLevel}</td>
  <td ${typeStyle(r.testType)}>${r.testType}</td>
  <td style="font-family:monospace;color:#374151;">${r.testId}</td>
  <td>${r.testDescription}</td>
  <td>${r.passCriteria}</td>
  <td style="color:#6b7280;font-style:italic;">Pending</td>
  <td></td>
  <td></td>
</tr>`,
  )
  .join("\n")}
</table>
<p style="margin-top:20px;font-size:8pt;color:#9ca3af;">AyurNexis 3.1 — GAMP 5 Validation Document Generator | CONFIDENTIAL</p>
</body>
</html>`;

  // Suppress unused variable warning
  void rows.length;

  return new Blob([html], { type: "application/vnd.ms-excel" });
}

// ---------- Download helper ----------

function downloadDoc(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------- AI generation helpers ----------

async function generateDocument(
  docType: string,
  form: GampFormData,
): Promise<string> {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const systemShortCode = form.systemName
    .replace(/\s+/g, "")
    .substring(0, 6)
    .toUpperCase();
  const scopeStr = form.validationScope.join(", ") || "IQ, OQ, PQ";

  const prompts: Record<string, string> = {
    urs: `Generate a complete GAMP 5 Second Edition compliant User Requirement Specification (URS) for ${form.systemName} (${form.systemType}).

GAMP Category: ${form.gampCategory}
Intended Use: ${form.intendedUse}
User Requirements: ${form.userRequirements}
Risk Level: ${form.riskLevel}
Validation Scope: ${scopeStr}

Generate the full URS document with ALL of these sections using proper numbered headings. Use markdown formatting (## for headings, | for tables, - for bullets):

## Document Control
| Field | Value |
|-------|-------|
| Document Number | URS-${systemShortCode}-001 |
| Version | 1.0 |
| Status | Draft |
| Date | ${today} |
| Author | Validation Team |
| Reviewed By | QA Manager |
| Approved By | [Pending] |

## Version History
| Version | Date | Author | Description of Change |
|---------|------|--------|----------------------|
| 1.0 | ${today} | Validation Team | Initial Draft |

## 1. Purpose and Scope
Write 2-3 paragraphs describing: (a) purpose of this URS document, (b) scope of the system being validated — include system name, GAMP category, and intended use.

## 2. Regulatory Basis
List all applicable regulations and guidelines. Must reference: GAMP 5 Second Edition (ISPE), FDA 21 CFR Part 11, EU Annex 11, ICH Q10, ICH Q9, USP <1058>, applicable ISO standards.

## 3. System Overview
Describe system type, GAMP category justification, intended use, deployment environment, and user community. Include a note on data integrity requirements (ALCOA+ principles).

## 4. Abbreviations and Definitions
| Abbreviation | Definition |
|---|---|
| URS | User Requirement Specification |
| FS | Functional Specification |
| DQ | Design Qualification |
| IQ | Installation Qualification |
| OQ | Operational Qualification |
| PQ | Performance Qualification |
| GAMP | Good Automated Manufacturing Practice |
| GxP | Good Practice (GMP/GLP/GCP) |
| CSV | Computerised System Validation |
| ALCOA | Attributable, Legible, Contemporaneous, Original, Accurate |
| CFR | Code of Federal Regulations |
| QMS | Quality Management System |

## 5. User Requirements
Number each requirement from the provided list as REQ-001, REQ-002, etc. For EACH requirement, provide:
- **Requirement ID:** REQ-XXX
- **Requirement Statement:** Clear, testable statement
- **Rationale:** Why this requirement is needed
- **Priority:** Must / Should / Could
- **Risk Level:** High / Medium / Low
- **Source:** Business / Regulatory / Technical

Include at least 10 numbered requirements based on the provided user requirements and typical requirements for a ${form.systemType}.

## 6. Data Integrity Requirements
List specific ALCOA+ requirements:
- Attributable: all data entries must be linked to a user with timestamp
- Legible: all records must be readable throughout retention period
- Contemporaneous: data recorded at time of activity
- Original: first capture of data must be preserved
- Accurate: data must reflect actual observations
- Complete, Consistent, Enduring, Available requirements
Reference 21 CFR Part 11 and EU Annex 11 requirements for electronic records.

## 7. Interface Requirements
Describe: system interfaces (databases, networks, other systems), data exchange formats (XML, HL7, JSON, CSV), network requirements, API interfaces, authentication protocols.

## 8. Performance Requirements
| Performance Parameter | Requirement | Rationale |
|---|---|---|
| System Availability | ≥99.5% uptime during business hours | Business continuity |
| Response Time | <3 seconds for standard queries | User productivity |
| Data Processing | <10 seconds for batch operations | Operational efficiency |
| Backup Frequency | Daily incremental, weekly full | Data protection |
| RTO (Recovery Time) | <4 hours | Business continuity |
| RPO (Recovery Point) | <1 hour data loss | Data integrity |

## 9. Security Requirements
List security requirements including: role-based access control, password policy (min 8 chars, complexity, 90-day expiry), account lockout (5 failed attempts), session timeout (30 minutes), audit trail for all critical events, electronic signature compliance (21 CFR Part 11 §11.50), encryption requirements.

## 10. Validation Approach
Describe the risk-based validation strategy per GAMP 5 Second Edition. Include: validation lifecycle (V-model), testing tiers (DQ→IQ→OQ→PQ), risk-based test coverage, traceability from requirements to test cases, periodic review schedule.

## 11. Acceptance Criteria
List overall acceptance criteria: all Must requirements tested and passed, no critical open deviations, QA approval of all validation protocols, system released for intended use by [designated approver].

## 12. Responsibilities
| Role | Responsibilities |
|------|----------------|
| Validation Lead | Owns validation lifecycle, executes protocols |
| QA Manager | Reviews and approves all documents |
| IT/System Owner | Provides system access, technical support |
| End User/SME | Provides requirements, executes UAT |
| Project Manager | Coordination and timeline management |

## 13. Open Issues and Assumptions
List open items, assumptions made, external dependencies, exclusions from scope.

## 14. Approval and Sign-off
| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | Validation Lead | | |
| | QA Manager | | |
| | System Owner | | |
| | IT Manager | | |

IMPORTANT: Generate comprehensive, specific content relevant to a ${form.systemType} system. All requirements and content must be technically correct and audit-ready per GAMP 5.`,

    functionalSpec: `Generate a complete GAMP 5 Second Edition compliant Functional Specification (FS) document for ${form.systemName} (${form.systemType}).

GAMP Category: ${form.gampCategory}
Intended Use: ${form.intendedUse}
User Requirements Basis: ${form.userRequirements}
Risk Level: ${form.riskLevel}

Generate the complete FS document using markdown formatting (## headings, | tables, - bullets):

## Document Control
| Field | Value |
|-------|-------|
| Document Number | FS-${systemShortCode}-001 |
| Version | 1.0 |
| Status | Draft |
| Date | ${today} |
| Parent Document | URS-${systemShortCode}-001 |
| Author | System Validation Team |
| Approved By | [Pending] |

## Version History
| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ${today} | Validation Team | Initial Draft |

## 1. Purpose and Scope
Purpose of this FS, relationship to URS, scope of functional description.

## 2. System Architecture Overview
Describe the overall system architecture for ${form.systemName}: hardware platform, software components, database architecture, network topology, integration points. Include a text-based architecture description.

## 3. Functional Requirements
For EACH functional requirement FS-001, FS-002, etc., provide:
| FS ID | Description | URS Reference | Priority | Notes |
Map each URS requirement (REQ-001+) to one or more functional specifications. Include at least 15 functional requirements specific to a ${form.systemType}. Cover: user management, data entry, data retrieval, calculations, reporting, audit trail, electronic signatures, backup/restore, system configuration.

## 4. User Interface Requirements
Describe UI layout, navigation, accessibility requirements, responsive design, error messaging standards, field validation rules, data entry controls.

## 5. Interface Requirements
- **System Interfaces:** List all external systems and integration specifications
- **Data Interfaces:** Data formats, exchange protocols, transformation rules
- **Hardware Interfaces:** Servers, printers, scanners, instruments
- **Network Interfaces:** Protocols, ports, firewall requirements

## 6. Security and Access Control
Describe: user roles and permission matrix, authentication mechanism, session management, data encryption (at rest and in transit), network security, physical security considerations.

## 7. Audit Trail and Data Integrity
Describe audit trail implementation per 21 CFR Part 11: what events are logged, audit trail fields (user ID, timestamp, old value, new value, reason for change), audit trail protection (read-only, tamper-evident), ALCOA+ compliance measures.

## 8. Reporting and Output Requirements
List all required reports with specifications: report name, data fields, filters, format (PDF/Excel/CSV), access control, scheduled vs. on-demand.

## 9. Error Handling and Validation
Input validation rules, error message standards, system fault handling, recovery procedures, data backup on failure.

## 10. Performance and Scalability
Technical performance specifications, database capacity planning, concurrent user support, archiving strategy.

## 11. Installation and Configuration Requirements
Server requirements, software prerequisites, configuration parameters, network requirements, environment-specific settings (Dev/Test/Prod).

## 12. Traceability to URS
| FS ID | FS Description Summary | URS Ref | Status |
|-------|----------------------|---------|--------|
List all FS requirements mapped to URS requirements.

## 13. Approval and Sign-off
| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | System Architect | | |
| | Validation Lead | | |
| | QA Manager | | |

Generate technically accurate, GAMP 5 compliant content specific to ${form.systemType} systems.`,

    riskAssessment: `Generate a complete GAMP 5 Second Edition and ICH Q9 compliant Risk Assessment document for ${form.systemName} (${form.systemType}, GAMP Category ${form.gampCategory}).

Overall Risk Level: ${form.riskLevel}
Intended Use: ${form.intendedUse}
User Requirements: ${form.userRequirements}

Generate the full Risk Assessment using markdown formatting:

## Document Control
| Field | Value |
|-------|-------|
| Document Number | RA-${systemShortCode}-001 |
| Version | 1.0 |
| Status | Draft |
| Date | ${today} |
| Methodology | FMEA (Failure Mode and Effects Analysis) |
| Risk Threshold | RPN > 12 requires mitigation |

## Version History
| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ${today} | Validation Team | Initial Risk Assessment |

## 1. Purpose and Scope
Purpose of this risk assessment, scope (system components, processes, data flows), relationship to GAMP 5 risk-based validation approach, and ICH Q9 risk management principles applied.

## 2. Risk Assessment Methodology
### 2.1 FMEA Approach
Describe FMEA methodology: identify potential failure modes, their causes, and effects on patient safety, data integrity, and product quality.

### 2.2 Risk Scoring
| Factor | Scale | Definition |
|--------|-------|-----------|
| Severity (S) | 1-5 | Impact on patient safety/data integrity |
| Probability (P) | 1-5 | Likelihood of occurrence |
| Detectability (D) | 1-5 | Ability to detect before impact |
| **RPN** | S × P × D | Risk Priority Number (max 125) |

### 2.3 Risk Acceptance Criteria
| RPN Range | Risk Level | Action Required |
|-----------|-----------|----------------|
| 1-12 | Low | Accept; standard controls apply |
| 13-36 | Medium | Mitigate; additional controls required |
| 37-125 | High | Must mitigate; re-assess after controls |

## 3. System Risk Classification
GAMP Category ${form.gampCategory} justification, overall system risk classification for ${form.systemType}, GxP impact analysis.

## 4. Risk Inventory — Failure Mode and Effects Analysis
Generate a comprehensive FMEA table with at least 12 specific risk items for ${form.systemType}. For EACH risk:

| Risk ID | System Function | Failure Mode | Potential Cause | Effect on Patient/Data | S | P | D | RPN | Risk Level | Mitigation Controls | Residual RPN |
|---------|----------------|-------------|----------------|----------------------|---|---|---|-----|-----------|-------------------|-------------|

Include risks covering:
- Unauthorized access / access control failure
- Audit trail corruption or deletion
- Data loss or corruption
- Electronic signature falsification
- System downtime / availability
- Incorrect calculations or data processing
- Interface failure (data exchange)
- Backup and recovery failure
- Software configuration changes
- User training deficiency
- Network failure / cybersecurity
- Hardware failure

## 5. Critical Function Identification
List all GxP-critical functions identified, their criticality justification, and validation approach.

## 6. Risk Summary
| Risk Level | Count Before Mitigation | Count After Mitigation |
|-----------|------------------------|----------------------|
| High | X | X |
| Medium | X | X |
| Low | X | X |

Overall residual risk assessment and acceptability statement.

## 7. Risk Control Measures
List all mitigation controls implemented, verification method, and responsible party.

## 8. Periodic Risk Review
Schedule for periodic risk review, trigger criteria for re-assessment, change control integration.

## 9. Approval and Sign-off
| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | Risk Assessment Lead | | |
| | QA Manager | | |
| | System Owner | | |

Generate specific, technically accurate risk items for a ${form.systemType} in a pharmaceutical/regulated environment.`,

    dq: `Generate a complete GAMP 5 Second Edition compliant Design Qualification (DQ) document for ${form.systemName} (${form.systemType}, GAMP Category ${form.gampCategory}).

Intended Use: ${form.intendedUse}
Risk Level: ${form.riskLevel}
User Requirements: ${form.userRequirements}

Generate the full DQ document using markdown formatting:

## Document Control
| Field | Value |
|-------|-------|
| Document Number | DQ-${systemShortCode}-001 |
| Version | 1.0 |
| Status | Draft |
| Date | ${today} |
| Author | Validation Team |
| Parent Documents | URS-${systemShortCode}-001, FS-${systemShortCode}-001 |

## Version History
| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ${today} | Validation Team | Initial Draft |

## 1. Purpose and Scope
Purpose of Design Qualification for ${form.systemName}, relationship to URS and FS, GAMP 5 DQ principles. DQ confirms that the proposed design of the system meets the user requirements and is fit for intended purpose.

## 2. Design Description
### 2.1 Hardware Architecture
Describe server specifications, client workstations, network components, storage systems, redundancy/failover design.

### 2.2 Software Architecture
Operating system, application software, database management system, middleware, integration components. Version numbers and vendor information.

### 2.3 System Configuration
Key configuration parameters, environment specifications (CPU, RAM, disk), network configuration, security configuration baseline.

## 3. Vendor Assessment (GAMP Category ${form.gampCategory})
| Assessment Criteria | Vendor Response | Acceptable |
|---------------------|----------------|-----------|
| Quality Management System | ISO 9001 certified | Yes/No |
| Software Development Process | Documented SDLC | Yes/No |
| Testing and QA Procedures | Unit/Integration/UAT | Yes/No |
| Change Control Process | Formal change management | Yes/No |
| Support and Maintenance | SLA documentation available | Yes/No |
| Regulatory Experience | Previous FDA/EMA submissions | Yes/No |
| Source Code Access | Available under escrow | Yes/No |

Vendor qualification approach per GAMP 5 Category ${form.gampCategory} requirements.

## 4. Design Qualification Test Cases

Generate at least 8 DQ test cases for ${form.systemType}. For each:

| DQ Test ID | Design Element | Requirement Reference | Design Specification | Acceptance Criteria | Result |
|-----------|---------------|---------------------|--------------------|--------------------|--------|

Include tests covering: hardware specifications vs URS, software version verification, security architecture design review, database design review, interface design review, backup/recovery design, network design, user access design.

## 5. Design Review Records
### 5.1 Formal Design Review
Date, attendees, design issues identified, resolutions, action items.

### 5.2 Design Review Outcomes
| Review Item | Status | Comments |
|-------------|--------|----------|

## 6. Traceability to URS and FS
| DQ ID | Design Element | URS Ref | FS Ref | Status |
|-------|---------------|---------|--------|--------|

## 7. Open Design Issues
List any open design issues, deviations from requirements, risk items identified during DQ, action items and owners.

## 8. DQ Conclusion
Summary of design qualification, overall assessment of design adequacy, recommendation to proceed to IQ.

## 9. Approval and Sign-off
| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | System Architect | | |
| | Validation Lead | | |
| | QA Manager | | |

Generate technically accurate DQ content specific to ${form.systemType} systems in a pharmaceutical/GxP environment.`,

    iqProtocol: `Generate a complete GAMP 5 Second Edition compliant Installation Qualification (IQ) Protocol for ${form.systemName} (${form.systemType}, GAMP Category ${form.gampCategory}).

Risk Level: ${form.riskLevel}
Intended Use: ${form.intendedUse}
Validation Scope: ${scopeStr}

Generate the full IQ Protocol using markdown formatting:

## Document Control
| Field | Value |
|-------|-------|
| Document Number | IQ-${systemShortCode}-001 |
| Version | 1.0 |
| Status | Draft |
| Date | ${today} |
| Protocol Type | Installation Qualification |
| Parent Documents | DQ-${systemShortCode}-001, FS-${systemShortCode}-001 |

## Version History
| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ${today} | Validation Team | Initial Protocol |

## 1. Purpose and Scope
The IQ Protocol verifies that ${form.systemName} has been installed correctly, in accordance with the vendor specifications and approved design qualification, and that all components are present and documented.

## 2. Pre-requisites
- Design Qualification (DQ-${systemShortCode}-001) completed and approved
- Server environment provisioned and available
- Software installation media / access provided by vendor
- Installation guide and configuration documentation received
- IQ execution team trained and authorized

## 3. Responsibilities
| Role | Responsibility |
|------|---------------|
| IQ Executor | Execute all test cases, record actual results |
| Witness | Witness critical steps, co-sign results |
| Validation Lead | Review completed protocol, raise deviations |
| IT Administrator | Provide system access, technical support |
| QA Reviewer | Review and approve completed IQ |

## 4. IQ Test Cases
Generate at least 12 detailed IQ test cases for ${form.systemType}. For EACH test case:

**IQ-001: Hardware Specification Verification**
- **Objective:** Verify installed hardware meets DQ specifications
- **Prerequisites:** Physical access to server room, DQ document
- **Test Steps:**
  1. Access server hardware inventory
  2. Verify CPU model and speed against specification
  3. Verify RAM capacity against specification
  4. Verify storage capacity and configuration
  5. Verify network interface specifications
- **Expected Result:** All hardware specifications match DQ-approved design
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester/Date:** ___________________________ / ___________
- **Witness:** ___________________________

Generate similar detailed test cases for:
- IQ-002: Operating System Installation and Version
- IQ-003: Application Software Installation Verification
- IQ-004: Database Installation and Configuration
- IQ-005: License Verification
- IQ-006: Network Connectivity and Ports
- IQ-007: Security Configuration (Firewall, Antivirus)
- IQ-008: User Account and Permission Setup
- IQ-009: Backup System Configuration
- IQ-010: System Clock and Time Zone
- IQ-011: Documentation Package (SOPs, User Guides)
- IQ-012: Integration Component Verification

## 5. IQ Deviation Log
| Dev. No. | Test ID | Description | Severity | Resolution | Status |
|----------|---------|-------------|----------|------------|--------|

## 6. IQ Summary and Conclusion
Summary of IQ execution, number of test cases executed/passed/failed, open deviations, overall IQ outcome (Pass/Fail), recommendation for OQ.

## 7. IQ Approval and Sign-off
| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | IQ Lead Executor | | |
| | Witness | | |
| | Validation Manager | | |
| | QA Approver | | |

Generate specific, technically accurate IQ test cases for ${form.systemType} installation.`,

    oqProtocol: `Generate a complete GAMP 5 Second Edition compliant Operational Qualification (OQ) Protocol for ${form.systemName} (${form.systemType}, GAMP Category ${form.gampCategory}).

Risk Level: ${form.riskLevel}
Functions to Qualify: ${form.userRequirements}
Validation Scope: ${scopeStr}

Generate the full OQ Protocol using markdown formatting:

## Document Control
| Field | Value |
|-------|-------|
| Document Number | OQ-${systemShortCode}-001 |
| Version | 1.0 |
| Status | Draft |
| Date | ${today} |
| Protocol Type | Operational Qualification |
| Pre-requisite | IQ-${systemShortCode}-001 Approved |

## Version History
| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ${today} | Validation Team | Initial Protocol |

## 1. Purpose and Scope
OQ verifies that ${form.systemName} operates correctly in accordance with the Functional Specification (FS) under all expected operating conditions, including boundary and exception conditions.

## 2. Pre-requisites
- IQ (IQ-${systemShortCode}-001) completed and approved
- Test environment configured with test data
- User accounts for test execution configured
- Test data sets prepared and documented
- Testers trained on OQ execution procedures

## 3. Test Environment
| Parameter | Specification |
|-----------|--------------|
| Environment Type | OQ Test / Validation Environment |
| Software Version | [As installed per IQ] |
| Test Data | Synthetic/anonymized test data sets |
| Network | Connected per IQ-verified configuration |

## 4. OQ Test Cases
Generate at least 15 detailed OQ test cases for ${form.systemType}. For EACH test case:

**OQ-001: User Authentication and Access Control**
- **Objective:** Verify role-based access control per security requirements
- **Risk Level:** High
- **URS/FS Reference:** REQ-001, FS-006
- **Test Input:** Valid and invalid credentials for each role
- **Test Steps:**
  1. Attempt login with valid Administrator credentials
  2. Verify Administrator functions are accessible
  3. Attempt login with valid Read-Only user credentials
  4. Verify restricted functions are inaccessible
  5. Attempt login with invalid credentials 5 times
  6. Verify account lockout after 5 failed attempts
- **Expected Result:** Role-based access enforced; account locked after 5 failures
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester/Date:** ___________________________ / ___________

Generate similar detailed test cases covering all critical functions of ${form.systemType}:
- OQ-002: Data Entry and Validation
- OQ-003: Data Retrieval and Search
- OQ-004: Audit Trail Generation and Content
- OQ-005: Electronic Signature (21 CFR Part 11)
- OQ-006: Report Generation (all required reports)
- OQ-007: Data Import/Export Interface
- OQ-008: Calculation Accuracy Verification
- OQ-009: Error Handling and Messages
- OQ-010: Session Timeout
- OQ-011: Password Policy Enforcement
- OQ-012: Data Backup and Restore
- OQ-013: System Alarm/Notification
- OQ-014: Boundary Value Testing
- OQ-015: Concurrent User Operation

## 5. OQ Deviation Log
| Dev. No. | Test ID | Description | Severity | Root Cause | Resolution | Status |
|----------|---------|-------------|----------|------------|------------|--------|

## 6. OQ Summary and Conclusion
Summary of OQ execution, statistics (executed/passed/failed), critical deviations, overall OQ outcome, recommendation for PQ.

## 7. OQ Approval and Sign-off
| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | OQ Lead Executor | | |
| | Business SME | | |
| | Validation Manager | | |
| | QA Approver | | |

Generate specific, technically accurate OQ test cases for ${form.systemType} operational functionality.`,

    pqProtocol: `Generate a complete GAMP 5 Second Edition compliant Performance Qualification (PQ) Protocol for ${form.systemName} (${form.systemType}, GAMP Category ${form.gampCategory}).

Risk Level: ${form.riskLevel}
Intended Use: ${form.intendedUse}
User Requirements: ${form.userRequirements}
Validation Scope: ${scopeStr}

Generate the full PQ Protocol using markdown formatting:

## Document Control
| Field | Value |
|-------|-------|
| Document Number | PQ-${systemShortCode}-001 |
| Version | 1.0 |
| Status | Draft |
| Date | ${today} |
| Protocol Type | Performance Qualification |
| Pre-requisite | OQ-${systemShortCode}-001 Approved |

## Version History
| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ${today} | Validation Team | Initial Protocol |

## 1. Purpose and Scope
PQ demonstrates that ${form.systemName} consistently performs in accordance with specifications and is suitable for its intended use under actual production conditions. PQ is conducted in the production (or production-representative) environment with real or realistic data.

## 2. Pre-requisites
- OQ (OQ-${systemShortCode}-001) completed and approved with no critical deviations
- Production environment provisioned
- End users trained on system operation
- SOPs for system use reviewed and approved
- System configured per approved configuration specifications
- Production data or realistic representative data available

## 3. PQ Environment
| Parameter | Specification |
|-----------|--------------|
| Environment | Production / Production-Representative |
| Users | Trained end users executing PQ |
| Data | Production or realistic representative data |
| Concurrent Users | [Per performance requirements] |

## 4. PQ Test Cases
Generate at least 10 detailed PQ test cases using realistic production scenarios for ${form.systemType}. For EACH test case:

**PQ-001: End-to-End Workflow — [Primary Workflow]**
- **Objective:** Verify complete primary workflow operates correctly in production environment
- **Risk Level:** High
- **URS Reference:** REQ-001 through REQ-005
- **Test Scenario:** Full business process workflow using realistic data
- **Test Data:** [Realistic representative data set — describe data characteristics]
- **Test Steps:**
  1. Log in as authorized end user
  2. Create new record with all required fields
  3. Submit for review/approval
  4. Reviewer approves record
  5. Generate required reports
  6. Verify audit trail captures all steps with correct user and timestamps
- **Expected Result:** All workflow steps complete successfully; audit trail complete and accurate; reports generated correctly
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester/Date:** ___________________________ / ___________
- **Approved By:** ___________________________

Generate similar detailed PQ test cases covering all end-to-end workflows of ${form.systemType}:
- PQ-002: Data Integrity Under Normal Operations (concurrent users)
- PQ-003: Regulatory Compliance Verification (21 CFR Part 11 completeness)
- PQ-004: Report Accuracy Against Source Data
- PQ-005: Data Archive and Retrieval
- PQ-006: System Performance Under Expected Load
- PQ-007: User Access and Permission in Production
- PQ-008: Interface Data Exchange with External Systems
- PQ-009: Backup and Recovery Drill
- PQ-010: Disaster Recovery / Business Continuity Test

## 5. System Release Criteria
The system may be released to production use when ALL of the following are met:
- All PQ test cases executed and passed
- No Critical or Major open deviations
- All Minor deviations have approved remediation plans
- End-user training records complete
- SOPs approved and available at point of use
- System administrator training complete
- Validation Summary Report approved by QA

## 6. PQ Deviation Log
| Dev. No. | Test ID | Description | Severity | Root Cause | Resolution | Closure Date |
|----------|---------|-------------|----------|------------|------------|-------------|

## 7. PQ Summary and Conclusion
Summary of PQ execution, overall system performance, open items, recommendation for system release to production.

## 8. PQ Approval and Sign-off
| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | PQ Lead Executor | | |
| | End User Representative | | |
| | Validation Manager | | |
| | QA Manager | | |
| | System Owner | | |

Generate specific, technically accurate PQ test cases for ${form.systemType} in a pharmaceutical/regulated environment.`,
  };

  return callDeepSeekRaw(prompts[docType]);
}

async function generateTraceability(
  form: GampFormData,
): Promise<TraceabilityRow[]> {
  const today = new Date().toLocaleDateString("en-IN");
  const prompt = `Generate a comprehensive Validation Traceability Matrix for ${form.systemName} (${form.systemType}, GAMP Category ${form.gampCategory}) that links ALL URS requirements to DQ, IQ, OQ, and PQ test cases.

User Requirements:
${form.userRequirements}

Return ONLY a valid JSON array (no markdown, no extra text, no code fences):
[{
  "reqId": "REQ-001",
  "requirement": "requirement statement",
  "testType": "OQ",
  "testId": "OQ-001",
  "testDescription": "specific test description",
  "passCriteria": "specific, measurable pass criteria",
  "riskLevel": "High"
}]

Rules:
- Generate at least 15 rows
- Each URS requirement should have at least one test case
- Assign testType based on: DQ=design verification, IQ=installation/infrastructure, OQ=functional/operational testing, PQ=production performance/UAT
- Include a mix of all four test types (DQ, IQ, OQ, PQ)
- Make requirements and test descriptions specific to ${form.systemType}
- Set riskLevel to High/Medium/Low based on patient safety and data integrity impact
- Today is ${today}`;

  try {
    const raw = await callDeepSeekRaw(prompt);
    const jsonMatch =
      raw.match(/```json\s*([\s\S]*?)\s*```/) ||
      raw.match(/```\s*([\s\S]*?)\s*```/) ||
      raw.match(/(\[[\s\S]*\])/);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : raw;
    const parsed = JSON.parse(jsonStr.trim());
    if (Array.isArray(parsed) && parsed.length > 0)
      return parsed as TraceabilityRow[];
  } catch {
    // fall through to fallback
  }

  // Comprehensive fallback traceability
  return [
    {
      reqId: "REQ-001",
      requirement:
        "System shall provide role-based access control with at least 3 user roles",
      testType: "OQ",
      testId: "OQ-001",
      testDescription:
        "Verify role-based access by logging in with each defined role and confirming only authorized functions are accessible",
      passCriteria:
        "All role restrictions enforced; unauthorized access denied with appropriate error message",
      riskLevel: "High",
    },
    {
      reqId: "REQ-002",
      requirement:
        "System shall generate a complete audit trail for all data creation, modification, and deletion",
      testType: "OQ",
      testId: "OQ-004",
      testDescription:
        "Create, modify, and delete records; verify audit trail captures user ID, timestamp, old value, new value, and reason",
      passCriteria:
        "Audit trail entries present for all operations; no gaps; data matches expected values",
      riskLevel: "High",
    },
    {
      reqId: "REQ-003",
      requirement:
        "System shall support electronic signatures compliant with 21 CFR Part 11",
      testType: "OQ",
      testId: "OQ-005",
      testDescription:
        "Apply electronic signature to critical record; verify signature captures signatory, meaning, and timestamp",
      passCriteria:
        "Electronic signature binds to record; cannot be re-used; meaning displayed correctly",
      riskLevel: "High",
    },
    {
      reqId: "REQ-004",
      requirement:
        "System shall provide data backup and recovery capabilities with RPO < 1 hour",
      testType: "PQ",
      testId: "PQ-009",
      testDescription:
        "Execute backup, simulate data loss, perform restore; verify all data restored within RPO",
      passCriteria:
        "System restored within 4 hours; data loss < 1 hour; all records intact",
      riskLevel: "High",
    },
    {
      reqId: "REQ-005",
      requirement:
        "System hardware shall meet minimum specification requirements for deployment environment",
      testType: "IQ",
      testId: "IQ-001",
      testDescription:
        "Verify installed hardware specifications against DQ-approved design: CPU, RAM, storage, network",
      passCriteria:
        "All hardware specifications equal to or exceed DQ-approved requirements",
      riskLevel: "Medium",
    },
    {
      reqId: "REQ-006",
      requirement:
        "System software shall be installed per vendor installation guide",
      testType: "IQ",
      testId: "IQ-003",
      testDescription:
        "Verify software installation: version number, checksum, installation path, and all components present",
      passCriteria:
        "Software version matches specification; all components installed; installation log clean",
      riskLevel: "Medium",
    },
    {
      reqId: "REQ-007",
      requirement: "System shall generate reports in PDF and Excel format",
      testType: "OQ",
      testId: "OQ-006",
      testDescription:
        "Generate all required reports in each format; verify data accuracy against source data",
      passCriteria:
        "All reports generate successfully; data matches source; format is correct",
      riskLevel: "Medium",
    },
    {
      reqId: "REQ-008",
      requirement:
        "System shall validate all data inputs and provide meaningful error messages",
      testType: "OQ",
      testId: "OQ-009",
      testDescription:
        "Enter invalid data in all critical fields; verify validation errors are raised with clear messages",
      passCriteria:
        "All invalid inputs rejected; error messages are specific and actionable",
      riskLevel: "Medium",
    },
    {
      reqId: "REQ-009",
      requirement:
        "System design shall meet user requirements and intended use specifications",
      testType: "DQ",
      testId: "DQ-001",
      testDescription:
        "Review system design documentation against URS; verify all requirements are addressed in design",
      passCriteria:
        "All URS requirements addressed in system design; no gaps identified",
      riskLevel: "High",
    },
    {
      reqId: "REQ-010",
      requirement:
        "System shall perform all critical functions within specified response time (<3 seconds)",
      testType: "PQ",
      testId: "PQ-006",
      testDescription:
        "Execute critical functions under expected production load with concurrent users; measure response times",
      passCriteria:
        "All critical functions respond within 3 seconds under normal production load",
      riskLevel: "Medium",
    },
    {
      reqId: "REQ-011",
      requirement:
        "System shall enforce password complexity and 90-day expiry policy",
      testType: "OQ",
      testId: "OQ-011",
      testDescription:
        "Test password creation with non-compliant passwords; verify rejection. Simulate 90-day expiry.",
      passCriteria:
        "Non-compliant passwords rejected; system forces password change at 90-day expiry",
      riskLevel: "High",
    },
    {
      reqId: "REQ-012",
      requirement:
        "System shall complete end-to-end business workflows correctly in production environment",
      testType: "PQ",
      testId: "PQ-001",
      testDescription:
        "Execute full primary business workflow with realistic production data; verify all steps complete correctly",
      passCriteria:
        "Complete workflow executes without errors; all data correct; audit trail complete",
      riskLevel: "High",
    },
    {
      reqId: "REQ-013",
      requirement:
        "System network and security configuration shall be installed per DQ specifications",
      testType: "IQ",
      testId: "IQ-006",
      testDescription:
        "Verify network connectivity, open ports, firewall rules match DQ-approved configuration",
      passCriteria:
        "All network connections verified; unauthorized ports closed; firewall active",
      riskLevel: "High",
    },
    {
      reqId: "REQ-014",
      requirement:
        "System shall maintain data integrity under concurrent multi-user operation",
      testType: "PQ",
      testId: "PQ-002",
      testDescription:
        "Simulate expected concurrent user load; verify no data corruption, conflicts, or performance degradation",
      passCriteria:
        "No data corruption under concurrent load; all transactions complete successfully",
      riskLevel: "High",
    },
    {
      reqId: "REQ-015",
      requirement:
        "System security configuration shall be verified per approved design",
      testType: "DQ",
      testId: "DQ-003",
      testDescription:
        "Review security architecture design: access control model, encryption design, audit trail design against security requirements",
      passCriteria:
        "Security design meets all security requirements; no design vulnerabilities identified",
      riskLevel: "High",
    },
  ];
}

// ---------- Progress steps ----------

const DOC_STEPS = [
  { key: "urs", label: "User Requirement Specification", shortLabel: "URS" },
  {
    key: "functionalSpec",
    label: "Functional Specification",
    shortLabel: "FS",
  },
  { key: "riskAssessment", label: "Risk Assessment", shortLabel: "Risk" },
  { key: "dq", label: "Design Qualification", shortLabel: "DQ" },
  { key: "iqProtocol", label: "IQ Protocol", shortLabel: "IQ" },
  { key: "oqProtocol", label: "OQ Protocol", shortLabel: "OQ" },
  { key: "pqProtocol", label: "PQ Protocol", shortLabel: "PQ" },
  {
    key: "traceabilityMatrix",
    label: "Traceability Matrix",
    shortLabel: "Trace",
  },
] as const;

const GAMP_CATEGORIES = [
  {
    value: "1",
    label: "Category 1 — Infrastructure Software",
    desc: "OS, network software, databases, virtualization",
  },
  {
    value: "3",
    label: "Category 3 — Non-configured Software",
    desc: "Off-the-shelf software used as-is (e.g., standard office tools)",
  },
  {
    value: "4",
    label: "Category 4 — Configured Software",
    desc: "ERP, LIMS, MES, SCADA with configuration",
  },
  {
    value: "5",
    label: "Category 5 — Custom Software",
    desc: "Bespoke or custom-developed software",
  },
];

const SYSTEM_TYPES = [
  "LIMS",
  "MES",
  "ERP",
  "DCS",
  "SCADA",
  "CDS",
  "QMS",
  "CTMS",
  "PMS",
  "EDMS",
  "Other",
];

// ---------- Main component ----------

export function Gamp5Page() {
  const [form, setForm] = useState<GampFormData>({
    systemName: "",
    systemType: "",
    gampCategory: "",
    intendedUse: "",
    userRequirements: "",
    riskLevel: "Medium",
    validationScope: ["IQ", "OQ", "PQ"],
  });
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [docs, setDocs] = useState<GeneratedDocuments | null>(null);
  const [activeTab, setActiveTab] = useState("urs");

  const updateField = <K extends keyof GampFormData>(
    k: K,
    v: GampFormData[K],
  ) => setForm((prev) => ({ ...prev, [k]: v }));

  const toggleScope = (scope: string) => {
    setForm((prev) => ({
      ...prev,
      validationScope: prev.validationScope.includes(scope)
        ? prev.validationScope.filter((s) => s !== scope)
        : [...prev.validationScope, scope],
    }));
  };

  const handleGenerate = async () => {
    if (!form.systemName.trim()) {
      toast.error("Please enter a system name");
      return;
    }
    if (!form.systemType) {
      toast.error("Please select a system type");
      return;
    }
    if (!form.gampCategory) {
      toast.error("Please select a GAMP category");
      return;
    }
    if (!form.intendedUse.trim()) {
      toast.error("Please describe the intended use");
      return;
    }
    if (!form.userRequirements.trim()) {
      toast.error("Please enter at least one user requirement");
      return;
    }

    setGenerating(true);
    setProgress(0);
    setDocs(null);

    const result: Partial<GeneratedDocuments> = {};
    const docKeys = [
      "urs",
      "functionalSpec",
      "riskAssessment",
      "dq",
      "iqProtocol",
      "oqProtocol",
      "pqProtocol",
    ] as const;

    try {
      for (let i = 0; i < docKeys.length; i++) {
        const key = docKeys[i];
        const step = DOC_STEPS.find((s) => s.key === key);
        setCurrentStep(step?.label ?? key);
        setProgress(Math.round((i / (docKeys.length + 1)) * 100));
        result[key] = await generateDocument(key, form);
      }

      setCurrentStep("Traceability Matrix");
      setProgress(93);
      result.traceabilityMatrix = await generateTraceability(form);

      setProgress(100);
      setDocs(result as GeneratedDocuments);
      setActiveTab("urs");
      toast.success(
        "All 7 validation documents generated successfully — audit-ready",
      );
    } catch (err) {
      console.error(err);
      if (Object.keys(result).length > 0) {
        result.traceabilityMatrix = result.traceabilityMatrix ?? [];
        setDocs(result as GeneratedDocuments);
        toast.error(
          "Some documents generated with errors — showing available results",
        );
      } else {
        toast.error(
          "Generation failed. Please check your network and try again.",
        );
      }
    } finally {
      setGenerating(false);
      setCurrentStep("");
    }
  };

  const handleDownloadDoc = (
    docKey: keyof Omit<GeneratedDocuments, "traceabilityMatrix">,
  ) => {
    if (!docs) return;
    const titles: Record<string, string> = {
      urs: "User Requirement Specification",
      functionalSpec: "Functional Specification",
      riskAssessment: "Risk Assessment",
      dq: "Design Qualification Protocol",
      iqProtocol: "Installation Qualification Protocol",
      oqProtocol: "Operational Qualification Protocol",
      pqProtocol: "Performance Qualification Protocol",
    };
    const title = titles[docKey] ?? docKey;
    const content = docs[docKey] as string;
    const blob = generateDocxBlob(title, content, form.systemName);
    const safeName = form.systemName
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "");
    downloadDoc(blob, `${safeName}_${docKey.toUpperCase()}_v1.0.doc`);
    toast.success(`${title} downloaded`);
  };

  const handleDownloadXlsx = () => {
    if (!docs?.traceabilityMatrix) return;
    const blob = generateXlsxBlob(docs.traceabilityMatrix, form.systemName);
    const safeName = form.systemName
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "");
    downloadDoc(blob, `${safeName}_Traceability_Matrix_v1.0.xls`);
    toast.success("Traceability Matrix downloaded");
  };

  const riskColors: Record<string, string> = {
    Low: "bg-green-100 text-green-800 border-green-200",
    Medium: "bg-amber-100 text-amber-800 border-amber-200",
    High: "bg-red-100 text-red-800 border-red-200",
  };

  const docTextKeys = [
    "urs",
    "functionalSpec",
    "riskAssessment",
    "dq",
    "iqProtocol",
    "oqProtocol",
    "pqProtocol",
  ] as const;

  return (
    <div
      className="p-4 md:p-6 max-w-6xl mx-auto space-y-6"
      data-ocid="gamp5.page"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-green-50 border border-green-200">
          <Shield className="h-7 w-7 text-green-700" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            GAMP 5 Validation Document Generator
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            AI-powered audit-ready documentation · GAMP 5 Second Edition · FDA
            21 CFR Part 11 · EU Annex 11 · ICH Q10
          </p>
        </div>
        {docs && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDocs(null)}
            data-ocid="gamp5.secondary_button"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        )}
      </div>

      {!docs ? (
        /* ─────── INPUT FORM ─────── */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* System Name */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  System Name *
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Input
                  placeholder="e.g., LIMS Alpha v2.0"
                  value={form.systemName}
                  onChange={(e) => updateField("systemName", e.target.value)}
                  data-ocid="gamp5.input"
                />
              </CardContent>
            </Card>

            {/* System Type */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  System Type *
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <Select
                  value={form.systemType}
                  onValueChange={(v) => updateField("systemType", v)}
                >
                  <SelectTrigger data-ocid="gamp5.select">
                    <SelectValue placeholder="Select system type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* GAMP Category */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  GAMP Category *
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                <Select
                  value={form.gampCategory}
                  onValueChange={(v) => updateField("gampCategory", v)}
                >
                  <SelectTrigger data-ocid="gamp5.select">
                    <SelectValue placeholder="Select GAMP category" />
                  </SelectTrigger>
                  <SelectContent>
                    {GAMP_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.gampCategory && (
                  <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
                    <span className="font-medium">Definition: </span>
                    {
                      GAMP_CATEGORIES.find((c) => c.value === form.gampCategory)
                        ?.desc
                    }
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Risk Level */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Overall Risk Level *
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex gap-3">
                  {(["Low", "Medium", "High"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateField("riskLevel", level)}
                      className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        form.riskLevel === level
                          ? `${riskColors[level]} border-current`
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                      data-ocid="gamp5.toggle"
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Intended Use */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Intended Use *
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Textarea
                placeholder="Describe the intended use of the system in the regulated GxP environment. E.g., 'This LIMS system will be used in a GMP pharmaceutical laboratory to manage sample registration, testing workflows, results reporting, and CoA generation per 21 CFR Part 211...'"
                value={form.intendedUse}
                onChange={(e) => updateField("intendedUse", e.target.value)}
                rows={3}
                data-ocid="gamp5.textarea"
              />
            </CardContent>
          </Card>

          {/* User Requirements */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700">
                User Requirements *
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                List each requirement on a new line. Be specific — these are
                used to generate all test protocols and traceability matrix.
              </p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Textarea
                placeholder={
                  "The system shall record all data entries with user ID and timestamps\nThe system shall provide role-based access control with at least Admin, Analyst, and Read-Only roles\nThe system shall generate a complete audit trail for all data modifications\nThe system shall support electronic signatures per 21 CFR Part 11\nThe system shall generate reports in PDF and Excel format\nThe system shall maintain 99.5% uptime during business hours\nThe system shall backup data daily with restore capability"
                }
                value={form.userRequirements}
                onChange={(e) =>
                  updateField("userRequirements", e.target.value)
                }
                rows={8}
                data-ocid="gamp5.textarea"
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Validation Scope */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Validation Scope
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                DQ and Traceability Matrix are always generated. Select
                additional qualification protocols:
              </p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex gap-6">
                {["IQ", "OQ", "PQ"].map((scope) => (
                  <div key={scope} className="flex items-center gap-2">
                    <Checkbox
                      id={`scope-${scope}`}
                      checked={form.validationScope.includes(scope)}
                      onCheckedChange={() => toggleScope(scope)}
                      data-ocid="gamp5.checkbox"
                    />
                    <Label
                      htmlFor={`scope-${scope}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {scope}
                      <span className="text-xs text-gray-500 ml-1">
                        {scope === "IQ" && "(Installation)"}
                        {scope === "OQ" && "(Operational)"}
                        {scope === "PQ" && "(Performance)"}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate button */}
          <Button
            className="w-full h-12 text-base font-semibold bg-green-700 hover:bg-green-800 text-white"
            onClick={handleGenerate}
            disabled={generating}
            data-ocid="gamp5.submit_button"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {currentStep
                  ? `Generating: ${currentStep}...`
                  : "Initializing..."}
              </>
            ) : (
              <>
                <FileCheck2 className="mr-2 h-5 w-5" />
                Generate GAMP 5 Validation Documents (7 Documents)
              </>
            )}
          </Button>

          {generating && (
            <div className="space-y-3" data-ocid="gamp5.loading_state">
              <div className="flex justify-between text-xs text-gray-600">
                <span className="font-medium">
                  {currentStep || "Starting generation..."}
                </span>
                <span className="font-mono font-bold text-green-700">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="grid grid-cols-4 md:grid-cols-8 gap-1">
                {DOC_STEPS.map((step) => (
                  <div
                    key={step.key}
                    className={`text-center p-1.5 rounded text-[10px] font-medium border ${
                      currentStep === step.label
                        ? "bg-green-100 text-green-800 border-green-300"
                        : "bg-gray-50 text-gray-400 border-gray-200"
                    }`}
                  >
                    {step.shortLabel}
                  </div>
                ))}
              </div>
              <p className="text-xs text-center text-gray-400">
                Generating 7 GAMP 5 compliant documents — this typically takes
                60–120 seconds
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ─────── GENERATED DOCUMENTS ─────── */
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-900 text-sm">
                  {form.systemName}
                </p>
                <p className="text-xs text-green-700">
                  {form.systemType} · GAMP Category {form.gampCategory} ·{" "}
                  <span
                    className={`font-medium ${riskColors[form.riskLevel].split(" ")[1]}`}
                  >
                    {form.riskLevel} Risk
                  </span>{" "}
                  · {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="text-green-700 border-green-300"
              >
                7 Documents
              </Badge>
              <Badge
                variant="outline"
                className="text-green-700 border-green-300"
              >
                {docs.traceabilityMatrix.length} Req Traces
              </Badge>
            </div>
          </div>

          {/* Regulatory compliance badge strip */}
          <div className="flex flex-wrap gap-2">
            {[
              "GAMP 5 Ed. 2",
              "FDA 21 CFR Part 11",
              "EU Annex 11",
              "ICH Q10",
              "ICH Q9",
            ].map((badge) => (
              <span
                key={badge}
                className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium"
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Document tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 md:grid-cols-8 h-auto gap-1 bg-gray-100 p-1">
              {DOC_STEPS.map((step) => (
                <TabsTrigger
                  key={step.key}
                  value={step.key}
                  className="text-xs py-2 px-1 data-[state=active]:bg-white data-[state=active]:text-green-800 data-[state=active]:shadow-sm"
                  data-ocid="gamp5.tab"
                >
                  {step.shortLabel}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Text document tabs */}
            {docTextKeys.map((docKey) => (
              <TabsContent key={docKey} value={docKey} className="mt-4">
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-green-700" />
                        <div>
                          <CardTitle className="text-base">
                            {DOC_STEPS.find((s) => s.key === docKey)?.label}
                          </CardTitle>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Version 1.0 · {new Date().toLocaleDateString()} ·
                            Draft · GAMP 5 Compliant
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() =>
                          handleDownloadDoc(
                            docKey as keyof Omit<
                              GeneratedDocuments,
                              "traceabilityMatrix"
                            >,
                          )
                        }
                        data-ocid="gamp5.download_button"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download .doc
                      </Button>
                    </div>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4 px-6 pb-6">
                    {docs[docKey] ? (
                      <div className="max-h-[65vh] overflow-y-auto">
                        <div
                          className="prose max-w-none text-sm"
                          style={{ lineHeight: "1.7", color: "#334155" }}
                          // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is generated from AI text, not user input
                          dangerouslySetInnerHTML={{
                            __html: markdownToHtml(docs[docKey] as string),
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-2 text-amber-600 text-sm"
                        data-ocid="gamp5.error_state"
                      >
                        <AlertCircle className="h-4 w-4" />
                        This document was not generated. Try regenerating.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}

            {/* Traceability Matrix tab */}
            <TabsContent value="traceabilityMatrix" className="mt-4">
              <Card className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-green-700" />
                      <div>
                        <CardTitle className="text-base">
                          Validation Traceability Matrix
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {docs.traceabilityMatrix.length} requirements traced ·
                          Version 1.0 · Pending Execution · GAMP 5 §9
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-300 text-green-700 hover:bg-green-50"
                      onClick={handleDownloadXlsx}
                      data-ocid="gamp5.download_button"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download .xls
                    </Button>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 px-2 pb-4">
                  {docs.traceabilityMatrix.length === 0 ? (
                    <div
                      className="flex items-center gap-2 text-amber-600 text-sm p-2"
                      data-ocid="gamp5.error_state"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Traceability matrix was not generated. Try regenerating.
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[65vh] overflow-y-auto">
                      <table
                        className="w-full text-xs border-collapse"
                        data-ocid="gamp5.table"
                      >
                        <thead className="sticky top-0">
                          <tr className="bg-green-800 text-white">
                            <th className="px-3 py-2 text-left font-medium w-20">
                              Req ID
                            </th>
                            <th className="px-3 py-2 text-left font-medium min-w-52">
                              Requirement
                            </th>
                            <th className="px-3 py-2 text-left font-medium w-16">
                              Risk
                            </th>
                            <th className="px-3 py-2 text-left font-medium w-14">
                              Type
                            </th>
                            <th className="px-3 py-2 text-left font-medium w-20">
                              Test ID
                            </th>
                            <th className="px-3 py-2 text-left font-medium min-w-52">
                              Test Description
                            </th>
                            <th className="px-3 py-2 text-left font-medium min-w-40">
                              Pass/Fail Criteria
                            </th>
                            <th className="px-3 py-2 text-left font-medium w-24">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {docs.traceabilityMatrix.map((row, idx) => (
                            <tr
                              key={`${row.reqId}-${idx}`}
                              className="border-b border-gray-100 hover:bg-green-50"
                              data-ocid="gamp5.row"
                            >
                              <td className="px-3 py-2 font-mono font-bold text-green-800">
                                {row.reqId}
                              </td>
                              <td className="px-3 py-2 text-gray-800">
                                {row.requirement}
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                    row.riskLevel === "High"
                                      ? "bg-red-100 text-red-700"
                                      : row.riskLevel === "Medium"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {row.riskLevel}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                                    row.testType === "DQ"
                                      ? "bg-purple-100 text-purple-700"
                                      : row.testType === "IQ"
                                        ? "bg-blue-100 text-blue-700"
                                        : row.testType === "OQ"
                                          ? "bg-violet-100 text-violet-700"
                                          : "bg-pink-100 text-pink-700"
                                  }`}
                                >
                                  {row.testType}
                                </span>
                              </td>
                              <td className="px-3 py-2 font-mono text-gray-700">
                                {row.testId}
                              </td>
                              <td className="px-3 py-2 text-gray-700">
                                {row.testDescription}
                              </td>
                              <td className="px-3 py-2 text-gray-600">
                                {row.passCriteria}
                              </td>
                              <td className="px-3 py-2">
                                <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">
                                  Pending
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
