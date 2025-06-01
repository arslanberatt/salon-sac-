import { gql, useQuery } from '@apollo/client';

// --- GraphQL Queries ---
export const GET_APPOINTMENTS = gql`
  query {
    appointments {
      id
      startTime
      endTime
      status
      notes
      employeeId
      customerId
      serviceIds
    }
  }
`;

export const GET_EMPLOYEES = gql`
  query {
    employees {
      id
      name
    }
  }
`;

export const GET_CUSTOMERS = gql`
  query {
    customers {
      id
      name
      phone
      notes
      createdAt
    }
  }
`;

export const GET_SERVICES = gql`
  query {
    services {
      id
      title
      duration
      price
    }
  }
`;

// --- Custom Hook ---
export const useAppointmentController = () => {
  const { data: appointmentData, loading: loadingAppointments } =
    useQuery(GET_APPOINTMENTS);
  const { data: employeeData } = useQuery(GET_EMPLOYEES);
  const { data: customerData } = useQuery(GET_CUSTOMERS);
  const { data: serviceData } = useQuery(GET_SERVICES);

  const appointments = appointmentData?.appointments ?? [];
  const employees = employeeData?.employees ?? [];
  const customers = customerData?.customers ?? [];
  const services = serviceData?.services ?? [];

  const today = new Date();
  const formatToDate = timestamp => {
    const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    return new Date(ts);
  };

  const todayAppointments = appointments.filter(appt => {
    const date = formatToDate(appt.startTime);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  });

  const waitingAppointments = appointments.filter(a => a.status === 'bekliyor');

  const getEmployeeName = id =>
    employees.find(e => e.id === id)?.name || 'Bilinmiyor';

  const getCustomerName = id =>
    customers.find(c => c.id === id)?.name || 'Bilinmiyor';

  const getServicesByIds = ids => services.filter(s => ids.includes(s.id));

  const formatTime = timestamp => {
    try {
      const dt = formatToDate(timestamp);
      return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  };

  const calculateDuration = (start, end) => {
    try {
      const startTime = formatToDate(start);
      const endTime = formatToDate(end);
      const diff = endTime - startTime;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours} saat ${minutes} dk`;
    } catch {
      return '-';
    }
  };

  return {
    appointments,
    todayAppointments,
    waitingAppointments,
    loading: loadingAppointments,
    customers,
    customerCount: customers.length, 
    getEmployeeName,
    getCustomerName,
    getServicesByIds,
    formatTime,
    calculateDuration,
  };
};
