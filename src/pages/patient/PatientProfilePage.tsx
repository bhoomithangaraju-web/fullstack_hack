import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { patientsApi } from '../../services/api';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { User, Mail, Phone, Heart, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const PatientProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const patient = user?.profile && 'bloodGroup' in user.profile ? user.profile : null;

  const [phone, setPhone] = useState(patient?.phone || '');
  const [address, setAddress] = useState(patient?.address || '');
  const [emergencyName, setEmergencyName] = useState(patient?.emergencyContactName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(patient?.emergencyContactPhone || '');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!patient) {
    return <Card className="p-8">Patient profile not found.</Card>;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSubmitting(true);

    try {
      await patientsApi.update(patient.id, {
        phone,
        address,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
      });
      await refetchUser();
      setSuccessMsg('Your personal details have been updated.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-3xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Patient Health Profile</h1>
        <p className="text-xs text-slate-500 font-medium">Manage your personal information and emergency contact details.</p>
      </div>

      <Card colorVariant="blue" className="p-8 flex flex-col sm:flex-row items-center gap-6 border border-indigo-100">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-2xl font-bold shadow-clay-card">
          {patient.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <h2 className="text-xl font-extrabold text-slate-800">{patient.fullName}</h2>
          <span className="text-xs font-bold text-indigo-600">Patient ID: PAT-{patient.id}</span>
          <span className="text-xs text-slate-500">Gender: {patient.gender} • DOB: {patient.dateOfBirth} • Blood: <strong className="text-rose-600">{patient.bloodGroup}</strong></span>
        </div>
      </Card>

      <Card className="p-6 bg-white/95">
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Personal & Emergency Details</h3>

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
            <Input label="Email Address" value={patient.email} disabled icon={<Mail className="w-4 h-4" />} />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4" />}
              required
            />
          </div>

          <Textarea
            label="Home Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
            <Input
              label="Emergency Contact Name"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              required
            />
            <Input
              label="Emergency Contact Phone"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" isLoading={submitting}>
              Update Information
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
