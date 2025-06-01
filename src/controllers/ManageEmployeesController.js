import { gql, useQuery, useMutation } from '@apollo/client';
import { useState, useEffect } from 'react';
import { useUserSession } from '../utils/useUserSession';

// --- GraphQL Sorgular ve Mutasyonlar ---
const GET_EMPLOYEES = gql`
  query GetEmployees {
    employees {
      id
      name
      role
      salary
      commissionRate
      advanceBalance
    }
  }
`;

const UPDATE_EMPLOYEE_ROLE = gql`
  mutation UpdateEmployeeRole($id: ID!, $role: String!, $password: String!) {
    updateEmployeeRole(id: $id, role: $role, password: $password) {
      id
      role
    }
  }
`;

const UPDATE_EMPLOYEE_BY_PATRON = gql`
  mutation UpdateEmployeeByPatron(
    $id: ID!
    $salary: Float
    $commissionRate: Float
    $advanceBalance: Float
    $password: String!
  ) {
    updateEmployeeByPatron(
      id: $id
      salary: $salary
      commissionRate: $commissionRate
      advanceBalance: $advanceBalance
      password: $password
    ) {
      id
      salary
      commissionRate
      advanceBalance
    }
  }
`;

export const useManageEmployeesController = () => {
  const { user } = useUserSession();
  const { data, loading, refetch } = useQuery(GET_EMPLOYEES);

  const [updateRole] = useMutation(UPDATE_EMPLOYEE_ROLE);
  const [updateFinancials] = useMutation(UPDATE_EMPLOYEE_BY_PATRON);

  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    salary: '',
    commissionRate: '',
    advanceBalance: '',
    role: '',
    password: '',
  });

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [showGuests, setShowGuests] = useState(false);

  // --- Çalışanları ayır (kendini hariç tut)
  const employees = (data?.employees || []).filter(
    emp => emp.role !== 'misafir' && emp.id !== user?.id
  );
  const guests = (data?.employees || []).filter(
    emp => emp.role === 'misafir' && emp.id !== user?.id
  );

  // --- Modal Aç
  const openEditModal = employee => {
    setSelected(employee);
    setForm({
      salary: employee.salary ?? '',
      commissionRate: employee.commissionRate ?? '',
      advanceBalance: employee.advanceBalance ?? '',
      role: employee.role ?? 'calisan',
      password: '',
    });
    setShowModal(true);
  };

  // --- Çalışanı Güncelle
  const updateEmployeeData = async () => {
    if (!selected || !form.password) return;

    try {
      setUpdating(true);
      setUpdateError('');
      setUpdateSuccess(false);

      await updateFinancials({
        variables: {
          id: selected.id,
          salary: parseFloat(form.salary),
          commissionRate: parseFloat(form.commissionRate),
          advanceBalance: parseFloat(form.advanceBalance),
          password: form.password,
        },
      });

      await updateRole({
        variables: {
          id: selected.id,
          role: form.role,
          password: form.password,
        },
      });

      await refetch();
      setShowModal(false);
      setUpdateSuccess(true);
    } catch (err) {
      setUpdateError(err.message || 'Bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  // --- İşten Çıkarma (rolü misafir yap)
  const terminateEmployee = async employee => {
    const confirm = window.confirm(`${employee.name} işten çıkarılsın mı?`);
    if (!confirm) return;

    const password = prompt('Lütfen işlemi onaylamak için şifrenizi girin:');
    if (!password) return;

    try {
      await updateRole({
        variables: {
          id: employee.id,
          role: 'misafir',
          password,
        },
      });
      await refetch();
      alert('Çalışan başarıyla işten çıkarıldı.');
    } catch (err) {
      alert(err.message || 'İşlem başarısız.');
    }
  };

  // --- Modal kapandığında sıfırla
  useEffect(() => {
    if (!showModal) {
      setForm(prev => ({ ...prev, password: '' }));
      setSelected(null);
    }
  }, [showModal]);

  return {
    employees,
    guests,
    loading,
    selected,
    setSelected,
    form,
    setForm,
    showModal,
    setShowModal,
    openEditModal,
    updateEmployeeData,
    terminateEmployee,
    updating,
    updateError,
    updateSuccess,
    showGuests,
    setShowGuests,
  };
};
