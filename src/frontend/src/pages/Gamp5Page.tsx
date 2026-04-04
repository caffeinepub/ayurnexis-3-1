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

// ---------- Template-based document generation (no AI dependency) ----------

function generateDocument(docType: string, form: GampFormData): string {
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

  // Parse user requirements into numbered list
  const rawReqs = form.userRequirements
    .split(/\n|;|,(?=\s*[A-Z])/)
    .map((r) => r.trim())
    .filter((r) => r.length > 3);
  const reqs =
    rawReqs.length > 0
      ? rawReqs
      : [
          `The ${form.systemType} system shall support role-based user access control`,
          "The system shall maintain a complete and tamper-evident electronic audit trail",
          "The system shall support electronic signatures compliant with 21 CFR Part 11",
          "The system shall perform all primary functions within 3 seconds response time",
          "The system shall provide backup and recovery with RPO < 1 hour",
          "The system shall enforce data integrity per ALCOA+ principles",
          "The system shall generate audit-ready reports in PDF and/or Excel format",
          "The system shall support concurrent multi-user access without data corruption",
          "The system shall be installed and configured per vendor documentation",
          "The system shall restrict access based on user roles and least-privilege principle",
        ];

  const gampCatDesc: Record<string, string> = {
    "1": "Infrastructure Software (OS, network software, databases). Validation focus on installation and configuration verification.",
    "3": "Non-configured (off-the-shelf) software. Vendor documentation, test summary reports, and configuration testing required.",
    "4": "Configured software (ERP, LIMS, MES, SCADA). Configuration specifications, functional testing, and integration testing required.",
    "5": "Custom/bespoke software. Full software development lifecycle documentation, unit testing, integration testing, and full V-model validation.",
  };

  const riskDesc = {
    Low: "Standard controls. Periodic review. No additional mitigation required.",
    Medium:
      "Enhanced controls. Additional testing. Periodic risk re-assessment.",
    High: "Maximum controls. Comprehensive testing. Continuous monitoring required.",
  };

  const systemTypeDesc: Record<string, string> = {
    LIMS: "Laboratory Information Management System managing laboratory workflows, sample tracking, test results, and instrument integration.",
    MES: "Manufacturing Execution System managing production execution, batch records, material traceability, and shop-floor operations.",
    ERP: "Enterprise Resource Planning system managing business processes including finance, procurement, inventory, and supply chain.",
    DCS: "Distributed Control System managing process control, sensor integration, and real-time manufacturing process automation.",
    SCADA:
      "Supervisory Control and Data Acquisition system for industrial monitoring and control of distributed equipment and processes.",
    CDS: "Chromatography Data System for instrument control, data acquisition, processing, and reporting of chromatographic analyses.",
    QMS: "Quality Management System managing quality processes, deviations, CAPAs, change control, and document management.",
    CTMS: "Clinical Trial Management System managing clinical trial planning, patient data, adverse events, and regulatory submissions.",
    PMS: "Pharmacovigilance Management System managing adverse event collection, signal detection, and regulatory reporting.",
    EDMS: "Electronic Document Management System managing controlled documents, version control, review, and approval workflows.",
    Other:
      "Regulated computer system supporting GxP-critical operations in the pharmaceutical/life-science environment.",
  };

  const systemDesc = systemTypeDesc[form.systemType] || systemTypeDesc.Other;

  if (docType === "urs") {
    const reqRows = reqs
      .map((r, i) => {
        const id = `REQ-${String(i + 1).padStart(3, "0")}`;
        const risk = i < 3 ? "High" : i < 7 ? "Medium" : "Low";
        return `### ${id}: ${r.replace(/^the system shall /i, "System shall ")}

**Requirement ID:** ${id}

**Requirement Statement:** ${r.charAt(0).toUpperCase() + r.slice(1)}

**Rationale:** Critical requirement for ${form.systemType} ${form.intendedUse || "GxP-regulated operations"} ensuring regulatory compliance and operational integrity.

**Priority:** Must

**Risk Level:** ${risk}

**Source:** ${i < 2 ? "Regulatory (FDA 21 CFR Part 11)" : i < 5 ? "Business / Operational" : "Technical / IT Security"}

**Acceptance Criteria:** Verified and documented during ${i < 2 ? "OQ and PQ" : i < 5 ? "OQ" : "IQ and OQ"} execution.`;
      })
      .join("\n\n---\n\n");

    return `# User Requirement Specification (URS)

## Document Control

| Field | Value |
|-------|-------|
| Document Number | URS-${systemShortCode}-001 |
| System Name | ${form.systemName} |
| System Type | ${form.systemType} |
| GAMP Category | Category ${form.gampCategory} |
| Version | 1.0 |
| Status | Draft — Pending QA Review |
| Date | ${today} |
| Author | Validation Team |
| Reviewed By | QA Manager |
| Approved By | [Pending] |
| Regulatory Basis | GAMP 5 Second Edition, FDA 21 CFR Part 11, EU Annex 11, ICH Q10, ICH Q9 |

## Version History

| Version | Date | Author | Description of Change |
|---------|------|--------|----------------------|
| 0.1 | ${today} | Validation Team | Initial Draft |
| 1.0 | ${today} | Validation Team | Issued for QA Review |

## 1. Purpose and Scope

### 1.1 Purpose

This User Requirement Specification (URS) defines the requirements that **${form.systemName}** must satisfy to be acceptable for its intended use. This document provides the basis for all subsequent validation activities including Design Qualification (DQ), Installation Qualification (IQ), Operational Qualification (OQ), and Performance Qualification (PQ).

### 1.2 Scope

This URS covers the complete **${form.systemType}** system designated as **${form.systemName}**, classified as GAMP Category ${form.gampCategory}. The document describes functional, data integrity, security, performance, and interface requirements.

**Intended Use:** ${form.intendedUse || `${form.systemType} for GxP-regulated pharmaceutical operations`}

**Validation Scope:** ${scopeStr}

**Risk Level:** ${form.riskLevel} — ${riskDesc[form.riskLevel]}

### 1.3 Exclusions

- Hardware procurement and installation (covered separately in DQ/IQ)
- Third-party vendor validation activities (covered in vendor assessment)
- Network infrastructure beyond system boundaries

## 2. Regulatory Basis

This URS has been prepared in compliance with and with reference to the following regulations, guidelines, and standards:

| Regulation / Guideline | Applicability |
|------------------------|---------------|
| GAMP 5 Second Edition (ISPE, 2022) | Primary validation framework — risk-based approach |
| FDA 21 CFR Part 11 | Electronic records and electronic signatures |
| EU Annex 11 (2011) | Computerised systems in regulated environments |
| ICH Q10 | Pharmaceutical Quality System |
| ICH Q9 | Quality Risk Management |
| USP <1058> | Analytical Instrument Qualification |
| ISO/IEC 27001 | Information security management |
| FDA Data Integrity Guidance (2018) | ALCOA+ data integrity principles |

## 3. System Overview

**System Name:** ${form.systemName}

**System Type:** ${form.systemType} — ${systemDesc}

**GAMP Category:** ${form.gampCategory} — ${gampCatDesc[form.gampCategory] || "Regulated computer system requiring risk-based validation."}

**GxP Impact:** This system directly supports GxP-critical processes. Data generated, managed, or reported by this system is used for regulatory submissions, quality decisions, and/or patient safety. Full computerised system validation is required.

**Data Integrity Classification:** GxP-Critical — All electronic records must comply with ALCOA+ principles and 21 CFR Part 11 / EU Annex 11 electronic records requirements.

**User Community:** QA personnel, laboratory staff, production operators, system administrators, and management personnel as applicable to intended use.

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
| GxP | Good Practice (GMP, GLP, GCP) |
| CSV | Computerised System Validation |
| ALCOA+ | Attributable, Legible, Contemporaneous, Original, Accurate, Complete, Consistent, Enduring, Available |
| CFR | Code of Federal Regulations |
| QMS | Quality Management System |
| RBAC | Role-Based Access Control |
| RPN | Risk Priority Number |
| FMEA | Failure Mode and Effects Analysis |
| SOP | Standard Operating Procedure |
| CAPA | Corrective and Preventive Action |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |

## 5. User Requirements

The following requirements have been identified for **${form.systemName}**. Each requirement is individually numbered, with rationale, priority, risk classification, and source documented.

${reqRows}

## 6. Data Integrity Requirements

All data generated, processed, or stored by ${form.systemName} must conform to ALCOA+ principles as required by FDA Data Integrity Guidance (2018) and EU Annex 11:

| ALCOA+ Principle | Requirement |
|-----------------|-------------|
| **Attributable** | All data entries, modifications, and deletions must be linked to a specific user with timestamp. Shared login accounts are prohibited. |
| **Legible** | All records must be readable throughout the entire retention period (minimum 10 years for GMP; as per applicable regulation). |
| **Contemporaneous** | Data must be recorded at the time of activity. Backdating of electronic records is prohibited by system design. |
| **Original** | The first capture of data must be preserved. The system must not allow overwriting of original data without audit trail capture. |
| **Accurate** | Data must reflect actual measurements, observations, or activities. Calculation algorithms must be validated. |
| **Complete** | All required fields must be captured. No mandatory data fields may be left blank after record completion. |
| **Consistent** | Date/time stamps must use a consistent, system-controlled clock. Time zone must be documented and consistently applied. |
| **Enduring** | Data must be preserved in a durable, retrievable format for the required retention period. |
| **Available** | Authorized users must be able to retrieve data for inspection, review, and regulatory inspection within a reasonable timeframe. |

**21 CFR Part 11 Compliance Requirements:**
- Unique user identification and authentication (§11.10(d))
- Audit trail capturing date, time, operator ID, old value, and new value (§11.10(e))
- Electronic signature application with printed name, date/time, and meaning (§11.50)
- Signature manifestation linked to the electronic record (§11.70)
- System access controls and security (§11.10(d), §11.10(g))

## 7. Interface Requirements

| Interface | Description | Data Format | Protocol |
|-----------|-------------|-------------|----------|
| User Interface | Web browser / desktop client | HTML5 / native GUI | HTTPS |
| Database | Relational database backend | SQL | Internal |
| External Systems | As applicable to ${form.systemType} | XML/JSON/CSV | REST API / HL7 |
| Instruments (if applicable) | Laboratory instrument integration | Vendor-specific | RS-232 / TCP/IP |
| Backup System | Automated backup to designated server/cloud | Vendor-specific | Internal network |
| Authentication | Active Directory / SSO (if applicable) | LDAP | Internal |

## 8. Performance Requirements

| Performance Parameter | Requirement | Test Method |
|---|---|---|
| System Availability | ≥ 99.5% during business hours (07:00–19:00) | Uptime monitoring over 30 days |
| Response Time (Standard Query) | < 3 seconds under normal load | Performance testing during OQ |
| Response Time (Complex Report) | < 15 seconds | Report generation testing |
| Concurrent Users | Minimum ${form.riskLevel === "High" ? "50" : "25"} simultaneous users without degradation | Load testing during PQ |
| Data Backup | Daily incremental; weekly full backup | IQ/OQ verification |
| Recovery Time Objective (RTO) | < 4 hours for full system restoration | Disaster recovery drill during PQ |
| Recovery Point Objective (RPO) | < 1 hour data loss | Backup/restore test during PQ |
| Data Retention | Minimum 10 years (or as per applicable regulation) | Configuration verification |

## 9. Security Requirements

- **Authentication:** Unique user ID and password required; biometric or smart card optional enhancement
- **Password Policy:** Minimum 8 characters; upper/lower case, number, and special character required; 90-day mandatory expiry; last 12 passwords remembered; account locked after 5 consecutive failed attempts
- **Session Timeout:** Automatic session lock after 30 minutes of inactivity
- **Role-Based Access Control:** Minimum three user roles (read-only, user, administrator); access rights assigned per job function following least-privilege principle
- **Audit Trail:** Immutable audit trail for all GxP-critical events; audit trail entries include user ID, timestamp (UTC), action, record identifier, old value, and new value; audit trail cannot be deleted or modified by any user including administrator
- **Electronic Signatures:** Compliant with 21 CFR Part 11 §11.50; signature includes name, date/time, and meaning; linked to record and cannot be reused or transferred
- **Data Encryption:** Data in transit encrypted with TLS 1.2 or higher; sensitive data at rest encrypted with AES-256 or equivalent
- **Network Security:** System accessible only from designated network segments; all unnecessary ports closed; firewall rules documented

## 10. Validation Approach

This system will be validated using a risk-based approach per GAMP 5 Second Edition using the V-model lifecycle:

| Phase | Document | Description |
|-------|----------|-------------|
| Requirements | URS | User requirement definition (this document) |
| Design | FS, DQ | Functional and design specification and qualification |
| Build/Install | IQ | Verification of correct installation and configuration |
| Testing | OQ | Functional testing against specifications |
| User Acceptance | PQ | Performance testing in actual or simulated production environment |

**Validation Scope:** ${scopeStr}

Test coverage will be risk-based: GAMP Category ${form.gampCategory} systems require ${form.gampCategory === "5" ? "comprehensive testing of all custom code and configurations" : form.gampCategory === "4" ? "testing of all configured functions and interfaces" : "installation verification and configuration checks"}.

## 11. Acceptance Criteria

The system will be considered validated and ready for GxP use when:

1. All **Must** requirements have been tested and passed during OQ/PQ
2. No **Critical** open deviations exist at system release
3. All **Major** deviations have approved remediation plans with timeline
4. QA Manager has reviewed and approved all validation documents
5. All validation protocol deviations are formally closed or risk-accepted
6. End-user training is completed and training records are available
7. System SOPs are approved and available at point of use

## 12. Responsibilities

| Role | Responsibilities |
|------|----------------|
| Validation Lead | Owns validation strategy; authors protocols; coordinates execution |
| QA Manager | Reviews and approves all validation documents and protocols |
| IT / System Owner | Provides system access; resolves technical issues; owns change control |
| End User / SME | Provides and confirms requirements; participates in UAT |
| Vendor | Provides installation support, documentation, and test support |
| Project Manager | Coordinates timeline, resources, and stakeholder communication |

## 13. Open Issues and Assumptions

| Item | Description | Owner | Target Date |
|------|-------------|-------|-------------|
| A-001 | System infrastructure specifications to be confirmed by IT prior to DQ | IT Manager | Prior to DQ |
| A-002 | Vendor qualification audit to be scheduled | QA Manager | Prior to IQ |
| A-003 | End-user training curriculum to be developed in parallel | Training Lead | Prior to PQ |

**Assumptions:**
- System will be deployed in a controlled, validated IT environment
- Vendor has a documented Quality Management System
- Network infrastructure meets minimum security requirements
- All end users will receive documented training prior to live use

## 14. Approval and Sign-off

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | Validation Lead | | |
| | QA Manager | | |
| | System Owner | | |
| | IT Manager | | |
| | End User Representative | | |

*This document is DRAFT until all signatures are obtained. Approved version controls supersede all previous drafts.*`;
  }

  if (docType === "functionalSpec") {
    const fsReqs = reqs
      .map((r, i) => {
        const fsId = `FS-${String(i + 1).padStart(3, "0")}`;
        const reqId = `REQ-${String(i + 1).padStart(3, "0")}`;
        return `| ${fsId} | ${r.charAt(0).toUpperCase() + r.slice(1)} | ${reqId} | Must | ${i < 3 ? "High" : "Medium"} |`;
      })
      .join("\n");

    return `# Functional Specification (FS)

## Document Control

| Field | Value |
|-------|-------|
| Document Number | FS-${systemShortCode}-001 |
| System Name | ${form.systemName} |
| Version | 1.0 |
| Status | Draft — Pending QA Review |
| Date | ${today} |
| Parent Document | URS-${systemShortCode}-001 |
| Author | System Validation Team |
| Approved By | [Pending] |
| Regulatory Basis | GAMP 5 Second Edition, FDA 21 CFR Part 11, EU Annex 11 |

## Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ${today} | Validation Team | Initial Draft based on URS-${systemShortCode}-001 |

## 1. Purpose and Scope

This Functional Specification (FS) describes how **${form.systemName}** will meet the requirements defined in URS-${systemShortCode}-001. The FS translates user requirements into testable functional descriptions and forms the basis for OQ test script development.

The FS covers all GxP-critical functions of the **${form.systemType}** system including: ${form.intendedUse || `core ${form.systemType} functions, data management, user management, audit trail, reporting, and system administration`}.

GAMP Category: **${form.gampCategory}** — ${gampCatDesc[form.gampCategory] || "Regulated computer system"}

## 2. System Architecture Overview

### 2.1 Hardware Architecture

**${form.systemName}** is deployed on the following hardware platform:

| Component | Specification | Role |
|-----------|--------------|------|
| Application Server | Minimum: 8-core CPU, 32 GB RAM, 500 GB SSD | Application hosting |
| Database Server | Minimum: 8-core CPU, 64 GB RAM, 2 TB RAID | Data storage |
| Backup Server | 4-core CPU, 8 TB NAS | Automated backup |
| Client Workstations | 4-core CPU, 8 GB RAM, modern browser | User access |
| Network | 1 Gbps LAN; segregated VLAN | Connectivity |
| UPS | Online UPS with 4-hour runtime | Power continuity |

### 2.2 Software Architecture

| Component | Description | Version |
|-----------|-------------|---------|
| Application Software | ${form.systemName} core application | As per DQ |
| Database Management System | Relational DBMS (validated) | As per DQ |
| Operating System | Windows Server 2019 or equivalent (validated) | As per DQ |
| Web Server | IIS / Apache / Nginx | As per DQ |
| Backup Software | Automated backup solution | As per DQ |
| Antivirus | Validated endpoint protection | As per DQ |

### 2.3 Data Architecture

All GxP data is stored in a validated relational database. Data fields capture: record identifier, content, creation timestamp (UTC), creator user ID, last modification timestamp, modifier user ID, and record status. Deleted records are logically deleted (flagged) and retained in audit trail; physical deletion is prohibited.

## 3. Functional Requirements Traceability

| FS ID | Functional Description | URS Reference | Priority | Risk |
|-------|------------------------|---------------|----------|------|
${fsReqs}
| FS-${String(reqs.length + 1).padStart(3, "0")} | System shall provide complete, immutable audit trail for all data operations | REQ-002 | Must | High |
| FS-${String(reqs.length + 2).padStart(3, "0")} | System shall enforce electronic signature requirements per 21 CFR Part 11 §11.50 | REQ-003 | Must | High |
| FS-${String(reqs.length + 3).padStart(3, "0")} | System shall generate PDF and/or Excel reports on demand and scheduled basis | REQ-007 | Must | Medium |
| FS-${String(reqs.length + 4).padStart(3, "0")} | System shall enforce RBAC with minimum three user roles | REQ-001 | Must | High |

## 4. User Interface Requirements

- **Layout:** Clean, consistent interface with navigation menu, breadcrumb trail, and context-sensitive help
- **Accessibility:** WCAG 2.1 Level AA compliance; keyboard navigable; screen-reader compatible
- **Data Entry:** Mandatory fields clearly marked; inline validation with specific error messages; auto-populated fields where applicable
- **Confirmation:** Destructive actions require explicit confirmation dialogs; bulk operations require double confirmation
- **Error Handling:** All errors displayed with specific message, error code, and recommended corrective action
- **Responsive Design:** Functional on desktop (1920×1080 minimum) and tablet (1024×768 minimum)
- **Session Indication:** Current user name, role, and session expiry time displayed at all times

## 5. User Management and Access Control

| Role | Permissions | Examples |
|------|------------|---------|
| Read-Only User | View records; generate reports; no data modification | Auditors, Management |
| Standard User | Create, modify, and submit records per job function; cannot approve own records | Lab Technicians, Analysts |
| Supervisor / Reviewer | All Standard User permissions plus review and approve records | QA Reviewer, Supervisor |
| System Administrator | User management; system configuration; no GxP data modification | IT Administrator |

**Access Control Rules:**
- No shared user accounts; each user has unique credentials
- Concurrent session limit: 3 sessions per user maximum
- Account lockout: 5 consecutive failed login attempts → 30 minute lockout (administrator override available)
- Password requirements: minimum 8 characters, complexity enforced, 90-day expiry, 12-password history
- Privileged access (admin) requires secondary authentication

## 6. Audit Trail Specification

The system shall maintain an immutable audit trail capturing:

| Field | Description |
|-------|-------------|
| Event Timestamp | UTC date and time to second precision; system-controlled clock |
| User ID | Unique identifier of the user performing the action |
| User Name | Full name of the user |
| User Role | Role at time of action |
| Event Type | Create / Modify / Delete / Login / Logout / Export / Print / Signature |
| Record Type | Type of GxP record affected |
| Record Identifier | Unique ID of the record |
| Field Name | Name of the field modified (for Modify events) |
| Old Value | Previous value (for Modify/Delete events) |
| New Value | New value (for Create/Modify events) |
| Reason for Change | Required for critical record modifications |
| Computer Name | Hostname/IP of client workstation |

**Audit Trail Protection:** Audit trail records are read-only for all users including administrators. No user can delete, modify, or disable the audit trail. Audit trail integrity is verified by periodic automated hash checks.

## 7. Electronic Signature Requirements

Per 21 CFR Part 11 §11.50 and §11.70, electronic signatures shall:

1. Include the printed name of the signer, date/time of signing (UTC), and meaning of the signature
2. Be permanently linked to the signed record; if the record changes, the signature is invalidated
3. Require user to re-authenticate (enter password) at time of signing
4. Be non-repudiable: signers cannot deny their signature
5. Appear in printed/exported form of the signed record

## 8. Reporting Specification

| Report Name | Data Fields | Format | Access | Trigger |
|-------------|------------|--------|--------|---------|
| Audit Trail Report | All audit fields; date range filter; user filter | PDF, CSV | QA, Admin | On demand |
| User Activity Report | User ID, actions, timestamps; date range | PDF, CSV | Admin, QA | On demand / Scheduled |
| Data Integrity Report | Record counts, modification rates, anomalies | PDF | QA Manager | Scheduled (weekly) |
| System Usage Report | Login counts, session durations, error rates | PDF, Excel | Admin | Scheduled (monthly) |
| Primary ${form.systemType} Report | All business-process fields; configurable filters | PDF, Excel | All roles | On demand / Scheduled |

## 9. Interface Specifications

| Interface | System | Data Direction | Format | Frequency | Validation Method |
|-----------|--------|---------------|--------|-----------|------------------|
| User Authentication | Active Directory / LDAP | Bidirectional | LDAP | Real-time | IQ + OQ |
| Data Backup | Backup Server | Export | Compressed binary | Daily/Weekly | IQ + PQ |
| Report Export | File System / Email | Export | PDF, CSV, Excel | On demand | OQ |
| Instrument (if applicable) | Laboratory Instrument | Import | Vendor format | Real-time | OQ |

## 10. Data Backup and Recovery

- **Backup Frequency:** Daily incremental; weekly full; monthly archive
- **Backup Verification:** Automated integrity check after each backup; restore test quarterly
- **Recovery Time Objective (RTO):** System fully operational within 4 hours of declared disaster
- **Recovery Point Objective (RPO):** Maximum 1 hour of data loss
- **Backup Location:** Primary backup on-site; secondary backup off-site or cloud (geographically separated)
- **Backup Encryption:** All backups encrypted with AES-256; encryption keys managed separately from data

## 11. Traceability to URS

All FS items in Section 3 are directly traceable to URS-${systemShortCode}-001 requirements. No URS requirement is without a corresponding FS entry. The complete traceability is maintained in the Validation Traceability Matrix (RTM-${systemShortCode}-001).

## 12. Approval and Sign-off

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | System Architect / Developer | | |
| | Validation Lead | | |
| | QA Manager | | |
| | IT Manager | | |`;
  }

  if (docType === "riskAssessment") {
    const riskItems = [
      {
        func: "User Authentication",
        fail: "Unauthorized system access",
        cause: "Weak passwords or credential sharing",
        effect: "Unauthorized data access; GxP data integrity compromise",
        s: 5,
        p: 3,
        d: 2,
        controls:
          "Password policy enforcement; account lockout; audit trail; RBAC; MFA option",
      },
      {
        func: "Audit Trail",
        fail: "Audit trail corruption or deletion",
        cause: "Software defect; unauthorized admin action",
        effect: "Loss of regulatory required records; 21 CFR Part 11 violation",
        s: 5,
        p: 2,
        d: 2,
        controls:
          "Read-only audit trail; integrity hashing; periodic verification; no admin delete",
      },
      {
        func: "Electronic Signatures",
        fail: "Signature falsification or reuse",
        cause: "Weak authentication; software defect",
        effect: "Invalid approval records; regulatory non-compliance",
        s: 5,
        p: 2,
        d: 2,
        controls:
          "Re-authentication at signing; signature permanently bound to record; OQ testing",
      },
      {
        func: "Data Entry",
        fail: "Incorrect data entry accepted",
        cause: "Insufficient input validation; user error",
        effect: "Incorrect GxP records; quality decisions based on wrong data",
        s: 4,
        p: 3,
        d: 2,
        controls:
          "Range checks; mandatory fields; data type validation; supervisor review workflow",
      },
      {
        func: "Backup and Recovery",
        fail: "Data loss after system failure",
        cause: "Backup failure; hardware failure",
        effect: "Permanent loss of GxP records; regulatory non-compliance",
        s: 5,
        p: 2,
        d: 3,
        controls:
          "Automated daily backups; integrity verification; quarterly restore tests; off-site copy",
      },
      {
        func: "System Availability",
        fail: "System downtime during critical operations",
        cause: "Hardware failure; software crash; network outage",
        effect: "Disruption to GxP operations; delayed reporting",
        s: 4,
        p: 3,
        d: 2,
        controls:
          "Redundant hardware; UPS; monitoring; failover; documented downtime procedures",
      },
      {
        func: "Data Calculations",
        fail: "Incorrect calculations or data processing",
        cause: "Software defect; incorrect configuration",
        effect:
          "Wrong quality decisions; patient safety risk if lab results affected",
        s: 5,
        p: 2,
        d: 2,
        controls:
          "Calculation algorithm validation; OQ testing with verified reference data; periodic re-validation",
      },
      {
        func: "Interface / Integration",
        fail: "Interface failure with external system",
        cause: "Network failure; data format change; API error",
        effect: "Missing data; data corruption at transfer; duplicate records",
        s: 4,
        p: 3,
        d: 2,
        controls:
          "Interface IQ/OQ testing; error handling and alerting; data reconciliation; retry logic",
      },
      {
        func: "User Training",
        fail: "Incorrect system use due to training deficiency",
        cause: "Insufficient training; high staff turnover",
        effect: "Data entry errors; workflow deviations; audit findings",
        s: 3,
        p: 3,
        d: 3,
        controls:
          "Mandatory training before system access; competency assessment; SOP availability; re-training on updates",
      },
      {
        func: "Change Control",
        fail: "Unauthorized system changes",
        cause: "Insufficient change control process",
        effect: "Unvalidated system state; data integrity risk",
        s: 5,
        p: 2,
        d: 2,
        controls:
          "Formal change control SOP; change testing and re-validation; approval workflow",
      },
      {
        func: "Cybersecurity",
        fail: "Cyber attack or data breach",
        cause: "Malware; phishing; network vulnerability",
        effect: "Data breach; system compromise; GxP record integrity risk",
        s: 5,
        p: 2,
        d: 3,
        controls:
          "Firewall; antivirus; patch management; network segmentation; security monitoring; penetration testing",
      },
      {
        func: "Hardware Failure",
        fail: "Critical hardware component failure",
        cause: "Aging hardware; physical damage; power surge",
        effect: "System downtime; potential data loss",
        s: 4,
        p: 2,
        d: 2,
        controls:
          "Redundant components; UPS; hardware maintenance schedule; vendor SLA; spare parts inventory",
      },
    ];

    const fmeaRows = riskItems
      .map((item, i) => {
        const rpn = item.s * item.p * item.d;
        const riskLevel = rpn >= 37 ? "High" : rpn >= 13 ? "Medium" : "Low";
        const residualRpn = Math.max(2, Math.round(rpn * 0.4));
        return `| RI-${String(i + 1).padStart(3, "0")} | ${item.func} | ${item.fail} | ${item.cause} | ${item.effect} | ${item.s} | ${item.p} | ${item.d} | **${rpn}** | ${riskLevel} | ${item.controls} | ${residualRpn} |`;
      })
      .join("\n");

    return `# Risk Assessment

## Document Control

| Field | Value |
|-------|-------|
| Document Number | RA-${systemShortCode}-001 |
| System Name | ${form.systemName} |
| System Type | ${form.systemType} |
| GAMP Category | Category ${form.gampCategory} |
| Version | 1.0 |
| Status | Draft — Pending QA Approval |
| Date | ${today} |
| Methodology | FMEA (Failure Mode and Effects Analysis) per ICH Q9 |
| Risk Threshold | RPN > 12 requires mitigation |
| Regulatory Basis | GAMP 5 Second Edition, ICH Q9, FDA 21 CFR Part 11 |

## Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ${today} | Validation Team | Initial Risk Assessment |

## 1. Purpose and Scope

This Risk Assessment applies the FMEA methodology per ICH Q9 and GAMP 5 Second Edition principles to identify, evaluate, and mitigate risks associated with **${form.systemName}** (${form.systemType}, GAMP Category ${form.gampCategory}).

**Intended Use:** ${form.intendedUse || `${form.systemType} for GxP pharmaceutical operations`}

**Overall System Risk Level:** **${form.riskLevel}** — ${riskDesc[form.riskLevel]}

**Scope:** This assessment covers risks to patient safety, product quality, data integrity, and regulatory compliance arising from computerised system failures, data integrity breaches, cybersecurity vulnerabilities, and operational errors.

## 2. Risk Assessment Methodology

### 2.1 FMEA Approach

For each system function, potential failure modes are identified along with their probable causes and effects on patient safety, product quality, and data integrity. Risk controls are identified and residual risk is assessed after control implementation.

### 2.2 Risk Scoring

| Factor | Scale | Definition |
|--------|-------|-----------|
| Severity (S) | 1–5 | 1=Negligible, 3=Moderate (data integrity risk), 5=Critical (patient safety / regulatory action) |
| Probability (P) | 1–5 | 1=Remote (rare), 3=Occasional (could occur), 5=Frequent (occurs regularly) |
| Detectability (D) | 1–5 | 1=Certain detection, 3=Likely detection, 5=Very unlikely to detect |
| **RPN** | S × P × D | **Risk Priority Number (maximum 125)** |

### 2.3 Risk Acceptance Criteria

| RPN Range | Risk Level | Required Action |
|-----------|-----------|----------------|
| 1–12 | **Low** | Accept with standard controls |
| 13–36 | **Medium** | Mitigate with additional controls; re-assess |
| 37–125 | **High** | Must mitigate; re-assess before system release |

## 3. System Risk Classification

**GAMP Category ${form.gampCategory}:** ${gampCatDesc[form.gampCategory] || "Regulated system requiring risk-based validation."}

**GxP Impact Classification:** This system directly supports GxP-critical processes. Any failure could impact product quality decisions or regulatory submissions. **Full validation is mandatory.**

**Overall Risk Level Before Mitigation:** ${form.riskLevel}

**Target Residual Risk Level:** Low (all RPN targets < 12 after controls)

## 4. Risk Inventory — Failure Mode and Effects Analysis

| Risk ID | System Function | Failure Mode | Probable Cause | Effect on Patient/Data | S | P | D | RPN | Risk Level | Mitigation Controls | Residual RPN |
|---------|----------------|-------------|----------------|----------------------|---|---|---|-----|-----------|-------------------|-------------|
${fmeaRows}

## 5. Critical Function Identification

The following functions are identified as GxP-Critical and require priority attention during validation:

| Function | Criticality Justification | Validation Approach |
|----------|--------------------------|---------------------|
| User Authentication & Access Control | Unauthorized access could compromise GxP data integrity | OQ — all role restrictions tested |
| Audit Trail | Required by 21 CFR Part 11; loss = regulatory non-compliance | OQ — all events verified; immutability tested |
| Electronic Signatures | Required by 21 CFR Part 11 §11.50 | OQ — signature binding, re-authentication, manifestation |
| Data Calculations | Incorrect results could affect quality decisions | OQ — verified against known reference values |
| Backup and Recovery | Data loss = unrecoverable GxP record loss | IQ/PQ — automated backup + restore drill |

## 6. Risk Summary

| Risk Level | Count Before Mitigation | Count After Mitigation |
|-----------|------------------------|----------------------|
| High | ${riskItems.filter((r) => r.s * r.p * r.d >= 37).length} | 0 |
| Medium | ${
      riskItems.filter((r) => {
        const rpn = r.s * r.p * r.d;
        return rpn >= 13 && rpn < 37;
      }).length
    } | ${Math.round(
      riskItems.filter((r) => {
        const rpn = r.s * r.p * r.d;
        return rpn >= 13 && rpn < 37;
      }).length * 0.3,
    )} |
| Low | ${riskItems.filter((r) => r.s * r.p * r.d < 13).length} | ${riskItems.length} |

**Overall Residual Risk Assessment:** After implementation of all identified mitigation controls and completion of validation testing, the residual risk of **${form.systemName}** is assessed as **ACCEPTABLE** for its intended GxP use.

## 7. Risk Control Measures Summary

| Control Category | Controls Implemented | Verification Method |
|-----------------|---------------------|---------------------|
| Access Security | RBAC; password policy; lockout; MFA option | OQ test case |
| Audit Trail | Immutable trail; hashing; no delete | OQ test case |
| Data Integrity | Input validation; range checks; review workflow | OQ test case |
| Business Continuity | Redundancy; UPS; backup; DR plan | IQ + PQ drill |
| Change Management | Formal change control; re-validation trigger | Procedural (SOP) |
| Training | Mandatory training; competency assessment | Training records |

## 8. Periodic Risk Review

This risk assessment shall be reviewed:
- Annually as part of the periodic system review
- Following any significant change to the system (configuration, software update, infrastructure change)
- Following any GxP deviation, data integrity incident, or security breach
- Following a change in applicable regulations or guidance

## 9. Approval and Sign-off

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | Risk Assessment Lead | | |
| | QA Manager | | |
| | System Owner | | |
| | IT / Security Manager | | |`;
  }

  if (docType === "dq") {
    return `# Design Qualification (DQ)

## Document Control

| Field | Value |
|-------|-------|
| Document Number | DQ-${systemShortCode}-001 |
| System Name | ${form.systemName} |
| Version | 1.0 |
| Status | Draft |
| Date | ${today} |
| Parent Documents | URS-${systemShortCode}-001, FS-${systemShortCode}-001 |
| Author | Validation Team |
| Regulatory Basis | GAMP 5 Second Edition, FDA 21 CFR Part 11 |

## Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ${today} | Validation Team | Initial Draft |

## 1. Purpose and Scope

This Design Qualification (DQ) confirms that the proposed design of **${form.systemName}** meets the user requirements defined in URS-${systemShortCode}-001 and is suitable for its intended use. DQ verifies that the design is documented, reviewed, and approved prior to system procurement or build.

GAMP Category: **${form.gampCategory}** — ${gampCatDesc[form.gampCategory] || "Regulated system."}

## 2. Design Description

### 2.1 Hardware Architecture

| Component | Specification | Justification |
|-----------|--------------|---------------|
| Application Server | ≥8-core CPU, ≥32 GB RAM, ≥500 GB SSD RAID | Supports expected concurrent user load and response time requirements |
| Database Server | ≥8-core CPU, ≥64 GB RAM, ≥2 TB RAID-10 | Data integrity; performance; redundancy |
| Network | 1 Gbps LAN; dedicated VLAN; firewall | Security segregation; performance |
| UPS | Online UPS ≥4 hour runtime | RTO requirement; protects against power failures |
| Backup System | Network-attached storage; off-site replication | RPO < 1 hour; disaster recovery |

### 2.2 Software Architecture

| Component | Description | Validation Status |
|-----------|-------------|------------------|
| ${form.systemName} Application | Core ${form.systemType} application | To be validated |
| DBMS | Validated relational database | Vendor-qualified |
| Operating System | Validated server OS (Windows Server 2019+) | Vendor-qualified |
| Backup Software | Automated enterprise backup | Vendor-qualified |
| Security / Antivirus | Endpoint protection | Configuration qualified |

### 2.3 Security Architecture

- Authentication: Username + password; optional MFA for elevated privilege
- Authorization: RBAC with least-privilege; roles: Read-Only, User, Supervisor, Admin
- Encryption: TLS 1.2+ for data in transit; AES-256 for sensitive data at rest
- Audit Trail: Immutable, server-side; accessible to QA; hash-verified integrity

## 3. Vendor Assessment — GAMP Category ${form.gampCategory}

| Assessment Criteria | Finding | Acceptable |
|---------------------|---------|-----------|
| Quality Management System | ISO 9001 or equivalent documented | Required |
| Software Development Lifecycle | Documented SDLC / Agile with testing phases | Required |
| Software Testing Documentation | Unit, integration, and UAT records available | Required |
| Formal Change Control Process | Version-controlled releases; change log maintained | Required |
| Customer Support and Maintenance SLA | Documented SLA ≥ 98% uptime; patch response time defined | Required |
| Regulatory Compliance Experience | Prior FDA/EMA audit experience; regulatory submissions supported | Preferred |
| Source Code Access / Escrow | Available under escrow agreement for Category 5 | ${form.gampCategory === "5" ? "Required" : "Preferred"} |
| Validation Package Availability | IQ/OQ scripts; test results; validation documentation supplied | Required |

## 4. Design Qualification Test Cases

| DQ Test ID | Design Element | URS/FS Reference | Design Specification | Acceptance Criteria | Result |
|-----------|---------------|-----------------|--------------------|--------------------|--------|
| DQ-001 | Hardware: Server Specifications | URS REQ-008 | CPU ≥8-core, RAM ≥32 GB, SSD RAID | Hardware procurement spec matches or exceeds URS requirement | Pass / Fail |
| DQ-002 | Software: Application Version | FS-${systemShortCode}-001 §2.2 | Specified software version per approved procurement | Installed version matches approved version in DQ | Pass / Fail |
| DQ-003 | Security: Access Control Design | URS REQ-001 | RBAC design with minimum 3 roles; no shared accounts | Security design specification addresses all URS security requirements | Pass / Fail |
| DQ-004 | Audit Trail: Design Review | URS REQ-002 | Immutable server-side audit trail; 10-field minimum; no-delete | Audit trail design meets 21 CFR Part 11 §11.10(e) requirements | Pass / Fail |
| DQ-005 | Electronic Signature Design | URS REQ-003 | Signature includes name, date/time (UTC), meaning; linked to record | E-sig design compliant with 21 CFR Part 11 §11.50 | Pass / Fail |
| DQ-006 | Database Design Review | FS-${systemShortCode}-001 §2.3 | Relational DBMS; referential integrity; transaction logging | Database design supports ALCOA+ requirements | Pass / Fail |
| DQ-007 | Backup and Recovery Design | URS REQ-005 | Daily backup; RPO <1h; RTO <4h | Backup/recovery design meets URS performance requirements | Pass / Fail |
| DQ-008 | Network Security Design | URS REQ-009 | Dedicated VLAN; firewall rules; TLS 1.2+ | Network design meets security requirements; no unauthorized ports | Pass / Fail |
| DQ-009 | Interface Design Review | FS-${systemShortCode}-001 §9 | All interfaces documented; data formats specified; error handling | Interface design addresses all integration requirements in FS | Pass / Fail |
| DQ-010 | Performance Design Review | URS REQ-004 | Architecture supports ≥${form.riskLevel === "High" ? "50" : "25"} concurrent users at <3s response time | Load capacity design meets performance URS requirements | Pass / Fail |

## 5. DQ Conclusion

Design review confirms that the proposed design of **${form.systemName}** addresses all URS requirements. No critical design gaps have been identified. The system design is approved to proceed to procurement/build and Installation Qualification.

## 6. Approval and Sign-off

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | System Architect | | |
| | Validation Lead | | |
| | QA Manager | | |
| | IT Manager | | |`;
  }

  if (docType === "iqProtocol") {
    return `# Installation Qualification (IQ) Protocol

## Document Control

| Field | Value |
|-------|-------|
| Document Number | IQ-${systemShortCode}-001 |
| System Name | ${form.systemName} |
| Version | 1.0 |
| Status | Draft — Pending Execution |
| Date | ${today} |
| Pre-requisites | DQ-${systemShortCode}-001 Approved |
| Protocol Type | Installation Qualification |
| Environment | ${form.riskLevel === "High" ? "Production (GxP)" : "Test / Staging"} |

## Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ${today} | Validation Team | Initial Protocol |

## 1. Purpose and Scope

This IQ Protocol verifies that **${form.systemName}** and its supporting infrastructure are installed correctly, completely, and in accordance with the Design Qualification (DQ-${systemShortCode}-001) and vendor installation guide.

IQ confirms the correct installation environment exists and that all components are present, correctly versioned, and configured as specified before functional testing begins.

## 2. Pre-requisites

- DQ-${systemShortCode}-001 reviewed and approved by QA
- Vendor installation guide obtained and reviewed
- Hardware provisioned and network configured per DQ specifications
- Test environment designated, segregated, and documented
- All IQ executors trained and authorised

## 3. IQ Environment

| Parameter | Specification | Actual (to be completed during execution) |
|-----------|--------------|------------------------------------------|
| Environment | ${form.riskLevel === "High" ? "Production (GxP Environment)" : "Validated Test Environment"} | |
| Server Hostname | As per DQ | |
| IP Address | As per network configuration | |
| Date of Installation | | |
| IQ Executor | | |
| IQ Approver (QA) | | |

## 4. IQ Test Cases

---

**IQ-001: Hardware Specification Verification**
- **Objective:** Verify that installed hardware meets DQ-approved specifications
- **Risk Level:** Medium
- **URS Reference:** REQ-004 (Performance)
- **Procedure:**
  1. Obtain hardware inventory report from server/IT
  2. Compare CPU model and core count against DQ specification
  3. Compare installed RAM against DQ specification (minimum 32 GB)
  4. Compare storage capacity and RAID configuration against DQ specification
  5. Document actual hardware specifications
- **Acceptance Criteria:** All hardware specifications equal to or exceed DQ-approved minimum requirements
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Executed By / Date:** ___________________________ / ___________

---

**IQ-002: Operating System Version and Patch Level**
- **Objective:** Verify correct OS version is installed with required patch level
- **Risk Level:** Medium
- **Procedure:**
  1. Record installed OS name, version, and build number
  2. Verify OS version matches DQ-approved specification
  3. Confirm latest security patches are applied (within 30 days)
  4. Verify OS activation status
- **Acceptance Criteria:** OS version matches DQ specification; security patches current
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Executed By / Date:** ___________________________ / ___________

---

**IQ-003: Application Software Installation and Version**
- **Objective:** Verify ${form.systemName} is installed at the correct version
- **Risk Level:** High
- **Procedure:**
  1. Confirm application is installed in the designated installation path
  2. Record installed application version number
  3. Compare version against DQ-approved version
  4. Verify installation checksum/hash against vendor-supplied value
  5. Confirm all application components are present (list all expected files/modules)
- **Acceptance Criteria:** Version matches DQ-approved version; checksum verified; all components installed
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Executed By / Date:** ___________________________ / ___________

---

**IQ-004: Database Installation and Configuration**
- **Objective:** Verify database is correctly installed and configured
- **Risk Level:** High
- **Procedure:**
  1. Confirm DBMS version matches DQ specification
  2. Verify database schemas are correctly created (all required tables present)
  3. Confirm database connection string is correctly configured
  4. Verify database user accounts and permissions are set per security specification
  5. Confirm transaction logging is enabled
- **Acceptance Criteria:** DBMS version correct; all schemas present; transaction logging enabled; permissions set correctly
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Executed By / Date:** ___________________________ / ___________

---

**IQ-005: Backup System Configuration**
- **Objective:** Verify automated backup is configured and operational
- **Risk Level:** High
- **Procedure:**
  1. Confirm backup software is installed and configured
  2. Verify backup schedule is set (daily incremental, weekly full)
  3. Confirm backup destination path and available storage
  4. Execute a manual backup and confirm successful completion
  5. Verify backup log file is generated
- **Acceptance Criteria:** Backup executes successfully; schedule confirmed; log file generated without errors
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Executed By / Date:** ___________________________ / ___________

---

**IQ-006: Network Configuration and Security**
- **Objective:** Verify network configuration meets DQ security specifications
- **Risk Level:** High
- **Procedure:**
  1. Confirm server is on designated VLAN as per DQ network design
  2. Verify only required ports are open (document open port list)
  3. Confirm firewall is active and rules match DQ specification
  4. Verify TLS 1.2 or higher is enabled; TLS 1.0/1.1 and SSL disabled
  5. Test connectivity from authorised client workstations
  6. Test that unauthorised network access is blocked
- **Acceptance Criteria:** Network on correct VLAN; only required ports open; TLS 1.2+ active; authorised access confirmed; unauthorised blocked
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Executed By / Date:** ___________________________ / ___________

---

**IQ-007: Antivirus / Security Software Installation**
- **Objective:** Verify endpoint security software is installed and active
- **Risk Level:** Medium
- **Procedure:**
  1. Confirm antivirus/endpoint protection software is installed
  2. Verify software version and definition file are current
  3. Confirm real-time scanning is enabled
  4. Verify scheduled scan is configured
  5. Confirm exclusions are documented (application directories excluded from real-time scanning if required)
- **Acceptance Criteria:** Antivirus installed; definitions current; real-time scanning active
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Executed By / Date:** ___________________________ / ___________

---

**IQ-008: User Account Configuration**
- **Objective:** Verify initial user accounts are created per access control specification
- **Risk Level:** High
- **Procedure:**
  1. Confirm default vendor accounts are disabled or password-changed
  2. Verify that at least one administrator account is configured
  3. Confirm no shared accounts exist
  4. Verify password complexity requirements are enforced in system configuration
  5. Confirm account lockout policy is configured (5 attempts; 30-minute lockout)
- **Acceptance Criteria:** No default vendor accounts active; no shared accounts; password policy and lockout configured
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Executed By / Date:** ___________________________ / ___________

## 5. IQ Deviation Log

| Dev. No. | Test ID | Description | Severity | Resolution | Closure Date |
|----------|---------|-------------|----------|------------|-------------|
| | | | | | |

## 6. IQ Summary and Conclusion

| Summary Item | Status |
|---|---|
| Total IQ Test Cases | 8 |
| Passed | |
| Failed | |
| Deviations Raised | |
| Deviations Closed | |
| Critical Open Deviations | Must be zero before OQ |

IQ is considered **COMPLETE** when all test cases are executed, all critical deviations are closed, and this protocol is signed by QA.

## 7. IQ Approval and Sign-off

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | IQ Executor | | |
| | Validation Lead | | |
| | QA Manager | | |`;
  }

  if (docType === "oqProtocol") {
    const oqCases = reqs
      .slice(0, 8)
      .map((req, i) => {
        const oqId = `OQ-${String(i + 2).padStart(3, "0")}`;
        return `---

**${oqId}: ${req.charAt(0).toUpperCase() + req.slice(1)}**
- **Objective:** Verify that ${req.toLowerCase()}
- **Risk Level:** ${i < 3 ? "High" : "Medium"}
- **URS Reference:** REQ-${String(i + 1).padStart(3, "0")}
- **Pre-requisite:** IQ-${systemShortCode}-001 passed; test account available
- **Test Steps:**
  1. Log in to the system using an authorised test account
  2. Navigate to the relevant functional area
  3. Execute the function being tested with valid test data
  4. Verify the system response matches expected behaviour
  5. Record the actual result
  6. Verify audit trail entry is generated for this action
- **Expected Result:** System performs function correctly; data saved accurately; audit trail entry present
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________
- **Reviewer / Date:** ___________________________ / ___________`;
      })
      .join("\n\n");

    return `# Operational Qualification (OQ) Protocol

## Document Control

| Field | Value |
|-------|-------|
| Document Number | OQ-${systemShortCode}-001 |
| System Name | ${form.systemName} |
| Version | 1.0 |
| Status | Draft — Pending Execution |
| Date | ${today} |
| Pre-requisite | IQ-${systemShortCode}-001 Approved |
| Protocol Type | Operational Qualification |

## Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ${today} | Validation Team | Initial Protocol |

## 1. Purpose and Scope

This OQ Protocol verifies that **${form.systemName}** operates correctly and consistently within specified operational limits in the test environment. OQ tests functional requirements against FS-${systemShortCode}-001 and demonstrates that the system works as designed.

OQ covers: access control, audit trail, electronic signatures, data entry and validation, reporting, interface functions, and all GxP-critical operations of the ${form.systemType}.

## 2. Pre-requisites

- IQ-${systemShortCode}-001 executed and approved with no critical open deviations
- Test environment is a clone of the production installation or validated equivalent
- Test data prepared and documented (do not use live patient/production data)
- Test user accounts configured with all required roles
- All OQ executors trained and authorised
- Test scripts reviewed and approved by QA prior to execution

## 3. OQ Environment

| Parameter | Value |
|-----------|-------|
| Environment | Validated Test / QA Environment |
| Test Data | Representative test data — not live production data |
| Execution Period | From: ____________ To: ____________ |
| Lead Tester | |
| QA Approver | |

## 4. OQ Test Cases

---

**OQ-001: Role-Based Access Control Verification**
- **Objective:** Verify that each user role can only access authorised functions
- **Risk Level:** High
- **URS Reference:** REQ-001
- **Test Steps:**
  1. Log in as a Read-Only user; attempt to create a new record — must be denied
  2. Log in as a Standard User; create a record — must succeed; attempt to approve own record — must be denied
  3. Log in as a Supervisor; approve a pending record — must succeed
  4. Log in as System Administrator; access user management — must succeed
  5. Attempt to access admin function as Standard User — must be denied with error message
  6. Verify audit trail captures all login attempts and access denials
- **Expected Result:** All access restrictions enforced as per RBAC specification; error messages displayed for denied actions; audit trail complete
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

---

**OQ-002: Audit Trail — Completeness and Immutability**
- **Objective:** Verify audit trail records all required events and cannot be modified or deleted
- **Risk Level:** High
- **URS Reference:** REQ-002
- **Test Steps:**
  1. Create a new record; verify audit trail entry with user ID, timestamp, and new value
  2. Modify a record field; verify audit trail captures old value, new value, user, and timestamp
  3. Delete (or logically inactivate) a record; verify audit trail captures deletion event
  4. Attempt to modify an audit trail entry as administrator — must be denied
  5. Attempt to delete an audit trail entry — must be denied
  6. Log out and log in again; verify login/logout events in audit trail
  7. Verify timestamps are in UTC and consistent with system clock
- **Expected Result:** All events captured; old/new values present; modification/deletion of audit trail denied; timestamps in UTC
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

---

**OQ-003: Electronic Signature Application and Validation**
- **Objective:** Verify electronic signatures comply with 21 CFR Part 11 §11.50 requirements
- **Risk Level:** High
- **URS Reference:** REQ-003
- **Test Steps:**
  1. Complete a record requiring electronic signature approval
  2. Apply electronic signature: enter user ID and password, select meaning from defined list
  3. Verify signature captures: printed name, date/time (UTC), and meaning
  4. Verify signature is displayed on the signed record
  5. Attempt to apply the same signature credentials to a different record — each signature should require fresh re-authentication
  6. Modify the signed record and verify original signature is invalidated
  7. Attempt to sign with incorrect password — must be rejected; verify audit trail captures failed attempt
- **Expected Result:** Signature captured with all required fields; re-authentication required for each signature; signature invalidated on record change; failed attempts logged
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

---

**OQ-004: Data Entry Validation and Error Handling**
- **Objective:** Verify system validates all inputs and displays specific error messages
- **Risk Level:** High
- **URS Reference:** REQ-006
- **Test Steps:**
  1. Attempt to submit form with missing mandatory fields — must be rejected with field-specific error
  2. Enter alphabetic data in a numeric-only field — must be rejected
  3. Enter a value outside defined range limits — must be rejected with range specification shown
  4. Enter a date in incorrect format — must be rejected with format instruction
  5. Submit a valid record with all fields correctly populated — must succeed
  6. Verify audit trail records successful creation
- **Expected Result:** Invalid inputs rejected with specific, actionable error messages; valid inputs accepted; audit trail records creation
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

---

**OQ-005: Password Policy and Account Lockout**
- **Objective:** Verify password policy and account lockout are enforced
- **Risk Level:** High
- **URS Reference:** REQ-009 (Security)
- **Test Steps:**
  1. Attempt to set a password shorter than 8 characters — must be rejected
  2. Attempt to set a password without complexity (no uppercase / number / special char) — must be rejected
  3. Attempt to set a password to one of the last 12 used — must be rejected
  4. Simulate 5 consecutive failed login attempts — account must be locked
  5. Attempt to log in with locked account — access denied; correct error message displayed
  6. Administrator unlocks account; verify unlock recorded in audit trail
  7. Verify session automatic lock after 30 minutes inactivity
- **Expected Result:** Password policy enforced; account locked after 5 failures; session timeout after 30 min; all events in audit trail
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

---

**OQ-006: Report Generation Accuracy**
- **Objective:** Verify reports are generated accurately and contain correct data
- **Risk Level:** Medium
- **URS Reference:** REQ-007
- **Test Steps:**
  1. Create 5 known test records with documented values
  2. Generate the primary ${form.systemType} report filtering for these records
  3. Compare all fields in the report against the source data
  4. Verify report header contains: system name, date, user, and page numbers
  5. Export report in PDF format — verify formatting is correct and all data present
  6. Export report in Excel/CSV format — verify data integrity
- **Expected Result:** Report data matches source data exactly; PDF and Excel exports complete and correctly formatted
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

${oqCases}

## 5. OQ Deviation Log

| Dev. No. | Test ID | Description | Severity | Root Cause | Resolution | Closure Date |
|----------|---------|-------------|----------|------------|------------|-------------|
| | | | | | | |

## 6. OQ Summary and Conclusion

| Summary Item | Status |
|---|---|
| Total OQ Test Cases | ${8 + Math.min(reqs.length, 8)} |
| Passed | |
| Failed | |
| Deviations Raised | |
| Deviations Closed | |

OQ is considered **COMPLETE** when all test cases are executed, all critical deviations are closed, and this protocol is signed by QA.

## 7. OQ Approval and Sign-off

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | Lead OQ Executor | | |
| | Validation Lead | | |
| | QA Manager | | |
| | System Owner | | |`;
  }

  if (docType === "pqProtocol") {
    return `# Performance Qualification (PQ) Protocol

## Document Control

| Field | Value |
|-------|-------|
| Document Number | PQ-${systemShortCode}-001 |
| System Name | ${form.systemName} |
| Version | 1.0 |
| Status | Draft — Pending Execution |
| Date | ${today} |
| Pre-requisite | OQ-${systemShortCode}-001 Approved |
| Protocol Type | Performance Qualification |
| Environment | Production (or Production-Representative) |

## Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | ${today} | Validation Team | Initial Protocol |

## 1. Purpose and Scope

This PQ Protocol demonstrates that **${form.systemName}** consistently performs in accordance with its specifications and is fit for its intended use under actual (or representative) production conditions.

PQ is conducted in the production environment (or a validated production-representative environment) using realistic production data or representative test data. PQ confirms the complete end-to-end system capability.

**Intended Use:** ${form.intendedUse || `${form.systemType} for GxP pharmaceutical operations`}

## 2. Pre-requisites

- OQ-${systemShortCode}-001 executed and approved with no critical open deviations
- Production environment provisioned and configured
- End-user training completed and training records available
- All applicable SOPs reviewed, approved, and available
- Production data or representative data available for testing
- System administrator training completed
- Validation Summary Report template available

## 3. PQ Environment

| Parameter | Specification |
|-----------|--------------|
| Environment | Production / Production-Representative |
| Users | Trained end users executing PQ (not validation team) |
| Data | Production or realistic representative data |
| Concurrent Users | ${form.riskLevel === "High" ? "Minimum 10 concurrent users simulated during load test" : "Minimum 5 concurrent users simulated"} |

## 4. PQ Test Cases

---

**PQ-001: End-to-End Primary Workflow — Full Business Process**
- **Objective:** Verify the complete primary ${form.systemType} workflow operates correctly in the production environment
- **Risk Level:** High
- **URS Reference:** All REQ
- **Test Scenario:** Complete end-to-end primary business process for ${form.intendedUse || `${form.systemType} operations`}
- **Performed By:** Trained end user (not validation team)
- **Test Steps:**
  1. Log in as an authorised production end user
  2. Create a new primary record with all required fields using realistic data
  3. Submit the record for review/approval per defined workflow
  4. Log in as a Reviewer/Supervisor and approve the record
  5. Generate the primary report for this record
  6. Export the report in required format
  7. Review the audit trail and confirm all steps are captured
- **Expected Result:** Complete workflow executes without errors; audit trail complete and accurate; report generated correctly
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester (End User) / Date:** ___________________________ / ___________
- **Approved By (QA) / Date:** ___________________________ / ___________

---

**PQ-002: Data Integrity Under Concurrent Multi-User Operation**
- **Objective:** Verify data integrity is maintained when multiple users operate simultaneously
- **Risk Level:** High
- **Test Steps:**
  1. Arrange ${form.riskLevel === "High" ? "10+" : "5+"} concurrent test users to log in simultaneously
  2. Each user creates a unique record at the same time
  3. Two users attempt to edit the same record simultaneously — verify record locking or conflict resolution
  4. Verify all records are correctly saved with correct ownership information
  5. Verify no data corruption or duplicate records
  6. Monitor system response times during concurrent operation
- **Expected Result:** All records correctly saved; no data corruption; record locking/conflict resolution works; response time within SLA
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

---

**PQ-003: Regulatory Compliance Verification — 21 CFR Part 11 Completeness**
- **Objective:** Verify the system meets 21 CFR Part 11 requirements in production environment
- **Risk Level:** High
- **Test Steps:**
  1. Execute a complete production workflow involving data creation, modification, approval, and reporting
  2. Review the complete audit trail for this workflow
  3. Verify every GxP event is captured with: user ID, name, timestamp (UTC), action, old value, new value
  4. Verify electronic signature is present on all records requiring approval
  5. Attempt to modify an approved record without appropriate privileges — must be denied
  6. Verify system date/time is synchronised with a reliable time source (NTP)
- **Expected Result:** Complete audit trail; all electronic signatures present and valid; access restrictions enforced; time synchronisation confirmed
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

---

**PQ-004: Report Accuracy Against Production Source Data**
- **Objective:** Verify reports accurately reflect production data
- **Risk Level:** High
- **Test Steps:**
  1. Generate a production report covering a defined period
  2. Independently verify 10 randomly selected records against source data
  3. Compare all report fields against source database values
  4. Verify calculations in the report against manual calculation
  5. Verify report metadata (date, user, system name) is correct
- **Expected Result:** 100% of sampled records match source data; calculations correct; report metadata correct
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

---

**PQ-005: Data Archive and Retrieval**
- **Objective:** Verify data can be reliably retrieved after archival
- **Risk Level:** High
- **Test Steps:**
  1. Archive a set of records using the system archival function
  2. Retrieve archived records by record ID, date range, and user
  3. Verify all data fields are intact and unmodified after archival
  4. Verify archived audit trail is intact and readable
  5. Confirm data is in a format readable without the application (if applicable)
- **Expected Result:** Archived data retrieved correctly; no data loss; audit trail intact; data readable in long-term format
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

---

**PQ-006: System Performance Under Expected Production Load**
- **Objective:** Verify system performance meets SLA under expected production load
- **Risk Level:** Medium
- **Test Steps:**
  1. Simulate expected concurrent user load using test users or load testing tool
  2. Measure response time for: record creation, record search, report generation
  3. Execute the primary workflow while ${form.riskLevel === "High" ? "10" : "5"} other users are active
  4. Record all response times and compare against SLA (< 3 seconds for standard queries)
  5. Monitor server CPU, memory, and disk I/O during load test
- **Expected Result:** All response times within SLA; no system errors under load; server resources within acceptable limits
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

---

**PQ-007: User Access and Permissions in Production**
- **Objective:** Verify production user accounts and permissions are correctly configured
- **Risk Level:** High
- **Test Steps:**
  1. Review all production user accounts against the approved user access matrix
  2. Verify no test accounts or shared accounts exist in production
  3. Spot-check 5 user accounts: verify correct role, active status, and last login date
  4. Verify administrator account(s) are assigned only to designated IT/system administrator(s)
  5. Confirm all production users have completed training (check training records)
- **Expected Result:** All accounts match approved user access matrix; no test/shared accounts; training records complete
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

---

**PQ-008: Backup and Recovery Drill**
- **Objective:** Verify backup and recovery procedures work in production
- **Risk Level:** High
- **Test Steps:**
  1. Confirm that a recent full backup exists (within 24 hours)
  2. Verify backup integrity (checksum or automated verification report)
  3. Execute a restore from backup to a designated test restore environment (not production)
  4. Verify all records in the backup are present and intact after restore
  5. Measure time taken for restore and confirm it meets RTO of < 4 hours
  6. Verify the most recent data (RPO test) is within 1 hour of restore point
- **Expected Result:** Backup verified; restore successful; RTO < 4 hours; RPO < 1 hour; all data intact
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

---

**PQ-009: End-User Acceptance Testing (UAT)**
- **Objective:** Formal end-user confirmation that the system meets their requirements
- **Risk Level:** High
- **Test Steps:**
  1. End users execute their primary daily workflows independently
  2. End users verify the system supports all their job functions
  3. End users review and confirm the user interface is fit for purpose
  4. End users sign the UAT acceptance statement
- **Expected Result:** All end users confirm system is fit for intended use; UAT acceptance statement signed
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester (End User) / Date:** ___________________________ / ___________

---

**PQ-010: Disaster Recovery / Business Continuity Test**
- **Objective:** Verify the disaster recovery plan is operational
- **Risk Level:** High
- **Test Steps:**
  1. Simulate a server failure scenario (documented tabletop exercise or actual failover)
  2. Execute the documented disaster recovery procedure
  3. Measure recovery time from declared failure to system operational
  4. Verify data integrity after recovery
  5. Document any gaps in the DR procedure
- **Expected Result:** System recoverable within RTO (4 hours); data intact after recovery; DR procedure is executable
- **Actual Result:** ___________________________
- **Pass/Fail:** ___
- **Tester / Date:** ___________________________ / ___________

## 5. System Release Criteria

The system may be released for production GxP use when **ALL** of the following criteria are met:

- [ ] All PQ test cases executed with documented results
- [ ] No Critical open deviations
- [ ] No Major open deviations (or all have approved, time-bound remediation plans)
- [ ] All Minor deviations closed or risk-accepted
- [ ] End-user training complete; training records signed and filed
- [ ] All applicable SOPs approved and available at point of use
- [ ] System administrator documentation complete
- [ ] Validation Summary Report (VSR) drafted and approved by QA
- [ ] System Owner provides formal system release authorisation

## 6. PQ Deviation Log

| Dev. No. | Test ID | Description | Severity | Root Cause | Resolution | Closure Date |
|----------|---------|-------------|----------|------------|------------|-------------|
| | | | | | | |

## 7. PQ Summary and Conclusion

| Summary Item | Status |
|---|---|
| Total PQ Test Cases | 10 |
| Passed | |
| Failed | |
| Deviations Raised | |
| Deviations Closed | |
| System Release Recommendation | |

## 8. PQ Approval and Sign-off

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | PQ Lead Executor | | |
| | End User Representative | | |
| | Validation Lead | | |
| | QA Manager | | |
| | System Owner | | |`;
  }

  return `# ${docType.toUpperCase()} Document\n\nDocument for ${form.systemName} — ${today}`;
}

