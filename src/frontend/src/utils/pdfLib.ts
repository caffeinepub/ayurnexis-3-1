// Dynamic CDN loader for jsPDF (not available as npm package in this project)

let jsPDFLoaded = false;
let autoTableLoaded = false;

async function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function loadJsPDF(): Promise<void> {
  if (!jsPDFLoaded) {
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    );
    jsPDFLoaded = true;
  }
  if (!autoTableLoaded) {
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js",
    );
    autoTableLoaded = true;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getJsPDF(): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.jspdf?.jsPDF || w.jsPDF;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function autoTable(doc: any, options: any): void {
  // autoTable is added as a plugin onto jsPDF instances
  if (typeof doc.autoTable === "function") {
    doc.autoTable(options);
  }
}
