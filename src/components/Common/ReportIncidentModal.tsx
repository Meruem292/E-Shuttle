import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Send,
  MapPin,
  Bike,
  ShieldAlert,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  createIncidentTicket,
  IncidentCategory,
  TicketPriority,
  INCIDENT_CATEGORIES,
} from '../../services/ticketService';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRideId?: string;
  defaultVehicleInfo?: string;
  onSuccessCreated?: (channelId: string) => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  defaultRideId,
  defaultVehicleInfo,
  onSuccessCreated,
}) => {
  const { currentUser, userProfile, driverProfile, role } = useAuth();

  const currentUserId = currentUser?.uid || (role === 'admin' ? 'admin' : '');
  const currentUserName =
    role === 'admin'
      ? 'Dispatch Admin'
      : role === 'driver'
      ? driverProfile?.fullName || 'Driver'
      : userProfile?.fullName || 'Passenger';
  const currentUserRole: 'customer' | 'driver' | 'admin' =
    role === 'admin' ? 'admin' : role === 'driver' ? 'driver' : 'customer';

  const [category, setCategory] = useState<IncidentCategory>('other');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [vehicleInfo, setVehicleInfo] = useState<string>(defaultVehicleInfo || '');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successTicketNum, setSuccessTicketNum] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim() || submitting) return;

    setSubmitting(true);
    try {
      const ticket = await createIncidentTicket({
        reporterId: currentUserId,
        reporterName: currentUserName,
        reporterRole: currentUserRole,
        category,
        priority,
        subject,
        description,
        locationAddress: locationAddress || undefined,
        vehicleInfo: vehicleInfo || undefined,
        rideId: defaultRideId || undefined,
      });

      setSuccessTicketNum(ticket.ticketNumber);
      setTimeout(() => {
        setSubmitting(false);
        setSuccessTicketNum(null);
        setSubject('');
        setDescription('');
        onClose();
        if (onSuccessCreated) {
          onSuccessCreated(ticket.channelId);
        }
      }, 1500);
    } catch (err) {
      console.error('Failed to create incident report:', err);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div className="bg-white border-2 border-[#0D47A1] rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#0D47A1] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center text-white shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black">Report Incident / Support Ticket</h2>
              <p className="text-[10px] text-blue-100 font-bold">
                Direct 2-Way Escalation to E-Shuttle Dispatch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {successTicketNum ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-[#0D47A1]">
              Ticket #{successTicketNum} Submitted!
            </h3>
            <p className="text-xs text-slate-600 font-bold">
              Our Dispatch Admin Team has received your report. Opening 2-way live chat...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-xs">
            {/* Category Grid */}
            <div>
              <label className="block text-[11px] font-black text-[#0D47A1] uppercase mb-1.5">
                Incident Category *
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(INCIDENT_CATEGORIES) as IncidentCategory[]).map((catKey) => {
                  const info = INCIDENT_CATEGORIES[catKey];
                  const isSelected = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`p-2 rounded-xl text-left border-2 transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'border-[#0D47A1] bg-[#E3F2FD] font-black text-[#0D47A1] shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base shrink-0">{info.icon}</span>
                      <span className="text-[11px] truncate">{info.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-[11px] font-black text-[#0D47A1] uppercase mb-1.5">
                Urgency Priority *
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
                  { id: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-800' },
                  { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
                  { id: 'emergency', label: '🚨 Emergency', color: 'bg-rose-600 text-white font-black' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as TicketPriority)}
                    className={`flex-1 py-1.5 px-2 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${
                      priority === p.id
                        ? 'border-[#0D47A1] shadow-sm ring-2 ring-[#0D47A1]/20 ' + p.color
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-[11px] font-black text-[#0D47A1] uppercase mb-1">
                Summary / Subject *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Left bag on e-shuttle / Driver reckless speed"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#F8FAFC] border-2 border-[#0D47A1] rounded-xl px-3 py-2 font-bold text-[#0D47A1] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-[11px] font-black text-[#0D47A1] uppercase mb-1">
                Detailed Description *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe what happened, time of incident, and any details to assist dispatch..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#F8FAFC] border-2 border-[#0D47A1] rounded-xl p-3 font-semibold text-[#0D47A1] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Optional Location & Shuttle details */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0D47A1]" /> Location / Station
                </label>
                <input
                  type="text"
                  placeholder="e.g. City College Station"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-[#0D47A1] font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                  <Bike className="w-3 h-3 text-[#0D47A1]" /> E-Shuttle Unit #
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shuttle Unit 03"
                  value={vehicleInfo}
                  onChange={(e) => setVehicleInfo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-[#0D47A1] font-bold"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 border-t border-slate-200">
              <button
                type="submit"
                disabled={!subject.trim() || !description.trim() || submitting}
                className="w-full py-3 bg-[#0D47A1] hover:bg-[#1565C0] text-white rounded-2xl font-black text-xs shadow-lg uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 transition-transform active:scale-95"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Ticket & Open 2-Way Chat</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
