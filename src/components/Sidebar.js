import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaCalendarCheck,
  FaCashRegister,
  FaUserFriends,
  FaUsersCog,
  FaUserCircle,
  FaSignOutAlt,
  FaServicestack,
} from 'react-icons/fa';
import { useAppointmentController } from '../controllers/AppointmentController';

export default function Sidebar() {
  const location = useLocation();
  const { waitingAppointments } = useAppointmentController();

  const navItemClass = path =>
    `d-flex align-items-center gap-3 px-4 py-3 rounded-3 transition ${
      location.pathname === path
        ? 'text-dark bg-light border-start border-3 border-primary fw-semibold'
        : 'text-white text-opacity-75 hover-bg'
    }`;

  return (
    <div
      className="d-flex flex-column justify-content-between p-4"
      style={{
        width: '300px',
        height: '100vh',
        backgroundColor: '#1e1e2f',
      }}
    >
      <div>
        <h6 className="text-uppercase text-white-50 fw-bold my-2">Menü</h6>
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/" className={navItemClass('/')}>
            <FaHome /> Anasayfa
          </Nav.Link>

          <Nav.Link as={Link} to="/takvim" className={navItemClass('/takvim')}>
            <FaCalendarCheck /> Takvim
            {waitingAppointments.length > 0 && (
              <span className="ms-auto badge bg-primary text-white">
                {waitingAppointments.length}
              </span>
            )}
          </Nav.Link>

          <Nav.Link as={Link} to="/kasa" className={navItemClass('/kasa')}>
            <FaCashRegister /> Kasa
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/hizmetler"
            className={navItemClass('/hizmetler')}
          >
            <FaServicestack /> Hizmetler
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/musteriler"
            className={navItemClass('/musteriler')}
          >
            <FaUserFriends /> Müşteriler
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/calisanlar"
            className={navItemClass('/calisanlar')}
          >
            <FaUsersCog /> Çalışanlar
          </Nav.Link>
        </Nav>

        {/* Profil */}
        <h6 className="text-uppercase text-white-50 fw-bold mt-4 mb-2">
          Profil
        </h6>
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/profil" className={navItemClass('/profil')}>
            <FaUserCircle /> Profil Ayarları
          </Nav.Link>
        </Nav>
      </div>

      {/* Çıkış */}
      <Nav className="flex-column mt-4">
        <Nav.Link
          as={Link}
          to="/logout"
          className="d-flex align-items-center gap-3 text-danger py-2"
        >
          <FaSignOutAlt /> Çıkış Yap
        </Nav.Link>
      </Nav>
    </div>
  );
}
