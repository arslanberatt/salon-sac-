import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaUserEdit, FaUserSlash } from 'react-icons/fa';

export default function EmployeeCard({ employee, onEdit, onTerminate }) {
  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Card.Title className="mb-0">{employee.name}</Card.Title>
            <Card.Subtitle className="text-muted text-capitalize">
              {employee.role}
            </Card.Subtitle>
          </div>
          <div className="d-flex flex-column align-items-end gap-2">
            <Button variant="outline-primary" size="sm" onClick={onEdit}>
              <FaUserEdit />
            </Button>
            {employee.role !== 'misafir' && (
              <Button variant="outline-danger" size="sm" onClick={onTerminate}>
                <FaUserSlash />
              </Button>
            )}
          </div>
        </div>
        <hr />
        <p className="mb-1">
          Maaş: <strong>{employee.salary ?? 0}₺</strong>
        </p>
        <p className="mb-1">
          Prim: <strong>{employee.commissionRate ?? 0}%</strong>
        </p>
      </Card.Body>
    </Card>
  );
}
