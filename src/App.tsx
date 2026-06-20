import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AppProvider } from "./context/AppContext";
import { ScrollToTop } from "./components/app/ScrollToTop";
import { Protected, AdminLegacyRedirect } from "./components/app/Protected";
import { MultiRoleProtected, AuthRequired } from "./components/app/MultiRoleProtected";
import WorkerDashboard from "./pages/worker/WorkerDashboard.tsx";
import DailyOperationsDashboard from "./pages/worker/DailyOperationsDashboard.tsx";
import WorkerMyDay from "./pages/worker/MyDay.tsx";
import WorkerHelpSupport from "./pages/worker/HelpSupport.tsx";
import Attendance from "./pages/worker/Attendance.tsx";
import AttendanceHistory from "./pages/worker/AttendanceHistory.tsx";
import Activities from "./pages/worker/Activities.tsx";
import History from "./pages/worker/History.tsx";
import WorkerAlerts from "./pages/worker/Alerts.tsx";
import Profile from "./pages/worker/Profile.tsx";
import Uploads from "./pages/worker/Uploads.tsx";
import VerificationDetail from "./pages/worker/VerificationDetail.tsx";
import WorkerComplaints from "./pages/worker/Complaints.tsx";
import SessionMonitor from "./pages/worker/SessionMonitor.tsx";
import SessionHistory from "./pages/worker/SessionHistory.tsx";
import WorkerPerformance from "./pages/worker/Performance.tsx";
import WorkerTraining from "./pages/worker/Training.tsx";
import WorkerTrainingCourse from "./pages/worker/TrainingCourse.tsx";
import SessionFeedback from "./pages/worker/SessionFeedback.tsx";
import SupervisorDashboard from "./pages/supervisor/SupervisorDashboard.tsx";
import Centers from "./pages/supervisor/Centers.tsx";
import CenterDetail from "./pages/supervisor/CenterDetail.tsx";
import Verifications from "./pages/supervisor/Verifications.tsx";
import Alerts from "./pages/supervisor/Alerts.tsx";
import MapView from "./pages/supervisor/MapView.tsx";
import SupervisorReports from "./pages/supervisor/Reports.tsx";
import SupervisorAuditDetail from "./pages/supervisor/SupervisorAuditDetail.tsx";
import SupervisorComplaints from "./pages/supervisor/Complaints.tsx";
import SupervisorCoaching from "./pages/supervisor/Coaching.tsx";
import SupervisorSessionReview from "./pages/supervisor/SessionReview.tsx";
import SupervisorDevelopment from "./pages/supervisor/Development.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminCompliance from "./pages/admin/AdminCompliance.tsx";
import AdminCenters from "./pages/admin/AdminCenters.tsx";
import AdminWorkers from "./pages/admin/AdminWorkers.tsx";
import AdminAlerts from "./pages/admin/AdminAlerts.tsx";
import AdminReports from "./pages/admin/AdminReports.tsx";
import MyGrievances from "./pages/beneficiary/MyGrievances.tsx";
import MyGrievanceDetail from "./pages/beneficiary/MyGrievanceDetail.tsx";
import SubmitGrievance from "./pages/beneficiary/SubmitGrievance.tsx";
import TrackGrievance from "./pages/beneficiary/TrackGrievance.tsx";
import BeneficiaryFeedback from "./pages/beneficiary/Feedback.tsx";
import BeneficiaryComplaints from "./pages/beneficiary/Complaints.tsx";
import BeneficiaryStatus from "./pages/beneficiary/Status.tsx";
import BeneficiaryActivities from "./pages/beneficiary/Activities.tsx";
import BeneficiaryProfile from "./pages/beneficiary/Profile.tsx";
import BeneficiaryNotifications from "./pages/beneficiary/Notifications.tsx";
import OmnichannelFeedback from "./pages/beneficiary/OmnichannelFeedback.tsx";
import StateAdminDashboard from "./pages/state-admin/StateAdminDashboard.tsx";
import StateAdminComplaints from "./pages/state-admin/Complaints.tsx";
import StateAdminNotifications from "./pages/state-admin/Notifications.tsx";
import DistrictAdminComplaints from "./pages/district-admin/Complaints.tsx";
import Integrations from "./pages/shared/Integrations.tsx";
import ChildProgress from "./pages/worker/ChildProgress.tsx";
import ChildOutcomes from "./pages/supervisor/ChildOutcomes.tsx";
import Interventions from "./pages/supervisor/Interventions.tsx";
import DistrictOutcomes from "./pages/district-admin/Outcomes.tsx";
import StateImpact from "./pages/state-admin/StateImpact.tsx";
import GovernmentStory from "./pages/state-admin/GovernmentStory.tsx";
import BeneficiarySurveys from "./pages/beneficiary/Surveys.tsx";
import MyChild from "./pages/beneficiary/MyChild.tsx";
import PublicRequestDetail from "./pages/beneficiary/PublicRequestDetail.tsx";
import GrievanceActionCenter from "./pages/supervisor/GrievanceActionCenter.tsx";
import PublicGrievanceCenter from "./pages/supervisor/PublicGrievanceCenter.tsx";
import SupervisorGrievanceDetail from "./pages/supervisor/SupervisorGrievanceDetail.tsx";
import AnganwadiAnalytics from "./pages/supervisor/AnganwadiAnalytics.tsx";
import CenterIntelligenceReportPage from "./pages/supervisor/CenterIntelligenceReport.tsx";
import MyRequests from "./pages/public/MyRequests.tsx";
import MyExperiences from "./pages/public/MyExperiences.tsx";
import ExperienceDetail from "./pages/public/ExperienceDetail.tsx";
import CenterTimelinePage from "./pages/beneficiary/CenterTimeline.tsx";
import EscalatedGrievances from "./pages/district-admin/EscalatedGrievances.tsx";
import DailyJourney from "./pages/beneficiary/DailyJourney.tsx";
import NutritionServices from "./pages/beneficiary/Nutrition.tsx";
import ParentCenterHealth from "./pages/beneficiary/CenterHealth.tsx";
import HelpSupport from "./pages/beneficiary/Help.tsx";
import CenterDigitalTwin from "./pages/shared/CenterDigitalTwin.tsx";
import CenterTimeline from "./pages/shared/CenterTimeline.tsx";
import SessionExplanation from "./pages/shared/SessionExplanation.tsx";
import OfflineSyncCenter from "./pages/shared/OfflineSyncCenter.tsx";
import TransparencyPortal from "./pages/public/TransparencyPortal.tsx";
import DemoExperience from "./pages/experience/DemoExperience.tsx";
import ScenarioGenerator from "./pages/experience/ScenarioGenerator.tsx";
import ImpactDashboard from "./pages/shared/ImpactDashboard.tsx";
import CenterCommand from "./pages/shared/CenterCommand.tsx";
import CenterScore from "./pages/shared/CenterScore.tsx";
import AEIAnalytics from "./pages/shared/AEIAnalytics.tsx";
import AEIExplanation from "./pages/shared/AEIExplanation.tsx";
import CenterHealth from "./pages/shared/CenterHealth.tsx";
import VoiceOfCitizen from "./pages/shared/VoiceOfCitizen.tsx";
import WorkerGrowth from "./pages/worker/WorkerGrowth.tsx";
import HackathonExperience from "./pages/experience/HackathonExperience.tsx";
import MissionControl from "./pages/state-admin/MissionControl.tsx";
import StateOutcomes from "./pages/state-admin/StateOutcomes.tsx";
import DistrictInterventions from "./pages/district-admin/DistrictInterventions.tsx";
import GrievanceExplanation from "./pages/shared/GrievanceExplanation.tsx";
import RiskExplanation from "./pages/shared/RiskExplanation.tsx";
import SQIExplanation from "./pages/shared/SQIExplanation.tsx";
import SupervisorClassroomIntelligence from "./pages/supervisor/ClassroomIntelligence.tsx";
import SupervisorSessionAnalysis from "./pages/supervisor/SupervisorSessionAnalysis.tsx";
import DistrictClassroomIntelligence from "./pages/district-admin/DistrictClassroomIntelligence.tsx";
import DistrictSessionReview from "./pages/district-admin/DistrictSessionReview.tsx";
import StateClassroomIntelligence from "./pages/state-admin/StateClassroomIntelligence.tsx";
import StateSessionInsights from "./pages/state-admin/StateSessionInsights.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" richColors />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Beneficiary */}
            <Route path="/beneficiary" element={<Protected role="beneficiary"><Navigate to="/beneficiary/my-grievances" replace /></Protected>} />
            <Route path="/beneficiary/my-grievances" element={<Protected role="beneficiary"><MyGrievances /></Protected>} />
            <Route path="/beneficiary/my-grievances/:id" element={<Protected role="beneficiary"><MyGrievanceDetail /></Protected>} />
            <Route path="/beneficiary/submit-grievance" element={<Protected role="beneficiary"><SubmitGrievance /></Protected>} />
            <Route path="/beneficiary/track-grievance" element={<Protected role="beneficiary"><TrackGrievance /></Protected>} />
            <Route path="/beneficiary/feedback" element={<Protected role="beneficiary"><BeneficiaryFeedback /></Protected>} />
            <Route path="/beneficiary/complaints" element={<Protected role="beneficiary"><BeneficiaryComplaints /></Protected>} />
            <Route path="/beneficiary/status" element={<Protected role="beneficiary"><BeneficiaryStatus /></Protected>} />
            <Route path="/beneficiary/activities" element={<Protected role="beneficiary"><BeneficiaryActivities /></Protected>} />
            <Route path="/beneficiary/profile" element={<Protected role="beneficiary"><BeneficiaryProfile /></Protected>} />
            <Route path="/beneficiary/notifications" element={<Protected role="beneficiary"><BeneficiaryNotifications /></Protected>} />
            <Route path="/beneficiary/omnichannel-feedback" element={<Protected role="beneficiary"><OmnichannelFeedback /></Protected>} />
            <Route path="/beneficiary/surveys" element={<Protected role="beneficiary"><BeneficiarySurveys /></Protected>} />
            <Route path="/beneficiary/my-child" element={<Protected role="beneficiary"><MyChild /></Protected>} />
            <Route path="/beneficiary/my-child/growth" element={<Protected role="beneficiary"><MyChild /></Protected>} />
            <Route path="/beneficiary/my-child/vaccination" element={<Protected role="beneficiary"><MyChild /></Protected>} />
            <Route path="/beneficiary/my-child/attendance" element={<Protected role="beneficiary"><MyChild /></Protected>} />
            <Route path="/beneficiary/my-child/milestones" element={<Protected role="beneficiary"><MyChild /></Protected>} />
            <Route path="/beneficiary/my-child/health" element={<Protected role="beneficiary"><MyChild /></Protected>} />
            <Route path="/beneficiary/center-timeline" element={<Protected role="beneficiary"><CenterTimelinePage /></Protected>} />
            <Route path="/beneficiary/request/:id" element={<Protected role="beneficiary"><PublicRequestDetail /></Protected>} />
            <Route path="/beneficiary/daily-journey" element={<Protected role="beneficiary"><DailyJourney /></Protected>} />
            <Route path="/beneficiary/nutrition" element={<Protected role="beneficiary"><NutritionServices /></Protected>} />
            <Route path="/beneficiary/center-health" element={<Protected role="beneficiary"><ParentCenterHealth /></Protected>} />
            <Route path="/beneficiary/help" element={<Protected role="beneficiary"><HelpSupport /></Protected>} />
            <Route path="/public/my-requests" element={<Protected role="beneficiary"><MyRequests /></Protected>} />
            <Route path="/public/my-experiences" element={<Protected role="beneficiary"><MyExperiences /></Protected>} />
            <Route path="/public/experience/:id" element={<Protected role="beneficiary"><ExperienceDetail /></Protected>} />

            {/* Worker */}
            <Route path="/worker" element={<Navigate to="/worker/dashboard" replace />} />
            <Route path="/worker/dashboard" element={<Protected role="worker"><DailyOperationsDashboard /></Protected>} />
            <Route path="/worker/my-day" element={<Protected role="worker"><WorkerMyDay /></Protected>} />
            <Route path="/worker/help-support" element={<Protected role="worker"><WorkerHelpSupport /></Protected>} />
            <Route path="/worker/attendance" element={<Protected role="worker"><Attendance /></Protected>} />
            <Route path="/worker/attendance-history" element={<Protected role="worker"><AttendanceHistory /></Protected>} />
            <Route path="/worker/activities" element={<Protected role="worker"><Activities /></Protected>} />
            <Route path="/worker/session-monitor" element={<Protected role="worker"><SessionMonitor /></Protected>} />
            <Route path="/worker/session-history" element={<Protected role="worker"><SessionHistory /></Protected>} />
            <Route path="/worker/performance" element={<Protected role="worker"><WorkerPerformance /></Protected>} />
            <Route path="/worker/training" element={<Protected role="worker"><WorkerTraining /></Protected>} />
            <Route path="/worker/training/:moduleId" element={<Protected role="worker"><WorkerTrainingCourse /></Protected>} />
            <Route path="/worker/session-feedback" element={<Protected role="worker"><SessionFeedback /></Protected>} />
            <Route path="/worker/session-feedback/:id" element={<Protected role="worker"><SessionFeedback /></Protected>} />
            <Route path="/worker/history" element={<Navigate to="/worker/uploads" replace />} />
            <Route path="/worker/teaching-insights" element={<Navigate to="/worker/performance" replace />} />
            <Route path="/worker/complaints" element={<Protected role="worker"><WorkerComplaints /></Protected>} />
            <Route path="/worker/alerts" element={<Protected role="worker"><WorkerAlerts /></Protected>} />
            <Route path="/worker/profile" element={<Protected role="worker"><Profile /></Protected>} />
            <Route path="/worker/uploads" element={<Protected role="worker"><Uploads /></Protected>} />
            <Route path="/worker/activity/:id" element={<Protected role="worker"><VerificationDetail /></Protected>} />
            <Route path="/worker/child-progress" element={<Protected role="worker"><ChildProgress /></Protected>} />
            <Route path="/worker/growth" element={<Protected role="worker"><WorkerGrowth /></Protected>} />

            {/* Supervisor */}
            <Route path="/supervisor" element={<Protected role="supervisor"><SupervisorDashboard /></Protected>} />
            <Route path="/supervisor/centers" element={<Protected role="supervisor"><Centers /></Protected>} />
            <Route path="/supervisor/centers/:id" element={<Protected role="supervisor"><CenterDetail /></Protected>} />
            <Route path="/supervisor/verifications" element={<Protected role="supervisor"><Verifications /></Protected>} />
            <Route path="/supervisor/coaching" element={<Protected role="supervisor"><SupervisorCoaching /></Protected>} />
            <Route path="/supervisor/session-review" element={<Protected role="supervisor"><SupervisorSessionReview /></Protected>} />
            <Route path="/supervisor/development" element={<Protected role="supervisor"><SupervisorDevelopment /></Protected>} />
            <Route path="/supervisor/complaints" element={<Protected role="supervisor"><SupervisorComplaints /></Protected>} />
            <Route path="/supervisor/public-grievance-center" element={<Protected role="supervisor"><PublicGrievanceCenter /></Protected>} />
            <Route path="/supervisor/grievance-action-center" element={<Protected role="supervisor"><GrievanceActionCenter /></Protected>} />
            <Route path="/supervisor/grievance/:id" element={<Protected role="supervisor"><SupervisorGrievanceDetail /></Protected>} />
            <Route path="/supervisor/anganwadi-analytics" element={<Protected role="supervisor"><AnganwadiAnalytics /></Protected>} />
            <Route path="/supervisor/anganwadi-analytics/:id" element={<Protected role="supervisor"><CenterIntelligenceReportPage /></Protected>} />
            <Route path="/supervisor/center/:centerId" element={<Protected role="supervisor"><CenterIntelligenceReportPage /></Protected>} />
            <Route path="/supervisor/audit/:id" element={<Protected role="supervisor"><SupervisorAuditDetail /></Protected>} />
            <Route path="/supervisor/alerts" element={<Protected role="supervisor"><Alerts /></Protected>} />
            <Route path="/supervisor/map" element={<Protected role="supervisor"><MapView /></Protected>} />
            <Route path="/supervisor/reports" element={<Protected role="supervisor"><SupervisorReports /></Protected>} />
            <Route path="/supervisor/child-outcomes" element={<Protected role="supervisor"><ChildOutcomes /></Protected>} />
            <Route path="/supervisor/outcomes" element={<Protected role="supervisor"><ChildOutcomes /></Protected>} />
            <Route path="/supervisor/interventions" element={<Protected role="supervisor"><Interventions /></Protected>} />
            <Route path="/supervisor/classroom-intelligence" element={<Protected role="supervisor"><SupervisorClassroomIntelligence /></Protected>} />
            <Route path="/supervisor/session-analysis/:sessionId" element={<Protected role="supervisor"><SupervisorSessionAnalysis /></Protected>} />

            {/* District Admin (legacy /admin redirects) */}
            <Route path="/admin" element={<AdminLegacyRedirect />} />
            <Route path="/admin/*" element={<AdminLegacyRedirect />} />
            <Route path="/district-admin" element={<Protected role="district_admin"><AdminDashboard /></Protected>} />
            <Route path="/district-admin/mission-control" element={<Protected role="district_admin"><MissionControl scope="district" /></Protected>} />
            <Route path="/district-admin/compliance" element={<Protected role="district_admin"><AdminCompliance /></Protected>} />
            <Route path="/district-admin/centers" element={<Protected role="district_admin"><AdminCenters /></Protected>} />
            <Route path="/district-admin/workers" element={<Protected role="district_admin"><AdminWorkers /></Protected>} />
            <Route path="/district-admin/alerts" element={<Navigate to="/district-admin/complaints" replace />} />
            <Route path="/district-admin/complaints" element={<Protected role="district_admin"><DistrictAdminComplaints /></Protected>} />
            <Route path="/district-admin/escalated-grievances" element={<Protected role="district_admin"><EscalatedGrievances /></Protected>} />
            <Route path="/district/escalated-grievances" element={<Protected role="district_admin"><EscalatedGrievances /></Protected>} />
            <Route path="/district-admin/integrations" element={<Protected role="district_admin"><Integrations scope="district" /></Protected>} />
            <Route path="/district-admin/reports" element={<Protected role="district_admin"><AdminReports /></Protected>} />
            <Route path="/district-admin/outcomes" element={<Protected role="district_admin"><DistrictOutcomes /></Protected>} />
            <Route path="/district-admin/interventions" element={<Protected role="district_admin"><DistrictInterventions /></Protected>} />
            <Route path="/district-admin/classroom-intelligence" element={<Protected role="district_admin"><DistrictClassroomIntelligence /></Protected>} />
            <Route path="/district-admin/session-review/:sessionId" element={<Protected role="district_admin"><DistrictSessionReview /></Protected>} />

            {/* State Admin */}
            <Route path="/state-admin" element={<Protected role="state_admin"><StateAdminDashboard /></Protected>} />
            <Route path="/state-admin/compliance" element={<Protected role="state_admin"><AdminCompliance /></Protected>} />
            <Route path="/state-admin/complaints" element={<Protected role="state_admin"><StateAdminComplaints /></Protected>} />
            <Route path="/state-admin/integrations" element={<Protected role="state_admin"><Integrations scope="state" /></Protected>} />
            <Route path="/state-admin/reports" element={<Protected role="state_admin"><AdminReports /></Protected>} />
            <Route path="/state-admin/notifications" element={<Protected role="state_admin"><StateAdminNotifications /></Protected>} />
            <Route path="/state-admin/impact" element={<Protected role="state_admin"><StateImpact /></Protected>} />
            <Route path="/state-admin/outcomes" element={<Protected role="state_admin"><StateOutcomes /></Protected>} />
            <Route path="/state-admin/mission-control" element={<Protected role="state_admin"><MissionControl scope="state" /></Protected>} />
            <Route path="/state-admin/story" element={<Protected role="state_admin"><GovernmentStory /></Protected>} />
            <Route path="/state-admin/classroom-intelligence" element={<Protected role="state_admin"><StateClassroomIntelligence /></Protected>} />
            <Route path="/state-admin/session-insights/:sessionId" element={<Protected role="state_admin"><StateSessionInsights /></Protected>} />

            {/* Unified service improvement layer */}
            <Route path="/center-command/:id" element={<MultiRoleProtected roles={["supervisor", "district_admin", "state_admin", "worker", "beneficiary"]}><CenterCommand /></MultiRoleProtected>} />
            <Route path="/center-journey/:id" element={<MultiRoleProtected roles={["supervisor", "district_admin", "state_admin", "worker", "beneficiary"]}><CenterCommand /></MultiRoleProtected>} />
            <Route path="/center-score/:id" element={<MultiRoleProtected roles={["supervisor", "district_admin", "state_admin", "worker"]}><CenterScore /></MultiRoleProtected>} />
            <Route path="/center-health/:id" element={<MultiRoleProtected roles={["supervisor", "district_admin", "state_admin"]}><CenterHealth /></MultiRoleProtected>} />
            <Route path="/voice-of-citizen" element={<MultiRoleProtected roles={["supervisor", "district_admin", "state_admin"]}><VoiceOfCitizen /></MultiRoleProtected>} />

            {/* Intelligence layer — multi-role & public */}
            <Route path="/center-digital-view/:id" element={<MultiRoleProtected roles={["supervisor", "district_admin", "state_admin"]}><CenterDigitalTwin /></MultiRoleProtected>} />
            <Route path="/center-timeline/:id" element={<MultiRoleProtected roles={["supervisor", "district_admin", "state_admin"]}><CenterTimeline /></MultiRoleProtected>} />
            <Route path="/session-explanation/:id" element={<AuthRequired><SessionExplanation /></AuthRequired>} />
            <Route path="/grievance-explanation/:id" element={<AuthRequired><GrievanceExplanation /></AuthRequired>} />
            <Route path="/risk-explanation/:id" element={<AuthRequired><RiskExplanation /></AuthRequired>} />
            <Route path="/sqi-explanation/:id" element={<AuthRequired><SQIExplanation /></AuthRequired>} />
            <Route path="/aei-explanation/:id" element={<AuthRequired><AEIExplanation /></AuthRequired>} />
            <Route path="/analytics/aei" element={<MultiRoleProtected roles={["supervisor", "district_admin", "state_admin"]}><AEIAnalytics /></MultiRoleProtected>} />
            <Route path="/settings/sync" element={<AuthRequired><OfflineSyncCenter /></AuthRequired>} />
            <Route path="/public/transparency" element={<TransparencyPortal />} />
            <Route path="/experience/demo" element={<DemoExperience />} />
            <Route path="/experience/hackathon" element={<HackathonExperience />} />
            <Route path="/experience/scenarios" element={<ScenarioGenerator />} />
            <Route path="/demo/scenarios" element={<Navigate to="/experience/scenarios" replace />} />
            <Route path="/impact" element={<ImpactDashboard />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
