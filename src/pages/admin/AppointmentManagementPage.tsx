import React, { useState, useEffect } from 'react';
import { appointmentsApi, doctorsApi, patientsApi } from '../../services/api';
import { Appointment, Doctor, Patient, AppointmentStatus } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Textarea } from '../../components/Textarea';
import { SearchBar } from '../../components/SearchBar';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Plus, Calendar, Clock, Eye, Edit2, Trash2, Check, X, Filter } from 'lucide-react';

export const AppointmentManagementPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [doctorIdFilter, setDoctorIdFilter] = useState<string>('');
  const [patientIdFilter, setPatientIdFilter] = useState<string>('');
  const [dateShortcut, setDateShortcut] = useState<string>('ALL');
  const [customDate, setCustomDate] = useState<string>('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '09:00 AM',
    reason: '',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchDropdownData = async () => {
    try {
      const [docsRes, patsRes] = await Promise.all([
        doctorsApi.getAll(undefined, 'ACTIVE'),
        patientsApi.getAll(undefined, 'ACTIVE'),
      ]);
      if (docsRes.success && docsRes.data) setDoctors(docsRes.data);
      if (patsRes.success && patsRes.data) setPatients(patsRes.data);
    } catch (e) {
      console.error('Failed loading doctors/patients dropdown');
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      let activeDate: string | undefined = undefined;

      const today = new Date();
      if (dateShortcut === 'TODAY') {
        activeDate = today.toISOString().split('T')[0];
      } else if (dateShortcut === 'TOMORROW') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        activeDate = tomorrow.toISOString().split('T')[0];
      } else if (dateShortcut === 'CUSTOM' && customDate) {
        activeDate = customDate;
      }

      const res = await appointmentsApi.getAll({
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        doctorId: doctorIdFilter ? parseInt(doctorIdFilter, 10) : undefined,
        patientId: patientIdFilter ? parseInt(patientIdFilter, 10) : undefined,
        date: activeDate,
      });

      if (res.success && res.data) {
        setAppointments(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [search, statusFilter, doctorIdFilter, patientIdFilter, dateShortcut, customDate]);

  const handleOpenCreateModal = () => {
    setFormData({
      patientId: patients.length > 0 ? String(patients[0].id) : '',
      doctorId: doctors.length > 0 ? String(doctors[0].id) : '',
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '09:00 AM',
      reason: '',
      notes: '',
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.patientId || !formData.doctorId) {
      setFormError('Please select both a patient and a doctor.');
      return;
    }
    setSubmitting(true);

    try {
      await appointmentsApi.create({
        patientId: parseInt(formData.patientId, 10),
        doctorId: parseInt(formData.doctorId, 10),
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        reason: formData.reason,
        notes: formData.notes,
      });
      setIsCreateModalOpen(false);
      await fetchAppointments();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: AppointmentStatus) => {
    try {
      await appointmentsApi.updateStatus(id, status);
      await fetchAppointments();
      if (viewingAppointment && viewingAppointment.id === id) {
        setViewingAppointment((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const handleDeleteOrCancel = async () => {
    if (!cancellingAppointment) return;
    setSubmitting(true);
    try {
      await appointmentsApi.updateStatus(cancellingAppointment.id, 'CANCELLED');
      setCancellingAppointment(null);
      await fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Appointment Management</h1>
          <p className="text-xs text-slate-500 font-medium">Schedule, search, filter and manage patient consultation visits.</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenCreateModal}>
          New Appointment
        </Button>
      </div>

      {/* Filter and Search Panel */}
      <Card className="p-4 bg-white/95 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by patient, doctor or ID..." className="max-w-md" />

          {/* Quick Date Shortcuts */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-400">Date:</span>
            {[
              { key: 'ALL', label: 'All Dates' },
              { key: 'TODAY', label: 'Today' },
              { key: 'TOMORROW', label: 'Tomorrow' },
              { key: 'CUSTOM', label: 'Custom' },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setDateShortcut(btn.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dateShortcut === btn.key
                    ? 'bg-purple-600 text-white shadow-clay-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-purple-50'
                }`}
              >
                {btn.label}
              </button>
            ))}
            {dateShortcut === 'CUSTOM' && (
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="py-1 px-2 text-xs"
              />
            )}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="clay-input py-1.5 px-3 text-xs font-semibold text-slate-700 w-full focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Doctor:</span>
            <select
              value={doctorIdFilter}
              onChange={(e) => setDoctorIdFilter(e.target.value)}
              className="clay-input py-1.5 px-3 text-xs font-semibold text-slate-700 w-full focus:outline-none"
            >
              <option value="">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Patient:</span>
            <select
              value={patientIdFilter}
              onChange={(e) => setPatientIdFilter(e.target.value)}
              className="clay-input py-1.5 px-3 text-xs font-semibold text-slate-700 w-full focus:outline-none"
            >
              <option value="">All Patients</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Appointments List Table */}
      <Card className="p-0 overflow-hidden bg-white/95">
        {loading ? (
          <LoadingState message="Loading clinic appointments..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchAppointments} />
        ) : appointments.length === 0 ? (
          <EmptyState
            title="No Appointments Found"
            description="No appointment records match the specified filters."
            actionText="Book Appointment"
            onAction={handleOpenCreateModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Patient</th>
                  <th className="py-4 px-6">Doctor</th>
                  <th className="py-4 px-6">Reason for Visit</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-400">
                      #{app.id}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{app.appointmentDate}</span>
                        <span className="text-[11px] text-purple-600 font-semibold">{app.appointmentTime}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold whitespace-nowrap">
                      {app.patient?.fullName || `Patient #${app.patientId}`}
                    </td>
                    <td className="py-4 px-6 font-semibold whitespace-nowrap text-purple-700">
                      {app.doctor?.fullName || `Doctor #${app.doctorId}`}
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate text-slate-500">
                      {app.reason}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingAppointment(app)}
                          className="p-1.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {app.status === 'SCHEDULED' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(app.id, 'COMPLETED')}
                              className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                              title="Mark Completed"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setCancellingAppointment(app)}
                              className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                              title="Cancel Appointment"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Appointment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New Appointment"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200">
              {formError}
            </div>
          )}

          <Select
            label="Select Patient *"
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            options={patients.map((p) => ({ value: p.id, label: `${p.fullName} (${p.phone})` }))}
          />

          <Select
            label="Select Doctor *"
            value={formData.doctorId}
            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
            options={doctors.map((d) => ({ value: d.id, label: `${d.fullName} — ${d.specialization}` }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Appointment Date *"
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              required
            />
            <Select
              label="Appointment Time *"
              value={formData.appointmentTime}
              onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
              options={[
                { value: '08:30 AM', label: '08:30 AM' },
                { value: '09:00 AM', label: '09:00 AM' },
                { value: '09:30 AM', label: '09:30 AM' },
                { value: '10:00 AM', label: '10:00 AM' },
                { value: '10:30 AM', label: '10:30 AM' },
                { value: '11:00 AM', label: '11:00 AM' },
                { value: '11:30 AM', label: '11:30 AM' },
                { value: '02:00 PM', label: '02:00 PM' },
                { value: '02:30 PM', label: '02:30 PM' },
                { value: '03:00 PM', label: '03:00 PM' },
                { value: '03:30 PM', label: '03:30 PM' },
                { value: '04:00 PM', label: '04:00 PM' },
              ]}
            />
          </div>

          <Textarea
            label="Reason for Visit *"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Describe patient symptoms or consultation reason..."
            required
          />

          <Textarea
            label="Additional Notes (Optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Initial reception or triage notes..."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Schedule Visit
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Appointment Details Modal */}
      {viewingAppointment && (
        <Modal
          isOpen={!!viewingAppointment}
          onClose={() => setViewingAppointment(null)}
          title={`Appointment #${viewingAppointment.id}`}
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Status</span>
              <Badge status={viewingAppointment.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-2xl bg-purple-50/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Patient</span>
                <span className="font-bold text-slate-800 block">{viewingAppointment.patient?.fullName}</span>
                <span className="text-slate-500 font-medium block">{viewingAppointment.patient?.phone}</span>
                <span className="text-slate-500 font-medium block">Blood: {viewingAppointment.patient?.bloodGroup}</span>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Doctor</span>
                <span className="font-bold text-indigo-700 block">{viewingAppointment.doctor?.fullName}</span>
                <span className="text-slate-500 font-medium block">{viewingAppointment.doctor?.specialization}</span>
                <span className="text-slate-500 font-medium block">{viewingAppointment.doctor?.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-bold block mb-1">Date</span>
                <span className="font-semibold text-slate-800">{viewingAppointment.appointmentDate}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1">Time</span>
                <span className="font-semibold text-purple-700">{viewingAppointment.appointmentTime}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold block mb-1">Reason for Visit</span>
              <p className="p-3 rounded-2xl bg-slate-50 text-slate-700 font-medium leading-relaxed">{viewingAppointment.reason}</p>
            </div>

            {viewingAppointment.notes && (
              <div>
                <span className="text-slate-400 font-bold block mb-1">Notes</span>
                <p className="p-3 rounded-2xl bg-amber-50/70 text-slate-700 font-medium leading-relaxed">{viewingAppointment.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancellingAppointment && (
        <ConfirmDialog
          isOpen={!!cancellingAppointment}
          onClose={() => setCancellingAppointment(null)}
          onConfirm={handleDeleteOrCancel}
          title="Cancel Appointment"
          message={`Are you sure you want to set Appointment #${cancellingAppointment.id} to CANCELLED? The record will remain saved in clinic history.`}
          isLoading={submitting}
        />
      )}
    </div>
  );
};
