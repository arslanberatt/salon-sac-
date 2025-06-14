// src/controllers/EmployeeSalaryController.js

import { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';

// ------------------------
// GraphQL Queries
// ------------------------
const GET_ALL_EMPLOYEES = gql`
  query GetAllEmployees {
    employees {
      id
      name
      salary
    }
  }
`;

const GET_SALARY_RECORDS = gql`
  query GetSalaryRecords {
    salaryRecords {
      id
      employeeId
      type
      amount
      approved
      date
    }
  }
`;

/**
 * useAllEmployeesSalary:
 * - Tüm çalışanları ve onların:
 *   • Bu aya ait avans/prim/net maaş bilgileri
 *   • Tüm zamanlardaki onaylı kayıtları (allRecords dizisi)
 *   döner.
 */
export function useAllEmployeesSalary() {
  const [loadingData, setLoadingData] = useState(true);
  const [employeesInfo, setEmployeesInfo] = useState([]);
  const [error, setError] = useState(null);

  // 1. Tüm çalışanlar
  const {
    data: empData,
    loading: loadingEmp,
    error: empError,
  } = useQuery(GET_ALL_EMPLOYEES, { fetchPolicy: 'no-cache' });

  // 2. Tüm salaryRecord’lar
  const {
    data: recData,
    loading: loadingRecs,
    error: recError,
  } = useQuery(GET_SALARY_RECORDS, { fetchPolicy: 'no-cache' });

  useEffect(() => {
    // Veriler gelene kadar bekle
    if (loadingEmp || loadingRecs) return;

    // Hata varsa
    if (empError || recError) {
      setError(empError || recError);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    const allEmployees = Array.isArray(empData?.employees)
      ? empData.employees
      : [];
    const allRecords = Array.isArray(recData?.salaryRecords)
      ? recData.salaryRecords
      : [];

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Her bir çalışan için bilgileri hesapla
    const infoList = allEmployees.map(emp => {
      const empId = emp.id;
      const gross = Number(emp.salary || 0);

      // Bu çalışanın onaylı tüm kayıtları
      const approvedRecords = allRecords.filter(
        r => r.employeeId === empId && r.approved === true,
      );

      // Bu aya ait olan onaylı kayıtlar
      const monthly = approvedRecords.filter(r => {
        const ts = parseInt(r.date, 10);
        if (isNaN(ts)) return false;
        const d = new Date(ts);
        return d.getFullYear() === year && d.getMonth() === month;
      });

      const advanceTotal = monthly
        .filter(r => (r.type || '').toLowerCase() === 'avans')
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);

      const bonusTotal = monthly
        .filter(r => (r.type || '').toLowerCase() === 'prim')
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);

      const net = gross - advanceTotal;

      return {
        id: empId,
        name: emp.name,
        grossSalary: gross,
        advanceTotal,
        bonusTotal,
        netSalary: net,
        monthlyRecords: monthly, // Bu aya ait onaylı kayıtlar
        allRecords: approvedRecords, // Tüm zamanlar onaylı kayıtlar
      };
    });

    setEmployeesInfo(infoList);
    setLoadingData(false);
  }, [loadingEmp, loadingRecs, empData, recData, empError, recError]);

  return {
    loading: loadingData || loadingEmp || loadingRecs,
    employeesInfo,
    error,
  };
}
