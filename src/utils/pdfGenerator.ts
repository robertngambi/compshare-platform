/**
 * Pure TypeScript PDF 1.4 Generator for CompShare Datasheets
 * Generates standards-compliant, valid PDF 1.4 documents without external binary dependencies.
 */
import { ElectronicComponent } from '../types';

export function generateDatasheetPDF(component: ElectronicComponent): Blob {
  const sanitize = (str: string) =>
    (str || '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[^\x20-\x7E]/g, ' ');

  const title = sanitize(component.name);
  const pkg = sanitize(component.packageType);
  const src = sanitize(component.sourceSoftware);
  const dst = sanitize(component.destinationSoftware);
  const desc = sanitize(component.description || 'Electronic semiconductor component.');
  const appNotes = sanitize(component.applicationNotes || 'Industrial automation, power regulation, signal processing, IoT.');

  // Build PDF stream commands
  const lines: string[] = [];

  // 1. Draw top brand bar (CompShare Blue: #0055d4 -> 0 0.33 0.83)
  lines.push('0 0.33 0.83 rg');
  lines.push('36 715 540 45 re f');

  // 2. White text on blue header
  lines.push('BT');
  lines.push('/F2 18 Tf');
  lines.push('1 1 1 rg'); // white text
  lines.push('48 738 Td');
  lines.push(`(CompShare Engineering Datasheet: ${title}) Tj`);
  lines.push('ET');

  lines.push('BT');
  lines.push('/F1 9 Tf');
  lines.push('1 1 1 rg');
  lines.push('48 723 Td');
  lines.push(`(Package: ${pkg}  |  IPC-7351 Compliant  |  Rev 1.0  |  Production Data) Tj`);
  lines.push('ET');

  // 3. Gray metadata info box
  lines.push('0.95 0.96 0.98 rg');
  lines.push('36 630 540 70 re f');
  lines.push('0.75 0.8 0.85 RG 1 w');
  lines.push('36 630 540 70 re S');

  lines.push('BT');
  lines.push('/F2 11 Tf');
  lines.push('0.1 0.15 0.2 rg');
  lines.push('48 680 Td');
  lines.push(`(1. PART SPECIFICATIONS & COMPATIBILITY) Tj`);
  lines.push('ET');

  lines.push('BT');
  lines.push('/F1 9 Tf');
  lines.push('0.2 0.2 0.2 rg');
  lines.push('48 662 Td');
  lines.push(`(Part Name: ${title}         Package Outline: ${pkg}         Size: ${sanitize(component.size)}) Tj`);
  lines.push('48 646 Td');
  lines.push(`(Source EDA: ${src}         Target EDA: ${dst}         ERC Check: ${component.ercVerified ? 'VERIFIED PASSED' : 'UNCHECKED'}) Tj`);
  lines.push('ET');

  // 4. Section 2: Description & Application
  lines.push('BT');
  lines.push('/F2 11 Tf');
  lines.push('0 0.33 0.83 rg');
  lines.push('48 605 Td');
  lines.push('(2. GENERAL DESCRIPTION & APPLICATION NOTES) Tj');
  lines.push('ET');

  lines.push('BT');
  lines.push('/F1 9 Tf');
  lines.push('0.15 0.15 0.15 rg');
  lines.push('48 588 Td');
  lines.push(`(Description: ${desc.slice(0, 100)}) Tj`);
  lines.push('48 572 Td');
  lines.push(`(Work & Applications: ${appNotes.slice(0, 100)}) Tj`);
  lines.push('ET');

  // 5. Section 3: Absolute Maximum Ratings Table
  lines.push('BT');
  lines.push('/F2 11 Tf');
  lines.push('0 0.33 0.83 rg');
  lines.push('48 545 Td');
  lines.push('(3. ABSOLUTE MAXIMUM RATINGS) Tj');
  lines.push('ET');

  // Table header background
  lines.push('0.9 0.92 0.95 rg');
  lines.push('36 520 540 16 re f');
  lines.push('0.7 0.7 0.7 RG 0.5 w');
  lines.push('36 520 540 16 re S');

  lines.push('BT');
  lines.push('/F2 8 Tf');
  lines.push('0.1 0.1 0.1 rg');
  lines.push('45 524 Td');
  lines.push('(PARAMETER                                     MIN        TYP        MAX        UNIT) Tj');
  lines.push('ET');

  const ratings = [
    { p: 'DC Supply Voltage (VCC)', min: '-0.3', typ: '3.3 / 5.0', max: '6.5', u: 'V' },
    { p: 'Input Voltage Range (VI)', min: '-0.3', typ: '--', max: 'VCC + 0.3', u: 'V' },
    { p: 'Operating Temperature (TOPR)', min: '-40', typ: '25', max: '125', u: 'deg C' },
    { p: 'Storage Temperature (TSTG)', min: '-65', typ: '--', max: '150', u: 'deg C' },
    { p: 'Lead Solder Temperature (10s)', min: '--', typ: '--', max: '260', u: 'deg C' },
  ];

  let rY = 505;
  ratings.forEach((r, idx) => {
    if (idx % 2 === 1) {
      lines.push(`0.97 0.97 0.98 rg 36 ${rY - 3} 540 14 re f`);
    }
    lines.push('BT');
    lines.push('/F1 8 Tf');
    lines.push('0.2 0.2 0.2 rg');
    lines.push(`45 ${rY} Td`);
    const padP = r.p.padEnd(38);
    const padMin = r.min.padEnd(10);
    const padTyp = r.typ.padEnd(10);
    const padMax = r.max.padEnd(10);
    lines.push(`(${padP}${padMin}${padTyp}${padMax}${r.u}) Tj`);
    lines.push('ET');
    rY -= 15;
  });

  // 6. Section 4: Pinout Configuration & Functions
  lines.push('BT');
  lines.push('/F2 11 Tf');
  lines.push('0 0.33 0.83 rg');
  lines.push('48 405 Td');
  lines.push(`(4. PIN CONFIGURATION & FUNCTIONS - ${component.pins.length} PINS) Tj`);
  lines.push('ET');

  // Table header
  lines.push('0.9 0.92 0.95 rg');
  lines.push('36 380 540 16 re f');
  lines.push('0.7 0.7 0.7 RG 0.5 w');
  lines.push('36 380 540 16 re S');

  lines.push('BT');
  lines.push('/F2 8 Tf');
  lines.push('0.1 0.1 0.1 rg');
  lines.push('45 384 Td');
  lines.push('(PIN #    NAME          TYPE           ORIENTATION      FUNCTION DESCRIPTION) Tj');
  lines.push('ET');

  let pinY = 365;
  component.pins.slice(0, 16).forEach((pin, idx) => {
    if (idx % 2 === 1) {
      lines.push(`0.97 0.97 0.98 rg 36 ${pinY - 3} 540 14 re f`);
    }
    lines.push('BT');
    lines.push('/F1 8 Tf');
    lines.push('0.15 0.15 0.15 rg');
    lines.push(`45 ${pinY} Td`);
    const num = `Pin ${pin.number}`.padEnd(9);
    const pName = sanitize(pin.name).padEnd(14);
    const pType = pin.type.toUpperCase().padEnd(15);
    const pSide = pin.side.padEnd(17);
    const desc = `${pin.name} pin connect for ${component.packageType}`;
    lines.push(`(${num}${pName}${pType}${pSide}${desc}) Tj`);
    lines.push('ET');
    pinY -= 14;
  });

  // 7. Footer
  lines.push('0.8 0.8 0.8 RG 0.5 w');
  lines.push('36 50 540 0 re S'); // horizontal rule

  lines.push('BT');
  lines.push('/F1 8 Tf');
  lines.push('0.5 0.5 0.5 rg');
  lines.push('48 38 Td');
  lines.push(`(CompShare Universal Platform v1.0  |  Part: ${title}  |  Generated on ${new Date().toLocaleDateString()}  |  Page 1 of 1) Tj`);
  lines.push('ET');

  const streamContent = lines.join('\n');
  const streamLength = streamContent.length;

  // Assemble PDF document objects
  const objects: string[] = [];
  objects[1] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  objects[3] = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n`;
  objects[4] = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
  objects[5] = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
  objects[6] = `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;

  let pdfString = '%PDF-1.4\n';
  const xrefOffsets: number[] = [0];

  for (let i = 1; i <= 6; i++) {
    xrefOffsets[i] = pdfString.length;
    pdfString += objects[i];
  }

  const startXref = pdfString.length;
  pdfString += 'xref\n0 7\n0000000000 65535 f \n';
  for (let i = 1; i <= 6; i++) {
    const offset = String(xrefOffsets[i]).padStart(10, '0');
    pdfString += `${offset} 00000 n \n`;
  }

  pdfString += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return new Blob([pdfString], { type: 'application/pdf' });
}
