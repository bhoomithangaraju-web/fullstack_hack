import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';
import { PatientDashboardMetrics } from '../../types';
import { Card } from '../../components/Card';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { BookAppointmentModal } from '../../components/BookAppointmentModal';
import { Calendar, Clock, CheckCircle2, Stethoscope, User, Heart, Plus } from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const [data, setData] = useState<PatientDashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);

  const fetchPatientDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getPatient();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load patient dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading your health portal..." />;
  if (error || !data) return <ErrorState message={error || 'No metrics available'} onRetry={fetchPatientDashboard} />;

  const { patient, nextAppointment, counts, history } = data;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Welcome Greeting Banner with Book Slot Button */}
      <Card colorVariant="blue" className="p-8 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome, {patient.fullName}</h1>
            <p className="text-xs text-indigo-700 font-medium">Patient ID: PAT-{patient.id} • Blood Group: {patient.bloodGroup}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsBookModalOpen(true)}
            >
              Book Appointment Slot
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard
          title="Upcoming Appointments"
          value={counts.upcoming}
          icon={<Calendar className="w-6 h-6 text-indigo-600" />}
          colorVariant="blue"
        />
        <StatCard
          title="Completed Visits"
          value={counts.completed}
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          colorVariant="mint"
        />
      </div>

      {/* Next Appointment Feature Card */}
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold text-slate-800">Next Upcoming Appointment</h3>

        {nextAppointment ? (
          <Card colorVariant="lavender" interactive onClick={() => setSelectedAppointment(nextAppointment)} className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-clay-sm">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-extrabold text-slate-800 text-base">{nextAppointment.doctor?.fullName}</h4>
                  <span className="text-xs font-bold text-purple-700">{nextAppointment.doctor?.specialization}</span>
                  <p className="text-xs text-slate-500 font-medium mt-1">Reason: {nextAppointment.reason}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <Badge status={nextAppointment.status} />
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700 bg-white/80 px-3 py-1.5 rounded-xl shadow-clay-sm">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>{nextAppointment.appointmentDate} at {nextAppointment.appointmentTime}</span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-white/95">
            <EmptyState
              title="No upcoming appointments"
              description="You have no scheduled doctor visits at this time."
              actionText="Book Slot Now"
              onAction={() => setIsBookModalOpen(true)}
            />
          </Card>
        )}
      </div>

      {/* Appointment History */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-800">Appointment History</h3>

        <Card className="p-0 overflow-hidden bg-white/95">
          {history.length === 0 ? (
            <EmptyState title="No history found" description="You have no past consultation records." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Date & Time</th>
                    <th className="py-4 px-6">Doctor</th>
                    <th className="py-4 px-6">Reason for Visit</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {history.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => setSelectedAppointment(app)}
                      className="hover:bg-purple-50/30 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6 whitespace-nowrap font-bold text-slate-800">
                        {app.appointmentDate} ({app.appointmentTime})
                      </td>
                      <td className="py-4 px-6 font-semibold text-purple-700 whitespace-nowrap">
                        {app.doctor?.fullName}
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate text-slate-500">
                        {app.reason}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <Badge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={fetchPatientDashboard}
      />

      {/* Detail Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          title={`Visit Details #${selectedAppointment.id}`}
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Status</span>
              <Badge status={selectedAppointment.status} />
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
              <span className="text-[11px] font-bold text-purple-700 uppercase block mb-1">Attending Doctor</span>
              <span className="font-bold text-slate-800 text-sm block">{selectedAppointment.doctor?.fullName}</span>
              <span className="text-purple-600 font-semibold block">{selectedAppointment.doctor?.specialization}</span>
              <span className="text-slate-500 block mt-1">{selectedAppointment.doctor?.qualification}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-bold block mb-1">Date</span>
                <span className="font-semibold text-slate-800">{selectedAppointment.appointmentDate}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1">Time</span>
                <span className="font-semibold text-purple-700">{selectedAppointment.appointmentTime}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold block mb-1">Reason for Visit</span>
              <p className="p-3 rounded-2xl bg-slate-50 text-slate-700 font-medium leading-relaxed">
                {selectedAppointment.reason}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
