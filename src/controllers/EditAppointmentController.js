import { gql, useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';

// Servis sürelerini almak için
const GET_SERVICES = gql`
  query {
    services {
      id
      duration
    }
  }
`;

// Başlangıç/bitiş zamanı ve not güncelleme
const UPDATE_APPOINTMENT = gql`
  mutation UpdateAppointment($id: ID!, $startTime: String!, $endTime: String!, $notes: String) {
    updateAppointment(id: $id, startTime: $startTime, endTime: $endTime, notes: $notes) {
      id
    }
  }
`;

// Durum güncelleme (tamamlandı / iptal)
const UPDATE_APPOINTMENT_STATUS = gql`
  mutation UpdateAppointmentStatus($id: ID!, $status: String!, $totalPrice: Float) {
    updateAppointmentStatus(id: $id, status: $status, totalPrice: $totalPrice) {
      id
      status
      totalPrice
    }
  }
`;



export const useEditAppointmentController = (appointment, onSuccess) => {
  const { data: serviceData } = useQuery(GET_SERVICES);
  const [updateAppointment, { loading: loadingUpdate }] = useMutation(UPDATE_APPOINTMENT);
  const [updateStatus, { loading: loadingStatus }] = useMutation(UPDATE_APPOINTMENT_STATUS);

  const [form, setForm] = useState({
    startTime: '',
    notes: '',
  });

  const [serviceIds, setServiceIds] = useState([]);
  const services = serviceData?.services || [];

  // Başlangıçta appointment verilerini forma geçir
  useEffect(() => {
    if (appointment) {
      setForm({
        startTime: appointment.startTime?.slice(0, 16) || '',
        notes: appointment.notes || '',
      });
      setServiceIds(appointment.serviceIds || []);
    }
  }, [appointment]);

  // Seçili servislerin toplam süresine göre endTime hesapla
  const calculateEndTime = () => {
    const selected = services.filter(s => serviceIds.includes(s.id));
    const totalMinutes = selected.reduce((sum, s) => sum + s.duration, 0);

    const startDate = new Date(form.startTime);
    const endDate = new Date(startDate.getTime() + totalMinutes * 60000);

    return endDate.toISOString();
  };

  // Randevu bilgilerini güncelle
  const handleSubmit = async () => {
    if (!appointment?.id || !form.startTime) {
      alert('Zaman veya ID eksik');
      return;
    }

    try {
      const startTimeISO = new Date(form.startTime).toISOString();
      const endTimeISO = calculateEndTime();

      await updateAppointment({
        variables: {
          id: appointment.id,
          startTime: startTimeISO,
          endTime: endTimeISO,
          notes: form.notes,
        },
      });

      alert('✅ Randevu güncellendi');
      if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
      alert(`❌ Hata: ${err.message}`);
    }
  };

  const handleStatusUpdate = async (status, totalPrice) => {
    if (!appointment?.id) {
      alert('Geçersiz randevu');
      return;
    }

    try {
      await updateStatus({
        variables: {
          id: appointment.id,
          status,
          totalPrice: Number(totalPrice), // 💥 ZORUNLU!
        },
      });

      alert(
        status === 'tamamlandi'
          ? '✅ Randevu tamamlandı, ödeme alındı.'
          : '❌ Randevu iptal edildi.'
      );

      if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
      alert(`❌ Hata: ${err.message}`);
    }
  };


  return {
    form,
    setForm,
    handleSubmit,
    handleStatusUpdate,
    loading: loadingUpdate || loadingStatus,
  };
};
