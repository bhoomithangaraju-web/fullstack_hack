import React, { useState, useEffect } from 'react';
import { appointmentsApi } from '../../services/api';
import { Appointment } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { BookAppointmentModal } from '../../components/BookAppointmentModal';
import { SearchBar } from '../../components/SearchBar';
import { Calendar, Clock, Stethoscope, Eye, Plus } from 'lucide-react';

export const PatientAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);

  const fetchPatientAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await appointmentsApi.getAll({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: search || undefined,
      });
      if (res.success && res.data) {
        setAppointments(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch appointment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientAppointments();
  }, [statusFilter, search]);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header & Book Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Appointments</h1>
          <p className="text-xs text-slate-500 font-medium">View your upcoming scheduled consultations and past medical visits.</p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsBookModalOpen(true)}>
          Book New Slot
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 bg-white/95 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by doctor or reason..." />
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="clay-input py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Visits</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Grid List */}
      {loading ? (
        <LoadingState message="Loading your appointments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchPatientAppointments} />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments found"
          description="You have no records matching the selected status."
          actionText="Book Appointment"
          onAction={() => setIsBookModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((app) => (
            <Card key={app.id} colorVariant="white" interactive className="flex flex-col justify-between p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shadow-clay-sm">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-slate-800 text-sm">{app.doctor?.fullName}</h3>
                      <span className="text-xs text-purple-600 font-bold">{app.doctor?.specialization}</span>
                    </div>
                  </div>
                  <Badge status={app.status} size="sm" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-slate-50">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-bold">{app.appointmentDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-700">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-bold">{app.appointmentTime}</span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-slate-400 font-bold block mb-0.5">Reason for Visit</span>
                  <p className="text-slate-700 font-medium line-clamp-2">{app.reason}</p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedAppointment(app)}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> View Full Details
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={fetchPatientAppointments}
      />

      {/* Details Modal */}
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
              <span className="text-slate-500 block mt-1">{selectedAppointment.doctor?.phone}</span>
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
              <p className="p-3 rounded-2xl bg-slate-50 text-slate-700 font-medium leading-relaxed">{selectedAppointment.reason}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