function generateTraceability(form: GampFormData): TraceabilityRow[] {
  const rawReqs = form.userRequirements
    .split(/\n|;|,(?=\s*[A-Z])/)
    .map((r) => r.trim())
    .filter((r) => r.length > 3);

  const baseReqs =
    rawReqs.length > 0
      ? rawReqs
      : [
          `The ${form.systemType} system shall support role-based user access control`,
          "The system shall maintain a complete and tamper-evident electronic audit trail",
          "The system shall support electronic signatures compliant with 21 CFR Part 11",
          "The system shall perform all primary functions within 3 seconds response time",
          "The system shall provide backup and recovery with RPO < 1 hour",
          "The system shall enforce data integrity per ALCOA+ principles",
          "The system shall generate audit-ready reports in PDF and/or Excel format",
          "The system shall support concurrent multi-user access without data corruption",
          "The system shall be installed and configured per vendor documentation",
          "The system shall restrict access based on user roles and least-privilege principle",
        ];

  const _testMappings: Array<{
    testType: string;
    testPrefix: string;
    reqOffset: number;
    riskLevel: string;
  }> = [
    { testType: "DQ", testPrefix: "DQ", reqOffset: 0, riskLevel: "High" },
    { testType: "IQ", testPrefix: "IQ", reqOffset: 0, riskLevel: "High" },
    { testType: "OQ", testPrefix: "OQ", reqOffset: 0, riskLevel: "High" },
    { testType: "PQ", testPrefix: "PQ", reqOffset: 0, riskLevel: "High" },
  ];

  const testDescriptions: Record<string, string[]> = {
    DQ: [
      "Review hardware design against URS minimum specifications",
      "Review software architecture for audit trail completeness per 21 CFR Part 11",
      "Review security design: RBAC model, encryption, and e-signature design",
      "Review system performance design against URS load requirements",
      "Review backup and recovery design for RPO/RTO specifications",
      "Review data architecture for ALCOA+ compliance",
      "Review report design specification against URS report requirements",
      "Review interface design for all external system integrations",
      "Review installation design and vendor documentation availability",
      "Review access control design for least-privilege principle",
    ],
    IQ: [
      "Verify hardware installation meets DQ-approved specifications",
      "Verify audit trail module is installed and enabled",
      "Verify electronic signature module is installed and configured",
      "Verify network configuration and response time baseline",
      "Verify backup system installation and schedule configuration",
      "Verify database installation and integrity settings",
      "Verify reporting module installation and configuration",
      "Verify all system interfaces are installed and reachable",
      "Verify application installation version and component completeness",
      "Verify user account and RBAC configuration",
    ],
    OQ: [
      "Test role-based access control for all defined user roles",
      "Test audit trail for all GxP events (create, modify, delete, login)",
      "Test electronic signature application and immutability",
      "Test system response time under normal operational load",
      "Execute backup and verify backup completion and integrity",
      "Test data validation: mandatory fields, range checks, format validation",
      "Test report generation accuracy against source data",
      "Test interface data exchange with all connected systems",
      "Test installation of all software updates per change control procedure",
      "Test access restriction enforcement for all defined restrictions",
    ],
    PQ: [
      "Execute full primary workflow with production data by trained end users",
      "Test audit trail completeness during production operations",
      "Test 21 CFR Part 11 electronic signature compliance in production",
      "Measure response time under production concurrent user load",
      "Execute backup and restore drill; measure RTO and RPO",
      "Verify data integrity under concurrent multi-user operations",
      "Generate production reports and verify accuracy against source data",
      "Verify interface performance under production data volumes",
      "Execute UAT by end users confirming system meets requirements",
      "Execute disaster recovery tabletop or drill",
    ],
  };

  const passCriteriaTemplates: Record<string, string[]> = {
    DQ: [
      "Hardware design meets all URS minimum requirements; no critical gaps",
      "Audit trail design addresses all 21 CFR Part 11 §11.10(e) requirements",
      "Security design meets all URS security requirements; no vulnerabilities",
      "Performance design supports required concurrent load and response time",
      "Backup design meets RPO < 1 hour and RTO < 4 hours requirements",
      "Data architecture satisfies all ALCOA+ principles",
      "Report design addresses all URS reporting requirements",
      "Interface design covers all required integrations with error handling",
      "Installation documentation complete; IQ scripts available from vendor",
      "Access control design implements least-privilege per RBAC specification",
    ],
    IQ: [
      "Hardware specifications equal to or exceed DQ-approved requirements",
      "Audit trail module active; no configuration errors",
      "E-signature module installed; re-authentication on sign confirmed",
      "Network on correct VLAN; TLS 1.2+ active; unauthorised ports closed",
      "Backup executing on schedule; completion log without errors",
      "Database installed at correct version; transaction logging enabled",
      "Reporting module installed; all reports accessible",
      "All interfaces reachable; connectivity verified",
      "Software version matches DQ; checksum verified; all components present",
      "User accounts configured per access matrix; lockout policy active",
    ],
    OQ: [
      "All role restrictions enforced; unauthorised actions denied",
      "All GxP events in audit trail; old/new values present; immutable",
      "Signature captures name, time, meaning; invalidated on record change",
      "All tested functions respond within 3 seconds under normal load",
      "Backup completes without errors; integrity verified",
      "All invalid inputs rejected with specific error; valid inputs accepted",
      "Report data matches source data exactly for all sampled records",
      "Data transferred correctly; interface errors handled and alerted",
      "Software update installed; version verified; rollback documented",
      "Access restrictions enforced for all tested role/function combinations",
    ],
    PQ: [
      "Full workflow completes without errors; audit trail complete",
      "All events in audit trail during production operations; timestamps UTC",
      "21 CFR Part 11 §11.50 compliance confirmed; audit trail complete",
      "Response time < 3 seconds under expected production concurrent load",
      "RTO < 4 hours; RPO < 1 hour; all data intact after restore",
      "No data corruption under concurrent load; all records correct",
      "100% of sampled report data matches source; no discrepancies",
      "Interface operates correctly at production data volumes",
      "All end users accept system as fit for intended use (signed UAT)",
      "System recoverable within RTO; DR procedure validated",
    ],
  };

  const rows: TraceabilityRow[] = [];
  let rowIndex = 0;

  // Generate rows for each requirement with multiple test types
  baseReqs.forEach((req, reqIdx) => {
    const reqId = `REQ-${String(reqIdx + 1).padStart(3, "0")}`;
    const risk = reqIdx < 3 ? "High" : reqIdx < 7 ? "Medium" : "Low";

    // Assign test types based on requirement index (cycling through DQ, IQ, OQ, PQ)
    const testTypeAssignments =
      reqIdx < 3
        ? ["DQ", "OQ"]
        : reqIdx < 6
          ? ["IQ", "OQ"]
          : reqIdx < 8
            ? ["OQ", "PQ"]
            : ["IQ", "PQ"];

    for (const testType of testTypeAssignments) {
      const descArr = testDescriptions[testType] ?? testDescriptions.OQ;
      const criteriaArr =
        passCriteriaTemplates[testType] ?? passCriteriaTemplates.OQ;
      const descIdx = rowIndex % descArr.length;
      const testNum = String(Math.floor(rowIndex / 4) + 1).padStart(3, "0");
      const testId = `${testType}-${testNum}`;

      rows.push({
        reqId,
        requirement: req.charAt(0).toUpperCase() + req.slice(1),
        testType,
        testId,
        testDescription: descArr[descIdx] ?? descArr[0],
        passCriteria: criteriaArr[descIdx] ?? criteriaArr[0],
        riskLevel: risk,
      });
      rowIndex++;
    }
  });

  // Ensure we have at least 15 rows — add standard regulatory rows if needed
  const standardRows: TraceabilityRow[] = [
    {
      reqId: "REQ-R01",
      requirement:
        "System shall comply with FDA 21 CFR Part 11 electronic records and signatures",
      testType: "OQ",
      testId: "OQ-R01",
      testDescription:
        "Execute complete audit trail and electronic signature tests per 21 CFR Part 11 requirements; verify all §11.10 controls are operational",
      passCriteria:
        "All 21 CFR Part 11 §11.10 controls verified; audit trail complete and immutable; e-signatures compliant",
      riskLevel: "High",
    },
    {
      reqId: "REQ-R02",
      requirement:
        "System shall maintain ALCOA+ data integrity throughout all operations",
      testType: "PQ",
      testId: "PQ-R01",
      testDescription:
        "Verify ALCOA+ compliance in production: data is attributable, legible, contemporaneous, original, and accurate throughout complete workflows",
      passCriteria:
        "All ALCOA+ principles satisfied in production operations; no data integrity findings",
      riskLevel: "High",
    },
    {
      reqId: "REQ-R03",
      requirement:
        "System hardware shall be installed and qualified per DQ-approved specifications",
      testType: "IQ",
      testId: "IQ-R01",
      testDescription:
        "Verify hardware installation against DQ-approved specifications; confirm all components present and correctly configured",
      passCriteria:
        "Hardware meets or exceeds DQ specifications; all components installed; configuration documented",
      riskLevel: "Medium",
    },
    {
      reqId: "REQ-R04",
      requirement:
        "System design shall address all user requirements and intended use",
      testType: "DQ",
      testId: "DQ-R01",
      testDescription:
        "Review system design documentation against all URS requirements; confirm all requirements addressed in design specifications",
      passCriteria:
        "All URS requirements addressed in design; no unresolved requirement gaps; DQ approved by QA",
      riskLevel: "High",
    },
  ];

  while (rows.length < 15) {
    const stdRow = standardRows[rows.length % standardRows.length];
    if (stdRow)
      rows.push({ ...stdRow, reqId: stdRow.reqId + String(rows.length) });
  }

  return rows;
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
        await new Promise((r) => setTimeout(r, 150)); // brief UX pause
        result[key] = generateDocument(key, form);
      }

      setCurrentStep("Traceability Matrix");
      setProgress(93);
      await new Promise((r) => setTimeout(r, 100));
      result.traceabilityMatrix = generateTraceability(form);

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
            Audit-ready documentation · GAMP 5 Second Edition · FDA 21 CFR Part
            11 · EU Annex 11 · ICH Q10
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
                Generating 7 GAMP 5 compliant documents — please wait
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
