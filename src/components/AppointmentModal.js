import React from 'react';
import { Modal, Button, Badge, ListGroup } from 'react-bootstrap';

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
        <ListGroup>
          {services.map(s => (
            <ListGroup.Item key={s.id}>
              <strong>{s.title}</strong> — ₺{s.price} / {s.duration} dk
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <div className="d-flex gap-2">
          {!isCompleted && !isCanceled && (
            <>
              <Button variant="danger" onClick={() => onStatusUpdate('iptal')}>
                İptal Et
              </Button>
              <Button
                variant="success"
                onClick={() => onStatusUpdate('tamamlandi')}
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
