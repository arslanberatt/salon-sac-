import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export default function EmployeeEditModal({
  show,
  onHide,
  form,
  setForm,
  onSave,
  updating,
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Çalışanı Güncelle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Rol</Form.Label>
            <Form.Select
              value={form.role}
              onChange={e =>
                setForm(prev => ({ ...prev, role: e.target.value }))
              }
            >
              <option value="calisan">Çalışan</option>
              <option value="patron">Patron</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Maaş</Form.Label>
            <Form.Control
              type="number"
              value={form.salary}
              onChange={e =>
                setForm(prev => ({ ...prev, salary: e.target.value }))
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Prim Oranı</Form.Label>
            <Form.Control
              type="number"
              value={form.commissionRate}
              onChange={e =>
                setForm(prev => ({ ...prev, commissionRate: e.target.value }))
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Şifre Onayı</Form.Label>
            <Form.Control
              type="password"
              value={form.password}
              onChange={e =>
                setForm(prev => ({ ...prev, password: e.target.value }))
              }
              placeholder="Şifrenizi girin"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          İptal
        </Button>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={updating || !form.password}
        >
          {updating ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
