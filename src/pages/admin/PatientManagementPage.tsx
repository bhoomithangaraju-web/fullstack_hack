import React, { useState, useEffect } from 'react';
import { patientsApi } from '../../services/api';
import { Patient, AccountStatus } from '../../types';
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
import { Plus, UserCheck, Edit2, Trash2, Eye, Mail, Phone, Calendar, Heart, ShieldAlert } from 'lucide-react';

export const PatientManagementPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [deactivatingPatient, setDeactivatingPatient] = useState<Patient | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    password: 'Patient@123',
    status: 'ACTIVE' as AccountStatus,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await patientsApi.getAll(search, statusFilter);
      if (res.success && res.data) {
        setPatients(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      bloodGroup: 'O+',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      password: 'Patient@123',
      status: 'ACTIVE',
    });
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (pat: Patient) => {
    setEditingPatient(pat);
    setFormData({
      fullName: pat.fullName,
      email: pat.email,
      phone: pat.phone,
      dateOfBirth: pat.dateOfBirth,
      gender: pat.gender,
      bloodGroup: pat.bloodGroup,
      address: pat.address,
      emergencyContactName: pat.emergencyContactName,
      emergencyContactPhone: pat.emergencyContactPhone,
      password: '',
      status: pat.status,
    });
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  const handleFetchDetailedPatient = async (id: number) => {
    try {
      const res = await patientsApi.getById(id);
      if (res.success && res.data) {
        setViewingPatient(res.data);
      }
    } catch (err) {
      alert('Could not fetch patient details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (editingPatient) {
        await patientsApi.update(editingPatient.id, {
          fullName: formData.fullName,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          address: formData.address,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          status: formData.status,
        });
      } else {
        await patientsApi.create(formData);
      }
      setIsAddEditModalOpen(false);
      await fetchPatients();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Error saving patient details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingPatient) return;
    setSubmitting(true);
    try {
      await patientsApi.delete(deactivatingPatient.id);
      setDeactivatingPatient(null);
      await fetchPatients();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate patient');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Patient Management</h1>
          <p className="text-xs text-slate-500 font-medium">Register, edit, view history and manage registered clinic patients.</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAddModal}>
          Register New Patient
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white/95 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search patient by name, email, phone..." />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="clay-input py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Patients Cards */}
      {loading ? (
        <LoadingState message="Fetching registered patients..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPatients} />
      ) : patients.length === 0 ? (
        <EmptyState
          title="No Patients Found"
          description="No patients match your search or filter parameters."
          actionText="Register Patient"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((pat) => (
            <Card key={pat.id} colorVariant="blue" interactive className="flex flex-col justify-between p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-base shadow-clay-sm">
                      {pat.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-slate-800 text-sm leading-tight">{pat.fullName}</h3>
                      <span className="text-xs font-bold text-indigo-600">Blood Group: {pat.bloodGroup}</span>
                    </div>
                  </div>
                  <Badge status={pat.status} size="sm" />
                </div>

                <div className="flex flex-col gap-1.5 pt-3 border-t border-indigo-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{pat.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pat.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span className="truncate">Emergency: {pat.emergencyContactName} ({pat.emergencyContactPhone})</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-indigo-100">
                <button
                  onClick={() => handleFetchDetailedPatient(pat.id)}
                  className="p-2 rounded-xl bg-white text-slate-600 hover:text-indigo-600 shadow-clay-sm text-xs font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Details & History
                </button>
                <button
                  onClick={() => handleOpenEditModal(pat)}
                  className="p-2 rounded-xl bg-white text-slate-600 hover:text-purple-600 shadow-clay-sm text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                {pat.status === 'ACTIVE' && (
                  <button
                    onClick={() => setDeactivatingPatient(pat)}
                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Deactivate
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Patient Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingPatient ? `Edit Patient: ${editingPatient.fullName}` : 'Register New Patient'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. John Doe"
              required
            />
            <Input
              label="Email Address *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@gmail.com"
              disabled={!!editingPatient}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Phone Number *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 111-2222"
              required
            />
            <Input
              label="Date of Birth *"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />
            <Select
              label="Gender *"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Blood Group *"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              options={[
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
              ]}
            />
            {!editingPatient && (
              <Input
                label="Default Login Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Patient@123"
              />
            )}
          </div>

          <Textarea
            label="Home Address *"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Full home address..."
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
            <Input
              label="Emergency Contact Name *"
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
              placeholder="Relative / Friend Name"
              required
            />
            <Input
              label="Emergency Contact Phone *"
              value={formData.emergencyContactPhone}
              onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
              placeholder="+1 (555) 999-0000"
              required
            />
          </div>

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as AccountStatus })}
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={() => setIsAddEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Save Patient
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Patient Details & Appointment History Modal */}
      {viewingPatient && (
        <Modal
          isOpen={!!viewingPatient}
          onClose={() => setViewingPatient(null)}
          title={`Patient File: ${viewingPatient.fullName}`}
          maxWidth="lg"
        >
          <div className="flex flex-col gap-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Patient ID</span>
              <span className="font-extrabold text-slate-800">PAT-{viewingPatient.id}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-slate-400 font-bold block mb-0.5">Blood Group</span>
                <span className="font-extrabold text-rose-600">{viewingPatient.bloodGroup}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-slate-400 font-bold block mb-0.5">Gender</span>
                <span className="font-bold text-slate-800">{viewingPatient.gender}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-slate-400 font-bold block mb-0.5">Date of Birth</span>
                <span className="font-bold text-slate-800">{viewingPatient.dateOfBirth}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50">
                <span className="text-slate-400 font-bold block mb-0.5">Phone</span>
                <span className="font-bold text-slate-800">{viewingPatient.phone}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
              <span className="text-amber-800 font-bold block mb-1">Emergency Contact</span>
              <p className="text-slate-700 font-medium">{viewingPatient.emergencyContactName} • {viewingPatient.emergencyContactPhone}</p>
            </div>

            {/* Appointment History List */}
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-slate-800 text-sm">Appointment History</h4>
              {!viewingPatient.appointments || viewingPatient.appointments.length === 0 ? (
                <p className="text-slate-400 italic">No previous appointment records.</p>
              ) : (
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  {viewingPatient.appointments.map((app) => (
                    <div key={app.id} className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800">{app.appointmentDate} at {app.appointmentTime}</span>
                        <span className="text-purple-700 font-semibold">{app.doctor?.fullName || `Doctor #${app.doctorId}`}</span>
                        <span className="text-slate-500 font-medium">{app.reason}</span>
                      </div>
                      <Badge status={app.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Deactivation Dialog */}
      {deactivatingPatient && (
        <ConfirmDialog
          isOpen={!!deactivatingPatient}
          onClose={() => setDeactivatingPatient(null)}
          onConfirm={handleDeactivate}
          title="Deactivate Patient"
          message={`Are you sure you want to set ${deactivatingPatient.fullName} to INACTIVE?`}
          isLoading={submitting}
        />
      )}
    </div>
  );
};
