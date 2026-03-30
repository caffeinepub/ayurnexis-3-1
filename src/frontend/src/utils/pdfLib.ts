// Zero-dependency PDF generator - no jspdf or jspdf-autotable needed.
// Implements the subset of the jsPDF API used throughout AyurNexis.

type RGB = [number, number, number];

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v / 255));
}

function rgbPDF(r: number, g: number, b: number): string {
  return `${clamp01(r).toFixed(4)} ${clamp01(g).toFixed(4)} ${clamp01(b).toFixed(4)}`;
}

function escapePDF(s: string): string {
  let out = "";
  for (const ch of String(s)) {
    const code = ch.charCodeAt(0);
    if (ch === "\\") out += "\\\\";
    else if (ch === "(") out += "\\(";
    else if (ch === ")") out += "\\)";
    else if (code < 0x20 || code > 0x7e) {
      out += `\\${code.toString(8).padStart(3, "0")}`;
    } else {
      out += ch;
    }
  }
  return out;
}

// Approximate char width at given font size (points)
function charWidth(fontSize: number, bold: boolean): number {
  return fontSize * (bold ? 0.62 : 0.56);
}

function getLineWidth(text: string, fontSize: number, bold: boolean): number {
  return text.length * charWidth(fontSize, bold);
}

interface TextOptions {
  align?: "left" | "center" | "right";
  maxWidth?: number;
}

export interface AutoTableOptions {
  startY: number;
  head: (string | number)[][];
  body: (string | number)[][];
  theme?: string;
  headStyles?: {
    fillColor?: number[];
    textColor?: number | number[];
    fontSize?: number;
    fontStyle?: string;
  };
  bodyStyles?: {
    fontSize?: number;
    textColor?: number | number[];
    fontStyle?: string;
  };
  alternateRowStyles?: { fillColor?: number[] };
  margin?: { left?: number; right?: number; top?: number };
  columnStyles?: Record<number, { cellWidth?: number | string }>;
  columns?: { header: string; dataKey: string }[];
}

class PDFPage {
  ops: string[] = [];
}

export class jsPDF {
  private unitPt: number; // points per user unit
  private pageWidthPt: number;
  private pageHeightPt: number;
  private pages: PDFPage[] = [];
  private current: PDFPage;

  // drawing state
  private _fontSize = 12;
  private _bold = false;
  private _italic = false;
  private _textColor: RGB = [0, 0, 0];
  private _fillColor: RGB = [255, 255, 255];
  private _drawColor: RGB = [0, 0, 0];
  private _lineWidth = 0.5;

  lastAutoTable: { finalY: number } = { finalY: 0 };

  constructor(options?: {
    orientation?: string;
    unit?: string;
    format?: string | number[];
  }) {
    const unit = options?.unit ?? "mm";
    const unitMap: Record<string, number> = { mm: 2.8346, pt: 1, in: 72 };
    this.unitPt = unitMap[unit] ?? 2.8346;

    const fmt = options?.format ?? "a4";
    let wU = 210;
    let hU = 297; // A4 mm
    if (Array.isArray(fmt)) {
      [wU, hU] = fmt;
    }

    const wPt = wU * this.unitPt;
    const hPt = hU * this.unitPt;
    if (options?.orientation === "landscape") {
      this.pageWidthPt = Math.max(wPt, hPt);
      this.pageHeightPt = Math.min(wPt, hPt);
    } else {
      this.pageWidthPt = Math.min(wPt, hPt);
      this.pageHeightPt = Math.max(wPt, hPt);
    }

    this.current = new PDFPage();
    this.pages.push(this.current);
  }

  get internal() {
    const u = this.unitPt;
    return {
      pageSize: {
        getWidth: () => this.pageWidthPt / u,
        getHeight: () => this.pageHeightPt / u,
      },
    };
  }

  private u(v: number): number {
    return v * this.unitPt;
  }

  private fy(y: number): number {
    // flip user-space y (top-origin) to PDF y (bottom-origin)
    return this.pageHeightPt - y * this.unitPt;
  }

