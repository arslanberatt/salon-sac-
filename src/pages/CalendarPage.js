import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/tr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Spinner, Container } from 'react-bootstrap';
import { useAppointmentController } from '../controllers/AppointmentController';
import AppointmentModal from '../components/AppointmentModal';
import { gql, useMutation } from '@apollo/client';

moment.locale('tr');
const localizer = momentLocalizer(moment);

// GraphQL Mutasyonu
const UPDATE_APPOINTMENT_STATUS = gql`
  mutation UpdateAppointmentStatus($id: ID!, $status: String!) {
    updateAppointmentStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export default function CalendarPage() {
  const {
    appointments,
    loading,
    refetchAppointments,
    getCustomerName,
    getEmployeeName,
    getServicesByIds,
    formatTime,
    calculateDuration,
  } = useAppointmentController();

  const [updateStatus] = useMutation(UPDATE_APPOINTMENT_STATUS);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Etkinlik formatı
  const calendarEvents = appointments.map(appt => ({
    id: appt.id,
    title: `${getCustomerName(appt.customerId)} • ${appt.status}`,
    start: new Date(Number(appt.startTime)),
    end: new Date(Number(appt.endTime)),
    original: appt,
  }));

  const handleSelectEvent = event => {
    setSelectedEvent(event.original);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setShowModal(false);
  };

  const handleStatusUpdate = async status => {
    if (!selectedEvent?.id) return;

    try {
      await updateStatus({
        variables: { id: selectedEvent.id, status },
      });

      alert(
        `Randevu ${status === 'tamamlandi' ? 'tamamlandı' : 'iptal edildi'}.`,
      );
      setShowModal(false);
      refetchAppointments?.();
    } catch (err) {
      alert(`❌ Hata: ${err.message}`);
    }
  };

  const getEventStyle = event => {
    const status = event.original.status;
    const backgroundColor =
      status === 'tamamlandi'
        ? '#28a745'
        : status === 'iptal'
        ? '#dc3545'
        : '#ffc107';

    return {
      style: {
        backgroundColor,
        color: '#fff',
        fontWeight: 500,
        padding: '6px 8px',
        borderRadius: '6px',
        border: 'none',
      },
    };
  };

  return (
    <Container fluid className="p-3">
      <h4 className="fw-bold mb-4"> Randevu Takvimi</h4>

      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: '60vh' }}
        >
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={['month', 'week', 'day']}
          selectable
          style={{
            height: '80vh',
            borderRadius: '12px',
            backgroundColor: '#fff',
          }}
          step={120}
          timeslots={1}
          min={new Date(1970, 1, 1, 7, 0)}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={getEventStyle}
          messages={{
            next: 'Sonraki',
            previous: 'Önceki',
            today: 'Bugün',
            month: 'Ay',
            week: 'Hafta',
            day: 'Gün',
            agenda: 'Ajanda',
            date: 'Tarih',
            time: 'Saat',
            event: 'Etkinlik',
          }}
        />
      )}

      {selectedEvent && (
        <AppointmentModal
          show={showModal}
          handleClose={closeModal}
          appointment={selectedEvent}
          getEmployeeName={getEmployeeName}
          getCustomerName={getCustomerName}
          formatTime={formatTime}
          calculateDuration={calculateDuration}
          getServicesByIds={getServicesByIds}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </Container>
  );
}
