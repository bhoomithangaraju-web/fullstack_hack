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
import { SearchBar } from '../../components/SearchBar';
import { Check, X, Eye, User, Calendar, Clock, FileText } from 'lucide-react';

export const DoctorAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchDoctorAppointments = async () => {
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
      setError(err.message || 'Failed to fetch assigned appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, [statusFilter, search]);

  const handleStatusUpdate = async (id: number, status: AppointmentStatus, notes?: string) => {
    setUpdatingId(id);
    try {
      await appointmentsApi.updateStatus(id, status, notes);
      await fetchDoctorAppointments();
      if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Assigned Appointments</h1>
        <p className="text-xs text-slate-500 font-medium">View and manage consultation requests assigned specifically to you.</p>
      </div>

      {/* Filter and Search */}
      <Card className="p-4 bg-white/95 flex flex-col sm:flex-row items-center justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by patient name, reason..." />
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

      {/* List / Grid */}
      {loading ? (
        <LoadingState message="Loading assigned appointments..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDoctorAppointments} />
      ) : appointments.length === 0 ? (
        <EmptyState title="No appointments found" description="No assigned appointments match your criteria." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((app) => (
            <Card key={app.id} colorVariant="white" interactive className="flex flex-col justify-between p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shadow-clay-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-slate-800 text-sm">{app.patient?.fullName}</h3>
                      <span className="text-xs text-slate-500">PAT-{app.patientId} • {app.patient?.gender}</span>
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

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedAppointment(app)}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" /> View Details
                </button>

                {app.status === 'SCHEDULED' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleStatusUpdate(app.id, 'CANCELLED')}
                      disabled={updatingId === app.id}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleStatusUpdate(app.id, 'COMPLETED')}
                      disabled={updatingId === app.id}
                    >
                      Mark Completed
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <Modal
          isOpen={!!selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          title={`Consultation Details #${selectedAppointment.id}`}
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-slate-400 font-bold">Status</span>
              <Badge status={selectedAppointment.status} />
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 grid grid-cols-2 gap-2 text-slate-700">
              <div><span className="font-bold">Patient Name:</span> {selectedAppointment.patient?.fullName}</div>
              <div><span className="font-bold">Patient ID:</span> PAT-{selectedAppointment.patient?.id}</div>
              <div><span className="font-bold">DOB:</span> {selectedAppointment.patient?.dateOfBirth}</div>
              <div><span className="font-bold">Gender:</span> {selectedAppointment.patient?.gender}</div>
              <div><span className="font-bold">Phone:</span> {selectedAppointment.patient?.phone}</div>
              <div><span className="font-bold">Blood Group:</span> {selectedAppointment.patient?.bloodGroup}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-bold block mb-1">Appointment Date</span>
                <span className="font-semibold text-slate-800">{selectedAppointment.appointmentDate}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1">Appointment Time</span>
                <span className="font-semibold text-purple-700">{selectedAppointment.appointmentTime}</span>
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
