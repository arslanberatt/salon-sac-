import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { GET_TRANSACTIONS } from '../controllers/TransactionController';
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Badge,
  Spinner,
} from 'react-bootstrap';
import { BsBell } from 'react-icons/bs';
import { useAppointmentController } from '../controllers/AppointmentController';
import { useAdvanceApprovalController } from '../controllers/AdvanceApprovalController';
import { useManageEmployeesController } from '../controllers/ManageEmployeesController';
import { useNavigate } from 'react-router-dom';
import AppointmentModal from '../components/AppointmentModal';
import AddAppointmentModal from '../components/AddAppointmentModal';
import EditAppointmentModal from '../components/EditAppointmentModal';
import EmployeeCard from '../components/EmployeeCard';

const UPDATE_APPOINTMENT_STATUS = gql`
  mutation UpdateAppointmentStatus($id: ID!, $status: String!) {
    updateAppointmentStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export default function Dashboard() {
  // --- TRANSACTION VERİSİ ---
  const { data, loading, error } = useQuery(GET_TRANSACTIONS);
  const transactions = data?.transactions ?? [];

  // --- RANDEVU KONTROLLERİ ---
  const {
    todayAppointments,
    loading: loadingAppointments,
    customerCount,
    getEmployeeName,
    getCustomerName,
    formatTime,
    calculateDuration,
    getServicesByIds,
    refetchAppointments,
  } = useAppointmentController();

  // --- ÇALIŞAN YÖNETİMİ KONTROLLERİ ---
  const { employees, terminateEmployee } = useManageEmployeesController();
  const activeEmployees = employees || [];

  // --- AVANS ONAY İSTEKLERİ ---
  const { pendingRequests } = useAdvanceApprovalController();

  // --- APPOINTMENT İŞLEMLERİ İÇİN DURUMLAR ---
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditAppointmentModal, setShowEditAppointmentModal] =
    useState(false);

  const [updateStatus] = useMutation(UPDATE_APPOINTMENT_STATUS);
  const navigate = useNavigate();

  // --- GELİR-GİDER HESAPLARI ---
  const income = transactions
    .filter(t => t.type === 'gelir' && !t.canceled)
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type !== 'gelir' && !t.canceled)
    .reduce((sum, t) => sum + t.amount, 0);

  const netRevenue = income - expense;

  // --- MODAL FONKSİYONLARI ---
  const handleOpenDetailModal = appt => {
    setSelectedAppt(appt);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedAppt(null);
    setShowDetailModal(false);
  };

  const openEditAppointmentModal = appt => {
    setSelectedAppt(appt);
    setShowDetailModal(false);
    setShowEditAppointmentModal(true);
  };

  const handleStatusUpdate = async status => {
    if (!selectedAppt?.id) return;

    try {
      await updateStatus({
        variables: { id: selectedAppt.id, status },
      });

      alert(
        `Randevu ${status === 'tamamlandi' ? 'tamamlandı' : 'iptal edildi'}.`,
      );
      setShowDetailModal(false);

      if (typeof refetchAppointments === 'function') {
        refetchAppointments();
      } else {
        window.location.reload();
      }
    } catch (err) {
      alert(`❌ Hata: ${err.message}`);
    }
  };

  return (
    <Container fluid className="p-4">
      {/* Başlık + Avans Bildirimi */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Anasayfa</h4>
        <div
          className="position-relative"
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/avans')}
        >
          <BsBell size={28} className="text-primary" />
          {pendingRequests.length > 0 && (
            <Badge
              bg="danger"
              pill
              className="position-absolute top-0 start-100 translate-middle"
            >
              {pendingRequests.length}
            </Badge>
          )}
        </div>
      </div>

      <Row className="gy-4">
        {/* SOL SÜTUN (8/12 genişlik) */}
        <Col md={8}>
          {/* Net Kazanç ve Müşteri + Buton Kartları */}
          <Row className="g-3 mb-4">
            <Col md={6}>
              <Card
                className="shadow-sm text-white p-4 border-0 rounded-4"
                style={{ backgroundColor: '#5a2e8c' }}
              >
                <h3 className="fw-bold">
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    `${netRevenue.toFixed(2)}₺`
                  )}
                </h3>
                <p className="text-white mb-0">Net Kazanç</p>
              </Card>
            </Col>

            <Col md={6}>
              <Card
                className="shadow-sm text-white p-4 border-0 rounded-4"
                style={{ backgroundColor: '#d14472' }}
              >
                <h3 className="fw-bold">
                  {loadingAppointments ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    customerCount
                  )}
                </h3>
                <p className="text-white mb-0">Müşteri Sayısı</p>
              </Card>
              <div className="d-flex justify-content-end mt-3">
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="text-white py-2 px-3 border-0"
                  style={{ backgroundColor: '#253d90' }}
                >
                  + Randevu Oluştur
                </Button>
              </div>
            </Col>
          </Row>

          {/* Bugün ki Randevular Başlığı */}
          <h5 className="fw-bold mb-3">Bugün ki Randevular</h5>

          {/* Kaydırılabilir Liste (overflowX: 'hidden') */}
          <div
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {loadingAppointments ? (
              <Spinner animation="border" />
            ) : todayAppointments.length === 0 ? (
              <p className="text-muted">Bugün için randevu bulunamadı.</p>
            ) : (
              todayAppointments.map((appt, index) => (
                <Card
                  key={appt.id}
                  onClick={() => handleOpenDetailModal(appt)}
                  className={`p-3 mb-3 border-0 rounded-4 shadow-sm ${
                    appt.status === 'tamamlandi'
                      ? 'bg-light'
                      : appt.status === 'iptal'
                      ? 'bg-light-danger'
                      : 'bg-light-warning'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle text-white d-flex justify-content-center align-items-center me-3"
                      style={{
                        width: 50,
                        height: 50,
                        fontSize: '1.2rem',
                        backgroundColor: '#1e1e2f',
                      }}
                    >
                      {getEmployeeName(appt.employeeId).charAt(0)}
                    </div>

                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="mb-1 fw-bold text-dark">
                            {getEmployeeName(appt.employeeId)} •{' '}
                            <span className="fw-normal text-muted">
                              {getCustomerName(appt.customerId)}
                            </span>
                          </h6>
                          <div className="text-muted small">
                            {formatTime(appt.startTime)} -{' '}
                            {formatTime(appt.endTime)} •{' '}
                            {calculateDuration(appt.startTime, appt.endTime)}
                          </div>
                        </div>

                        <div className="text-end">
                          <Badge
                            bg={
                              appt.status === 'tamamlandi'
                                ? 'success'
                                : appt.status === 'iptal'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {appt.status}
                          </Badge>
                          <div className="small text-muted mt-1">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Col>

        {/* SAĞ SÜTUN (4/12 genişlik) */}
        <Col md={4}>
          <div
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              overflowX: 'hidden',
              paddingRight: '8px', // Scrollbar boşluğu için
            }}
          >
            <Row className="g-4">
              {activeEmployees.map(emp => (
                <Col md={12} key={emp.id}>
                  <EmployeeCard
                    employee={emp}
                    onEdit={() => navigate(`/calisan/${emp.id}`)}
                    onTerminate={event => {
                      event.stopPropagation();
                      terminateEmployee(emp);
                    }}
                  />
                </Col>
              ))}
            </Row>
          </div>
        </Col>
      </Row>

      {/* RANDEVU DETAY + DÜZENLE MODALLARI */}
      {selectedAppt && (
        <>
          <AppointmentModal
            show={showDetailModal}
            handleClose={handleCloseDetailModal}
            appointment={selectedAppt}
            getEmployeeName={getEmployeeName}
            getCustomerName={getCustomerName}
            formatTime={formatTime}
            calculateDuration={calculateDuration}
            getServicesByIds={getServicesByIds}
            onEdit={openEditAppointmentModal}
            onStatusUpdate={handleStatusUpdate}
          />

          <EditAppointmentModal
            show={showEditAppointmentModal}
            handleClose={() => setShowEditAppointmentModal(false)}
            appointment={selectedAppt}
          />
        </>
      )}

      {/* RANDEVU EKLEME MODALI */}
      <AddAppointmentModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
      />

      {error && <div className="text-danger mt-3">Hata: {error.message}</div>}
    </Container>
  );
}
