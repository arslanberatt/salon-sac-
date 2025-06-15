import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  Badge,
  ListGroup,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { useEditAppointmentController } from '../controllers/EditAppointmentController';

export default function AppointmentModal({
  show,
  handleClose,
  appointment,
  getEmployeeName,
  getCustomerName,
  formatTime,
  calculateDuration,
  getServicesByIds,
  onEdit,
  onStatusUpdate,
}) {
  const {
    handleStatusUpdate,
  } = useEditAppointmentController(appointment, () => {
    onStatusUpdate?.();
    handleClose();
  });

  const [editablePrice, setEditablePrice] = useState(0);

  useEffect(() => {
    if (appointment) {
      const services = getServicesByIds(appointment.serviceIds || []);
      const totalServicePrice = services.reduce((sum, s) => sum + s.price, 0);
      setEditablePrice(totalServicePrice);
    }
  }, [appointment, getServicesByIds]);

  if (!appointment) return null;

  const employee = getEmployeeName(appointment.employeeId);
  const customer = getCustomerName(appointment.customerId);
  const start = formatTime(appointment.startTime);
  const end = formatTime(appointment.endTime);
  const duration = calculateDuration(
    appointment.startTime,
    appointment.endTime,
  );
  const services = getServicesByIds(appointment.serviceIds);

  const isCompleted = appointment.status === 'tamamlandi';
  const isCanceled = appointment.status === 'iptal';

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Randevu Detayı</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          <strong>Çalışan:</strong> {employee}
        </p>
        <p>
          <strong>Müşteri:</strong> {customer}
        </p>
        <p>
          <strong>Başlangıç:</strong> {start}
        </p>
        <p>
          <strong>Bitiş:</strong> {end}
        </p>
        <p>
          <strong>Süre:</strong> {duration}
        </p>
        <p>
          <strong>Durum:</strong>{' '}
          <Badge
            bg={isCompleted ? 'success' : isCanceled ? 'danger' : 'warning'}
          >
            {appointment.status}
          </Badge>
        </p>
        {appointment.notes && (
          <p>
            <strong>Not:</strong> {appointment.notes}
          </p>
        )}

        <hr />
        <h6>Hizmetler</h6>
        <ListGroup className="mb-3">
          {services.map(s => (
            <ListGroup.Item key={s.id}>
              <strong>{s.title}</strong> — ₺{s.price} / {s.duration} dk
            </ListGroup.Item>
          ))}
        </ListGroup>

        {!isCompleted && !isCanceled && (
          <Form.Group>
            <Form.Label>Toplam Ödeme Tutarı</Form.Label>
            <InputGroup>
              <InputGroup.Text>₺</InputGroup.Text>
              <Form.Control
                type="number"
                value={editablePrice}
                onChange={e => setEditablePrice(Number(e.target.value))}
              />
            </InputGroup>
          </Form.Group>
        )}
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <div className="d-flex gap-2">
          {!isCompleted && !isCanceled && (
            <>
              <Button
                variant="danger"
                onClick={() => handleStatusUpdate('iptal', 0)}
              >
                İptal Et
              </Button>
              <Button
                variant="success"
                onClick={() => handleStatusUpdate('tamamlandi', editablePrice)}
              >
                Ödeme Al
              </Button>
            </>
          )}
        </div>
        <div>
          <Button variant="secondary" onClick={handleClose}>
            Kapat
          </Button>{' '}
          <Button variant="primary" onClick={() => onEdit(appointment)}>
            Düzenle
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}