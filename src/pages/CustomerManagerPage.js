import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Table,
  Pagination,
} from 'react-bootstrap';
import { useCustomerController } from '../controllers/CustomerController';

export default function CustomerManagerPage() {
  const [form, setForm] = useState({ name: '', phone: '', notes: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const {
    customers,
    loading,
    error,
    addCustomer,
    addState,
    deleteCustomer,
    refetchCustomers,
  } = useCustomerController();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await addCustomer({ variables: { ...form } });
      setForm({ name: '', phone: '', notes: '' });
      setCurrentPage(1);
      refetchCustomers();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async id => {
    if (window.confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) {
      await deleteCustomer({ variables: { id } });
      refetchCustomers();
    }
  };

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const paginatedCustomers = customers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container fluid className="p-4">
      <Row>
        {/* Sol Form */}
        <Col md={4}>
          <Card className="p-4 shadow-sm border-0">
            <h5 className="fw-bold mb-3">👤 Yeni Müşteri</h5>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Ad Soyad</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Örn: Ahmet Yılmaz"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Telefon</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Örn: 0555 123 4567"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Not</Form.Label>
                <Form.Control
                  as="textarea"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Opsiyonel not..."
                  rows={2}
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
            </Form>

            {addState.error && (
              <Alert variant="danger" className="mt-3">
                {addState.error.message}
              </Alert>
            )}
            {addState.data && (
              <Alert variant="success" className="mt-3">
                ✅ “{addState.data.addCustomer.name}” eklendi.
              </Alert>
            )}
          </Card>
        </Col>

        {/* Sağ Liste */}
        <Col md={8}>
          <Card className="p-4 shadow-sm border-0">
            <h5 className="fw-bold mb-3">📋 Müşteri Listesi</h5>
            {loading ? (
              <Spinner animation="border" />
            ) : error ? (
              <Alert variant="danger">{error.message}</Alert>
            ) : (
              <>
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Ad</th>
                      <th>Telefon</th>
                      <th>Not</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCustomers.map(c => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{c.phone}</td>
                        <td>{c.notes || '-'}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(c.id)}
                          >
                            Sil
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-3">
                    <Pagination>
                      <Pagination.First
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev
                        onClick={() =>
                          setCurrentPage(prev => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      />
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() =>
                          setCurrentPage(prev =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
