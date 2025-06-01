import { gql, useMutation, useQuery } from '@apollo/client';

const GET_CUSTOMERS = gql`
  query GetCustomers {
    customers {
      id
      name
      phone
      notes
    }
  }
`;

const ADD_CUSTOMER = gql`
  mutation AddCustomer($name: String!, $phone: String!, $notes: String) {
    addCustomer(name: $name, phone: $phone, notes: $notes) {
      id
      name
    }
  }
`;

const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id) {
      id
    }
  }
`;

export function useCustomerController() {
  const { data, loading, error, refetch } = useQuery(GET_CUSTOMERS);
  const [addCustomer, addState] = useMutation(ADD_CUSTOMER);
  const [deleteCustomer, deleteState] = useMutation(DELETE_CUSTOMER);

  return {
    customers: data?.customers || [],
    loading,
    error,
    refetchCustomers: refetch,

    addCustomer,
    addState,

    deleteCustomer,
    deleteState,
  };
}
