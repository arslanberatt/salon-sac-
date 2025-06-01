import { gql, useMutation, useQuery } from '@apollo/client';

const ADD_SERVICE = gql`
  mutation AddService($title: String!, $duration: Int!, $price: Float!) {
    addService(title: $title, duration: $duration, price: $price) {
      id
      title
      duration
      price
    }
  }
`;

const GET_SERVICES = gql`
  query GetServices {
    services {
      id
      title
      duration
      price
      createdAt
    }
  }
`;

const DELETE_SERVICE = gql`
  mutation DeleteService($id: ID!) {
    deleteService(id: $id) {
      id
    }
  }
`;

const UPDATE_SERVICE_PRICE = gql`
  mutation UpdateServicePrice($id: ID!, $price: Float!) {
    updateServicePrice(id: $id, price: $price) {
      id
      price
    }
  }
`;

export function useServiceController() {
  const { data, loading, error, refetch } = useQuery(GET_SERVICES);
  const [addService, addState] = useMutation(ADD_SERVICE);
  const [deleteService, deleteState] = useMutation(DELETE_SERVICE);
  const [updateServicePrice, updateState] = useMutation(UPDATE_SERVICE_PRICE);

  return {
    services: data?.services || [],
    loading,
    error,
    refetchServices: refetch,

    // Mutasyonlar
    addService,
    addState,

    deleteService,
    deleteState,

    updateServicePrice,
    updateState,
  };
}
