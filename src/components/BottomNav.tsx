import React from 'react';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useActionBadges } from '../hooks/useActionBadges';
import {
  MapPin,
  Clock,
  User,
  Navigation,
  History,
  CreditCard,
  LayoutDashboard,
  Users,
  Route,
  Cpu,
  Settings,
  Landmark,
  Layers,
  MessageSquare,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole | null;
  hasActiveBooking?: boolean;
  onOpenChat?: () => void;
  customActionDots?: Record<string, boolean>;
}

const RedDot: React.FC = () => (
  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white animate-pulse shadow-md z-10 pointer-events-none" />
);

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  role,
  hasActiveBooking = false,
  onOpenChat,
  customActionDots,
}) => {
  const { currentUser } = useAuth();
  const liveActionDots = useActionBadges(currentUser, role);
  const actionDots = customActionDots || liveActionDots;

  if (!role) return null;

  if (role === 'customer') {
    const showHomeDot = actionDots.home || hasActiveBooking;
    const showHistoryDot = actionDots.history;
    const showSupportDot = actionDots.support;
    const showProfileDot = actionDots.profile;

    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-[#0D47A1] px-3 py-2 flex items-center justify-around max-w-md mx-auto shadow-[0_-4px_20px_rgba(13,71,161,0.18)]">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'home'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <MapPin className={`w-5 h-5 ${activeTab === 'home' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
            {showHomeDot && <RedDot />}
          </div>
          <span className="text-[11px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'history'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Clock className={`w-5 h-5 ${activeTab === 'history' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
            {showHistoryDot && <RedDot />}
          </div>
          <span className="text-[11px]">Activity</span>
        </button>

        <button
          onClick={() => {
            if (onOpenChat) {
              onOpenChat();
            } else {
              setActiveTab('support');
            }
          }}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'support'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
            {showSupportDot && <RedDot />}
          </div>
          <span className="text-[11px]">Help & Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'profile'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
            {showProfileDot && <RedDot />}
          </div>
          <span className="text-[11px]">Profile</span>
        </button>
      </div>
    );
  }

  if (role === 'driver') {
    const showDriveDot = actionDots.home;
    const showHistoryDot = actionDots.history;
    const showSupportDot = actionDots.support;
    const showProfileDot = actionDots.profile;

    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-[#0D47A1] px-3 py-2 flex items-center justify-around max-w-md mx-auto shadow-[0_-4px_20px_rgba(13,71,161,0.18)]">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'home'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Navigation className={`w-5 h-5 ${activeTab === 'home' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
            {showDriveDot && <RedDot />}
          </div>
          <span className="text-[11px]">Drive</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'history'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <History className={`w-5 h-5 ${activeTab === 'history' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
            {showHistoryDot && <RedDot />}
          </div>
          <span className="text-[11px]">History</span>
        </button>

        <button
          onClick={() => {
            if (onOpenChat) {
              onOpenChat();
            } else {
              setActiveTab('support');
            }
          }}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'support'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
            {showSupportDot && <RedDot />}
          </div>
          <span className="text-[11px]">Dispatch Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all ${
            activeTab === 'profile'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <CreditCard className={`w-5 h-5 ${activeTab === 'profile' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
            {showProfileDot && <RedDot />}
          </div>
          <span className="text-[11px]">Profile & RFID</span>
        </button>
      </div>
    );
  }

  if (role === 'admin') {
    const showDashboardDot = actionDots.dashboard;
    const showIncidentsDot = actionDots.incidents;
    const showZonesDot = actionDots.zones;
    const showStationsDot = actionDots.stations;
    const showUsersDot = actionDots.users || actionDots.drivers || actionDots.customers;
    const showRidesDot = actionDots.rides;
    const showEbikesDot = actionDots.ebikes;
    const showSettingsDot = actionDots.settings;

    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-[#0D47A1] px-1.5 sm:px-4 py-2 flex items-center justify-between max-w-5xl mx-auto shadow-[0_-4px_20px_rgba(13,71,161,0.18)]">
        <button
          onClick={() => setActiveTab('dashboard')}
          title="Overview & Live Map"
          className={`flex flex-col items-center gap-0.5 text-[9px] sm:text-xs py-1.5 px-1.5 sm:px-2 rounded-xl transition-all ${
            activeTab === 'dashboard' || activeTab === 'map'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' || activeTab === 'map' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
            {showDashboardDot && <RedDot />}
          </div>
          <span className="truncate">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('incidents')}
          title="Incidents & Support Tickets"
          className={`flex flex-col items-center gap-0.5 text-[9px] sm:text-xs py-1.5 px-1.5 sm:px-2 rounded-xl transition-all ${
            activeTab === 'incidents'
              ? 'text-white bg-rose-600 font-extrabold shadow-md border border-rose-600'
              : 'text-rose-700 hover:text-rose-900 font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <ShieldAlert className={`w-4 h-4 ${activeTab === 'incidents' ? 'text-white' : 'text-rose-600'}`} />
            {showIncidentsDot && <RedDot />}
          </div>
          <span className="truncate">Incidents</span>
        </button>

        <button
          onClick={() => setActiveTab('zones')}
          title="Create and configure geographic service zones"
          className={`flex flex-col items-center gap-0.5 text-[9px] sm:text-xs py-1.5 px-1.5 sm:px-2 rounded-xl transition-all ${
            activeTab === 'zones'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Layers className={`w-4 h-4 ${activeTab === 'zones' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
            {showZonesDot && <RedDot />}
          </div>
          <span className="truncate">Zones</span>
        </button>

        <button
          onClick={() => setActiveTab('stations')}
          title="Pin and manage designated shuttle stations & geofences"
          className={`flex flex-col items-center gap-0.5 text-[9px] sm:text-xs py-1.5 px-1.5 sm:px-2 rounded-xl transition-all ${
            activeTab === 'stations'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Landmark className={`w-4 h-4 ${activeTab === 'stations' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
            {showStationsDot && <RedDot />}
          </div>
          <span className="truncate">Stations</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          title="Manage user accounts, drivers, RFID cards & approvals"
          className={`flex flex-col items-center gap-0.5 text-[9px] sm:text-xs py-1.5 px-1.5 sm:px-2 rounded-xl transition-all ${
            activeTab === 'users' || activeTab === 'customers' || activeTab === 'drivers'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Users className={`w-4 h-4 ${activeTab === 'users' || activeTab === 'customers' || activeTab === 'drivers' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
            {showUsersDot && <RedDot />}
          </div>
          <span className="truncate">Accounts</span>
        </button>

        <button
          onClick={() => setActiveTab('rides')}
          title="Pick-up and drop-off trip management & history"
          className={`flex flex-col items-center gap-0.5 text-[9px] sm:text-xs py-1.5 px-1.5 sm:px-2 rounded-xl transition-all ${
            activeTab === 'rides'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Route className={`w-4 h-4 ${activeTab === 'rides' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
            {showRidesDot && <RedDot />}
          </div>
          <span className="truncate">Trips</span>
        </button>

        <button
          onClick={() => setActiveTab('ebikes')}
          title="E-Shuttle management & GPS telemetry"
          className={`flex flex-col items-center gap-0.5 text-[9px] sm:text-xs py-1.5 px-1.5 sm:px-2 rounded-xl transition-all ${
            activeTab === 'ebikes'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Cpu className={`w-4 h-4 ${activeTab === 'ebikes' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
            {showEbikesDot && <RedDot />}
          </div>
          <span className="truncate">Shuttles</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          title="Configure service dispatch parameters"
          className={`flex flex-col items-center gap-0.5 text-[9px] sm:text-xs py-1.5 px-1.5 sm:px-2 rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
            {showSettingsDot && <RedDot />}
          </div>
          <span className="truncate">Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          title="System activity audit trail and CRUD backtracking"
          className={`flex flex-col items-center gap-0.5 text-[9px] sm:text-xs py-1.5 px-1.5 sm:px-2 rounded-xl transition-all ${
            activeTab === 'logs' || activeTab === 'audit'
              ? 'text-white bg-[#0D47A1] font-extrabold shadow-md border border-[#0D47A1]'
              : 'text-[#0D47A1]/70 hover:text-[#0D47A1] font-bold'
          }`}
        >
          <div className="relative flex items-center justify-center">
            <ClipboardList className={`w-4 h-4 ${activeTab === 'logs' || activeTab === 'audit' ? 'text-white' : 'text-[#0D47A1]/70'}`} />
          </div>
          <span className="truncate">Logs</span>
        </button>
      </div>
    );
  }

  return null;
};
