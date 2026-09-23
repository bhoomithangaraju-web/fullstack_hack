import React, { useState, useEffect } from 'react';
import { dashboardApi, appointmentsApi } from '../../services/api';
import { AdminDashboardMetrics, AppointmentStatus } from '../../types';
import { StatCard } from '../../components/StatCard';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import {
  Stethoscope,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  X,
} from 'lucide-react';
import { Modal } from '../../components/Modal';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getAdmin();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStatusUpdate = async (id: number, status: AppointmentStatus) => {
    setUpdatingId(id);
    try {
      await appointmentsApi.updateStatus(id, status);
      await fetchDashboard();
      if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment((prev: any) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingState message="Loading clinic overview..." />;
  if (error || !data) return <ErrorState message={error || 'No dashboard metrics available'} onRetry={fetchDashboard} />;

  const { metrics, todayAppointments } = data;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Welcome Banner */}
      <Card colorVariant="lavender" className="p-8 border border-purple-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Good Morning, Admin</h1>
            <p className="text-xs text-slate-500 font-medium">Here is today's real-time clinic overview and operational summary.</p>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-white/80 shadow-clay-sm text-xs font-bold text-purple-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Today: {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </Card>

      {/* Summary Clay Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Doctors"
          value={metrics.totalDoctors}
          icon={<Stethoscope className="w-6 h-6 text-purple-600" />}
          colorVariant="lavender"
          subtitle="Active Medical Staff"
        />
        <StatCard
          title="Total Patients"
          value={metrics.totalPatients}
          icon={<Users className="w-6 h-6 text-indigo-600" />}
          colorVariant="blue"
          subtitle="Registered Patients"
        />
        <StatCard
          title="Today's Visits"
          value={metrics.todayVisits}
          icon={<Calendar className="w-6 h-6 text-amber-600" />}
          colorVariant="peach"
          subtitle="Appointments Today"
        />
        <StatCard
          title="Scheduled"
          value={metrics.scheduledCount}
          icon={<Clock className="w-6 h-6 text-blue-600" />}
          colorVariant="blue"
          subtitle="Upcoming & Active"
        />
        <StatCard
          title="Completed"
          value={metrics.completedCount}
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          colorVariant="mint"
          subtitle="Finished Consultations"
        />
        <StatCard
          title="Cancelled"
          value={metrics.cancelledCount}
          icon={<XCircle className="w-6 h-6 text-rose-600" />}
          colorVariant="rose"
          subtitle="Cancelled Sessions"
        />
      </div>

      {/* Today's Appointments Table Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-800">Today's Appointments</h3>
            <span className="text-xs text-slate-500 font-medium">Real-time daily schedule</span>
          </div>
        </div>

        <Card className="p-0 overflow-hidden bg-white/95">
          {todayAppointments.length === 0 ? (
            <EmptyState title="No appointments scheduled for today" description="There are no visits booked for today." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Time</th>
                    <th className="py-4 px-6">Patient</th>
                    <th className="py-4 px-6">Doctor</th>
                    <th className="py-4 px-6">Reason</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {todayAppointments.map((app) => (
                    <tr key={app.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800 whitespace-nowrap">
                        {app.appointmentTime}
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
                            onClick={() => setSelectedAppointment(app)}
                            className="p-1.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {app.status === 'SCHEDULED' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(app.id, 'COMPLETED')}
                                disabled={updatingId === app.id}
                                className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                title="Mark Completed"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(app.id, 'CANCELLED')}
                                disabled={updatingId === app.id}
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
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          title={`Appointment Details #${selectedAppointment.id}`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500">Status</span>
              <Badge status={selectedAppointment.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1 p-3 rounded-2xl bg-purple-50/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Patient</span>
                <span className="font-bold text-slate-800">{selectedAppointment.patient?.fullName}</span>
                <span className="text-[11px] text-slate-500">{selectedAppointment.patient?.phone}</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-2xl bg-indigo-50/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Doctor</span>
                <span className="font-bold text-indigo-700">{selectedAppointment.doctor?.fullName}</span>
                <span className="text-[11px] text-slate-500">{selectedAppointment.doctor?.specialization}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-1">Date</span>
                <span className="font-semibold text-slate-800">{selectedAppointment.appointmentDate}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1">Time</span>
                <span className="font-semibold text-slate-800">{selectedAppointment.appointmentTime}</span>
              </div>
            </div>

            <div className="text-xs">
              <span className="text-slate-400 font-bold block mb-1">Reason for Visit</span>
              <p className="p-3 rounded-2xl bg-slate-50 text-slate-700 font-medium leading-relaxed">
                {selectedAppointment.reason}
              </p>
            </div>

            {selectedAppointment.notes && (
              <div className="text-xs">
                <span className="text-slate-400 font-bold block mb-1">Clinical Notes</span>
                <p className="p-3 rounded-2xl bg-amber-50/70 text-slate-700 font-medium leading-relaxed">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
