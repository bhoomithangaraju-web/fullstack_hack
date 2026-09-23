import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doctorsApi } from '../../services/api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { Stethoscope, Award, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export const DoctorProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const doctor = user?.profile && 'specialization' in user.profile ? user.profile : null;

  const [phone, setPhone] = useState(doctor?.phone || '');
  const [address, setAddress] = useState(doctor?.address || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!doctor) {
    return <Card className="p-8">Doctor profile not found.</Card>;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSubmitting(true);

    try {
      await doctorsApi.update(doctor.id, { phone, address });
      await refetchUser();
      setSuccessMsg('Profile contact information updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-3xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Doctor Profile</h1>
        <p className="text-xs text-slate-500 font-medium">Manage your clinical profile and contact details.</p>
      </div>

      <Card colorVariant="lavender" className="p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-clay-card">
          {doctor.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <h2 className="text-xl font-extrabold text-slate-800">{doctor.fullName}</h2>
          <span className="text-sm font-bold text-purple-600">{doctor.specialization}</span>
          <span className="text-xs text-slate-500">{doctor.qualification} • License: {doctor.licenseNumber}</span>
        </div>
      </Card>

      <Card className="p-6 bg-white/95">
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Contact Information</h3>

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Email Address" value={doctor.email} disabled icon={<Mail className="w-4 h-4" />} />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4" />}
              required
            />
          </div>

          <Textarea
            label="Clinic Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" isLoading={submitting}>
              Update Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
