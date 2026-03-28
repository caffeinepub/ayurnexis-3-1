import jsPDF from "jspdf";
import autoTablePlugin from "jspdf-autotable";

export { jsPDF };

export function autoTable(
  doc: jsPDF,
  options: Parameters<typeof autoTablePlugin>[1],
): void {
  autoTablePlugin(doc, options);
}

// Keep these for backward compatibility with existing callers
export async function loadJsPDF(): Promise<void> {
  // No-op — jsPDF is now an npm package, no loading needed
}

export function getJsPDF(): typeof jsPDF {
  return jsPDF;
}
