export type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT';
export type AccountStatus = 'ACTIVE' | 'INACTIVE';
export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: number;
  email: string;
  role: Role;
  profileId?: number;
  profile?: Doctor | Patient | null;
}

export interface Doctor {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  licenseNumber: string;
  experience: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  profileImage?: string | null;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  appointments?: Appointment[];
}

export interface Patient {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  profileImage?: string | null;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  appointments?: Appointment[];
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  notes?: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface AdminDashboardMetrics {
  metrics: {
    totalDoctors: number;
    totalPatients: number;
    todayVisits: number;
    scheduledCount: number;
    completedCount: number;
    cancelledCount: number;
  };
  todayAppointments: Appointment[];
}

export interface DoctorDashboardMetrics {
  doctor: Doctor;
  counts: {
    today: number;
    upcoming: number;
    completed: number;
  };
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  completedAppointments: Appointment[];
}

export interface PatientDashboardMetrics {
  patient: Patient;
  nextAppointment?: Appointment | null;
  counts: {
    upcoming: number;
    completed: number;
  };
  history: Appointment[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
