import React from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { useEditAppointmentController } from '../controllers/EditAppointmentController';

export default function EditAppointmentModal({
  show,
  handleClose,
  appointment,
}) {
  const { form, setForm, handleSubmit, loading } = useEditAppointmentController(
    appointment,
    handleClose,
  );

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Randevu Güncelle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={e => e.preventDefault()}>
          <Form.Group className="mb-3">
            <Form.Label>Tarih & Saat</Form.Label>
            <Form.Control
              type="datetime-local"
              value={form.startTime}
              onChange={e => setForm({ ...form, startTime: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Not</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </Form.Group>
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
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : 'Güncelle'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
