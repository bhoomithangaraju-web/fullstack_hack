import axios from 'axios';
import {
  ApiResponse,
  User,
  Doctor,
  Patient,
  Appointment,
  AdminDashboardMetrics,
  DoctorDashboardMetrics,
  PatientDashboardMetrics,
  AppointmentStatus,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token in Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clinic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to catch 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('clinic_token');
      localStorage.removeItem('clinic_user');
      // Redirect to login if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- AUTH API SERVICES ---
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  logout: async (): Promise<ApiResponse> => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  getMe: async (): Promise<ApiResponse<User>> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// --- DOCTORS API SERVICES ---
export const doctorsApi = {
  getAll: async (search?: string, status?: string): Promise<ApiResponse<Doctor[]>> => {
    const res = await api.get('/doctors', { params: { search, status } });
    return res.data;
  },
  getById: async (id: number): Promise<ApiResponse<Doctor>> => {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  },
  create: async (data: Partial<Doctor> & { password?: string }): Promise<ApiResponse<Doctor>> => {
    const res = await api.post('/doctors', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Doctor>): Promise<ApiResponse<Doctor>> => {
    const res = await api.put(`/doctors/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/doctors/${id}`);
    return res.data;
  },
};

// --- PATIENTS API SERVICES ---
export const patientsApi = {
  getAll: async (search?: string, status?: string): Promise<ApiResponse<Patient[]>> => {
    const res = await api.get('/patients', { params: { search, status } });
    return res.data;
  },
  getById: async (id: number): Promise<ApiResponse<Patient>> => {
    const res = await api.get(`/patients/${id}`);
    return res.data;
  },
  create: async (data: Partial<Patient> & { password?: string }): Promise<ApiResponse<Patient>> => {
    const res = await api.post('/patients', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Patient>): Promise<ApiResponse<Patient>> => {
    const res = await api.put(`/patients/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/patients/${id}`);
    return res.data;
  },
};

// --- APPOINTMENTS API SERVICES ---
export const appointmentsApi = {
  getAll: async (params?: {
    status?: string;
    doctorId?: number;
    patientId?: number;
    date?: string;
    search?: string;
  }): Promise<ApiResponse<Appointment[]>> => {
    const res = await api.get('/appointments', { params });
    return res.data;
  },
  getById: async (id: number): Promise<ApiResponse<Appointment>> => {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },
  create: async (data: {
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    reason: string;
    notes?: string;
    status?: AppointmentStatus;
  }): Promise<ApiResponse<Appointment>> => {
    const res = await api.post('/appointments', data);
    return res.data;
  },
  update: async (id: number, data: Partial<Appointment>): Promise<ApiResponse<Appointment>> => {
    const res = await api.put(`/appointments/${id}`, data);
    return res.data;
  },
  updateStatus: async (
    id: number,
    status: AppointmentStatus,
    notes?: string
  ): Promise<ApiResponse<Appointment>> => {
    const res = await api.patch(`/appointments/${id}/status`, { status, notes });
    return res.data;
  },
  delete: async (id: number): Promise<ApiResponse> => {
    const res = await api.delete(`/appointments/${id}`);
    return res.data;
  },
};

// --- DASHBOARD API SERVICES ---
export const dashboardApi = {
  getAdmin: async (): Promise<ApiResponse<AdminDashboardMetrics>> => {
    const res = await api.get('/dashboard/admin');
    return res.data;
  },
  getDoctor: async (): Promise<ApiResponse<DoctorDashboardMetrics>> => {
    const res = await api.get('/dashboard/doctor');
    return res.data;
  },
  getPatient: async (): Promise<ApiResponse<PatientDashboardMetrics>> => {
    const res = await api.get('/dashboard/patient');
    return res.data;
  },
};
