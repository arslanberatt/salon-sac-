import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useManageEmployeesController } from '../controllers/ManageEmployeesController';
import EmployeeCard from '../components/EmployeeCard';
import EmployeeEditModal from '../components/EmployeeEditModal';

export default function ManageEmployeesPage() {
  const {
    employees,
    guests,
    loading,
    selected,
    setSelected,
    showModal,
    setShowModal,
    openEditModal,
    updateEmployeeData,
    terminateEmployee,
    form,
    setForm,
    updating,
  } = useManageEmployeesController();

  const [showGuests, setShowGuests] = useState(false);

  const activeEmployees = showGuests ? guests : employees;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Çalışanlar</h3>
        <Button
          variant="outline-secondary"
          onClick={() => setShowGuests(prev => !prev)}
        >
          {showGuests ? 'Aktif Çalışanları Gör' : 'Pasif Çalışanları Gör'}
        </Button>
      </div>

      <Row className="g-4">
        {activeEmployees.map(emp => (
          <Col md={4} key={emp.id}>
            <EmployeeCard
              employee={emp}
              onEdit={() => openEditModal(emp)}
              onTerminate={() => terminateEmployee(emp)}
            />
          </Col>
        ))}
      </Row>

      {/* Modal */}
      {selected && (
        <EmployeeEditModal
          show={showModal}
          onHide={() => setShowModal(false)}
          form={form}
          setForm={setForm}
          updating={updating}
          onSave={updateEmployeeData}
        />
      )}
    </Container>
  );
}
