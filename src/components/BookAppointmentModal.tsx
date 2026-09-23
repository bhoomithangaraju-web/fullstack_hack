import React, { useState, useEffect } from 'react';
import { doctorsApi, appointmentsApi } from '../services/api';
import { Doctor } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';
import { Calendar, Clock, Stethoscope, User, HeartPulse, CheckCircle2 } from 'lucide-react';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState<boolean>(true);

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState<string>('09:00 AM');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSuccessMsg(false);
      setError(null);
      const fetchActiveDoctors = async () => {
        setLoadingDoctors(true);
        try {
          const res = await doctorsApi.getAll(undefined, 'ACTIVE');
          if (res.success && res.data) {
            setDoctors(res.data);
            if (res.data.length > 0) {
              setSelectedDoctorId(String(res.data[0].id));
            }
          }
        } catch (e) {
          setError('Failed to fetch list of active doctors');
        } finally {
          setLoadingDoctors(false);
        }
      };
      fetchActiveDoctors();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDoctorId) {
      setError('Please select a doctor.');
      return;
    }
    if (!appointmentDate) {
      setError('Please pick an appointment date.');
      return;
    }
    if (!reason || reason.trim().length < 3) {
      setError('Please state your reason for the visit.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await appointmentsApi.create({
        patientId: 0, // Backend auto-overrides to req.user.profileId for PATIENT role
        doctorId: parseInt(selectedDoctorId, 10),
        appointmentDate,
        appointmentTime,
        reason,
        notes: notes || undefined,
      });

      if (res.success) {
        setSuccessMsg(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to book appointment slot');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDoctor = doctors.find((d) => String(d.id) === selectedDoctorId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book Appointment Slot" maxWidth="md">
      {successMsg ? (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-800">Slot Booked Successfully!</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Your visit with {selectedDoctor?.fullName} on {appointmentDate} at {appointmentTime} has been confirmed.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200">
              {error}
            </div>
          )}

          {/* Select Doctor */}
          <div className="flex flex-col gap-2">
            <Select
              label="Choose Specialist Doctor *"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              options={doctors.map((d) => ({
                value: d.id,
                label: `${d.fullName} (${d.specialization})`,
              }))}
              disabled={loadingDoctors}
            />

            {selectedDoctor && (
              <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center gap-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">{selectedDoctor.fullName}</span>
                  <span className="text-purple-700 font-semibold">{selectedDoctor.qualification} • {selectedDoctor.experience}</span>
                </div>
              </div>
            )}
          </div>

          {/* Pick Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Appointment Date *"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
            />

            <Select
              label="Available Time Slot *"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
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

          {/* Reason for Visit */}
          <Textarea
            label="Reason for Visit *"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe symptoms, routine checkup, or consultation requirement..."
            required
          />

          {/* Additional Notes */}
          <Textarea
            label="Additional Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any allergies, previous medical history, or special requests..."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Confirm & Book Slot
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
