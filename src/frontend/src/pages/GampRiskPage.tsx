import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Cpu,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";
import {
  getCurrentUser,
  getCurrentUserId,
  isAdminAuthed,
} from "../utils/accessControl";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SystemInput {
  systemName: string;
  systemType: string;
  gampCategory: string;
  customizationLevel: string;
  numUsers: string;
  dataCriticality: string;
  integrationComplexity: string;
  intendedUse: string;
  userRequirements: string;
  riskOverride: string;
}

interface RiskFactor {
  factor: string;
  score: number;
  description: string;
  mitigation: string;
}

interface ValidationScope {
  required: boolean;
  rationale: string;
  keyTests: string[];
}

interface ComplianceGap {
  gap: string;
  regulation: string;
  priority: "High" | "Medium" | "Low";
}

interface RiskResult {
  riskScore: number;
  riskLevel: string;
  riskRationale: string;
  topRiskFactors: RiskFactor[];
  validationScope: {
    iq: ValidationScope;
    oq: ValidationScope;
    pq: ValidationScope;
  };
  complianceGaps: ComplianceGap[];
  overallRecommendation: string;
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

// ─── Constants ────────────────────────────────────────────────────────────────

const GAMP_DESCRIPTIONS: Record<string, string> = {
  "1": "Infrastructure Software — OS, databases, networks",
  "3": "Non-Configured Software — off-the-shelf products",
  "4": "Configured Software — LIMS, MES, ERP systems",
  "5": "Custom/Bespoke Software — fully custom-built",
};

const RISK_COLORS: Record<string, string> = {
  Low: "oklch(0.42 0.14 145)",
  Medium: "oklch(0.72 0.15 78)",
  High: "oklch(0.68 0.18 45)",
  Critical: "oklch(0.55 0.20 25)",
};

const DOC_TYPES = [
  {
    key: "urs",
    label: "User Requirement Specification",
    icon: ClipboardList,
    ext: "docx",
  },
  {
    key: "functionalSpec",
    label: "Functional Specification",
    icon: FileText,
    ext: "docx",
  },
  {
    key: "riskAssessment",
    label: "Risk Assessment",
    icon: ShieldAlert,
    ext: "docx",
  },
  { key: "dq", label: "Design Qualification (DQ)", icon: Cpu, ext: "docx" },
  { key: "iqProtocol", label: "IQ Protocol", icon: Shield, ext: "docx" },
  { key: "oqProtocol", label: "OQ Protocol", icon: ShieldCheck, ext: "docx" },
  { key: "pqProtocol", label: "PQ Protocol", icon: CheckCircle2, ext: "docx" },
  {
    key: "traceabilityMatrix",
    label: "Traceability Matrix",
    icon: FileSpreadsheet,
    ext: "xlsx",
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRiskColor(level: string): string {
  return RISK_COLORS[level] || "oklch(0.42 0.14 145)";
}

function getRiskBgColor(level: string): string {
  const map: Record<string, string> = {
    Low: "oklch(0.42 0.14 145 / 0.10)",
    Medium: "oklch(0.72 0.15 78 / 0.12)",
    High: "oklch(0.68 0.18 45 / 0.12)",
    Critical: "oklch(0.55 0.20 25 / 0.12)",
  };
  return map[level] || "oklch(0.42 0.14 145 / 0.10)";
}

function getRiskBorderColor(level: string): string {
  const map: Record<string, string> = {
    Low: "oklch(0.42 0.14 145 / 0.30)",
    Medium: "oklch(0.72 0.15 78 / 0.30)",
    High: "oklch(0.68 0.18 45 / 0.30)",
    Critical: "oklch(0.55 0.20 25 / 0.30)",
  };
  return map[level] || "oklch(0.42 0.14 145 / 0.30)";
}

// ─── Risk Score Gauge ─────────────────────────────────────────────────────────

function RiskGauge({ score, level }: { score: number; level: string }) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = 70;
  const strokeWidth = 14;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * radius;
  // Only draw top 270 degrees (from -135 to +135)
  const arcLength = circumference * 0.75;
  const fillLength = (clampedScore / 100) * arcLength;
  const gapLength = arcLength - fillLength;
  const color = getRiskColor(level);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width="180"
        height="130"
        viewBox="0 0 180 130"
        role="img"
        aria-label="Risk score gauge"
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="oklch(0.88 0.012 240)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeDashoffset={circumference * 0.125}
          strokeLinecap="round"
        />
        {/* Fill */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${fillLength} ${gapLength + circumference - arcLength}`}
          strokeDashoffset={circumference * 0.125}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease-out" }}
        />
        {/* Score */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: "28px",
            fontWeight: "700",
            fill: color,
            fontFamily: "inherit",
          }}
        >
          {clampedScore}
        </text>
        <text
          x={cx}
          y={cy + 18}
          textAnchor="middle"
          style={{
            fontSize: "9px",
            fill: "oklch(0.55 0.015 240)",
            fontFamily: "inherit",
          }}
        >
          RISK SCORE
        </text>
        {/* Min/max labels */}
        <text
          x="18"
          y="118"
          style={{
            fontSize: "9px",
            fill: "oklch(0.65 0.01 240)",
            fontFamily: "inherit",
          }}
        >
          0
        </text>
        <text
          x="152"
          y="118"
          style={{
            fontSize: "9px",
            fill: "oklch(0.65 0.01 240)",
            fontFamily: "inherit",
          }}
        >
          100
        </text>
      </svg>
      <div
        className="px-3 py-1 rounded-full text-xs font-bold tracking-wide"
        style={{
          background: getRiskBgColor(level),
          color: getRiskColor(level),
          border: `1px solid ${getRiskBorderColor(level)}`,
        }}
      >
        {level} Risk
      </div>
    </div>
  );
}

// ─── Document generation helpers (from Gamp5Page) ─────────────────────────────

function markdownToHtml(text: string): string {
  if (!text) return "";
  return text
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
    .replace(
      /^# (.+)$/gm,
      '<h1 style="font-size:1.4rem;font-weight:700;color:#0f172a;margin:24px 0 12px;border-bottom:2px solid #166534;padding-bottom:8px;">$1</h1>',
    )
    .replace(
      /^## (.+)$/gm,
      '<h2 style="font-size:1.1rem;font-weight:700;color:#14532d;margin:20px 0 8px;border-left:3px solid #16a34a;padding-left:8px;">$1</h2>',
    )
    .replace(
      /^### (.+)$/gm,
      '<h3 style="font-size:0.95rem;font-weight:600;color:#166534;margin:14px 0 6px;">$1</h3>',
    )
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#1e293b;">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(
      /^---+$/gm,
      '<hr style="border:none;border-top:2px solid #dcfce7;margin:20px 0;">',
    )
    .replace(
      /^\d+\. (.+)$/gm,
      '<li style="margin:4px 0;padding-left:4px;list-style-type:decimal;">$1</li>',
    )
    .replace(
      /^[-*•] (.+)$/gm,
      '<li style="margin:4px 0;padding-left:4px;list-style-type:disc;">$1</li>',
    )
    .replace(
      /(<li[^>]*>[\s\S]*?<\/li>\n?)+/g,
      (match: string) =>
        `<ul style="margin:8px 0 8px 20px;padding:0;">${match}</ul>`,
    )
    .replace(
      /\n\n/g,
      '</p><p style="margin:8px 0;line-height:1.75;color:#334155;">',
    )
    .replace(/\n/g, "<br>");
}

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
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><title>${title}</title>
<style>
@page { margin: 2.54cm; size: A4; }
body { font-family: "Times New Roman", Times, serif; font-size: 11pt; color: #000; line-height: 1.6; }
h1 { font-size: 16pt; font-weight: bold; color: #14532d; border-bottom: 2pt solid #16a34a; padding-bottom: 6pt; margin-top: 0; }
h2 { font-size: 13pt; font-weight: bold; color: #166534; margin-top: 18pt; margin-bottom: 6pt; border-left: 3pt solid #16a34a; padding-left: 6pt; }
h3 { font-size: 11pt; font-weight: bold; color: #166534; margin-top: 12pt; margin-bottom: 4pt; }
table { border-collapse: collapse; width: 100%; margin: 10pt 0; }
td, th { border: 1pt solid #94a3b8; padding: 5pt 8pt; font-size: 10pt; vertical-align: top; }
th { background-color: #dcfce7; font-weight: bold; color: #14532d; }
tr:nth-child(even) td { background-color: #f8fffe; }
p { margin: 6pt 0; line-height: 1.6; }
ul, ol { margin: 6pt 0 6pt 20pt; } li { margin: 3pt 0; }
.header-box { border: 2pt solid #14532d; padding: 12pt; margin-bottom: 18pt; background: #f0fdf4; }
.footer { font-size: 8pt; color: #6b7280; border-top: 1pt solid #94a3b8; padding-top: 6pt; margin-top: 30pt; }
</style></head>
<body>
<div class="header-box">
<h1>${title}</h1>
<table>
<tr><td><strong>System Name:</strong></td><td>${systemName}</td><td><strong>Document No.:</strong></td><td>${title.substring(0, 3).toUpperCase()}-${systemName.replace(/\s+/g, "").substring(0, 6).toUpperCase()}-001</td></tr>
<tr><td><strong>Version:</strong></td><td>1.0 (Draft)</td><td><strong>Date:</strong></td><td>${date}</td></tr>
<tr><td><strong>Regulatory Basis:</strong></td><td colspan="3">GAMP 5 Second Edition, FDA 21 CFR Part 11, EU Annex 11, ICH Q10</td></tr>
<tr><td><strong>Status:</strong></td><td colspan="3">DRAFT — Pending QA Review and Approval</td></tr>
</table></div>
<p style="margin:8px 0;line-height:1.75;color:#334155;">${htmlContent}</p>
<div class="footer">AyurNexis 3.1 — GAMP 5 Validation Document Generator &nbsp;|&nbsp; CONFIDENTIAL — FOR VALIDATION USE ONLY &nbsp;|&nbsp; Generated: ${date}</div>
</body></html>`;
  return new Blob([wordHtml], { type: "application/msword" });
}

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
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><style>
body{font-family:Calibri,Arial;font-size:10pt;}table{border-collapse:collapse;width:100%;}
th{background:#14532d;color:white;padding:8px 10px;text-align:left;border:1px solid #0d3520;font-size:10pt;}
td{border:1px solid #d0e8d8;padding:6px 8px;vertical-align:top;font-size:9pt;}
tr:nth-child(even) td{background:#f0fdf4;}h2{color:#14532d;font-size:14pt;margin-bottom:4px;}.meta{font-size:9pt;color:#6b7280;margin-bottom:12px;}
</style></head><body>
<h2>Validation Traceability Matrix — ${systemName}</h2>
<p class="meta">Generated: ${date} | Version: 1.0 | Regulatory Basis: GAMP 5 Ed.2, FDA 21 CFR Part 11 | Status: Pending Execution</p>
<table><tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr>
${rows.map((r) => `<tr><td style="font-family:monospace;font-weight:bold;color:#14532d;">${r.reqId}</td><td>${r.requirement}</td><td ${riskStyle(r.riskLevel)}>${r.riskLevel}</td><td ${typeStyle(r.testType)}>${r.testType}</td><td style="font-family:monospace;color:#374151;">${r.testId}</td><td>${r.testDescription}</td><td>${r.passCriteria}</td><td style="color:#6b7280;font-style:italic;">Pending</td><td></td><td></td></tr>`).join("\n")}
</table>
<p style="margin-top:20px;font-size:8pt;color:#9ca3af;">AyurNexis 3.1 — GAMP 5 Validation Document Generator | CONFIDENTIAL</p>
</body></html>`;
  return new Blob([html], { type: "application/vnd.ms-excel" });
}

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

// Build a traceability matrix from the risk result
function buildTraceabilityRows(
  input: SystemInput,
  riskResult: RiskResult,
): TraceabilityRow[] {
  const rawReqs = input.userRequirements
    .split(/\n|;|,(?=\s*[A-Z])/)
    .map((r) => r.trim())
    .filter((r) => r.length > 3)
    .slice(0, 12);

  const baseReqs =
    rawReqs.length > 0
      ? rawReqs
      : [
          "System shall implement role-based user access control",
          "System shall maintain complete and immutable electronic audit trail",
          "System shall support electronic signatures per 21 CFR Part 11",
          "System shall perform all primary functions within 3 second response time",
          "System shall provide backup and recovery with RPO < 1 hour",
          "System shall enforce data integrity per ALCOA+ principles",
          "System shall generate audit-ready reports in PDF and Excel format",
          "System shall support concurrent multi-user access",
        ];

  const testTypes = ["IQ", "OQ", "PQ"] as const;
  const rows: TraceabilityRow[] = [];

  baseReqs.forEach((req, i) => {
    const testType = testTypes[Math.min(2, Math.floor(i / 3))];
    const riskLvl = i < 3 ? "High" : i < 6 ? "Medium" : "Low";
    rows.push({
      reqId: `REQ-${String(i + 1).padStart(3, "0")}`,
      requirement: req.charAt(0).toUpperCase() + req.slice(1),
      testType,
      testId: `${testType}-${String(i + 1).padStart(3, "0")}`,
      testDescription: `Verify that: ${req.charAt(0).toLowerCase() + req.slice(1)}`,
      passCriteria: "System meets specified requirement with no deviations",
      riskLevel: riskLvl,
    });
  });

  // Add compliance gap rows
  (Array.isArray(riskResult.complianceGaps) ? riskResult.complianceGaps : [])
    .slice(0, 4)
    .forEach((gap, i) => {
      rows.push({
        reqId: `CG-${String(i + 1).padStart(3, "0")}`,
        requirement: gap.gap,
        testType: "OQ",
        testId: `OQ-CG-${String(i + 1).padStart(3, "0")}`,
        testDescription: `Verify compliance with ${gap.regulation}: ${gap.gap}`,
        passCriteria: `No deviations against ${gap.regulation} requirements`,
        riskLevel: gap.priority,
      });
    });

  return rows;
}

// Build document content with AI risk data injected
function generateDocumentContent(
  docKey: string,
  input: SystemInput,
  riskResult: RiskResult,
): string {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const shortCode = input.systemName
    .replace(/\s+/g, "")
    .substring(0, 6)
    .toUpperCase();
  const factorsTable = riskResult.topRiskFactors
    .map(
      (f, i) =>
        `| RF-${String(i + 1).padStart(3, "0")} | ${f.factor} | ${f.score} | ${f.description} | ${f.mitigation} |`,
    )
    .join("\n");
  const gapTable = riskResult.complianceGaps
    .map(
      (g, i) =>
        `| CG-${String(i + 1).padStart(3, "0")} | ${g.gap} | ${g.regulation} | ${g.priority} |`,
    )
    .join("\n");

  if (docKey === "riskAssessment") {
    return `# Risk Assessment — AI-Enhanced

## Document Control

| Field | Value |
|-------|-------|
| Document No. | RA-${shortCode}-001 |
| System | ${input.systemName} |
| Type | ${input.systemType} |
| GAMP Category | ${input.gampCategory} |
| Date | ${today} |
| Risk Level | **${riskResult.riskLevel}** |
| Risk Score | **${riskResult.riskScore}/100** |
| Methodology | FMEA + AI Risk Analysis (GAMP 5, ICH Q9) |

## 1. AI-Generated Risk Summary

**Overall Risk Score:** ${riskResult.riskScore}/100

**Risk Level:** ${riskResult.riskLevel}

**Rationale:** ${riskResult.riskRationale}

**Overall Recommendation:** ${riskResult.overallRecommendation}

## 2. Top Risk Factors

| Risk ID | Factor | Score | Description | Mitigation |
|---------|--------|-------|-------------|------------|
${factorsTable}

## 3. Compliance Gap Analysis

| Gap ID | Gap Description | Regulation | Priority |
|--------|----------------|------------|----------|
${gapTable}

## 4. Validation Scope

**IQ Required:** ${riskResult.validationScope.iq.required ? "Yes" : "No"}
${riskResult.validationScope.iq.rationale}

Key Tests: ${riskResult.validationScope.iq.keyTests.join(", ")}

**OQ Required:** ${riskResult.validationScope.oq.required ? "Yes" : "No"}
${riskResult.validationScope.oq.rationale}

Key Tests: ${riskResult.validationScope.oq.keyTests.join(", ")}

**PQ Required:** ${riskResult.validationScope.pq.required ? "Yes" : "No"}
${riskResult.validationScope.pq.rationale}

Key Tests: ${riskResult.validationScope.pq.keyTests.join(", ")}

## 5. Approval

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | Risk Assessment Lead | | |
| | QA Manager | | |
| | System Owner | | |`;
  }

  if (docKey === "urs") {
    const reqs = input.userRequirements
      .split(/\n|;/)
      .map((r) => r.trim())
      .filter((r) => r.length > 3);
    const reqRows = (
      reqs.length > 0
        ? reqs
        : [
            "System shall implement role-based access control",
            "System shall maintain an immutable audit trail",
            "System shall support electronic signatures per 21 CFR Part 11",
            "System shall achieve 99.5% availability during business hours",
            "System shall encrypt all data in transit with TLS 1.2+",
          ]
    )
      .map(
        (r, i) =>
          `| REQ-${String(i + 1).padStart(3, "0")} | ${r.charAt(0).toUpperCase() + r.slice(1)} | ${i < 2 ? "High" : "Medium"} | Must | Regulatory / Business |`,
      )
      .join("\n");

    return `# User Requirement Specification (URS)

## Document Control

| Field | Value |
|-------|-------|
| Document No. | URS-${shortCode}-001 |
| System | ${input.systemName} |
| Type | ${input.systemType} |
| GAMP Category | ${input.gampCategory} |
| Risk Level | ${riskResult.riskLevel} (Score: ${riskResult.riskScore}/100) |
| Date | ${today} |
| Status | Draft — Pending QA Review |

## 1. Intended Use

${input.intendedUse || `${input.systemType} for GxP-regulated pharmaceutical operations.`}

## 2. Regulatory Basis

GAMP 5 Second Edition, FDA 21 CFR Part 11, EU Annex 11, ICH Q9, ICH Q10, ISO/IEC 27001

## 3. Requirements

| Req ID | Statement | Risk | Priority | Source |
|--------|-----------|------|----------|--------|
${reqRows}

## 4. AI-Identified Risk Factors Affecting Requirements

${riskResult.topRiskFactors.map((f, i) => `**RF-${i + 1}. ${f.factor} (Score: ${f.score}/100):** ${f.description} — Mitigation: ${f.mitigation}`).join("\n\n")}

## 5. Approval

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | Validation Lead | | |
| | QA Manager | | |`;
  }

  if (docKey === "iqProtocol") {
    const tests = riskResult.validationScope.iq.keyTests;
    return `# Installation Qualification (IQ) Protocol

## Document Control

| Field | Value |
|-------|-------|
| Document No. | IQ-${shortCode}-001 |
| System | ${input.systemName} |
| Risk Level | ${riskResult.riskLevel} |
| Date | ${today} |

## 1. Objective

Verify that ${input.systemName} is installed correctly and completely per vendor specifications and design documentation.

## 2. Scope

This protocol covers hardware installation, software installation, configuration baseline, and system documentation verification.

**AI Risk Rationale:** ${riskResult.validationScope.iq.rationale}

## 3. Test Cases

${tests.map((t, i) => `### IQ-TC-${String(i + 1).padStart(3, "0")}: ${t}\n\n**Expected Result:** Verification passes with documented evidence.\n\n**Actual Result:** [ ]\n\n**Pass/Fail:** [ ]\n`).join("\n")}

## 4. Approval

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | IQ Tester | | |
| | QA Reviewer | | |`;
  }

  if (docKey === "oqProtocol") {
    const tests = riskResult.validationScope.oq.keyTests;
    return `# Operational Qualification (OQ) Protocol

## Document Control

| Field | Value |
|-------|-------|
| Document No. | OQ-${shortCode}-001 |
| System | ${input.systemName} |
| Risk Level | ${riskResult.riskLevel} |
| Date | ${today} |

## 1. Objective

Verify that ${input.systemName} operates as specified across the intended operating range and that all functions meet their specifications.

**AI Risk Rationale:** ${riskResult.validationScope.oq.rationale}

## 2. Test Cases

${tests.map((t, i) => `### OQ-TC-${String(i + 1).padStart(3, "0")}: ${t}\n\n**Test Steps:** 1. Configure system for test. 2. Execute test. 3. Record results.\n\n**Expected Result:** Function operates within specification.\n\n**Actual Result:** [ ]\n\n**Pass/Fail:** [ ]\n`).join("\n")}

## 3. Approval

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | OQ Tester | | |
| | QA Reviewer | | |`;
  }

  if (docKey === "pqProtocol") {
    const tests = riskResult.validationScope.pq.keyTests;
    return `# Performance Qualification (PQ) Protocol

## Document Control

| Field | Value |
|-------|-------|
| Document No. | PQ-${shortCode}-001 |
| System | ${input.systemName} |
| Risk Level | ${riskResult.riskLevel} |
| Date | ${today} |

## 1. Objective

Demonstrate that ${input.systemName} consistently performs in accordance with its intended use under actual or simulated production conditions.

**AI Risk Rationale:** ${riskResult.validationScope.pq.rationale}

## 2. Test Cases

${tests.map((t, i) => `### PQ-TC-${String(i + 1).padStart(3, "0")}: ${t}\n\n**Condition:** Normal production use conditions.\n\n**Expected Result:** Performance meets specification.\n\n**Actual Result:** [ ]\n\n**Pass/Fail:** [ ]\n`).join("\n")}

## 3. Approval

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | PQ Lead | | |
| | QA Manager | | |`;
  }

  if (docKey === "functionalSpec") {
    return `# Functional Specification (FS)

## Document Control

| Field | Value |
|-------|-------|
| Document No. | FS-${shortCode}-001 |
| System | ${input.systemName} |
| Type | ${input.systemType} |
| GAMP Category | ${input.gampCategory} |
| Risk Level | ${riskResult.riskLevel} |
| Date | ${today} |

## 1. System Overview

${input.intendedUse || `${input.systemType} system supporting GxP-regulated pharmaceutical operations.`}

## 2. Functional Requirements

All functional requirements are derived from URS-${shortCode}-001 and incorporate the AI-identified risk factors with priority level ${riskResult.riskLevel}.

### 2.1 Core Functions

- Role-based access control with minimum three user roles (read-only, user, administrator)
- Immutable audit trail capturing all GxP-critical events per 21 CFR Part 11
- Electronic signature support with re-authentication and signature manifestation
- Data integrity enforcement per ALCOA+ principles
- Automated backup and disaster recovery

### 2.2 AI-Identified High-Priority Functions

${riskResult.topRiskFactors
  .filter((f) => f.score > 50)
  .map((f) => `- **${f.factor}:** ${f.mitigation}`)
  .join("\n")}

## 3. Compliance Gaps to Address

${riskResult.complianceGaps.map((g) => `- **${g.priority}:** ${g.gap} (${g.regulation})`).join("\n")}

## 4. Approval

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | System Architect | | |
| | QA Manager | | |`;
  }

  if (docKey === "dq") {
    return `# Design Qualification (DQ)

## Document Control

| Field | Value |
|-------|-------|
| Document No. | DQ-${shortCode}-001 |
| System | ${input.systemName} |
| Type | ${input.systemType} |
| GAMP Category | ${input.gampCategory} |
| Risk Level | ${riskResult.riskLevel} (Score: ${riskResult.riskScore}/100) |
| Date | ${today} |

## 1. Purpose

Confirm that the proposed design of ${input.systemName} meets the requirements in URS-${shortCode}-001 and incorporates controls for AI-identified risk factors.

## 2. Design Review Against Risk Factors

${riskResult.topRiskFactors.map((f, i) => `### ${i + 1}. ${f.factor} (Risk Score: ${f.score}/100)\n\n**Description:** ${f.description}\n\n**Design Control:** ${f.mitigation}\n\n**DQ Verification:** Confirm control is included in system design documentation.`).join("\n\n")}

## 3. Compliance Design Requirements

${riskResult.complianceGaps.map((g) => `- **[${g.priority}] ${g.regulation}:** Design must address: ${g.gap}`).join("\n")}

## 4. Approval

| Name | Title | Signature | Date |
|------|-------|-----------|------|
| | Design Lead | | |
| | QA Manager | | |`;
  }

  return `# ${docKey} — ${input.systemName}\n\nGenerated: ${today}`;
}

// ─── Step 1: System Info Form ─────────────────────────────────────────────────

function Step1Form({
  input,
  setInput,
  credits,
  creditsLoading,
  onNext,
}: {
  input: SystemInput;
  setInput: (v: SystemInput) => void;
  credits: number | null;
  creditsLoading: boolean;
  onNext: () => void;
}) {
  const isAdmin = isAdminAuthed();
  const hasCredits = isAdmin || (credits !== null && credits > 0);

  const field = (
    label: string,
    key: keyof SystemInput,
    type: "text" | "number" = "text",
  ) => (
    <div>
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      <input
        type={type}
        className="mt-1 w-full px-3 py-2 rounded-lg border text-sm text-foreground bg-background focus:outline-none focus:border-primary transition-colors"
        style={{ borderColor: "oklch(0.88 0.012 240)" }}
        value={input[key]}
        onChange={(e) => setInput({ ...input, [key]: e.target.value })}
        data-ocid={`gamp_risk.${key}.input`}
      />
    </div>
  );

  const select = (
    label: string,
    key: keyof SystemInput,
    options: { value: string; label: string }[],
  ) => (
    <div>
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      <select
        className="mt-1 w-full px-3 py-2 rounded-lg border text-sm text-foreground bg-background focus:outline-none focus:border-primary transition-colors"
        style={{ borderColor: "oklch(0.88 0.012 240)" }}
        value={input[key]}
        onChange={(e) => setInput({ ...input, [key]: e.target.value })}
        data-ocid={`gamp_risk.${key}.select`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-6"
    >
      {/* Credits chip */}
      <div className="flex items-center gap-3">
        {creditsLoading ? (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{
              background: "oklch(0.97 0.004 240)",
              border: "1px solid oklch(0.88 0.012 240)",
            }}
          >
            <Loader2 size={12} className="animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Loading credits…</span>
          </div>
        ) : isAdmin ? (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "oklch(0.42 0.14 145 / 0.10)",
              color: "oklch(0.35 0.14 145)",
              border: "1px solid oklch(0.42 0.14 145 / 0.30)",
            }}
          >
            <Zap size={12} />
            Admin — Unlimited Credits
          </div>
        ) : credits === 0 ? (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "oklch(0.55 0.20 25 / 0.10)",
              color: "oklch(0.45 0.18 25)",
              border: "1px solid oklch(0.55 0.20 25 / 0.30)",
            }}
            data-ocid="gamp_risk.no_credits.error_state"
          >
            <AlertCircle size={12} />
            No Credits — Contact Admin
          </div>
        ) : (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: "oklch(0.97 0.004 240)",
              color: "oklch(0.42 0.14 145)",
              border: "1px solid oklch(0.42 0.14 145 / 0.30)",
            }}
            data-ocid="gamp_risk.credits.panel"
          >
            <Zap size={12} />
            AI Credits Remaining: {credits}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field("System Name *", "systemName")}
        {select("System Type *", "systemType", [
          {
            value: "LIMS",
            label: "LIMS — Laboratory Information Management System",
          },
          { value: "MES", label: "MES — Manufacturing Execution System" },
          { value: "ERP", label: "ERP — Enterprise Resource Planning" },
          {
            value: "SCADA",
            label: "SCADA — Supervisory Control & Data Acquisition",
          },
          { value: "DCS", label: "DCS — Distributed Control System" },
          { value: "CDS", label: "CDS — Chromatography Data System" },
          { value: "QMS", label: "QMS — Quality Management System" },
          { value: "CTMS", label: "CTMS — Clinical Trial Management System" },
          {
            value: "PIMS",
            label: "PIMS — Pharmaceutical Information Management",
          },
          {
            value: "EDMS",
            label: "EDMS — Electronic Document Management System",
          },
          { value: "Other", label: "Other Regulated System" },
        ])}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {select("GAMP Category *", "gampCategory", [
            { value: "1", label: "Category 1 — Infrastructure Software" },
            { value: "3", label: "Category 3 — Non-Configured Software" },
            { value: "4", label: "Category 4 — Configured Software" },
            { value: "5", label: "Category 5 — Custom/Bespoke Software" },
          ])}
          {input.gampCategory && (
            <p className="mt-1 text-xs text-muted-foreground pl-1">
              {GAMP_DESCRIPTIONS[input.gampCategory]}
            </p>
          )}
        </div>
        {select("Customization Level", "customizationLevel", [
          { value: "Off-the-shelf", label: "Off-the-shelf" },
          { value: "Configured", label: "Configured" },
          { value: "Customized", label: "Customized" },
          { value: "Bespoke", label: "Bespoke (Fully Custom)" },
        ])}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {field("Number of Users", "numUsers", "number")}
        {select("Data Criticality", "dataCriticality", [
          { value: "Low", label: "Low" },
          { value: "Medium", label: "Medium" },
          { value: "High", label: "High" },
          { value: "Critical", label: "Critical (Patient Safety)" },
        ])}
        {select("Integration Complexity", "integrationComplexity", [
          { value: "Standalone", label: "Standalone" },
          { value: "Few Integrations", label: "Few Integrations" },
          { value: "Highly Integrated", label: "Highly Integrated" },
        ])}
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Intended Use *
        </Label>
        <Textarea
          className="mt-1 text-sm"
          rows={3}
          placeholder="Describe the intended use of this system in your GxP environment…"
          value={input.intendedUse}
          onChange={(e) => setInput({ ...input, intendedUse: e.target.value })}
          data-ocid="gamp_risk.intendedUse.textarea"
        />
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          User Requirements
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-1">
          Enter one requirement per line. These will be mapped to test cases in
          the Traceability Matrix.
        </p>
        <Textarea
          className="mt-1 text-sm font-mono"
          rows={5}
          placeholder="The system shall maintain an audit trail&#10;The system shall support role-based access control&#10;The system shall comply with 21 CFR Part 11…"
          value={input.userRequirements}
          onChange={(e) =>
            setInput({ ...input, userRequirements: e.target.value })
          }
          data-ocid="gamp_risk.userRequirements.textarea"
        />
      </div>

      {select("Risk Level Override", "riskOverride", [
        { value: "Auto-Detect", label: "Auto-Detect (Recommended)" },
        { value: "Low", label: "Low" },
        { value: "Medium", label: "Medium" },
        { value: "High", label: "High" },
        { value: "Critical", label: "Critical" },
      ])}

      <div className="flex justify-end pt-2">
        <Button
          data-ocid="gamp_risk.run_analysis.primary_button"
          disabled={!input.systemName || !input.intendedUse || !hasCredits}
          onClick={onNext}
          className="px-6 gap-2"
          style={{ background: "oklch(0.42 0.14 145)", color: "white" }}
        >
          Run AI Risk Analysis
          <ChevronRight size={16} />
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Step 2: Loading ───────────────────────────────────────────────────────────

function Step2Loading() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-24 gap-6"
    >
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: "oklch(0.42 0.14 145 / 0.10)",
            border: "2px solid oklch(0.42 0.14 145 / 0.30)",
          }}
        >
          <Shield size={32} style={{ color: "oklch(0.42 0.14 145)" }} />
        </div>
        <div className="absolute -top-1 -right-1">
          <Loader2
            size={22}
            className="animate-spin"
            style={{ color: "oklch(0.42 0.14 145)" }}
          />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Analyzing System Risk Profile…
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Applying GAMP 5 Second Edition, ICH Q9, and ISO 13485 guidelines to
          evaluate your system's validation risks.
        </p>
        <p className="text-xs text-muted-foreground">
          Estimated time: 10–25 seconds
        </p>
      </div>
      <div
        className="w-64 h-1.5 rounded-full overflow-hidden"
        style={{ background: "oklch(0.88 0.012 240)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "oklch(0.42 0.14 145)" }}
          initial={{ width: "0%" }}
          animate={{ width: "90%" }}
          transition={{ duration: 18, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

// ─── Step 3: Risk Dashboard ───────────────────────────────────────────────────

function Step3Dashboard({
  input,
  result,
  onGenerate,
  onBack,
}: {
  input: SystemInput;
  result: RiskResult;
  onGenerate: () => void;
  onBack: () => void;
}) {
  const [expandedScope, setExpandedScope] = useState<string | null>(null);

  const safeFactors = Array.isArray(result.topRiskFactors)
    ? result.topRiskFactors
    : [];
  const radarData = safeFactors.map((f) => ({
    factor: f.factor.length > 18 ? `${f.factor.substring(0, 16)}…` : f.factor,
    score: f.score,
    fullFactor: f.factor,
  }));

  const priorityColor = (p: string) => {
    if (p === "High")
      return {
        bg: "oklch(0.55 0.20 25 / 0.12)",
        text: "oklch(0.45 0.18 25)",
        border: "oklch(0.55 0.20 25 / 0.30)",
      };
    if (p === "Medium")
      return {
        bg: "oklch(0.72 0.15 78 / 0.12)",
        text: "oklch(0.50 0.12 78)",
        border: "oklch(0.72 0.15 78 / 0.30)",
      };
    return {
      bg: "oklch(0.42 0.14 145 / 0.10)",
      text: "oklch(0.35 0.13 145)",
      border: "oklch(0.42 0.14 145 / 0.30)",
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* A: Score Gauge + Rationale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          style={{
            background: "oklch(1.0 0 0)",
            border: "1px solid oklch(0.88 0.012 240)",
          }}
          data-ocid="gamp_risk.score.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              AI Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center pb-4">
            <RiskGauge score={result.riskScore} level={result.riskLevel} />
            <p className="text-xs text-center text-muted-foreground mt-2 max-w-xs leading-relaxed">
              System:{" "}
              <span className="font-semibold text-foreground">
                {input.systemName}
              </span>{" "}
              | {input.systemType} | GAMP {input.gampCategory}
            </p>
          </CardContent>
        </Card>

        <Card
          style={{
            background: "oklch(1.0 0 0)",
            border: "1px solid oklch(0.88 0.012 240)",
          }}
          data-ocid="gamp_risk.rationale.card"
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Risk Rationale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">
              {result.riskRationale}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* B: Risk Factors Chart */}
      <Card
        style={{
          background: "oklch(1.0 0 0)",
          border: "1px solid oklch(0.88 0.012 240)",
        }}
        data-ocid="gamp_risk.factors.card"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <BarChart3 size={14} />
            Top Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={radarData}
                margin={{ top: 0, right: 8, bottom: 0, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.92 0.008 240)"
                />
                <XAxis dataKey="factor" tick={{ fontSize: 9 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: "1px solid oklch(0.88 0.012 240)",
                  }}
                  formatter={(val: number, _name: string, props: any) =>
                    [val, props?.payload?.fullFactor ?? _name] as [
                      number,
                      string,
                    ]
                  }
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {(radarData ?? []).map((entry) => (
                    <Cell
                      key={entry.fullFactor}
                      fill={
                        entry.score >= 75
                          ? "oklch(0.55 0.20 25)"
                          : entry.score >= 50
                            ? "oklch(0.68 0.18 45)"
                            : entry.score >= 25
                              ? "oklch(0.72 0.15 78)"
                              : "oklch(0.42 0.14 145)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {(Array.isArray(result.topRiskFactors)
                ? result.topRiskFactors
                : []
              ).map((f) => (
                <div
                  key={f.factor}
                  className="p-2.5 rounded-lg"
                  style={{
                    background: "oklch(0.97 0.004 240)",
                    border: "1px solid oklch(0.92 0.008 240)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">
                      {f.factor}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{
                        color:
                          f.score >= 75
                            ? "oklch(0.55 0.20 25)"
                            : f.score >= 50
                              ? "oklch(0.68 0.18 45)"
                              : "oklch(0.42 0.14 145)",
                      }}
                    >
                      {f.score}/100
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* D: Validation Scope */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
        data-ocid="gamp_risk.validation_scope.panel"
      >
        {(
          [
            {
              key: "iq",
              label: "Installation Qualification (IQ)",
              scope: result.validationScope.iq,
            },
            {
              key: "oq",
              label: "Operational Qualification (OQ)",
              scope: result.validationScope.oq,
            },
            {
              key: "pq",
              label: "Performance Qualification (PQ)",
              scope: result.validationScope.pq,
            },
          ] as const
        ).map(({ key, label, scope }) => (
          <Card
            key={key}
            style={{
              background: "oklch(1.0 0 0)",
              border: `1px solid ${scope.required ? "oklch(0.42 0.14 145 / 0.30)" : "oklch(0.88 0.012 240)"}`,
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold text-foreground">
                  {label}
                </CardTitle>
                <Badge
                  style={{
                    background: scope.required
                      ? "oklch(0.42 0.14 145 / 0.12)"
                      : "oklch(0.88 0.012 240 / 0.5)",
                    color: scope.required
                      ? "oklch(0.35 0.14 145)"
                      : "oklch(0.55 0.015 240)",
                  }}
                >
                  {scope.required ? "Required" : "Optional"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">
                {scope.rationale}
              </p>
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-primary font-medium"
                onClick={() =>
                  setExpandedScope(expandedScope === key ? null : key)
                }
                data-ocid={`gamp_risk.${key}_scope.toggle`}
              >
                {expandedScope === key ? (
                  <ChevronUp size={12} />
                ) : (
                  <ChevronDown size={12} />
                )}
                {scope.keyTests.length} Key Tests
              </button>
              <AnimatePresence>
                {expandedScope === key && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1"
                  >
                    {scope.keyTests.map((t) => (
                      <li
                        key={t}
                        className="text-[10px] text-foreground flex gap-1.5"
                      >
                        <CheckCircle2
                          size={10}
                          className="flex-shrink-0 mt-0.5"
                          style={{ color: "oklch(0.42 0.14 145)" }}
                        />
                        {t}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* E: Compliance Gaps */}
      {Array.isArray(result.complianceGaps) &&
        result.complianceGaps.length > 0 && (
          <Card
            style={{
              background: "oklch(1.0 0 0)",
              border: "1px solid oklch(0.88 0.012 240)",
            }}
            data-ocid="gamp_risk.compliance_gaps.card"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                Compliance Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid oklch(0.88 0.012 240)",
                      }}
                    >
                      <th className="text-left py-2 pr-4 text-muted-foreground font-semibold">
                        Gap Description
                      </th>
                      <th className="text-left py-2 pr-4 text-muted-foreground font-semibold">
                        Regulation
                      </th>
                      <th className="text-left py-2 text-muted-foreground font-semibold">
                        Priority
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(result.complianceGaps)
                      ? result.complianceGaps
                      : []
                    ).map((gap) => {
                      const c = priorityColor(gap.priority);
                      return (
                        <tr
                          key={gap.gap}
                          style={{
                            borderBottom: "1px solid oklch(0.95 0.005 240)",
                          }}
                        >
                          <td className="py-2 pr-4 text-foreground">
                            {gap.gap}
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground font-mono text-[10px]">
                            {gap.regulation}
                          </td>
                          <td className="py-2">
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                              style={{
                                background: c.bg,
                                color: c.text,
                                border: `1px solid ${c.border}`,
                              }}
                            >
                              {gap.priority}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

      {/* F: Overall Recommendation */}
      <Card
        style={{
          background: "oklch(0.97 0.006 145)",
          border: "1px solid oklch(0.42 0.14 145 / 0.25)",
        }}
        data-ocid="gamp_risk.recommendation.card"
      >
        <CardHeader className="pb-2">
          <CardTitle
            className="text-sm font-semibold flex items-center gap-2"
            style={{ color: "oklch(0.35 0.14 145)" }}
          >
            <ShieldCheck size={14} />
            Overall Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "oklch(0.28 0.10 145)" }}
          >
            {result.overallRecommendation}
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button
          data-ocid="gamp_risk.back.secondary_button"
          variant="outline"
          onClick={onBack}
          className="gap-2"
        >
          <RefreshCw size={14} />
          Re-analyze with Different Inputs
        </Button>
        <Button
          data-ocid="gamp_risk.generate_docs.primary_button"
          onClick={onGenerate}
          className="gap-2 px-6"
          style={{ background: "oklch(0.42 0.14 145)", color: "white" }}
        >
          Generate Validation Documents
          <ChevronRight size={16} />
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Step 4: Document Generation ─────────────────────────────────────────────

function Step4Documents({
  input,
  result,
  auditDate,
  userName,
  onBack,
}: {
  input: SystemInput;
  result: RiskResult;
  auditDate: string;
  userName: string;
  onBack: () => void;
}) {
  const [generated, setGenerated] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (docKey: string, _ext: string) => {
    setDownloading(docKey);
    try {
      const doc = DOC_TYPES.find((d) => d.key === docKey)!;
      const cleanName = input.systemName.replace(/\s+/g, "_").toUpperCase();

      if (docKey === "traceabilityMatrix") {
        const rows = buildTraceabilityRows(input, result);
        const blob = generateXlsxBlob(rows, input.systemName);
        downloadDoc(blob, `RTM-${cleanName}-001.xlsx`);
      } else {
        const content = generateDocumentContent(docKey, input, result);
        const blob = generateDocxBlob(doc.label, content, input.systemName);
        downloadDoc(
          blob,
          `${docKey.toUpperCase().substring(0, 3)}-${cleanName}-001.docx`,
        );
      }
      setGenerated((prev) => new Set([...prev, docKey]));
      toast.success(`${doc.label} downloaded`);
    } catch (err) {
      console.error(err);
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadAll = async () => {
    for (const doc of DOC_TYPES) {
      handleDownload(doc.key, doc.ext);
      await new Promise((r) => setTimeout(r, 500));
    }
    toast.success("All documents downloaded");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Validation Documents
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pre-populated with AI risk data for {input.systemName}
          </p>
        </div>
        <Button
          data-ocid="gamp_risk.download_all.primary_button"
          onClick={handleDownloadAll}
          size="sm"
          className="gap-1.5 text-xs"
          style={{ background: "oklch(0.42 0.14 145)", color: "white" }}
        >
          <Download size={12} />
          Download All
        </Button>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        data-ocid="gamp_risk.documents.list"
      >
        {DOC_TYPES.map((doc, index) => {
          const Icon = doc.icon;
          const isGenerated = generated.has(doc.key);
          const isDownloading = downloading === doc.key;
          return (
            <motion.div
              key={doc.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              data-ocid={`gamp_risk.documents.item.${index + 1}`}
              className="rounded-xl p-4 flex flex-col gap-3"
              style={{
                background: isGenerated
                  ? "oklch(0.97 0.006 145)"
                  : "oklch(1.0 0 0)",
                border: `1px solid ${isGenerated ? "oklch(0.42 0.14 145 / 0.30)" : "oklch(0.88 0.012 240)"}`,
              }}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isGenerated
                      ? "oklch(0.42 0.14 145 / 0.12)"
                      : "oklch(0.97 0.004 240)",
                  }}
                >
                  <Icon
                    size={16}
                    style={{
                      color: isGenerated
                        ? "oklch(0.42 0.14 145)"
                        : "oklch(0.55 0.015 240)",
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight">
                    {doc.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    .{doc.ext} format
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-semibold"
                  style={{
                    color: isGenerated
                      ? "oklch(0.42 0.14 145)"
                      : "oklch(0.55 0.015 240)",
                  }}
                >
                  {isGenerated ? "✓ Generated" : "Ready to Generate"}
                </span>
                <Button
                  size="sm"
                  variant={isGenerated ? "outline" : "default"}
                  className="h-7 text-xs px-2.5 gap-1"
                  disabled={isDownloading}
                  onClick={() => handleDownload(doc.key, doc.ext)}
                  data-ocid={`gamp_risk.document_download.button.${index + 1}`}
                  style={
                    isGenerated
                      ? {}
                      : { background: "oklch(0.42 0.14 145)", color: "white" }
                  }
                >
                  {isDownloading ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Download size={11} />
                  )}
                  {isDownloading ? "…" : "Get"}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Audit trail summary */}
      <div
        className="rounded-xl p-4 text-xs"
        style={{
          background: "oklch(0.97 0.004 240)",
          border: "1px solid oklch(0.88 0.012 240)",
        }}
        data-ocid="gamp_risk.audit_trail.panel"
      >
        <div className="flex items-center gap-2 mb-1">
          <Shield size={12} style={{ color: "oklch(0.42 0.14 145)" }} />
          <span className="font-semibold text-foreground">Audit Trail</span>
        </div>
        <p className="text-muted-foreground">
          This analysis was logged on{" "}
          <span className="font-medium text-foreground">{auditDate}</span>
          {" · "}
          Credits used: <span className="font-medium text-foreground">1</span>
          {" · "}
          User: <span className="font-medium text-foreground">{userName}</span>
          {" · "}
          Risk Score:{" "}
          <span
            className="font-medium"
            style={{ color: getRiskColor(result.riskLevel) }}
          >
            {result.riskScore}/100 ({result.riskLevel})
          </span>
        </p>
      </div>

      <div className="flex justify-start pt-2">
        <Button
          data-ocid="gamp_risk.back_to_dashboard.secondary_button"
          variant="outline"
          onClick={onBack}
          className="gap-2"
        >
          <RefreshCw size={14} />
          Back to Risk Dashboard
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function GampRiskPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [input, setInput] = useState<SystemInput>({
    systemName: "",
    systemType: "LIMS",
    gampCategory: "4",
    customizationLevel: "Configured",
    numUsers: "25",
    dataCriticality: "High",
    integrationComplexity: "Few Integrations",
    intendedUse: "",
    userRequirements: "",
    riskOverride: "Auto-Detect",
  });
  const [result, setResult] = useState<RiskResult | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState("");
  const [auditDate, setAuditDate] = useState("");

  const currentUser = getCurrentUser();
  const currentUserId = getCurrentUserId();
  const userName = currentUser?.name || "Unknown User";

  // Load credits on mount
  const loadCredits = async () => {
    if (isAdminAuthed()) {
      setCredits(null);
      setCreditsLoading(false);
      return;
    }
    if (!currentUserId) {
      setCredits(0);
      setCreditsLoading(false);
      return;
    }
    try {
      const actor = await createActorWithConfig();
      const raw = await (actor as any).getUserOwnCredits(currentUserId);
      setCredits(Number(raw));
    } catch {
      setCredits(0);
    } finally {
      setCreditsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: load once on mount
  useEffect(() => {
    loadCredits();
  }, []);

  const runAnalysis = async () => {
    setStep(2);
    setAnalysisError("");

    try {
      // Deduct credit if not admin
      if (!isAdminAuthed() && currentUserId) {
        const actor = await createActorWithConfig();
        const ok = await (actor as any).deductCredit(currentUserId);
        if (!ok) {
          setAnalysisError(
            "Insufficient credits. Please contact admin to add more credits.",
          );
          setStep(1);
          return;
        }
        setCredits((prev) => (prev !== null ? Math.max(0, prev - 1) : 0));
      }

      const prompt = `You are a GAMP 5 compliance expert and pharmaceutical validation specialist. Perform a comprehensive risk assessment for this computerized system following GAMP 5 Second Edition, ICH Q9, and ISO 13485 guidelines.

System Details:
- System Name: ${input.systemName}
- System Type: ${input.systemType}
- GAMP Category: ${input.gampCategory}
- Customization Level: ${input.customizationLevel}
- Number of Users: ${input.numUsers}
- Data Criticality: ${input.dataCriticality}
- Integration Complexity: ${input.integrationComplexity}
- Intended Use: ${input.intendedUse}
- User Requirements: ${input.userRequirements}

Based on this information, provide a detailed GAMP 5 risk assessment as JSON:
{
  "riskScore": <number 0-100, integer>,
  "riskLevel": "<Low|Medium|High|Critical>",
  "riskRationale": "<2-3 sentence explanation of the overall risk level>",
  "topRiskFactors": [
    {"factor": "<risk factor name>", "score": <0-100>, "description": "<brief description>", "mitigation": "<specific mitigation>"},
    {"factor": "<factor 2>", "score": <0-100>, "description": "...", "mitigation": "..."},
    {"factor": "<factor 3>", "score": <0-100>, "description": "...", "mitigation": "..."},
    {"factor": "<factor 4>", "score": <0-100>, "description": "...", "mitigation": "..."},
    {"factor": "<factor 5>", "score": <0-100>, "description": "...", "mitigation": "..."}
  ],
  "validationScope": {
    "iq": {"required": <true|false>, "rationale": "<why>", "keyTests": ["test 1", "test 2", "test 3"]},
    "oq": {"required": <true|false>, "rationale": "<why>", "keyTests": ["test 1", "test 2", "test 3", "test 4"]},
    "pq": {"required": <true|false>, "rationale": "<why>", "keyTests": ["test 1", "test 2", "test 3"]}
  },
  "complianceGaps": [
    {"gap": "<compliance gap>", "regulation": "<FDA 21 CFR Part 11 / EU Annex 11 / ICH Q9>", "priority": "<High|Medium|Low>"}
  ],
  "overallRecommendation": "<actionable recommendation paragraph>"
}

Return ONLY valid JSON, no markdown, no explanation.`;

      let rawResponse = "";
      try {
        const actor = await createActorWithConfig();
        rawResponse = await (actor as any).callDeepSeekExtended(prompt);
      } catch (err) {
        console.error("AI call failed:", err);
        throw new Error("AI service unavailable. Please try again later.");
      }

      // Parse AI response
      let parsed: RiskResult;
      try {
        let content = rawResponse;
        try {
          const p = JSON.parse(rawResponse);
          if (p?.choices?.[0]?.message?.content) {
            content = p.choices[0].message.content;
          } else if (typeof p === "object" && p.riskScore !== undefined) {
            parsed = p as RiskResult;
            content = "";
          }
        } catch {
          // rawResponse itself may be the JSON
        }
        if (!parsed!) {
          // Extract JSON from content (strip markdown code blocks if any)
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]) as RiskResult;
          } else {
            parsed = JSON.parse(content) as RiskResult;
          }
        }
      } catch (parseErr) {
        console.error("JSON parse error:", parseErr, "raw:", rawResponse);
        // Use intelligent fallback based on inputs
        parsed = buildFallbackResult(input);
      }

      // Apply risk override if set
      if (input.riskOverride !== "Auto-Detect") {
        parsed.riskLevel = input.riskOverride;
      }

      // Log audit
      const now = new Date();
      setAuditDate(
        now.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      );

      try {
        if (currentUserId) {
          const actor = await createActorWithConfig();
          await (actor as any).logRiskPrediction(
            currentUserId,
            userName,
            input.systemName,
            BigInt(parsed.riskScore),
            parsed.riskLevel,
          );
        }
      } catch (logErr) {
        console.warn("Failed to log risk prediction:", logErr);
      }

      setResult(sanitizeResult(parsed, buildFallbackResult(input)));
      setStep(3);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Analysis failed. Please try again.";
      setAnalysisError(msg);
      setStep(1);
      toast.error(msg);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} style={{ color: "oklch(0.42 0.14 145)" }} />
            <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              GAMP 5 Compliance
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            AI-Based Risk Prediction System
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Intelligent GAMP 5 validation risk scoring powered by advanced AI
            analysis
          </p>
        </div>
      </div>

      {/* Step Progress */}
      <div
        className="flex items-center gap-0 mb-8"
        data-ocid="gamp_risk.steps.panel"
      >
        {(
          [
            { n: 1, label: "System Info" },
            { n: 2, label: "AI Analysis" },
            { n: 3, label: "Risk Dashboard" },
            { n: 4, label: "Documents" },
          ] as const
        ).map(({ n, label }) => (
          <div key={n} className="flex items-center flex-1">
            <div
              className="flex items-center gap-2 text-sm font-medium"
              style={{
                color:
                  step === n
                    ? "oklch(0.42 0.14 145)"
                    : step > n
                      ? "oklch(0.55 0.10 145)"
                      : "oklch(0.60 0.01 240)",
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors"
                style={{
                  background:
                    step === n
                      ? "oklch(0.42 0.14 145)"
                      : step > n
                        ? "oklch(0.42 0.14 145 / 0.20)"
                        : "oklch(0.92 0.008 240)",
                  color:
                    step === n
                      ? "white"
                      : step > n
                        ? "oklch(0.42 0.14 145)"
                        : "oklch(0.60 0.01 240)",
                }}
              >
                {step > n ? "✓" : n}
              </div>
              <span className="hidden sm:inline text-xs">{label}</span>
            </div>
            {n < 4 && (
              <div
                className="flex-1 h-px mx-2"
                style={{
                  background:
                    step > n
                      ? "oklch(0.42 0.14 145 / 0.40)"
                      : "oklch(0.88 0.012 240)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error banner */}
      {analysisError && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4 text-sm"
          style={{
            background: "oklch(0.95 0.03 25)",
            border: "1px solid oklch(0.70 0.10 25 / 0.4)",
            color: "oklch(0.45 0.15 25)",
          }}
          data-ocid="gamp_risk.analysis.error_state"
        >
          <AlertCircle size={16} className="flex-shrink-0" />
          <p>{analysisError}</p>
        </div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <Step1Form
            key="step1"
            input={input}
            setInput={setInput}
            credits={credits}
            creditsLoading={creditsLoading}
            onNext={runAnalysis}
          />
        )}
        {step === 2 && <Step2Loading key="step2" />}
        {step === 3 && result && (
          <Step3Dashboard
            key="step3"
            input={input}
            result={result}
            onGenerate={() => setStep(4)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 4 && result && (
          <Step4Documents
            key="step4"
            input={input}
            result={result}
            auditDate={auditDate}
            userName={userName}
            onBack={() => setStep(3)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Fallback result when AI parsing fails ─────────────────────────────────────

// ─── Sanitize AI result to prevent crashes from missing fields ────────────────
function sanitizeResult(parsed: RiskResult, fallback: RiskResult): RiskResult {
  const safe = { ...fallback, ...parsed };
  // Ensure topRiskFactors is always a non-empty array
  if (!Array.isArray(safe.topRiskFactors) || safe.topRiskFactors.length === 0) {
    safe.topRiskFactors = fallback.topRiskFactors;
  }
  // Ensure each factor has required fields
  safe.topRiskFactors = safe.topRiskFactors.map((f) => ({
    factor: f?.factor ?? "Unknown Risk",
    score: typeof f?.score === "number" ? f.score : 50,
    description: f?.description ?? "Risk factor identified during analysis.",
    mitigation: f?.mitigation ?? "Apply standard validation controls.",
  }));
  // Ensure complianceGaps is always an array
  if (!Array.isArray(safe.complianceGaps)) {
    safe.complianceGaps = fallback.complianceGaps;
  }
  // Ensure validationScope has all required sub-objects
  const defaultScope = (s?: ValidationScope): ValidationScope => ({
    required: s?.required ?? true,
    rationale: s?.rationale ?? "Validation required per GAMP 5 guidelines.",
    keyTests:
      Array.isArray(s?.keyTests) && s.keyTests.length > 0
        ? s.keyTests
        : [
            "Installation verification",
            "Configuration check",
            "Functional test",
          ],
  });
  if (!safe.validationScope || typeof safe.validationScope !== "object") {
    safe.validationScope = fallback.validationScope;
  } else {
    safe.validationScope = {
      iq: defaultScope(safe.validationScope?.iq),
      oq: defaultScope(safe.validationScope?.oq),
      pq: defaultScope(safe.validationScope?.pq),
    };
  }
  // Ensure string fields
  safe.riskScore =
    typeof safe.riskScore === "number" ? safe.riskScore : fallback.riskScore;
  safe.riskLevel = safe.riskLevel ?? fallback.riskLevel;
  safe.riskRationale = safe.riskRationale ?? fallback.riskRationale;
  safe.overallRecommendation =
    safe.overallRecommendation ?? fallback.overallRecommendation;
  return safe;
}

function buildFallbackResult(input: SystemInput): RiskResult {
  const baseScore = (() => {
    let s = 40;
    if (input.gampCategory === "5") s += 20;
    else if (input.gampCategory === "4") s += 12;
    if (input.dataCriticality === "Critical") s += 15;
    else if (input.dataCriticality === "High") s += 8;
    if (input.integrationComplexity === "Highly Integrated") s += 10;
    if (input.customizationLevel === "Bespoke") s += 10;
    else if (input.customizationLevel === "Customized") s += 5;
    return Math.min(95, s);
  })();

  const level =
    baseScore >= 75
      ? "Critical"
      : baseScore >= 50
        ? "High"
        : baseScore >= 25
          ? "Medium"
          : "Low";

  return {
    riskScore: baseScore,
    riskLevel: level,
    riskRationale: `Based on the GAMP Category ${input.gampCategory} classification and ${input.dataCriticality} data criticality, this ${input.systemType} system presents a ${level.toLowerCase()} validation risk. The ${input.customizationLevel.toLowerCase()} level of customization and ${input.integrationComplexity.toLowerCase()} integration complexity contribute to this assessment.`,
    topRiskFactors: [
      {
        factor: "Data Integrity",
        score: Math.min(95, baseScore + 5),
        description:
          "Risk of GxP data integrity breaches due to audit trail gaps or unauthorized modifications.",
        mitigation:
          "Implement immutable audit trail per 21 CFR Part 11 with hash verification",
      },
      {
        factor: "Access Control",
        score: Math.max(20, baseScore - 5),
        description: "Unauthorized access to GxP-critical functions and data.",
        mitigation:
          "Enforce RBAC with minimum 3 roles, account lockout after 5 failures",
      },
      {
        factor: "System Availability",
        score: Math.max(15, baseScore - 10),
        description: "System downtime impacting critical GxP operations.",
        mitigation:
          "Redundant infrastructure, UPS, documented downtime SOP, RPO < 1 hour",
      },
      {
        factor: "Integration Complexity",
        score:
          input.integrationComplexity === "Highly Integrated"
            ? baseScore
            : Math.max(10, baseScore - 20),
        description:
          "Risk of data corruption or loss at integration interfaces.",
        mitigation:
          "Interface qualification testing and data reconciliation procedures",
      },
      {
        factor: "Change Management",
        score: Math.max(20, baseScore - 15),
        description:
          "Uncontrolled changes leading to unvalidated system states.",
        mitigation:
          "Formal change control SOP with re-validation trigger criteria",
      },
    ],
    validationScope: {
      iq: {
        required: true,
        rationale:
          "IQ is required for all GAMP systems to verify correct installation.",
        keyTests: [
          "Software installation verification",
          "Configuration baseline documentation",
          "Network connectivity test",
          "Backup system verification",
        ],
      },
      oq: {
        required: true,
        rationale:
          "OQ is required to verify all configured functions meet specifications.",
        keyTests: [
          "User authentication and access control",
          "Audit trail completeness test",
          "Electronic signature verification",
          "Report generation test",
          "Data backup and restore test",
        ],
      },
      pq: {
        required: level !== "Low",
        rationale:
          level !== "Low"
            ? "PQ is required due to medium-high risk and direct GxP impact."
            : "PQ may be combined with OQ given low risk level.",
        keyTests: [
          "Concurrent user load test",
          "Performance under production conditions",
          "Data integrity over extended period",
        ],
      },
    },
    complianceGaps: [
      {
        gap: "Audit trail may not capture all 21 CFR Part 11 required fields",
        regulation: "FDA 21 CFR Part 11",
        priority: "High",
      },
      {
        gap: "Electronic signature binding to records not yet verified",
        regulation: "FDA 21 CFR Part 11",
        priority: "High",
      },
      {
        gap: "EU Annex 11 access control requirements pending review",
        regulation: "EU Annex 11",
        priority: "Medium",
      },
      {
        gap: "ICH Q9 risk review frequency not yet defined in SOP",
        regulation: "ICH Q9",
        priority: "Low",
      },
    ],
    overallRecommendation: `This ${input.systemType} system (GAMP Category ${input.gampCategory}) requires a structured validation approach. Prioritize audit trail implementation, electronic signature compliance, and access control testing. Schedule IQ, OQ, and ${level !== "Low" ? "PQ" : "combined OQ/PQ"} qualification activities. Ensure all documentation is reviewed and approved by QA before system release to GxP use.`,
  };
}
