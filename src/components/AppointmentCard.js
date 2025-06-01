import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { BsClockHistory } from 'react-icons/bs';

export default function AppointmentCard({
  appointment,
  getEmployeeName,
  getCustomerName,
  formatTime,
  calculateDuration,
}) {
  const start = formatTime(appointment.startTime);
  const end = formatTime(appointment.endTime);
  const duration = calculateDuration(
    appointment.startTime,
    appointment.endTime,
  );

  const employee = getEmployeeName(appointment.employeeId);
  const customer = getCustomerName(appointment.customerId);

  return (
    <Card className="mb-3 shadow-sm border-0">
      <Card.Body>
        <Row className="align-items-center justify-content-between">
          <Col>
            <h6 className="fw-bold mb-1">{employee}</h6>
            <div className="text-muted small">Müşteri: {customer}</div>
          </Col>

          <Col xs="auto">
            <Badge
              bg="light"
              text="primary"
              className="d-flex align-items-center gap-1"
            >
              <BsClockHistory size={14} />
              <span style={{ fontSize: '0.85rem' }}>{duration}</span>
            </Badge>
          </Col>
        </Row>

        <Row className="text-center mt-3">
          <Col>
            <div className="text-muted small">Tahmini Giriş</div>
            <div className="fw-bold">{start}</div>
          </Col>
          <Col>
            <div className="text-muted small">Tahmini Çıkış</div>
            <div className="fw-bold">{end}</div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
