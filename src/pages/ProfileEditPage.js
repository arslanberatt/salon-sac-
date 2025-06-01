import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  InputGroup,
} from 'react-bootstrap';
import { useUserProfileController } from '../controllers/UserProfileController';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function UserProfilePage() {
  const { userInfo, form, setForm, loading, updateInfo, updatePassword } =
    useUserProfileController();

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setForm(prev => ({
        ...prev,
        name: userInfo.name,
        phone: userInfo.phone,
      }));
    }
  }, [userInfo]);

  return (
    <Container className="py-5">
      <Row className="g-4">
        {/* Kişisel Bilgiler */}
        <Col md={6}>
          <Card className="p-4 bg-light border-0 shadow-sm">
            <h5 className="fw-bold mb-3">👤 Kişisel Bilgiler</h5>
            <Form onSubmit={updateInfo}>
              <Form.Group className="mb-3">
                <Form.Label>Ad Soyad</Form.Label>
                <Form.Control
                  type="text"
                  value={form.name}
                  onChange={e =>
                    setForm(prev => ({ ...prev, name: e.target.value }))
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Telefon</Form.Label>
                <Form.Control
                  type="text"
                  value={form.phone}
                  onChange={e =>
                    setForm(prev => ({ ...prev, phone: e.target.value }))
                  }
                />
              </Form.Group>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Spinner size="sm" animation="border" />
                ) : (
                  'Bilgileri Güncelle'
                )}
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Şifre Güncelleme */}
        <Col md={6}>
          <Card className="p-4 bg-light border-0 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">🔐 Şifre Değiştir</h5>
              {!showPasswordSection && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPasswordSection(true)}
                >
                  Şifreyi Değiştir
                </Button>
              )}
            </div>

            {showPasswordSection && (
              <Form onSubmit={updatePassword}>
                <Form.Group className="mb-3">
                  <Form.Label>Yeni Şifre</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      value={form.newPassword}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(prev => !prev)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Yeni Şifre (Tekrar)</Form.Label>
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                </Form.Group>

                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    'Parolayı Güncelle'
                  )}
                </Button>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
