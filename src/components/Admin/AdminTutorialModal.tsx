import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Layers,
  MapPin,
  Cpu,
  UserCheck,
  Route,
  AlertTriangle,
  Sliders,
  Database,
  ArrowRight,
  Search,
  Key,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  Check,
  Copy,
  Info,
  Play,
  RotateCcw,
  Compass,
  FileSpreadsheet,
  Activity,
} from 'lucide-react';
import { useBackHandler } from '../../contexts/NativeBackContext';

interface AdminTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tabName: string) => void;
  initialStepIndex?: number;
}

interface TutorialStep {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  targetTab?: string;
  targetTabLabel?: string;
  objectives: string[];
  explanation: string;
  actionGuide: { stepNumber: number; title: string; description: string }[];
  proTips: string[];
  backtrackingRelevance?: string;
}

export const AdminTutorialModal: React.FC<AdminTutorialModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  initialStepIndex = 0,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialStepIndex);
  const [activeMode, setActiveMode] = useState<'walkthrough' | 'backtracking' | 'cheatsheet'>('walkthrough');
  const [cheatQuery, setCheatQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Simulation state for Backtracking interactive demo
  const [simulatedFare, setSimulatedFare] = useState<number>(15);
  const [simulatedHistory, setSimulatedHistory] = useState<
    { id: string; timestamp: string; action: string; before: any; after: any; summary: string }[]
  >([
    {
      id: 'log-demo-01',
      timestamp: '2026-09-03 08:30:12',
      action: 'UPDATE',
      summary: 'Updated base fare parameter from ₱12 to ₱15',
      before: { baseFare: 12, perKmRate: 2.5 },
      after: { baseFare: 15, perKmRate: 2.5 },
    },
    {
      id: 'log-demo-02',
      timestamp: '2026-09-03 09:14:45',
      action: 'STATUS_CHANGE',
      summary: 'Changed Driver "Juan Dela Cruz" account status to APPROVED',
      before: { accountStatus: 'PENDING', zoneId: null },
      after: { accountStatus: 'APPROVED', zoneId: 'zone-downtown' },
    },
  ]);

  useBackHandler(
    isOpen,
    () => {
      onClose();
      return true;
    },
    30,
    'admin-tutorial-modal'
  );

  useEffect(() => {
    if (initialStepIndex >= 0) {
      setCurrentStep(initialStepIndex);
    }
  }, [initialStepIndex, isOpen]);

  if (!isOpen) return null;

  const steps: TutorialStep[] = [
    {
      id: 'step-overview',
      category: 'Foundation',
      title: 'Administrator Console & Live Telemetry',
      subtitle: 'Real-time overview of the Tagbilaran E-Shuttle operational fleet',
      badge: 'Step 1 of 8',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <Compass className="w-5 h-5 text-[#0D47A1]" />,
      targetTab: 'dashboard',
      targetTabLabel: 'Open Dashboard & Live Map',
      objectives: [
        'Understand executive KPI cards (Active Users, Stations, Zones, Shuttles, Trips, Open Incidents).',
        'Monitor real-time GPS locations of all active electric shuttles on the map.',
        'View live passenger boarding requests and dispatch status.',
      ],
      explanation:
        'As an administrator, the Executive Dashboard serves as your central command center. You can see real-time movement, battery levels, driver shifts, and incoming ride requests across the entire City of Tagbilaran coverage area.',
      actionGuide: [
        {
          stepNumber: 1,
          title: 'Observe Active Shuttles',
          description: 'The interactive map displays custom markers for e-shuttles with live speed, direction, and passenger count.',
        },
        {
          stepNumber: 2,
          title: 'Review System KPIs',
          description: 'Click any KPI card (Users, Drivers, Stations, Zones) at the top of the dashboard to immediately filter and manage those resources.',
        },
        {
          stepNumber: 3,
          title: 'Check Urgent Alerts',
          description: 'Look for red incident counters or pending driver approvals requiring immediate administrative clearance.',
        },
      ],
      proTips: [
        'The dashboard auto-updates in real time via Firestore subscriptions without needing manual page reloads.',
        'Use the top-right "Audit Logs" button at any time to verify recent team actions.',
      ],
      backtrackingRelevance:
        'All admin sessions and logins are logged under AUTH events with timestamps and role designations.',
    },
    {
      id: 'step-zones',
      category: 'Geofencing',
      title: 'Operational Coverage Zones',
      subtitle: 'Define municipal service boundaries and geofenced operating areas',
      badge: 'Step 2 of 8',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
      targetTab: 'zones',
      targetTabLabel: 'Manage Service Zones',
      objectives: [
        'Draw and adjust geofenced polygon boundaries on the map.',
        'Assign zone names, color codings, and operational statuses (Active/Inactive).',
        'Ensure drivers are assigned to designated zones for balanced city coverage.',
      ],
      explanation:
        'Service zones prevent shuttle congestion and ensure adequate transit coverage across Tagbilaran (Downtown, Port Area, Bool, Dampas, Taloto). Shuttles and bookings are bounded to their respective operational zones.',
      actionGuide: [
        {
          stepNumber: 1,
          title: 'Click "+ Add Zone"',
          description: 'Provide a descriptive name (e.g., "Tagbilaran Port & Downtown Corridor") and pick an accent color.',
        },
        {
          stepNumber: 2,
          title: 'Plot Boundary Coordinates',
          description: 'Click on the map to define polygon boundary points, or enter latitude/longitude vertices.',
        },
        {
          stepNumber: 3,
          title: 'Toggle Active Status',
          description: 'Zones can be toggled inactive during street closures, fiestas, or road maintenance.',
        },
      ],
      proTips: [
        'Keep zone borders aligned with major arterial roads to avoid confusing passenger pickup boundaries.',
        'If a zone is deleted accidentally, its coordinates can be retrieved from the Activity Logs.',
      ],
      backtrackingRelevance:
        'Creating, modifying coordinates, renaming, or deleting zones writes a ZONE CRUD log with coordinate snapshots before and after the edit.',
    },
    {
      id: 'step-stations',
      category: 'Transit Stops',
      title: 'Shuttle Stations & Boarding Stops',
      subtitle: 'Establish designated passenger pickup and drop-off hubs',
      badge: 'Step 3 of 8',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <MapPin className="w-5 h-5 text-emerald-600" />,
      targetTab: 'stations',
      targetTabLabel: 'Manage Stations',
      objectives: [
        'Add designated shuttle stops with landmark names, addresses, and passenger queue capacities.',
        'Move station pin coordinates interactively on the map.',
        'Link stations to corresponding operational zones.',
      ],
      explanation:
        'Passengers select predefined stations or popular municipal landmarks (Plaza Rizal, Cogon Market, Tagbilaran Port, Island City Mall) for predictable boarding and drop-offs.',
      actionGuide: [
        {
          stepNumber: 1,
          title: 'Create New Station',
          description: 'Click "+ Add Station", input the landmark name (e.g. "Tagbilaran City Hall Terminal") and set queue capacity.',
        },
        {
          stepNumber: 2,
          title: 'Position Station Pin',
          description: 'Click on the map to set the exact latitude and longitude where the shuttle will pull over.',
        },
        {
          stepNumber: 3,
          title: 'Save & Deploy',
          description: 'The station immediately becomes visible to both customers booking rides and drivers on patrol.',
        },
      ],
      proTips: [
        'Stations can be temporarily deactivated if construction or road closures occur.',
        'You can filter stations by operational zone to quickly review coverage balance.',
      ],
      backtrackingRelevance:
        'Station name changes, coordinate adjustments, and capacity edits record before-and-after coordinate values in the Activity Log.',
    },
    {
      id: 'step-hardware',
      category: 'IoT Fleet',
      title: 'E-Shuttle Fleet & RFID Card Pairing',
      subtitle: 'Register physical electric shuttles and pair driver contactless RFID cards',
      badge: 'Step 4 of 8',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: <Cpu className="w-5 h-5 text-purple-600" />,
      targetTab: 'ebikes',
      targetTabLabel: 'Manage E-Bikes & Hardware',
      objectives: [
        'Register electric shuttles with plate numbers, hardware IDs, and battery ratings.',
        'Pair physical RFID cards to authorized drivers for tap-in/tap-out shift authentication.',
        'Monitor battery health, maintenance status, and vehicle telemetry.',
      ],
      explanation:
        'The Tagbilaran E-Shuttle network features physical contactless RFID cards for driver shift validation, vehicle ignition unlock, and passenger tap-to-ride payment.',
      actionGuide: [
        {
          stepNumber: 1,
          title: 'Register Vehicle',
          description: 'Add the e-shuttle unit ID, vehicle plate, and current battery charge percentage.',
        },
        {
          stepNumber: 2,
          title: 'Pair Driver RFID Card',
          description: 'Use the Admin Registration Mode to tap or manually enter a driver’s physical RFID UID to link it to their driver profile.',
        },
        {
          stepNumber: 3,
          title: 'Flag Maintenance',
          description: 'If a shuttle needs servicing, update its status to "Maintenance" to prevent dispatches.',
        },
      ],
      proTips: [
        'If a driver loses their physical RFID card, unpair the old card from their profile and pair a replacement card instantly.',
      ],
      backtrackingRelevance:
        'Every RFID card pairing, unpairing, and hardware status change is recorded with driver UID, vehicle ID, and card serial numbers.',
    },
    {
      id: 'step-drivers',
      category: 'Personnel',
      title: 'Driver Vetting & Account Verification',
      subtitle: 'Approve driver applications, inspect documents, and assign operational zones',
      badge: 'Step 5 of 8',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      icon: <UserCheck className="w-5 h-5 text-cyan-600" />,
      targetTab: 'drivers',
      targetTabLabel: 'Manage Drivers',
      objectives: [
        'Review pending driver applicants, driver’s licenses, and government clearance documents.',
        'Approve, reject, or suspend driver accounts.',
        'Assign drivers to specific operational zones for localized route fulfillment.',
      ],
      explanation:
        'Drivers cannot accept passenger trips or tap into shuttles until an administrator reviews their credentials and marks their account as "APPROVED".',
      actionGuide: [
        {
          stepNumber: 1,
          title: 'Filter by Pending Status',
          description: 'Open the Drivers tab and select "Pending Approval" to view all new applicants awaiting review.',
        },
        {
          stepNumber: 2,
          title: 'Inspect Driver Profile',
          description: 'Click "View Details" to examine license numbers, vehicle registration, emergency contacts, and photo ID.',
        },
        {
          stepNumber: 3,
          title: 'Assign Zone & Approve',
          description: 'Select their primary operational zone from the dropdown and click "Approve Driver".',
        },
      ],
      proTips: [
        'If a driver violates city traffic policies or fails safety standards, click "Suspend Driver" to immediately revoke app access.',
      ],
      backtrackingRelevance:
        'Approval status changes (PENDING → APPROVED / SUSPENDED) and zone reassignments are permanently logged with the approving admin’s identity.',
    },
    {
      id: 'step-incidents',
      category: 'Safety',
      title: 'Emergency Incidents & Support Tickets',
      subtitle: 'Triage passenger feedback, emergency SOS alerts, and driver reports',
      badge: 'Step 6 of 8',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
      targetTab: 'incidents',
      targetTabLabel: 'View Incidents & Support',
      objectives: [
        'Monitor incoming safety incident reports and emergency SOS triggers.',
        'Assign ticket priorities (Low, Medium, High, Emergency).',
        'Coordinate emergency response and mark tickets resolved with administrative notes.',
      ],
      explanation:
        'Passenger and driver safety is paramount. Any incident reported during transit alerts the admin console in real time with GPS location, trip ID, and contact numbers.',
      actionGuide: [
        {
          stepNumber: 1,
          title: 'Prioritize Emergency Tickets',
          description: 'Emergency tickets appear with red pulsing badges and audio alerts for urgent action.',
        },
        {
          stepNumber: 2,
          title: 'Dispatch Assistance',
          description: 'Review the reported GPS location and contact the driver or local emergency services if necessary.',
        },
        {
          stepNumber: 3,
          title: 'Resolve Ticket',
          description: 'Document the resolution in the administrative notes and change the ticket status to "Resolved".',
        },
      ],
      proTips: [
        'Filter tickets by "Open" or "In Progress" to ensure no passenger complaint is left unanswered.',
      ],
      backtrackingRelevance:
        'Ticket creation, priority escalations, and status transitions are recorded with full diagnostic details.',
    },
    {
      id: 'step-audit',
      category: 'Audit & Compliance',
      title: 'Activity Logs & CRUD State Backtracking',
      subtitle: 'The cornerstone of administrative transparency, auditability, and error recovery',
      badge: 'Step 7 of 8',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <Database className="w-5 h-5 text-amber-600" />,
      targetTab: 'logs',
      targetTabLabel: 'Open Activity Logs & Backtracking',
      objectives: [
        'Understand how every Create, Update, Delete, and Status Change is recorded.',
        'Use multi-dimension filters (Entity, Action, Severity, Timeframe) and instant search.',
        'Inspect "Before vs. After" state diffs to backtrack accidental edits or deletions.',
        'Export audit trails to CSV or JSON for compliance and reporting.',
      ],
      explanation:
        'The Activity Logs system acts as the immutable flight recorder of the entire transit platform. If a station was moved, a driver was suspended, a zone boundary was altered, or fare rates were changed, you can pinpoint exactly WHO did it, WHEN it happened, and WHAT the previous state was.',
      actionGuide: [
        {
          stepNumber: 1,
          title: 'Filter by Entity or Action',
          description: 'Use the dropdowns to isolate specific events—for example, select "STATION" and "UPDATE" to see all station edits.',
        },
        {
          stepNumber: 2,
          title: 'Click "Inspect" on Any Log',
          description: 'Open the Backtracking Inspector modal to see the side-by-side Before (Previous State) and After (Applied State) JSON diff.',
        },
        {
          stepNumber: 3,
          title: 'Backtrack & Reconcile',
          description: 'Copy values from the "BEFORE CHANGE" block to easily restore previous settings or investigate unauthorized changes.',
        },
        {
          stepNumber: 4,
          title: 'Export Audit Records',
          description: 'Click "Export CSV" to download an official spreadsheet report for city management or audits.',
        },
      ],
      proTips: [
        'Search works on any field: enter an entity name (e.g. "Cogon"), an ID, an admin name, or a keyword.',
        'The "Diff Captured" badge highlights records containing state change comparisons.',
      ],
      backtrackingRelevance:
        'This is the heart of the backtracking engine. You can trace changes back across any timeframe (Today, 24 Hours, 7 Days, or All Time).',
    },
    {
      id: 'step-settings',
      category: 'Policy',
      title: 'Fare Policies & System Configuration',
      subtitle: 'Configure municipal fare algorithms, service radii, and branding',
      badge: 'Step 8 of 8',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: <Sliders className="w-5 h-5 text-slate-700" />,
      targetTab: 'settings',
      targetTabLabel: 'Open System Settings',
      objectives: [
        'Set base fare (₱), per-kilometer rate, and student/senior discount policies.',
        'Configure the maximum dispatch service radius (km).',
        'Update municipal program branding, logo assets, and admin security credentials.',
      ],
      explanation:
        'All automated trip fare calculations are determined by the parameters defined in System Settings. Adjustments apply dynamically across all passenger apps and driver meters.',
      actionGuide: [
        {
          stepNumber: 1,
          title: 'Set Fare Parameters',
          description: 'Input the official base fare (e.g. ₱15.00) and the per-kilometer increment (e.g. ₱2.50/km).',
        },
        {
          stepNumber: 2,
          title: 'Set Operating Radius',
          description: 'Define the maximum distance (e.g. 15 km) from city center within which rides can be dispatched.',
        },
        {
          stepNumber: 3,
          title: 'Save & Commit',
          description: 'Click "Save Changes". The update is automatically logged in the audit trail with the before and after fare values.',
        },
      ],
      proTips: [
        'Always review the Activity Log after modifying fare rates to verify that your changes took effect correctly.',
      ],
      backtrackingRelevance:
        'Fare updates generate a SETTINGS_UPDATE audit log capturing previous vs. new base fares and kilometer rates.',
    },
  ];

  const currentStepData = steps[currentStep];

  // Quick Action Cheat Sheet Data
  const cheatItems = [
    {
      title: 'How do I approve a new driver?',
      category: 'Drivers',
      steps: [
        'Go to the Drivers tab (or click Users & Drivers KPI).',
        'Click the "Pending" status filter.',
        'Click "View Details" on the driver applicant card.',
        'Verify their license number and documents.',
        'Select their operational zone and click "Approve Driver".',
      ],
      logRecord: 'Generates a STATUS_CHANGE log with severity "success".',
      targetTab: 'drivers',
    },
    {
      title: 'How do I recover an accidentally deleted or moved station?',
      category: 'Stations & Backtracking',
      steps: [
        'Open the Activity Logs tab (click "Audit Logs" at the top right).',
        'Filter Entity to "STATION" and Action to "UPDATE" or "DELETE".',
        'Find the log corresponding to the station and click "Inspect".',
        'Look at the "BEFORE CHANGE" JSON box to copy the exact previous latitude, longitude, and capacity.',
        'Return to the Stations tab and re-create or adjust the station to its prior coordinates.',
      ],
      logRecord: 'All prior coordinate diffs are captured under details.before.',
      targetTab: 'logs',
    },
    {
      title: 'How do I pair an RFID card to a driver?',
      category: 'Hardware & RFID',
      steps: [
        'Navigate to the "E-Bikes & Hardware" tab.',
        'Select the driver from the assignment list.',
        'Click "Pair RFID Card".',
        'Tap the physical card on the USB/NFC reader or type the UID manually.',
        'Click "Confirm & Link Card".',
      ],
      logRecord: 'Generates an RFID_PAIR log with driver and card UID.',
      targetTab: 'ebikes',
    },
    {
      title: 'How do I export system logs for a monthly audit?',
      category: 'Compliance & Export',
      steps: [
        'Go to the Activity Logs tab.',
        'Select your desired timeframe (e.g. "7D" or leave as "All Time").',
        'Optional: Filter to specific entities like "RIDE", "SETTINGS", or "DRIVER".',
        'Click the "Export CSV" button at the top right of the logs toolbar.',
        'Open the downloaded .CSV spreadsheet in Microsoft Excel or Google Sheets.',
      ],
      logRecord: 'Includes ISO timestamps, actor names, entity types, and diff summaries.',
      targetTab: 'logs',
    },
    {
      title: 'How do I handle an emergency SOS trigger?',
      category: 'Safety & Incidents',
      steps: [
        'Immediately click the pulsating red Incidents notification on the dashboard.',
        'Identify the vehicle plate number and passenger GPS location on the map.',
        'Call the driver or passenger via the emergency contact link.',
        'Alert local traffic authorities (Tagbilaran PNP or City Traffic Management) if needed.',
        'Update ticket status to "In Progress", then "Resolved" with police/medical report notes.',
      ],
      logRecord: 'Emergency incidents are logged with "danger" severity and instant dispatch timestamps.',
      targetTab: 'incidents',
    },
    {
      title: 'How do I change fare rates and verify the change?',
      category: 'Fares & Settings',
      steps: [
        'Go to System Settings (gear icon).',
        'Edit the "Base Fare" and "Per Kilometer Rate".',
        'Click "Save Settings".',
        'Switch to "Audit Logs" to inspect the SETTINGS_UPDATE log and verify previous vs new fare rates.',
      ],
      logRecord: 'SETTINGS_UPDATE log captures old and new fare parameter matrices.',
      targetTab: 'settings',
    },
  ];

  const filteredCheats = cheatItems.filter(
    (c) =>
      c.title.toLowerCase().includes(cheatQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(cheatQuery.toLowerCase()) ||
      c.steps.some((s) => s.toLowerCase().includes(cheatQuery.toLowerCase()))
  );

  const handleSimulateFareChange = () => {
    const nextFare = simulatedFare + 2;
    const newLog = {
      id: `log-demo-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action: 'SETTINGS_UPDATE',
      summary: `Admin modified Base Fare parameter from ₱${simulatedFare} to ₱${nextFare}`,
      before: { baseFare: simulatedFare, perKmRate: 2.5 },
      after: { baseFare: nextFare, perKmRate: 2.5 },
    };
    setSimulatedFare(nextFare);
    setSimulatedHistory([newLog, ...simulatedHistory]);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#0D47A1] rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0D47A1] via-[#1565C0] to-[#0D47A1] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">Admin System Tutorial & Guide</h2>
                <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                  Official Manual
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">
                Master fleet operations, station dispatch, geofencing, and CRUD audit backtracking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-all"
            title="Close Tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto shrink-0 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveMode('walkthrough')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeMode === 'walkthrough'
                  ? 'bg-[#0D47A1] text-white shadow-sm font-extrabold'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Step-by-Step Walkthrough</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">8 Steps</span>
            </button>

            <button
              onClick={() => setActiveMode('backtracking')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeMode === 'backtracking'
                  ? 'bg-amber-600 text-white shadow-sm font-extrabold'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-amber-500" />
              <span>Backtracking Masterclass & Simulation</span>
            </button>

            <button
              onClick={() => setActiveMode('cheatsheet')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeMode === 'cheatsheet'
                  ? 'bg-emerald-700 text-white shadow-sm font-extrabold'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Quick Action Cheat Sheet</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden md:inline">Tagbilaran City E-Shuttle Admin Hub</span>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-800">
          {/* =========================================================================
              MODE 1: STEP-BY-STEP WALKTHROUGH
             ========================================================================= */}
          {activeMode === 'walkthrough' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Step Navigation Pill Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {steps.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStep(idx)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 whitespace-nowrap transition-all border shrink-0 ${
                      currentStep === idx
                        ? 'bg-[#0D47A1] text-white border-[#0D47A1] shadow-sm'
                        : idx < currentStep
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {idx < currentStep ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                    )}
                    <span>{s.category}</span>
                  </button>
                ))}
              </div>

              {/* Step Header Card */}
              <div className="bg-gradient-to-br from-blue-50/70 via-white to-slate-50 border-2 border-[#0D47A1]/40 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-[#0D47A1]/30 flex items-center justify-center shadow-sm shrink-0">
                      {currentStepData.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${currentStepData.badgeColor}`}>
                          {currentStepData.badge}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {currentStepData.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight mt-0.5">
                        {currentStepData.title}
                      </h3>
                    </div>
                  </div>

                  {/* Jump directly to tab button */}
                  {currentStepData.targetTab && onNavigateTab && (
                    <button
                      onClick={() => {
                        onNavigateTab(currentStepData.targetTab!);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 bg-[#0D47A1] hover:bg-[#1565C0] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm shrink-0 active:scale-95"
                      title={`Switch to ${currentStepData.targetTabLabel}`}
                    >
                      <span>{currentStepData.targetTabLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {currentStepData.explanation}
                </p>

                {/* Key Objectives Checklist */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-xs">
                  <div className="text-[11px] font-black text-[#0D47A1] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Key Mastery Objectives
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentStepData.objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Guide (How to execute) */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-[#0D47A1]" />
                  Operational Step-by-Step Procedure
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {currentStepData.actionGuide.map((ag) => (
                    <div
                      key={ag.stepNumber}
                      className="bg-white border border-slate-200 hover:border-[#0D47A1] rounded-2xl p-3.5 space-y-1.5 shadow-xs transition-colors"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#0D47A1] text-white font-black text-xs flex items-center justify-center">
                        {ag.stepNumber}
                      </div>
                      <div className="font-black text-xs text-slate-900">{ag.title}</div>
                      <p className="text-[11px] text-slate-600 font-medium leading-normal">{ag.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Tips & Audit / Backtracking Callout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Pro Tips Box */}
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-black text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Pro Tips & Best Practices
                  </div>
                  <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside font-medium">
                    {currentStepData.proTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Backtracking & Audit Linkage */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-black text-xs uppercase tracking-wider">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    Backtracking & Audit Trail
                  </div>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {currentStepData.backtrackingRelevance}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MODE 2: BACKTRACKING MASTERCLASS & SIMULATION
             ========================================================================= */}
          {activeMode === 'backtracking' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Conceptual Intro */}
              <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Mastering CRUD Backtracking & Audit Verification
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      How to pinpoint changes, examine before/after state diffs, and recover prior data
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  <strong>What is Backtracking?</strong> When team members or automated systems create, edit, or delete stations, zones, drivers, or fare matrices, human mistakes can happen (e.g., setting a fare to ₱150 instead of ₱15, or moving a station coordinate by accident).
                  The <strong>Activity Logs & Backtracking Engine</strong> records an immutable snapshot of the <strong>BEFORE (State Prior)</strong> and <strong>AFTER (Applied State)</strong> at the exact millisecond of change.
                </p>

                {/* 3 Pillar Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="bg-white border border-amber-300 rounded-xl p-3 space-y-1 text-xs">
                    <span className="font-black text-amber-900 block">1. Locate the Event</span>
                    <p className="text-slate-600 font-medium text-[11px]">
                      Filter by Entity (e.g. SETTINGS, STATION, DRIVER) or search for the item’s name or ID.
                    </p>
                  </div>
                  <div className="bg-white border border-amber-300 rounded-xl p-3 space-y-1 text-xs">
                    <span className="font-black text-amber-900 block">2. Click "Inspect"</span>
                    <p className="text-slate-600 font-medium text-[11px]">
                      Opens the side-by-side JSON Diff viewer comparing the prior state against the current state.
                    </p>
                  </div>
                  <div className="bg-white border border-amber-300 rounded-xl p-3 space-y-1 text-xs">
                    <span className="font-black text-amber-900 block">3. Copy & Reconcile</span>
                    <p className="text-slate-600 font-medium text-[11px]">
                      Copy the prior values from the red "BEFORE" block and restore them in the management panel.
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Simulation Sandbox */}
              <div className="bg-white border-2 border-[#0D47A1] rounded-2xl p-4 sm:p-5 shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#0D47A1] tracking-wider">
                      Interactive Demonstration
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-slate-900">
                      Live Simulation: Trigger a Change & Inspect the Diff
                    </h4>
                  </div>

                  <button
                    onClick={handleSimulateFareChange}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Simulate Fare Rate Change (Current: ₱{simulatedFare})</span>
                  </button>
                </div>

                {/* Simulated Log Feed */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Simulated Activity Log Stream ({simulatedHistory.length} Events)
                  </span>

                  <div className="space-y-2 max-h-52 overflow-y-auto">
                    {simulatedHistory.map((sim, i) => (
                      <div
                        key={sim.id}
                        className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          i === 0 ? 'bg-blue-50/80 border-[#0D47A1]' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#0D47A1] text-white">
                              {sim.action}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{sim.timestamp}</span>
                            {i === 0 && (
                              <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-300">
                                Just Recorded!
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-800">{sim.summary}</p>
                        </div>

                        {/* Side by Side Mini Diff */}
                        <div className="flex items-center gap-2 text-[11px] font-mono bg-white p-2 rounded-lg border border-slate-200 shrink-0">
                          <span className="text-rose-600 font-bold">
                            Before: ₱{sim.before.baseFare ?? 'N/A'}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-emerald-600 font-bold">
                            After: ₱{sim.after.baseFare ?? 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Anatomy of an Audit Record visual breakdown */}
                <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[10px] overflow-x-auto space-y-1">
                  <div className="text-slate-400 font-bold">
                    // Structure of each Audit Record in Firestore ('activityLogs' collection)
                  </div>
                  <pre>{`{
  "id": "log-xyz123",
  "timestamp": "2026-09-03T09:30:00.000Z",
  "action": "UPDATE", // CREATE | UPDATE | DELETE | STATUS_CHANGE | AUTH
  "entityType": "STATION", // STATION | ZONE | SHUTTLE | DRIVER | RIDE | SETTINGS
  "entityId": "station-04",
  "entityName": "Tagbilaran Port Terminal",
  "performedBy": { "uid": "admin-1", "name": "System Administrator", "role": "admin" },
  "summary": "Updated station capacity from 10 to 25 passengers",
  "details": {
    "before": { "capacity": 10, "lat": 9.654, "lng": 123.856 },
    "after": { "capacity": 25, "lat": 9.654, "lng": 123.856 }
  },
  "severity": "info" // info | success | warning | danger
}`}</pre>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              MODE 3: QUICK ACTION CHEAT SHEET
             ========================================================================= */}
          {activeMode === 'cheatsheet' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Search filter for cheats */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={cheatQuery}
                  onChange={(e) => setCheatQuery(e.target.value)}
                  placeholder="Search administrative procedures (e.g. approve driver, recover station, export logs)..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-[#0D47A1] focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Grid of Cheat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCheats.map((cheat, idx) => (
                  <div
                    key={idx}
                    className="bg-white border-2 border-slate-200 hover:border-[#0D47A1] rounded-2xl p-4 space-y-2.5 shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black text-[#0D47A1] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {cheat.category}
                        </span>
                        <h4 className="text-sm font-black text-slate-900 mt-1">{cheat.title}</h4>
                      </div>

                      {cheat.targetTab && onNavigateTab && (
                        <button
                          onClick={() => {
                            onNavigateTab(cheat.targetTab!);
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-[#E3F2FD] hover:bg-[#0D47A1] text-[#0D47A1] hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all shrink-0"
                          title="Jump directly to this tab"
                        >
                          <span>Go</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <ol className="space-y-1 text-xs text-slate-700 list-decimal list-inside font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {cheat.steps.map((st, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          {st}
                        </li>
                      ))}
                    </ol>

                    <div className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{cheat.logRecord}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between gap-2 shrink-0">
          {activeMode === 'walkthrough' ? (
            <>
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1 transition-all shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="text-center">
                <span className="text-xs font-black text-slate-700">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-[10px] text-slate-400 block sm:inline sm:ml-1.5">
                  ({steps[currentStep].category})
                </span>
              </div>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-4 py-2 bg-[#0D47A1] hover:bg-[#1565C0] text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish Tutorial</span>
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveMode('walkthrough')}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                ← Back to Step-by-Step
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#0D47A1] text-white rounded-xl text-xs font-bold hover:bg-[#1565C0] transition-colors"
              >
                Close Guide
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
