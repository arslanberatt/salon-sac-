// TransactionPage.jsx

import React, { useState } from 'react';
import {
  Container,
  Table,
  Button,
  Spinner,
  Row,
  Col,
  Form,
  Badge,
  Pagination,
} from 'react-bootstrap';
import { useTransactionController } from '../controllers/TransactionController';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function TransactionPage() {
  const {
    transactions, // “Bu ay” işlemleri
    allTransactions, // Tüm zamanlar işlemleri
    loading,
    totalIncome,
    totalExpense,
    addTransaction,
    cancelTransaction,
  } = useTransactionController();

  const [form, setForm] = useState({
    type: 'gain',
    amount: '',
    description: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Date range states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    await addTransaction({
      type: form.type === 'gain' ? 'gelir' : 'gider',
      amount: parseFloat(form.amount),
      description: form.description,
    });
    setForm({ type: 'gain', amount: '', description: '' });
    setCurrentPage(1);
  };

  // Determine which list to display: if both fromDate/toDate set, filter allTransactions; otherwise use this month
  const filteredTransactions = (() => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      return allTransactions.filter(txn => {
        const txnDate = new Date(Number(txn.date));
        return txnDate >= from && txnDate <= to;
      });
    }
    return transactions;
  })();

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const handlePageChange = pageNumber => setCurrentPage(pageNumber);

  // Excel Export (filtered list)
  const handleExportExcel = () => {
    const data = filteredTransactions.map(txn => {
      const d = new Date(Number(txn.date));
      return {
        Date: d.toLocaleDateString('en-GB'),
        Time: d.toLocaleTimeString('en-GB'),
        Type: txn.type === 'gelir' ? 'Income' : 'Expense',
        Amount: txn.amount.toFixed(2),
        Description: txn.description,
        CreatedBy: txn.createdBy?.name || '',
        Canceled: txn.canceled ? 'Yes' : 'No',
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    const wbout = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      `transactions_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  return (
    <Container className="p-4">
      <h4 className="fw-bold mb-4">Income / Expense Tracker</h4>

      {/* Form */}
      <Form onSubmit={handleSubmit} className="mb-4">
        <Row className="g-2">
          <Col md={2}>
            <Form.Select name="type" value={form.type} onChange={handleChange}>
              <option value="gain">Income</option>
              <option value="loss">Expense</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Control
              type="number"
              step="0.01"
              name="amount"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </Col>
          <Col md={5}>
            <Form.Control
              type="text"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </Col>
          <Col md={2}>
            <Button
              type="submit"
              className="w-100"
              style={{ backgroundColor: '#253d90' }}
            >
              Add
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Summary (always “Bu ay” basis) */}
      <Row className="mb-3">
        <Col>
          <div className="bg-success text-white p-3 rounded">
            Total Income (This Month): {totalIncome.toFixed(2)} ₺
          </div>
        </Col>
        <Col>
          <div className="bg-danger text-white p-3 rounded">
            Total Expense (This Month): {totalExpense.toFixed(2)} ₺
          </div>
        </Col>
      </Row>

      {/* Date Range Filter */}
      <Row className="mb-4 g-2">
        <Col md={3}>
          <Form.Control
            type="date"
            value={fromDate}
            onChange={e => {
              setFromDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Col>
        <Col md={3}>
          <Form.Control
            type="date"
            value={toDate}
            onChange={e => {
              setToDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </Col>
        <Col md={2}>
          <Button
            variant="outline-secondary"
            onClick={() => {
              setFromDate('');
              setToDate('');
              setCurrentPage(1);
            }}
            className="w-100"
          >
            Tarihi temizle
          </Button>
        </Col>
        <Col md={2}>
          <Button
            variant="outline-success"
            onClick={handleExportExcel}
            className="w-100"
          >
            Excel'e çıkar
          </Button>
        </Col>
      </Row>

      {/* Scrollable Table Container */}
      <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Created By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map((txn, index) => (
                <tr key={txn.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>
                    {new Date(Number(txn.date)).toLocaleDateString('en-GB')}
                  </td>
                  <td>
                    <Badge bg={txn.type === 'gelir' ? 'success' : 'danger'}>
                      {txn.type === 'gelir' ? 'Income' : 'Expense'}
                    </Badge>
                  </td>
                  <td>{txn.amount.toFixed(2)} ₺</td>
                  <td>{txn.description}</td>
                  <td>{txn.createdBy?.name || '-'}</td>
                  <td>
                    {!txn.canceled && (
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => cancelTransaction(txn.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination className="justify-content-center mt-3">
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
        </Pagination>
      )}
    </Container>
  );
}
