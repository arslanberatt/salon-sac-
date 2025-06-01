import { ApolloClient, InMemoryCache, gql, useQuery, useMutation } from '@apollo/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ------------------------
// 1. Apollo Client Setup
// ------------------------
export const client = new ApolloClient({
  uri: '/graphql', // Sizin GraphQL endpoint’iniz
  cache: new InMemoryCache(),
});

// ------------------------
// 2. GRAPHQL FRAGMENTS
// ------------------------
const TRANSACTION_FIELDS = `
  id
  type
  amount
  description
  date
  canceled
  createdBy {
    id
    name
  }
`;

// ------------------------
// 3. QUERIES & MUTATIONS
// ------------------------
export const GET_TRANSACTIONS = gql`
  query GetTransactions {
    transactions {
      ${TRANSACTION_FIELDS}
    }
  }
`;

export const ADD_TRANSACTION = gql`
  mutation AddTransaction($type: String!, $amount: Float!, $description: String!) {
    addTransaction(type: $type, amount: $amount, description: $description) {
      ${TRANSACTION_FIELDS}
    }
  }
`;

export const CANCEL_TRANSACTION = gql`
  mutation CancelTransaction($id: ID!) {
    cancelTransaction(id: $id) {
      id
      canceled
    }
  }
`;

// ------------------------
// 4. FETCH FUNCTIONS
// ------------------------
/**
 * Tüm işlemleri GraphQL’den çeker, tarihe göre (yeniden eskiye) sıralar ve döner.
 */
export async function fetchAllTransactions() {
  try {
    const { data } = await client.query({
      query: GET_TRANSACTIONS,
      fetchPolicy: 'no-cache',
    });
    return [...(data.transactions || [])].sort(
      (a, b) => Number(b.date) - Number(a.date)
    );
  } catch (err) {
    console.error('fetchAllTransactions hata:', err);
    return [];
  }
}

/**
 * from ve to, JavaScript Date objesi veya “YYYY-MM-DD” formatında string olabilir.
 * Bu fonksiyon, tüm işlemler arasından fromDate ≤ txnDate ≤ toDate aralığındaki kayıtları döner.
 */
export async function fetchTransactionsInRange(from, to) {
  try {
    const allTxns = await fetchAllTransactions();
    const fromDate = typeof from === 'string' ? new Date(from) : from;
    const toDate = typeof to === 'string' ? new Date(to) : to;

    // Bitiş gününü 23:59:59.999’a kadar kapsayacak şekilde ayarlayın
    const toDateEnd = new Date(toDate);
    toDateEnd.setHours(23, 59, 59, 999);

    return allTxns.filter(txn => {
      const txnDate = new Date(Number(txn.date));
      return txnDate >= fromDate && txnDate <= toDateEnd;
    });
  } catch (err) {
    console.error('fetchTransactionsInRange hata:', err);
    return [];
  }
}

// ------------------------
// 5. PDF EXPORT FUNCTIONS
// ------------------------
/**
 * transactions: [
 *   { id, type, amount, description, date, canceled, createdBy: { id, name } }, …
 * ]
 * title: PDF başlığında kullanılacak metin
 */
function generatePdfFromList(transactions, title) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'A4',
  });

  doc.setFontSize(16);
  doc.text(title, 40, 40);

  const columns = [
    { header: 'Tarih', dataKey: 'dateFormatted' },
    { header: 'Tür', dataKey: 'type' },
    { header: 'Miktar (₺)', dataKey: 'amount' },
    { header: 'Açıklama', dataKey: 'description' },
    { header: 'Oluşturan', dataKey: 'createdByName' },
    { header: 'İptal', dataKey: 'canceled' },
  ];

  const rows = transactions.map(txn => {
    const dateObj = new Date(Number(txn.date));
    const dateFormatted =
      dateObj.toLocaleDateString('tr-TR') +
      ' ' +
      dateObj.toLocaleTimeString('tr-TR');
    return {
      dateFormatted,
      type: txn.type,
      amount: txn.amount.toFixed(2).replace('.', ','), // “1234,50”
      description: txn.description,
      createdByName: txn.createdBy?.name || '-',
      canceled: txn.canceled ? 'Evet' : 'Hayır',
    };
  });

  autoTable(doc, {
    startY: 70,
    head: [columns.map(col => col.header)],
    body: rows.map(r => columns.map(col => r[col.dataKey])),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { left: 40, right: 40 },
  });

  const now = new Date();
  const fileName = `${title
    .toLowerCase()
    .replace(/ /g, '_')}_${now.toLocaleDateString('tr-TR').replace(/\./g, '-')}.pdf`;

  doc.save(fileName);
}

/**
 * 1. Tüm zamanlar için PDF oluşturur ve indirir.
 */
export async function exportAllTransactionsToPDF() {
  const allTxns = await fetchAllTransactions();
  generatePdfFromList(allTxns, 'Tüm Zamanlar İşlem Raporu');
}

/**
 * 2. Belirli bir tarih aralığı için PDF oluşturur ve indirir.
 * from, to: “YYYY-MM-DD” formatında string veya Date objesi
 */
export async function exportTransactionsInRangeToPDF(from, to) {
  const filteredTxns = await fetchTransactionsInRange(from, to);
  const fromDate = typeof from === 'string' ? new Date(from) : from;
  const toDate = typeof to === 'string' ? new Date(to) : to;
  const title = `İşlem Raporu ${fromDate.toLocaleDateString('tr-TR')}_ile_${toDate.toLocaleDateString('tr-TR')}`;
  generatePdfFromList(filteredTxns, title);
}

// ------------------------
// 6. useTransactionController Hook
// ------------------------
export function useTransactionController() {
  const { data, loading, refetch } = useQuery(GET_TRANSACTIONS, {
    fetchPolicy: 'no-cache',
  });

  const [addTransactionMutation] = useMutation(ADD_TRANSACTION);
  const [cancelTransactionMutation] = useMutation(CANCEL_TRANSACTION);

  // 1. Tüm işlemleri al, tarihe göre sırala
  const allTransactions = [...(data?.transactions || [])].sort((a, b) => {
    const dateA = new Date(Number(a.date));
    const dateB = new Date(Number(b.date));
    return dateB - dateA;
  });

  // 2. Bu ayın yıl/ay bilgisi
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // 3. “Bu aya” ait işlemleri filtrele
  const monthTransactions = allTransactions.filter(txn => {
    const txnDate = new Date(Number(txn.date));
    return (
      txnDate.getFullYear() === currentYear &&
      txnDate.getMonth() === currentMonth
    );
  });

  // 4. Bu aya ait toplam geliri hesapla
  const totalIncome = monthTransactions
    .filter(txn => txn.type === 'gelir' && !txn.canceled)
    .reduce((sum, txn) => sum + txn.amount, 0);

  // 5. Bu aya ait toplam gideri hesapla
  const totalExpense = monthTransactions
    .filter(txn => txn.type !== 'gelir' && !txn.canceled)
    .reduce((sum, txn) => sum + txn.amount, 0);

  // 6. İşlem ekleme / iptal etme
  const addTransaction = async ({ type, amount, description }) => {
    await addTransactionMutation({ variables: { type, amount, description } });
    await refetch();
  };

  const cancelTransaction = async id => {
    await cancelTransactionMutation({ variables: { id } });
    await refetch();
  };

  return {
    transactions: monthTransactions, // Yalnızca bu ay
    allTransactions,                // Tüm zamanlar
    loading,
    totalIncome,
    totalExpense,
    addTransaction,
    cancelTransaction,
    refetch,
  };
}
