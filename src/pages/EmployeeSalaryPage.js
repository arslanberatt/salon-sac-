// src/pages/EmployeeSalaryPage.jsx

import React, { useState, useMemo } from 'react';
import {
  Container,
  Card,
  Row,
  Col,
  Spinner,
  Table,
  Badge,
  Button,
  Form,
} from 'react-bootstrap';
import { useAllEmployeesSalary } from '../controllers/EmployeeSalaryController';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function EmployeeSalaryPage() {
  const { loading, employeesInfo, error } = useAllEmployeesSalary();

  // Date range states for exporting all-time filtered records
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Export this month’s records to Excel
  const handleExportCurrentMonthExcel = () => {
    const data = employeesInfo.flatMap(emp =>
      emp.monthlyRecords.map(rec => {
        const dateObj = new Date(Number(rec.date));
        return {
          Çalışan: emp.name,
          Tür: (rec.type || '').toLowerCase() === 'avans' ? 'Avans' : 'Prim',
          Tutar: Number(rec.amount).toFixed(2),
          Tarih:
            dateObj.toLocaleDateString('tr-TR') +
            ' ' +
            dateObj.toLocaleTimeString('tr-TR'),
        };
      }),
    );
    if (data.length === 0) {
      alert('Bu aya ait kayıt bulunamadığı için Excel oluşturulamıyor.');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bu Ayın Kayıtları');
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      `bu_ayin_kayitlari_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  // Export date-range filtered records to Excel
  const handleExportRangeExcel = () => {
    if (!fromDate || !toDate) {
      alert('Lütfen başlangıç ve bitiş tarihlerini seçin.');
      return;
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const data = employeesInfo.flatMap(emp =>
      emp.allRecords
        .filter(rec => {
          const ts = parseInt(rec.date, 10);
          if (isNaN(ts)) return false;
          const d = new Date(ts);
          return d >= from && d <= to;
        })
        .map(rec => {
          const dateObj = new Date(Number(rec.date));
          return {
            Çalışan: emp.name,
            Tür: (rec.type || '').toLowerCase() === 'avans' ? 'Avans' : 'Prim',
            Tutar: Number(rec.amount).toFixed(2),
            Tarih:
              dateObj.toLocaleDateString('tr-TR') +
              ' ' +
              dateObj.toLocaleTimeString('tr-TR'),
          };
        }),
    );

    if (data.length === 0) {
      alert(
        'Bu tarih aralığında kayıt bulunamadığı için Excel oluşturulamıyor.',
      );
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tarih Aralığı Kayıtları');
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      `tarih_araligi_kayitlari_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  // Compute filtered all-time records for display or export (not displayed in list)
  const filteredAllTimeRecords = useMemo(() => {
    if (!fromDate || !toDate) return [];
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return employeesInfo.flatMap(emp =>
      emp.allRecords
        .filter(rec => {
          const ts = parseInt(rec.date, 10);
          if (isNaN(ts)) return false;
          const d = new Date(ts);
          return d >= from && d <= to;
        })
        .map(rec => ({
          employeeName: emp.name,
          type: (rec.type || '').toLowerCase() === 'avans' ? 'Avans' : 'Prim',
          amount: Number(rec.amount).toFixed(2),
          date:
            new Date(Number(rec.date)).toLocaleDateString('tr-TR') +
            ' ' +
            new Date(Number(rec.date)).toLocaleTimeString('tr-TR'),
          id: rec.id,
        })),
    );
  }, [employeesInfo, fromDate, toDate]);

  if (loading) {
    return (
      <Container className="text-center p-5">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="p-5">
        <h5 className="text-danger">Veri çekilirken hata oluştu.</h5>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4">Tüm Çalışan Maaş Bilgileri</h3>

      {/* Özet Kartları */}
      <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
        <Row
          className="flex-nowrap gx-2"
          style={{ width: `${employeesInfo.length * 250}px` }}
        >
          {employeesInfo.map(emp => (
            <Col key={emp.id} style={{ flex: '0 0 250px' }} className="mb-3">
              <Card className="shadow-sm h-100">
                <Card.Body className="p-2">
                  <Card.Title className="h6 text-truncate mb-2">
                    {emp.name}
                  </Card.Title>
                  <p className="mb-1 small">
                    <strong>Brüt Maaş:</strong> ₺{emp.grossSalary.toFixed(2)}
                  </p>
                  <p className="mb-1 small">
                    <strong>Avans (Bu Ay):</strong>{' '}
                    <Badge bg="warning text-dark" className="ms-1">
                      ₺{emp.advanceTotal.toFixed(2)}
                    </Badge>
                  </p>
                  <p className="mb-1 small">
                    <strong>Prim (Bu Ay):</strong>{' '}
                    <Badge bg="info" className="ms-1">
                      ₺{emp.bonusTotal.toFixed(2)}
                    </Badge>
                  </p>
                  <p className="mb-0 small">
                    <strong>Net Maaş:</strong> ₺{emp.netSalary.toFixed(2)}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Excel’e Aktarma Butonları */}
      <Row className="mb-3">
        <Col md={4} className="mb-2">
          <Button
            variant="outline-success"
            onClick={handleExportCurrentMonthExcel}
            className="w-100"
          >
            Bu Ayın Kayıtlarını Excel’e Aktar
          </Button>
        </Col>

        <Col md={5} className="d-flex align-items-center">
          <Form.Control
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="me-2"
            style={{ maxWidth: '130px' }}
          />
          <Form.Control
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="me-2"
            style={{ maxWidth: '130px' }}
          />
          <Button
            variant="outline-secondary"
            onClick={() => {
              setFromDate('');
              setToDate('');
            }}
            className="me-2"
            style={{ flexShrink: 0 }}
          >
            Temizle
          </Button>
          <Button
            variant="outline-success"
            onClick={handleExportRangeExcel}
            style={{ flexShrink: 0 }}
          >
            Aralığı Aktar
          </Button>
        </Col>
      </Row>

      {/* Bu Ayın Kayıtları Tablosu */}
      <h5 className="mb-3">Bu Ayın Kayıtları (Çalışan Bazlı)</h5>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        <Table striped bordered hover responsive size="sm">
          <thead className="table-light">
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '25%' }}>Çalışan</th>
              <th style={{ width: '20%' }}>Tür</th>
              <th style={{ width: '20%' }}>Tutar</th>
              <th style={{ width: '30%' }}>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {employeesInfo.every(emp => emp.monthlyRecords.length === 0) ? (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  Bu aya ait veri bulunamadı.
                </td>
              </tr>
            ) : (
              employeesInfo.flatMap(emp =>
                emp.monthlyRecords.map((rec, recIdx) => {
                  const dateObj = new Date(Number(rec.date));
                  const formattedDate =
                    dateObj.toLocaleDateString('tr-TR') +
                    ' ' +
                    dateObj.toLocaleTimeString('tr-TR');
                  const typeLabel =
                    (rec.type || '').toLowerCase() === 'avans' ? (
                      <Badge bg="warning text-dark">Avans</Badge>
                    ) : (
                      <Badge bg="info">Prim</Badge>
                    );
                  return (
                    <tr key={`${emp.id}-monthly-${rec.id}`}>
                      <td>{recIdx + 1}</td>
                      <td>{emp.name}</td>
                      <td>{typeLabel}</td>
                      <td>₺{Number(rec.amount).toFixed(2)}</td>
                      <td>{formattedDate}</td>
                    </tr>
                  );
                }),
              )
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
}
