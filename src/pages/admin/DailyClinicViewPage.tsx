import React, { useState, useEffect } from 'react';
import { appointmentsApi } from '../../services/api';
import { Appointment, AppointmentStatus } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Clock, Calendar, Check, X, Eye, ChevronLeft, ChevronRight, User, Stethoscope } from 'lucide-react';

export const DailyClinicViewPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchDailySchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await appointmentsApi.getAll({ date: selectedDate });
      if (res.success && res.data) {
        setAppointments(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch daily clinic schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailySchedule();
  }, [selectedDate]);

  const handleDateChange = (daysDelta: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + daysDelta);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleStatusUpdate = async (id: number, status: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      await appointmentsApi.updateStatus(id, status);
      await fetchDailySchedule();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header & Date Picker Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Daily Clinic View</h1>
          <p className="text-xs text-slate-500 font-medium">Primary operational screen for clinic receptionists & staff.</p>
        </div>

        {/* Date Switcher */}
        <Card className="p-2 bg-white/95 flex items-center gap-2">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-2 rounded-xl text-slate-600 hover:bg-purple-50 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-3">
            <Calendar className="w-4 h-4 text-purple-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => handleDateChange(1)}
            className="p-2 rounded-xl text-slate-600 hover:bg-purple-50 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-700 text-xs font-bold hover:bg-purple-200 transition-colors"
          >
            Today
          </button>
        </Card>
      </div>

      {/* Timeline Schedule */}
      {loading ? (
        <LoadingState message={`Fetching clinic schedule for ${selectedDate}...`} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDailySchedule} />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No Appointments Scheduled"
          description={`There are no appointments on ${selectedDate}.`}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            {appointments.length} Appointments Scheduled for {selectedDate}
          </div>

          <div className="flex flex-col gap-4">
            {appointments.map((app) => (
              <Card key={app.id} colorVariant="white" interactive className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                <div className="flex items-start sm:items-center gap-4">
                  {/* Time Badge */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-100 text-purple-800 min-w-[90px] shadow-clay-sm">
                    <Clock className="w-4 h-4 text-purple-600 mb-1" />
                    <span className="font-extrabold text-xs">{app.appointmentTime}</span>
                  </div>

                  {/* Patient & Doctor Info */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-800 text-sm">{app.patient?.fullName}</span>
                      <span className="text-xs text-slate-400">({app.patient?.phone})</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <Stethoscope className="w-3.5 h-3.5 text-purple-500" />
                      <span className="font-semibold text-purple-700">{app.doctor?.fullName}</span>
                      <span className="text-slate-400">• {app.doctor?.specialization}</span>
                    </div>

                    <p className="text-xs text-slate-500 font-medium mt-1">Reason: {app.reason}</p>
                  </div>
                </div>

                {/* Status & Quick Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Badge status={app.status} />

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingAppointment(app)}
                      className="p-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {app.status === 'SCHEDULED' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'COMPLETED')}
                          disabled={updatingId === app.id}
                          className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          title="Mark Completed"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(app.id, 'CANCELLED')}
                          disabled={updatingId === app.id}
                          className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Cancel Visit"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Appointment Detail Modal */}
      {viewingAppointment && (
        <Modal
          isOpen={!!viewingAppointment}
          onClose={() => setViewingAppointment(null)}
          title={`Appointment Details #${viewingAppointment.id}`}
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
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Doctor</span>
                <span className="font-bold text-indigo-700 block">{viewingAppointment.doctor?.fullName}</span>
                <span className="text-slate-500 font-medium block">{viewingAppointment.doctor?.specialization}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold block mb-1">Reason for Visit</span>
              <p className="p-3 rounded-2xl bg-slate-50 text-slate-700 font-medium leading-relaxed">
                {viewingAppointment.reason}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
