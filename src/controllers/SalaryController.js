// controllers/useSalaryController.js
import { useQuery, useMutation, gql } from '@apollo/client';
import { useEffect, useState } from 'react';

const GET_SALARY_RECORDS = gql`
  query {
    salaryRecords {
      id
      employeeId
      type
      amount
      description
      approved
      createdAt
    }
  }
`;

const ADD_SALARY_RECORD = gql`
  mutation AddSalaryRecord(
    $employeeId: ID!
    $type: String!
    $amount: Float!
    $description: String!
  ) {
    addSalaryRecord(
      employeeId: $employeeId
      type: $type
      amount: $amount
      description: $description
    ) {
      id
      type
      amount
      description
      approved
    }
  }
`;

const APPROVE_SALARY_RECORD = gql`
  mutation ApproveSalaryRecord($id: ID!) {
    approveSalaryRecord(id: $id) {
      id
      approved
    }
  }
`;

export function useSalaryController() {
  const { data, loading, error, refetch } = useQuery(GET_SALARY_RECORDS, {
    fetchPolicy: 'no-cache',
  });

  const [addSalaryRecordMutation, addState] = useMutation(ADD_SALARY_RECORD);
  const [approveSalaryRecordMutation] = useMutation(APPROVE_SALARY_RECORD);

  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (data?.salaryRecords) {
      const enriched = data.salaryRecords
        .map(r => ({
          ...r,
          parsedDate: new Date(parseInt(r.createdAt)),
        }))
        .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());

      setRecords(enriched);
    }
  }, [data]);

  const addSalaryRecord = async ({ employeeId, type, amount, description }) => {
    await addSalaryRecordMutation({
      variables: { employeeId, type, amount: parseFloat(amount), description },
    });
    await refetch();
  };

  const approveSalaryRecord = async id => {
    await approveSalaryRecordMutation({ variables: { id } });
    await refetch();
  };

  return {
    loading,
    error,
    records,
    addSalaryRecord,
    approveSalaryRecord,
    refetch,
    addState,
  };
}
