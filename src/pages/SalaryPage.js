import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Spinner,
  Badge,
  Alert,
} from 'react-bootstrap';
import { useSalaryController } from '../controllers/SalaryController';

export default function SalaryPage() {
  const {
    loading,
    error,
    records,
    addSalaryRecord,
    approveSalaryRecord,
    addState,
  } = useSalaryController();

  const [form, setForm] = useState({
    employeeId: '',
    type: 'maas',
    amount: '',
    description: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await addSalaryRecord(form);
    setForm({ employeeId: '', type: 'maas', amount: '', description: '' });
  };

  return (
    <Container fluid className="p-4">
      <Row>
        <Col md={4} className="mb-4">
          <Card className="p-4 shadow-sm">
            <h5 className="fw-bold mb-3">➕ Yeni Kayıt</h5>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Çalışan ID</Form.Label>
                <Form.Control
                  type="text"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  placeholder="Çalışan ID"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tür</Form.Label>
                <Form.Select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="maas">Maaş</option>
                  <option value="prim">Prim</option>
                  <option value="avans">Avans</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tutar</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="₺"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Açıklama</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                />
              </Form.Group>

              <div className="d-flex justify-content-end">
                <Button type="submit" disabled={addState.loading}>
                  {addState.loading ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    'Ekle'
                  )}
                </Button>
              </div>

              {addState.error && (
                <Alert variant="danger" className="mt-3">
                  {addState.error.message}
                </Alert>
              )}
            </Form>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="p-4 shadow-sm">
            <h5 className="fw-bold mb-3">📋 Maaş Kayıtları</h5>
            {loading ? (
              <Spinner animation="border" />
            ) : error ? (
              <Alert variant="danger">{error.message}</Alert>
            ) : (
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Çalışan ID</th>
                    <th>Tür</th>
                    <th>Tutar</th>
                    <th>Açıklama</th>
                    <th>Durum</th>
                    <th>Tarih</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id}>
                      <td>{r.employeeId}</td>
                      <td>
                        <Badge
                          bg={
                            r.type === 'maas'
                              ? 'primary'
                              : r.type === 'prim'
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {r.type}
                        </Badge>
                      </td>
                      <td>₺{r.amount}</td>
                      <td>{r.description}</td>
                      <td>
                        {r.approved ? (
                          <Badge bg="success">Onaylı</Badge>
                        ) : (
                          <Badge bg="secondary">Onaysız</Badge>
                        )}
                      </td>
                      <td>{r.parsedDate.toLocaleDateString('tr-TR')}</td>
                      <td>
                        {!r.approved && (
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => approveSalaryRecord(r.id)}
                          >
                            Onayla
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
