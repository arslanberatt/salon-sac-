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
  Modal,
  Pagination,
} from 'react-bootstrap';
import { useServiceController } from '../controllers/ServiceController';

export default function ServiceManagerPage() {
  const [form, setForm] = useState({ title: '', duration: '', price: '' });
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const {
    services,
    loading,
    error,
    addService,
    addState,
    deleteService,
    updateServicePrice,
    refetchServices,
  } = useServiceController();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await addService({
        variables: {
          title: form.title,
          duration: parseInt(form.duration),
          price: parseFloat(form.price),
        },
      });
      setForm({ title: '', duration: '', price: '' });
      setCurrentPage(1); // yeni ekleme varsa en başa dön
      refetchServices();
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async id => {
    if (window.confirm('Bu hizmeti silmek istediğinize emin misiniz?')) {
      await deleteService({ variables: { id } });
      refetchServices();
    }
  };

  const handlePriceUpdate = async () => {
    if (!editData?.id) return;
    await updateServicePrice({
      variables: { id: editData.id, price: parseFloat(editData.price) },
    });
    setEditData(null);
    refetchServices();
  };

  const totalPages = Math.ceil(services.length / itemsPerPage);
  const paginatedServices = services.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container fluid className="p-4">
      <Row>
        {/* Sol Form */}
        <Col md={4}>
          <Card className="p-4 shadow-sm border-0">
            <h5 className="fw-bold mb-3">➕ Yeni Hizmet</h5>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Ad</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Örn: Saç Kesimi"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Süre (dk)</Form.Label>
                <Form.Control
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="Örn: 30"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fiyat (₺)</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Örn: 150"
                  required
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
                ✅ “{addState.data.addService.title}” eklendi.
              </Alert>
            )}
          </Card>
        </Col>

        {/* Sağ Liste */}
        <Col md={8}>
          <Card className="p-4 shadow-sm border-0">
            <h5 className="fw-bold mb-3">🧾 Mevcut Hizmetler</h5>
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
                      <th>Süre</th>
                      <th>Fiyat</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedServices.map(s => (
                      <tr key={s.id}>
                        <td>{s.title}</td>
                        <td>{s.duration} dk</td>
                        <td>₺{s.price}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => setEditData({ ...s })}
                            className="me-2"
                          >
                            Düzenle
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(s.id)}
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

      {/* Düzenleme Modalı */}
      <Modal show={!!editData} onHide={() => setEditData(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Fiyat Güncelle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Yeni Fiyat (₺)</Form.Label>
            <Form.Control
              type="number"
              value={editData?.price || ''}
              onChange={e =>
                setEditData(prev => ({ ...prev, price: e.target.value }))
              }
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditData(null)}>
            İptal
          </Button>
          <Button variant="primary" onClick={handlePriceUpdate}>
            Güncelle
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
