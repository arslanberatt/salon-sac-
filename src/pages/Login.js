import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_EMPLOYEE } from '../controllers/authController';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginEmployee, { loading }] = useMutation(LOGIN_EMPLOYEE);
  const [error, setError] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);

    try {
      const result = await loginEmployee({
        variables: { email, password },
      });

      const loginData = result.data?.loginEmployee;

      if (!loginData || !loginData.token) {
        setError('Geçersiz giriş bilgileri.');
        return;
      }

      const { token, employee } = loginData;

      if (employee.role === 'misafir') {
        setError('Hesabınız henüz onaylanmadı. Lütfen yöneticinize başvurun.');
        return;
      }

      localStorage.setItem('token', token);
      window.location.href = '/';
    } catch (err) {
      const msg =
        err.message?.replace('GraphQL error: ', '') || 'Bir hata oluştu.';
      setError(msg);
    }
  };

  return (
    <Container style={{ maxWidth: '400px', marginTop: '100px' }}>
      <h3 className="text-center mb-4">Giriş Yap</h3>
      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>Email adresi</Form.Label>
          <Form.Control
            type="email"
            placeholder="E-posta girin"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Şifre</Form.Label>
          <Form.Control
            type="password"
            placeholder="Şifrenizi girin"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="w-100"
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : 'Giriş Yap'}
        </Button>
      </Form>
    </Container>
  );
}