  setFontSize(size: number): this {
    this._fontSize = size;
    return this;
  }

  setFont(_family: string, style = "normal"): this {
    const s = style.toLowerCase();
    this._bold = s === "bold" || s === "bolditalic";
    this._italic = s === "italic" || s === "oblique" || s === "bolditalic";
    return this;
  }

  setTextColor(r: number | string, g?: number, b?: number): this {
    if (typeof r === "string") {
      const hex = r.replace("#", "");
      this._textColor = [
        Number.parseInt(hex.slice(0, 2), 16) || 0,
        Number.parseInt(hex.slice(2, 4), 16) || 0,
        Number.parseInt(hex.slice(4, 6), 16) || 0,
      ];
    } else {
      this._textColor = [r, g ?? r, b ?? r];
    }
    return this;
  }

  setFillColor(r: number, g?: number, b?: number): this {
    this._fillColor = [r, g ?? r, b ?? r];
    return this;
  }

  setDrawColor(r: number, g?: number, b?: number): this {
    this._drawColor = [r, g ?? r, b ?? r];
    return this;
  }

  setLineWidth(w: number): this {
    this._lineWidth = w;
    return this;
  }

  rect(x: number, y: number, w: number, h: number, style = "S"): this {
    const ops = this.current.ops;
    const px = this.u(x);
    const py = this.fy(y + h); // bottom-left of rect in PDF coords
    const pw = this.u(w);
    const ph = this.u(h);
    const lw = this._lineWidth * this.unitPt;

    ops.push(`${lw.toFixed(3)} w`);

    const isFill = style === "F" || style === "FD";
    const isStroke = style === "S" || style === "FD";

    if (isFill) {
      ops.push(
        `${rgbPDF(...this._fillColor)} rg ${px.toFixed(3)} ${py.toFixed(3)} ${pw.toFixed(3)} ${ph.toFixed(3)} re f`,
      );
    }
    if (isStroke) {
      ops.push(
        `${rgbPDF(...this._drawColor)} RG ${px.toFixed(3)} ${py.toFixed(3)} ${pw.toFixed(3)} ${ph.toFixed(3)} re S`,
      );
    }
    return this;
  }

  line(x1: number, y1: number, x2: number, y2: number): this {
    const ops = this.current.ops;
    const lw = this._lineWidth * this.unitPt;
    ops.push(`${lw.toFixed(3)} w`);
    ops.push(`${rgbPDF(...this._drawColor)} RG`);
    ops.push(
      `${this.u(x1).toFixed(3)} ${this.fy(y1).toFixed(3)} m ${this.u(x2).toFixed(3)} ${this.fy(y2).toFixed(3)} l S`,
    );
    return this;
  }

  text(
    text: string | string[],
    x: number,
    y: number,
    options?: TextOptions,
  ): this {
    const ops = this.current.ops;
    const lines = Array.isArray(text) ? text : [text];
    const fontName = this._bold ? "F2" : this._italic ? "F3" : "F1";
    const fs = this._fontSize; // points
    const lineHeightPt = fs * 1.35;

    ops.push("BT");
    ops.push(`/${fontName} ${fs} Tf`);
    ops.push(`${rgbPDF(...this._textColor)} rg`);

    for (let i = 0; i < lines.length; i++) {
      const ln = String(lines[i]);
      let tx = this.u(x);
      const ty = this.fy(y) - i * lineHeightPt;

      if (options?.align === "right") {
        tx -= getLineWidth(ln, fs, this._bold);
      } else if (options?.align === "center") {
        tx -= getLineWidth(ln, fs, this._bold) / 2;
      }

      ops.push(`1 0 0 1 ${tx.toFixed(3)} ${ty.toFixed(3)} Tm`);
      ops.push(`(${escapePDF(ln)}) Tj`);
    }

    ops.push("ET");
    return this;
  }

