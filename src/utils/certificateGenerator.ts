import { jsPDF } from 'jspdf';
import { TrainingCompletion } from '../types';

/**
 * Helper to wrap text on a 2D canvas context
 */
function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

/**
 * Renders a high-resolution A4 Landscape Certificate onto an HTML5 Canvas
 * with 100% native UTF-8 Turkish character support (Ğ, Ü, Ş, İ, Ö, Ç, ğ, ü, ş, ı, ö, ç).
 */
export function renderCertificateCanvas(completion: TrainingCompletion): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  // A4 Landscape at high DPI (297mm x 210mm -> 2376 x 1680 px)
  const W = 2376;
  const H = 1680;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d')!;
  const fontStack = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  // 1. Background
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, '#fffdf9');
  bgGrad.addColorStop(0.5, '#ffffff');
  bgGrad.addColorStop(1, '#fefaf0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle watermark seal in center
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate((-18 * Math.PI) / 180);
  ctx.font = `900 180px ${fontStack}`;
  ctx.fillStyle = 'rgba(185, 28, 28, 0.035)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ESME AVM', 0, 0);
  ctx.restore();

  // 2. Outer Crimson Frame & Inner Gold Frame
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 20;
  ctx.strokeRect(64, 64, W - 128, H - 128);

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 6;
  ctx.strokeRect(92, 92, W - 184, H - 184);

  // Corner Ornaments
  const corners = [
    [92, 92, 1, 1],
    [W - 92, 92, -1, 1],
    [92, H - 92, 1, -1],
    [W - 92, H - 92, -1, -1]
  ];
  corners.forEach(([cx, cy, dx, dy]) => {
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(cx, cy, dx * 48, dy * 10);
    ctx.fillRect(cx, cy, dx * 10, dy * 48);
  });

  // 3. Top Logo Emblem
  const centerX = W / 2;
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.roundRect(centerX - 48, 130, 96, 96, 20);
  ctx.fill();

  ctx.font = `900 56px ${fontStack}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', centerX, 180);

  // 4. Corporate Header
  ctx.textBaseline = 'alphabetic';
  ctx.font = `900 58px ${fontStack}`;
  ctx.fillStyle = '#b91c1c';
  ctx.fillText('ESME AVM', centerX, 290);

  ctx.font = `700 26px ${fontStack}`;
  ctx.fillStyle = '#475569';
  const subAcademyTitle =
    completion.category === 'depocu'
      ? 'MAĞAZA İÇİ DEPO YÖNETİMİ VE SEVKİYAT AKADEMİSİ'
      : 'KURUMSAL OPERASYON VE BİLGİ İŞLEM AKADEMİSİ';
  ctx.fillText(subAcademyTitle, centerX, 335);

  // 5. Certificate Main Title Banner
  ctx.fillStyle = '#fef3c7';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(centerX - 780, 365, 1560, 76, 16);
  ctx.fill();
  ctx.stroke();

  ctx.font = `900 38px ${fontStack}`;
  ctx.fillStyle = '#111827';
  const mainCertTitle =
    completion.category === 'depocu'
      ? 'DEPOCU EĞİTİM VE GÖREV YETERLİLİK SERTİFİKASI'
      : 'EĞİTİM BAŞARI VE YETERLİLİK SERTİFİKASI';
  ctx.fillText(mainCertTitle, centerX, 416);

  // 6. Statement Paragraph (Full Turkish UTF-8)
  const score = completion.quizScore ?? 5;
  const total = completion.quizTotal ?? 5;
  const pct = Math.round((score / Math.max(1, total)) * 100);

  ctx.font = `500 26px ${fontStack}`;
  ctx.fillStyle = '#1f2937';
  const statementText = `İşbu belge ile aşağıda kimliği ve görev yeri belirtilen personelimizin; ESME bünyesinde yayımlanan eğitim ve standart operasyon yönergelerini eksiksiz incelediği, Sınavda %${pct} (${score}/${total}) başarı gösterdiği ve yönerge kurallarına eksiksiz uyacağını taahhüt ettiği tescil edilmiştir.`;
  wrapCanvasText(ctx, statementText, centerX, 490, 1860, 40);

  // 7. Details Table Box
  const tableX = 240;
  const tableY = 605;
  const tableW = W - 480;
  const rowH = 74;

  const rows: [string, string][] = [
    ['Eğitimi Tamamlayan Personel', completion.personnelName || 'Şube Personeli'],
    ['Mağaza / Şube Bilgisi', `${completion.branchName} (Şube Kodu: #${completion.branchId})`],
    ['Eğitim Modülü / Yönerge', completion.trainingTitle],
    [
      'Eğitim Kategorisi / Alan',
      completion.category === 'depocu'
        ? 'Depocu Eğitim ve Görev Tanımı Alanı'
        : 'Bilgi İşlem ve Kasa Yönetimi Alanı'
    ],
    ['Sınav Başarı Derecesi', `${score} / ${total} Doğru (%${pct} Başarı — GEÇER NOT)`],
    ['Tamamlama Tarih ve Saati', new Date(completion.completedAt).toLocaleString('tr-TR')],
    ['Sertifika Doğrulama Kodu', completion.certificateId]
  ];

  // Table Header
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.roundRect(tableX, tableY, tableW, rowH, [14, 14, 0, 0]);
  ctx.fill();

  ctx.font = `800 25px ${fontStack}`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('PARAMETRE', tableX + 36, tableY + 46);
  ctx.fillText('EĞİTİM VE BAŞARI SERTİFİKASI DETAYI', tableX + 620, tableY + 46);

  // Table Rows
  rows.forEach(([label, val], idx) => {
    const ry = tableY + rowH * (idx + 1);
    ctx.fillStyle = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    ctx.fillRect(tableX, ry, tableW, rowH);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(tableX, ry, tableW, rowH);

    // Vertical divider
    ctx.beginPath();
    ctx.moveTo(tableX + 580, ry);
    ctx.lineTo(tableX + 580, ry + rowH);
    ctx.stroke();

    // Label
    ctx.font = `700 24px ${fontStack}`;
    ctx.fillStyle = '#334155';
    ctx.textAlign = 'left';
    ctx.fillText(label, tableX + 36, ry + 46);

    // Value
    ctx.font = idx === 0 || idx === 6 ? `800 25px ${fontStack}` : `600 24px ${fontStack}`;
    ctx.fillStyle = idx === 6 ? '#b91c1c' : idx === 4 ? '#047857' : '#0f172a';
    const maxValWidth = tableW - 640;
    let displayVal = val || '-';
    while (ctx.measureText(displayVal).width > maxValWidth && displayVal.length > 5) {
      displayVal = displayVal.slice(0, -4) + '...';
    }
    ctx.fillText(displayVal, tableX + 620, ry + 46);
  });

  // 8. Signatures & Official Stamp Section
  const sigY = 1280;
  ctx.textAlign = 'center';

  // Left Signature: Personnel
  const leftSigX = 520;
  ctx.font = `800 26px ${fontStack}`;
  ctx.fillStyle = '#0f172a';
  ctx.fillText('PERSONEL BEYAN VE ONAYI', leftSigX, sigY);
  ctx.font = `600 21px ${fontStack}`;
  ctx.fillStyle = '#64748b';
  ctx.fillText('Dijital Sınav ve Tamamlama Onayı', leftSigX, sigY + 34);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftSigX - 220, sigY + 55);
  ctx.lineTo(leftSigX + 220, sigY + 55);
  ctx.stroke();

  ctx.font = `italic 800 28px ${fontStack}`;
  ctx.fillStyle = '#1e293b';
  ctx.fillText(completion.personnelName || 'Şube Personeli', leftSigX, sigY + 100);
  ctx.font = `700 20px ${fontStack}`;
  ctx.fillStyle = '#059669';
  ctx.fillText('✓ Dijital Olarak Tamamlandı', leftSigX, sigY + 136);

  // Center Gold Seal
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, sigY + 65, 88, 0, Math.PI * 2);
  ctx.fillStyle = '#fef3c7';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#d97706';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(centerX, sigY + 65, 74, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#b45309';
  ctx.stroke();

  ctx.font = `900 22px ${fontStack}`;
  ctx.fillStyle = '#b45309';
  ctx.fillText('ESME AVM', centerX, sigY + 48);
  ctx.font = `800 18px ${fontStack}`;
  ctx.fillStyle = '#92400e';
  ctx.fillText('RESMİ ONAYLI', centerX, sigY + 74);
  ctx.font = `700 16px ${fontStack}`;
  ctx.fillText('SERTİFİKA', centerX, sigY + 98);
  ctx.restore();

  // Right Signature: General Management
  const rightSigX = W - 520;
  ctx.font = `800 26px ${fontStack}`;
  ctx.fillStyle = '#0f172a';
  ctx.fillText('ESME AVM GENEL YÖNETİM ONAYI', rightSigX, sigY);
  ctx.font = `600 21px ${fontStack}`;
  ctx.fillStyle = '#64748b';
  ctx.fillText('Genel Müdürlük & Bilgi İşlem Koordinatörlüğü', rightSigX, sigY + 34);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rightSigX - 240, sigY + 55);
  ctx.lineTo(rightSigX + 240, sigY + 55);
  ctx.stroke();

  ctx.font = `italic 800 26px ${fontStack}`;
  ctx.fillStyle = '#1e293b';
  ctx.fillText('Ömer BAŞ (Genel Yönetici) & Turgut CESUR', rightSigX, sigY + 100);
  ctx.font = `700 20px ${fontStack}`;
  ctx.fillStyle = '#b91c1c';
  ctx.fillText('✓ Elektronik Kurumsal Mühür', rightSigX, sigY + 136);

  // 9. Bottom Footer Note
  ctx.font = `600 19px ${fontStack}`;
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(
    `ESME Eğitim, İç Yönergeler Portalı • Belge No: ${completion.certificateId} • Kurumsal dijital başarı kayıt belgesidir.`,
    centerX,
    H - 125
  );

  return canvas;
}

/**
 * Generates a data URL image of the certificate for on-screen album previews
 */
export function generateCertificateImageUrl(completion: TrainingCompletion): string {
  const canvas = renderCertificateCanvas(completion);
  return canvas.toDataURL('image/png');
}

/**
 * Generates and downloads a crisp A4 Landscape PDF Certificate with 100% Turkish character fidelity
 */
export function downloadCertificatePdf(completion: TrainingCompletion, customFileName?: string): void {
  const canvas = renderCertificateCanvas(completion);
  const imgData = canvas.toDataURL('image/png', 1.0);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  doc.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');

  const safeCertId = (completion.certificateId || 'SERTIFIKA').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = customFileName || `Esme_AVM_Basari_Sertifikasi_${safeCertId}.pdf`;
  doc.save(fileName);
}
