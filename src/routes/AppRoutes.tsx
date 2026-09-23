import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { DoctorManagementPage } from '../pages/admin/DoctorManagementPage';
import { PatientManagementPage } from '../pages/admin/PatientManagementPage';
import { AppointmentManagementPage } from '../pages/admin/AppointmentManagementPage';
import { DailyClinicViewPage } from '../pages/admin/DailyClinicViewPage';

import { DoctorDashboard } from '../pages/doctor/DoctorDashboard';
import { DoctorAppointmentsPage } from '../pages/doctor/DoctorAppointmentsPage';
import { DoctorProfilePage } from '../pages/doctor/DoctorProfilePage';

import { PatientDashboard } from '../pages/patient/PatientDashboard';
import { PatientAppointmentsPage } from '../pages/patient/PatientAppointmentsPage';
import { PatientProfilePage } from '../pages/patient/PatientProfilePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* ADMIN Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="doctors" element={<DoctorManagementPage />} />
        <Route path="patients" element={<PatientManagementPage />} />
        <Route path="appointments" element={<AppointmentManagementPage />} />
        <Route path="daily-schedule" element={<DailyClinicViewPage />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* DOCTOR Protected Routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['DOCTOR']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointmentsPage />} />
        <Route path="profile" element={<DoctorProfilePage />} />
        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
      </Route>

      {/* PATIENT Protected Routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="appointments" element={<PatientAppointmentsPage />} />
        <Route path="profile" element={<PatientProfilePage />} />
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
      </Route>

      {/* Fallback / Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