  splitTextToSize(text: string, maxWidthUser: number): string[] {
    const maxW = maxWidthUser * this.unitPt; // convert to pts
    const cw = charWidth(this._fontSize, this._bold);
    const words = String(text).split(" ");
    const lines: string[] = [];
    let cur = "";

    for (const word of words) {
      const test = cur ? `${cur} ${word}` : word;
      if (test.length * cw > maxW && cur) {
        lines.push(cur);
        cur = word;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines.length > 0 ? lines : [""];
  }

  addPage(): this {
    this.current = new PDFPage();
    this.pages.push(this.current);
    return this;
  }

  save(filename: string): void {
    const pdfStr = this._buildPDF();
    const bytes = new Uint8Array(pdfStr.length);
    for (let i = 0; i < pdfStr.length; i++) {
      bytes[i] = pdfStr.charCodeAt(i) & 0xff;
    }
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  private _buildPDF(): string {
    // Object layout:
    //  1: Catalog
    //  2: Pages
    //  3: Font Helvetica (F1)
    //  4: Font Helvetica-Bold (F2)
    //  5: Font Helvetica-Oblique (F3)
    //  6 + i*2    : content stream for page i
    //  7 + i*2    : page object for page i

    const W = this.pageWidthPt.toFixed(2);
    const H = this.pageHeightPt.toFixed(2);
    const resources =
      "/Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >>";

    let pdf = "";
    const xref: number[] = []; // xref[i] = byte offset of object (i+1)

    const emit = (s: string) => {
      pdf += `${s}\n`;
    };

    emit("%PDF-1.4");

    // 1: Catalog
    xref[0] = pdf.length;
    emit("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj");

    // 2: Pages
    const pageKids = this.pages.map((_, i) => `${7 + i * 2} 0 R`).join(" ");
    xref[1] = pdf.length;
    emit(
      `2 0 obj\n<< /Type /Pages /Kids [${pageKids}] /Count ${this.pages.length} >>\nendobj`,
    );

    // 3: Helvetica
    xref[2] = pdf.length;
    emit(
      "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj",
    );

    // 4: Helvetica-Bold
    xref[3] = pdf.length;
    emit(
      "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj",
    );

    // 5: Helvetica-Oblique
    xref[4] = pdf.length;
    emit(
      "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj",
    );

    // Pages: content stream + page object
    for (let i = 0; i < this.pages.length; i++) {
      const content = this.pages[i].ops.join("\n");

      xref[5 + i * 2] = pdf.length;
      pdf += `${6 + i * 2} 0 obj\n<< /Length ${content.length} >>\nstream\n`;
      pdf += content;
      pdf += "\nendstream\nendobj\n";

      // Page object
      xref[6 + i * 2] = pdf.length;
      emit(
        `${7 + i * 2} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents ${6 + i * 2} 0 R ${resources} >>\nendobj`,
      );
    }

    const totalObjs = 5 + this.pages.length * 2 + 1; // +1 for free obj 0
    const xrefOffset = pdf.length;
    emit("xref");
    emit(`0 ${totalObjs}`);
    emit("0000000000 65535 f ");
    for (const off of xref) {
      emit(`${String(off).padStart(10, "0")} 00000 n `);
    }
    emit("trailer");
    emit(`<< /Size ${totalObjs} /Root 1 0 R >>`);
    emit("startxref");
    emit(`${xrefOffset}`);
    emit("%%EOF");

    return pdf;
  }
}

// Matches jsPDF autoTable plugin signature
export function autoTable(doc: jsPDF, options: AutoTableOptions): void {
  const marginL = options.margin?.left ?? 20;
  const marginR = options.margin?.right ?? 20;
  const marginTop = options.margin?.top ?? 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const tableWidth = pageWidth - marginL - marginR;

  const headFontSize = options.headStyles?.fontSize ?? 9;
  const bodyFontSize = options.bodyStyles?.fontSize ?? 8;
  const pad = 3; // cell padding in mm
  const headRowH = (headFontSize / 2.8346) * 1.8 + pad * 2;
  const lineHeightMM = (bodyFontSize / 2.8346) * 1.35;

  const numCols =
    options.head[0]?.length ??
    (options.body[0] as (string | number)[])?.length ??
    1;

  // Compute column widths
  const colWidths: number[] = [];
  for (let ci = 0; ci < numCols; ci++) {
    const cs = options.columnStyles?.[ci];
    if (cs?.cellWidth && typeof cs.cellWidth === "number") {
      colWidths.push(cs.cellWidth);
    } else {
      colWidths.push(tableWidth / numCols);
    }
  }

  const headFill = options.headStyles?.fillColor ?? [0, 137, 123];
  const headTextColor = options.headStyles?.textColor;

  function renderHeader(yPos: number): void {
    for (let ci = 0; ci < numCols; ci++) {
      const cx = marginL + colWidths.slice(0, ci).reduce((a, b) => a + b, 0);
      doc.setFillColor(headFill[0], headFill[1], headFill[2]);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.1);
      doc.rect(cx, yPos, colWidths[ci], headRowH, "FD");

      if (Array.isArray(headTextColor)) {
        doc.setTextColor(headTextColor[0], headTextColor[1], headTextColor[2]);
      } else if (typeof headTextColor === "number") {
        doc.setTextColor(headTextColor, headTextColor, headTextColor);
      } else {
        doc.setTextColor(255, 255, 255);
      }
      doc.setFontSize(headFontSize);
      doc.setFont("helvetica", options.headStyles?.fontStyle ?? "bold");
      const hText = String(options.head[0]?.[ci] ?? "");
      doc.text(hText, cx + pad, yPos + pad + (headFontSize / 2.8346) * 0.8);
    }
  }

  let y = options.startY;

  // Header row
  renderHeader(y);
  y += headRowH;

  // Body rows
  for (let ri = 0; ri < options.body.length; ri++) {
    const row = options.body[ri] as (string | number)[];
    const isAlt = ri % 2 === 1;
    const altFill = options.alternateRowStyles?.fillColor;

    // Pre-compute all splits and dynamic row height
    const allSplits: string[][] = [];
    for (let ci = 0; ci < numCols; ci++) {
      const cellVal = String(row[ci] ?? "");
      const maxCellW = colWidths[ci] - pad * 2;
      doc.setFontSize(bodyFontSize);
      doc.setFont("helvetica", options.bodyStyles?.fontStyle ?? "normal");
      allSplits.push(doc.splitTextToSize(cellVal, maxCellW));
    }
    const maxLines = Math.max(...allSplits.map((s) => s.length), 1);
    const dynamicRowH = Math.max(
      (bodyFontSize / 2.8346) * 1.8 + pad * 2,
      maxLines * lineHeightMM + pad * 2,
    );

    // Page break check
    if (y + dynamicRowH > pageHeight - 20) {
      doc.addPage();
      y = marginTop;
      renderHeader(y);
      y += headRowH;
    }

    for (let ci = 0; ci < numCols; ci++) {
      const cx = marginL + colWidths.slice(0, ci).reduce((a, b) => a + b, 0);
      if (isAlt && altFill) {
        doc.setFillColor(altFill[0], altFill[1], altFill[2]);
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.rect(cx, y, colWidths[ci], dynamicRowH, "FD");
      } else {
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.rect(cx, y, colWidths[ci], dynamicRowH, "S");
      }

      const bodyText = options.bodyStyles?.textColor;
      if (Array.isArray(bodyText)) {
        doc.setTextColor(bodyText[0], bodyText[1], bodyText[2]);
      } else {
        doc.setTextColor(60, 60, 60);
      }
      doc.setFontSize(bodyFontSize);
      doc.setFont("helvetica", options.bodyStyles?.fontStyle ?? "normal");

      const splits = allSplits[ci];
      for (let li = 0; li < splits.length; li++) {
        const lineY = y + pad + lineHeightMM * 0.8 + li * lineHeightMM;
        doc.text(splits[li] ?? "", cx + pad, lineY);
      }
    }
    y += dynamicRowH;
  }

  (doc as any).lastAutoTable = { finalY: y };
}

// Keep these for backward compatibility
export async function loadJsPDF(): Promise<void> {
  // No-op - PDF generator is built-in
}

export function getJsPDF(): typeof jsPDF {
  return jsPDF;
}
