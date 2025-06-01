import React from 'react';
import { Modal, Button, Form, Spinner, ListGroup } from 'react-bootstrap';
import { useAddAppointmentController } from '../controllers/AddAppointmentController';

export default function AddAppointmentModal({ show, handleClose }) {
  const {
    form,
    setForm,
    employees,
    filteredCustomers,
    services,
    totalPrice,
    handleServiceChange,
    handleSubmit,
    loading,
    customerSearch,
    setCustomerSearch,
  } = useAddAppointmentController(handleClose);

  const selectedCustomer = filteredCustomers.find(c => c.id === form.customerId);

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Randevu Ekle</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={(e) => e.preventDefault()}>
          {/* Müşteri Arama */}
          <Form.Group className="mb-3">
            <Form.Label>Müşteri Ara</Form.Label>
            <Form.Control
              type="text"
              placeholder="İsim veya telefon..."
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setForm({ ...form, customerId: '' });
              }}
            />

            {customerSearch && (
              <ListGroup style={{ maxHeight: '150px', overflowY: 'auto', marginTop: '5px' }}>
                {filteredCustomers.length === 0 ? (
                  <ListGroup.Item disabled>Müşteri bulunamadı</ListGroup.Item>
                ) : (
                  filteredCustomers.map((c) => (
                    <ListGroup.Item
                      key={c.id}
                      action
                      active={form.customerId === c.id}
                      onClick={() => setForm({ ...form, customerId: c.id })}
                    >
                      {c.name} ({c.phone})
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            )}
          </Form.Group>

          {/* Seçilen müşteri */}
          {selectedCustomer && (
            <div className="mb-3 text-success">
              Seçilen: <strong>{selectedCustomer.name}</strong> ({selectedCustomer.phone})
            </div>
          )}

          {/* Çalışan Seçimi */}
          <Form.Group className="mb-3">
            <Form.Label>Çalışan</Form.Label>
            <Form.Select
              value={form.employeeId}
              onChange={(e) =>
                setForm({ ...form, employeeId: e.target.value })
              }
            >
              <option value="">Seçiniz</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Hizmet Seçimi */}
          <Form.Group className="mb-3">
            <Form.Label>Hizmetler</Form.Label>
            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                borderRadius: '5px',
                padding: '10px',
              }}
            >
              {services.length === 0 ? (
                <div className="text-muted">Hizmet bulunamadı</div>
              ) : (
                services.map((s) => (
                  <Form.Check
                    key={s.id}
                    type="checkbox"
                    label={`${s.title} - ₺${s.price}`}
                    value={s.id}
                    checked={form.serviceIds.includes(s.id)}
                    onChange={handleServiceChange}
                  />
                ))
              )}
            </div>
          </Form.Group>

          {/* Tarih & Saat */}
          <Form.Group className="mb-3">
            <Form.Label>Tarih & Saat</Form.Label>
            <Form.Control
              type="datetime-local"
              value={form.startTime}
              onChange={(e) =>
                setForm({ ...form, startTime: e.target.value })
              }
            />
          </Form.Group>

          {/* Not */}
          <Form.Group className="mb-3">
            <Form.Label>Not</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Form.Group>

          <p><strong>Toplam Tutar:</strong> ₺{totalPrice}</p>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Kapat
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || !form.customerId}
        >
          {loading ? <Spinner animation="border" size="sm" /> : 'Kaydet'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
