import { gql, useMutation } from '@apollo/client';

// 🔐 Login mutation
export const LOGIN_EMPLOYEE = gql`
  mutation LoginEmployee($email: String!, $password: String!) {
    loginEmployee(email: $email, password: $password) {
      token
      employee {
        id
        name
        email
        role
      }
    }
  }
`;

export const useAuthController = () => {
  const [loginMutation, loginStatus] = useMutation(LOGIN_EMPLOYEE);

  const login = async ({ email, password }) => {
    try {
      const result = await loginMutation({
        variables: { email, password },
      });

      const token = result.data?.loginEmployee?.token;
      const employee = result.data?.loginEmployee?.employee;

      if (!token || !employee) {
        throw new Error('Geçersiz email veya şifre.');
      }

      if (employee.role !== 'patron') {
        throw new Error('Bu panele sadece patronlar giriş yapabilir.');
      }

      localStorage.setItem('token', token);
      return employee;
    } catch (err) {
      const message =
        err.message?.replace('GraphQL error: ', '') || 'Bir hata oluştu.';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return {
    login,
    loginStatus,
    logout,
  };
};
