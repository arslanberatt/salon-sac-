import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';

// --- GraphQL Queries ---
const GET_EMPLOYEES = gql`
  query {
    employees {
      id
      name
      role
    }
  }
`;

const GET_CUSTOMERS = gql`
  query {
    customers {
      id
      name
      phone
    }
  }
`;

const GET_SERVICES = gql`
  query {
    services {
      id
      title
      price
    }
  }
`;

// --- Mutation: Add Appointment ---
const ADD_APPOINTMENT = gql`
  mutation AddAppointment(
    $customerId: ID!
    $employeeId: ID!
    $serviceIds: [ID!]!
    $startTime: String!
    $totalPrice: Float!
    $notes: String
  ) {
    addAppointment(
      customerId: $customerId
      employeeId: $employeeId
      serviceIds: $serviceIds
      startTime: $startTime
      totalPrice: $totalPrice
      notes: $notes
    ) {
      id
    }
  }
`;

export const useAddAppointmentController = (onSuccess) => {
  // GraphQL verilerini çek
  const { data: employeeData, loading: loadingEmployees } = useQuery(GET_EMPLOYEES);
  const { data: customerData, loading: loadingCustomers } = useQuery(GET_CUSTOMERS);
  const { data: serviceData, loading: loadingServices } = useQuery(GET_SERVICES);

  // Mutation
  const [addAppointment, { loading: adding }] = useMutation(ADD_APPOINTMENT);

  // Form State
  const [form, setForm] = useState({
    customerId: '',
    employeeId: '',
    serviceIds: [],
    startTime: '',
    notes: '',
  });
  function toTurkishISO(datetimeStr) {
    const localDate = new Date(datetimeStr);
    const turkishDate = new Date(localDate.getTime()); // 3 saat ileri
    return turkishDate.toISOString();
  }

  // Diğer state'ler
  const [totalPrice, setTotalPrice] = useState(0);
  const [customerSearch, setCustomerSearch] = useState('');

  // Filtrelenmiş çalışan listesi (sadece patron ve calisan)
  const employees = (employeeData?.employees || []).filter(
    (e) => e.role === 'patron' || e.role === 'calisan'
  );

  // Tüm müşteriler
  const customers = customerData?.customers || [];

  // Arama kutusuna göre filtreli müşteri listesi
  const filteredCustomers = customers.filter((c) =>
    `${c?.name || ''} ${c?.phone || ''}`.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Hizmetler
  const services = serviceData?.services || [];

  // Checkbox değiştiğinde hizmetleri ve toplam fiyatı güncelle
  const handleServiceChange = (e) => {
    const { value, checked } = e.target;
    const updatedIds = checked
      ? [...form.serviceIds, value]
      : form.serviceIds.filter((id) => id !== value);

    setForm({ ...form, serviceIds: updatedIds });

    const selectedServices = services.filter((s) => updatedIds.includes(s.id));
    const total = selectedServices.reduce((sum, s) => sum + s.price, 0);
    setTotalPrice(total);
  };

  // Formu submit et (randevu ekle)
  const handleSubmit = async () => {
    const { customerId, employeeId, startTime, serviceIds } = form;

    if (!customerId || !employeeId || !startTime || serviceIds.length === 0) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      await addAppointment({
        variables: {
          ...form,
          startTime: toTurkishISO(form.startTime), // burada dönüştürüyoruz
          totalPrice,
        },
      });


      alert('✅ Randevu başarıyla eklendi.');
      if (typeof onSuccess === 'function') onSuccess();

      // Formu sıfırla
      setForm({
        customerId: '',
        employeeId: '',
        serviceIds: [],
        startTime: '',
        notes: '',
      });
      setTotalPrice(0);
      setCustomerSearch('');
    } catch (err) {
      alert(`❌ Hata: ${err.message}`);
    }
  };

  return {
    form,
    setForm,
    employees,
    customers,
    filteredCustomers,
    services,
    customerSearch,
    setCustomerSearch,
    totalPrice,
    handleServiceChange,
    handleSubmit,
    loading: loadingEmployees || loadingCustomers || loadingServices || adding,
  };
};
