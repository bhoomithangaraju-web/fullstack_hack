import React, { useState, useEffect } from 'react';
import { doctorsApi } from '../../services/api';
import { Doctor, AccountStatus } from '../../types';
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
import { Plus, Search, Stethoscope, Edit2, Trash2, Eye, Mail, Phone, Award } from 'lucide-react';

export const DoctorManagementPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const [viewingDoctor, setViewingDoctor] = useState<Doctor | null>(null);
  const [deactivatingDoctor, setDeactivatingDoctor] = useState<Doctor | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialization: '',
    qualification: '',
    licenseNumber: '',
    experience: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    password: '',
    status: 'ACTIVE' as AccountStatus,
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorsApi.getAll(search, statusFilter);
      if (res.success && res.data) {
        setDoctors(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [search, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      specialization: '',
      qualification: '',
      licenseNumber: '',
      experience: '5 Years',
      gender: 'Male',
      dateOfBirth: '1985-01-01',
      address: '',
      password: 'Doctor@123',
      status: 'ACTIVE',
    });
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setFormData({
      fullName: doc.fullName,
      email: doc.email,
      phone: doc.phone,
      specialization: doc.specialization,
      qualification: doc.qualification,
      licenseNumber: doc.licenseNumber,
      experience: doc.experience,
      gender: doc.gender,
      dateOfBirth: doc.dateOfBirth,
      address: doc.address,
      password: '',
      status: doc.status,
    });
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (editingDoctor) {
        await doctorsApi.update(editingDoctor.id, {
          fullName: formData.fullName,
          phone: formData.phone,
          specialization: formData.specialization,
          qualification: formData.qualification,
          licenseNumber: formData.licenseNumber,
          experience: formData.experience,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          status: formData.status,
        });
      } else {
        await doctorsApi.create(formData);
      }
      setIsAddEditModalOpen(false);
      await fetchDoctors();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Error saving doctor details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingDoctor) return;
    setSubmitting(true);
    try {
      await doctorsApi.delete(deactivatingDoctor.id);
      setDeactivatingDoctor(null);
      await fetchDoctors();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate doctor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Doctor Management</h1>
          <p className="text-xs text-slate-500 font-medium">Add, manage, edit and search clinic medical specialists.</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAddModal}>
          Add New Doctor
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white/95 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search doctor by name, specialization, license..." />
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

      {/* Doctor Cards / Table */}
      {loading ? (
        <LoadingState message="Fetching clinic doctors..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDoctors} />
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No Doctors Found"
          description="No doctors match your search or filter parameters."
          actionText="Add Doctor"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <Card key={doc.id} colorVariant="lavender" interactive className="flex flex-col justify-between p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-clay-sm">
                      {doc.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-slate-800 text-sm leading-tight">{doc.fullName}</h3>
                      <span className="text-xs font-bold text-purple-600">{doc.specialization}</span>
                    </div>
                  </div>
                  <Badge status={doc.status} size="sm" />
                </div>

                <div className="flex flex-col gap-1.5 pt-3 border-t border-purple-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-purple-500" />
                    <span className="font-semibold">{doc.qualification} • {doc.experience}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.phone}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-purple-100">
                <button
                  onClick={() => setViewingDoctor(doc)}
                  className="p-2 rounded-xl bg-white text-slate-600 hover:text-purple-600 shadow-clay-sm text-xs font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button
                  onClick={() => handleOpenEditModal(doc)}
                  className="p-2 rounded-xl bg-white text-slate-600 hover:text-indigo-600 shadow-clay-sm text-xs font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                {doc.status === 'ACTIVE' && (
                  <button
                    onClick={() => setDeactivatingDoctor(doc)}
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

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingDoctor ? `Edit Doctor: ${editingDoctor.fullName}` : 'Add New Doctor'}
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
              label="Doctor Name *"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Dr. Sarah Johnson"
              required
            />
            <Input
              label="Email Address *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sarah.johnson@clinic.com"
              disabled={!!editingDoctor}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number *"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              required
            />
            <Input
              label="Specialization *"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. General Medicine"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Qualification *"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="e.g. MD, Internal Medicine"
              required
            />
            <Input
              label="License Number *"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              placeholder="LIC-90812"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Experience *"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="e.g. 10 Years"
              required
            />
            <Select
              label="Gender *"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              options={[
                { value: 'Female', label: 'Female' },
                { value: 'Male', label: 'Male' },
                { value: 'Other', label: 'Other' },
              ]}
            />
            <Input
              label="Date of Birth *"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />
          </div>

          {!editingDoctor && (
            <Input
              label="Default Login Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Doctor@123"
            />
          )}

          <Textarea
            label="Clinic Address *"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Full clinic address..."
            required
          />

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
              Save Doctor
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Doctor Details Modal */}
      {viewingDoctor && (
        <Modal
          isOpen={!!viewingDoctor}
          onClose={() => setViewingDoctor(null)}
          title={`Doctor Profile: ${viewingDoctor.fullName}`}
          maxWidth="md"
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Doctor ID</span>
              <span className="font-extrabold text-slate-800">DOC-{viewingDoctor.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">Specialization</span>
                <span className="font-bold text-purple-700">{viewingDoctor.specialization}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">Qualification</span>
                <span className="font-semibold text-slate-800">{viewingDoctor.qualification}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">License Number</span>
                <span className="font-semibold text-slate-800">{viewingDoctor.licenseNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">Experience</span>
                <span className="font-semibold text-slate-800">{viewingDoctor.experience}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">Email</span>
                <span className="font-semibold text-slate-800">{viewingDoctor.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-0.5">Phone</span>
                <span className="font-semibold text-slate-800">{viewingDoctor.phone}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold block mb-0.5">Address</span>
              <p className="p-3 rounded-2xl bg-slate-50 text-slate-700 font-medium">{viewingDoctor.address}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Deactivation Dialog */}
      {deactivatingDoctor && (
        <ConfirmDialog
          isOpen={!!deactivatingDoctor}
          onClose={() => setDeactivatingDoctor(null)}
          onConfirm={handleDeactivate}
          title="Deactivate Doctor"
          message={`Are you sure you want to set ${deactivatingDoctor.fullName} to INACTIVE? They will not be selectable for new appointments.`}
          isLoading={submitting}
        />
      )}
    </div>
  );
};
