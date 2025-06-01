// exportToPdf.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * transactions: [
 *   {
 *     id: '...',
 *     type: 'gelir' | 'gider' | ...,
 *     amount: 2500.0,
 *     description: 'Ödeme...',
 *     date: '1748694240807', // timestamp string
 *     canceled: false,
 *     createdBy: { id: '...', name: 'Kullanıcı Adı' }
 *   },
 *   …
 * ]
 *
 * Bu fonksiyon, verilen işlem listesini bir PDF’e çevirir ve tarayıcıda indirir.
 * title: PDF başlığında kullanılacak metin (örneğin “Tüm Zamanlar İşlem Raporu”).
 */
function generatePdfFromList(transactions, title) {
  // 1. jsPDF nesnesi oluştur
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'A4',
  });

  // 2. Başlık yazısı
  doc.setFontSize(16);
  doc.text(title, 40, 40);

  // 3. Tablo sütun başlıkları:
  const columns = [
    { header: 'Tarih', dataKey: 'dateFormatted' },
    { header: 'Tür', dataKey: 'type' },
    { header: 'Miktar (₺)', dataKey: 'amount' },
    { header: 'Açıklama', dataKey: 'description' },
    { header: 'Oluşturan', dataKey: 'createdByName' },
    { header: 'İptal', dataKey: 'canceled' },
  ];

  // 4. Her bir işlemi tablo formatına dönüştür
  const rows = transactions.map(txn => {
    const dateObj = new Date(Number(txn.date));
    const dateFormatted =
      dateObj.toLocaleDateString('tr-TR') +
      ' ' +
      dateObj.toLocaleTimeString('tr-TR');

    return {
      dateFormatted,
      type: txn.type,
      amount: txn.amount.toFixed(2).replace('.', ','), // Nokta yerine virgül
      description: txn.description,
      createdByName: txn.createdBy?.name || '-',
      canceled: txn.canceled ? 'Evet' : 'Hayır',
    };
  });

  // 5. autoTable ile tabloyu çiz
  autoTable(doc, {
    startY: 70,
    head: [columns.map(col => col.header)],
    body: rows.map(r => columns.map(col => r[col.dataKey])),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 40, right: 40 },
  });

  // 6. PDF’i indir
  const now = new Date();
  const fileName = `${title
    .toLowerCase()
    .replace(/ /g, '_')}_${now
    .toLocaleDateString('tr-TR')
    .replace(/\./g, '-')}.pdf`;

  doc.save(fileName);
}

/**
 * Tüm zamanlar için PDF oluşturur ve indirir.
 */
export async function exportAllTransactionsToPDF() {
  const { fetchAllTransactions } = await import('./transactionService');
  const allTxns = await fetchAllTransactions();
  generatePdfFromList(allTxns, 'Tüm Zamanlar İşlem Raporu');
}

/**
 * Belirli bir tarih aralığı için PDF oluşturur ve indirir.
 * from, to: “YYYY-MM-DD” formatında string veya Date objesi
 */
export async function exportTransactionsInRangeToPDF(from, to) {
  const { fetchTransactionsInRange } = await import('./transactionService');
  const filteredTxns = await fetchTransactionsInRange(from, to);
  const fromDate = typeof from === 'string' ? new Date(from) : from;
  const toDate = typeof to === 'string' ? new Date(to) : to;
  const title = `İşlem Raporu ${fromDate.toLocaleDateString(
    'tr-TR'
  )}_ile_${toDate.toLocaleDateString('tr-TR')}`;
  generatePdfFromList(filteredTxns, title);
}
