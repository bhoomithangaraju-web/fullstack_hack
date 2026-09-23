import React, { useState, useEffect } from 'react';
import { dashboardApi, appointmentsApi } from '../../services/api';
import { DoctorDashboardMetrics, AppointmentStatus } from '../../types';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Clock, CalendarCheck, CheckCircle2, Eye, Check, X, User } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const [data, setData] = useState<DoctorDashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchDoctorDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getDoctor();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load doctor dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDashboard();
  }, []);

  const handleStatusUpdate = async (id: number, status: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      await appointmentsApi.updateStatus(id, status);
      await fetchDoctorDashboard();
      if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment((prev: any) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingState message="Fetching doctor schedule..." />;
  if (error || !data) return <ErrorState message={error || 'No metrics available'} onRetry={fetchDoctorDashboard} />;

  const { doctor, counts, todayAppointments } = data;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Greeting Banner */}
      <Card colorVariant="lavender" className="p-8 border border-purple-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome, {doctor.fullName}</h1>
            <p className="text-xs text-purple-700 font-semibold">{doctor.specialization} • {doctor.qualification}</p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/80 shadow-clay-sm text-xs font-bold text-slate-700">
            {todayAppointments.length} Patient Visits Today
          </div>
        </div>
      </Card>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Today's Visits"
          value={counts.today}
          icon={<Clock className="w-6 h-6 text-purple-600" />}
          colorVariant="lavender"
        />
        <StatCard
          title="Upcoming Visits"
          value={counts.upcoming}
          icon={<CalendarCheck className="w-6 h-6 text-indigo-600" />}
          colorVariant="blue"
        />
        <StatCard
          title="Completed Visits"
          value={counts.completed}
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          colorVariant="mint"
        />
      </div>

      {/* Today's Schedule Timeline */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-800">Today's Patient Schedule</h3>

        {todayAppointments.length === 0 ? (
          <Card className="bg-white/95">
            <EmptyState title="No consultations today" description="You have no scheduled patient appointments for today." />
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {todayAppointments.map((app) => (
              <Card key={app.id} interactive className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/95">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="p-3 rounded-2xl bg-purple-100 text-purple-800 font-extrabold text-xs min-w-[85px] text-center shadow-clay-sm">
                    {app.appointmentTime}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-slate-800 text-sm">{app.patient?.fullName}</span>
                      <span className="text-xs text-slate-500">({app.patient?.gender}, DOB: {app.patient?.dateOfBirth})</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Reason: {app.reason}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Badge status={app.status} />

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedAppointment(app)}
                      className="p-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                      title="View Patient Record"
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
        )}
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          title={`Patient Consultation Details #${selectedAppointment.id}`}
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Status</span>
              <Badge status={selectedAppointment.status} />
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col gap-2">
              <span className="text-[11px] font-extrabold text-purple-700 uppercase">Patient Information</span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div><span className="font-bold">Name:</span> {selectedAppointment.patient?.fullName}</div>
                <div><span className="font-bold">Patient ID:</span> PAT-{selectedAppointment.patient?.id}</div>
                <div><span className="font-bold">Gender:</span> {selectedAppointment.patient?.gender}</div>
                <div><span className="font-bold">Blood Group:</span> {selectedAppointment.patient?.bloodGroup}</div>
                <div><span className="font-bold">Phone:</span> {selectedAppointment.patient?.phone}</div>
                <div><span className="font-bold">DOB:</span> {selectedAppointment.patient?.dateOfBirth}</div>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold block mb-1">Reason for Visit</span>
              <p className="p-3 rounded-2xl bg-slate-50 text-slate-700 font-medium leading-relaxed">
                {selectedAppointment.reason}
              </p>
            </div>

            {selectedAppointment.status === 'SCHEDULED' && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedAppointment.id, 'CANCELLED')}
                >
                  Cancel Visit
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handleStatusUpdate(selectedAppointment.id, 'COMPLETED')}
                >
                  Mark Completed
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
