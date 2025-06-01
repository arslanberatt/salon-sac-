// controllers/AdvanceApprovalController.js
import { useEffect, useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const FETCH_ADVANCE_REQUESTS = gql`
  query {
    advanceRequests {
      id
      amount
      reason
      status
      createdAt
      employee {
        id
        name
      }
    }
  }
`;

const APPROVE_ADVANCE = gql`
  mutation ApproveAdvanceRequest($id: ID!) {
    approveAdvanceRequest(id: $id) {
      id
      status
    }
  }
`;

const REJECT_ADVANCE = gql`
  mutation RejectAdvanceRequest($id: ID!) {
    rejectAdvanceRequest(id: $id) {
      id
      status
    }
  }
`;

export function useAdvanceApprovalController() {
  const { data, loading, error, refetch } = useQuery(FETCH_ADVANCE_REQUESTS, {
    fetchPolicy: 'no-cache',
  });

  const [approveAdvance] = useMutation(APPROVE_ADVANCE);
  const [rejectAdvance] = useMutation(REJECT_ADVANCE);

  const [allRequests, setAllRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    if (data && data.advanceRequests) {
      const parsedData = data.advanceRequests.map(r => {
        const timestamp = typeof r.createdAt === 'string' ? parseInt(r.createdAt) : r.createdAt;
        const parsedDate = new Date(timestamp);

        return {
          ...r,
          parsedDate,
        };
      });

      console.log(
        'Gelen veri (createdAt):',
        parsedData.map(r => ({ id: r.id, createdAt: r.createdAt, parsed: r.parsedDate.toLocaleString('tr-TR') }))
      );

      const sorted = parsedData.sort(
        (a, b) => b.parsedDate.getTime() - a.parsedDate.getTime()
      );

      setAllRequests(sorted);
      setPendingRequests(sorted.filter(r => r.status === 'beklemede'));
    }
  }, [data]);

  const updateStatus = async (id, approve = true) => {
    const mutation = approve ? approveAdvance : rejectAdvance;
    await mutation({ variables: { id } });
    await refetch();
  };

  return {
    loading,
    error,
    allRequests,
    pendingRequests,
    updateStatus,
    refetchRequests: refetch,
  };
}