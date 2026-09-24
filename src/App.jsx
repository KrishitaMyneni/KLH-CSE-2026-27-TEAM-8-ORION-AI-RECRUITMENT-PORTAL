import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import SelectRole from "./pages/SelectRole";

import CandidateDashboard from "./pages/CandidateDashboard";
import CandidateProfile from "./pages/CandidateProfile";
import JobListings from "./pages/JobListings";
import JobDetails from "./pages/JobDetails";
import MatchAnalysis from "./pages/MatchAnalysis";
import Applications from "./pages/Applications";
import RecruiterApplicants from "./pages/RecruiterApplicants";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterJobs from "./pages/RecruiterJobs";
import Notifications from "./pages/Notifications";
import RecruiterScreening from "./pages/RecruiterScreening";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Role Selection */}
        <Route path="/select-role" element={<SelectRole />} />
<Route
  path="/recruiter/screening"
  element={<RecruiterScreening />}
/>
        {/* Candidate */}
        <Route
          path="/candidate/dashboard"
          element={<CandidateDashboard />}
        />

        <Route
          path="/candidate/profile"
          element={<CandidateProfile />}
        />

        {/* Jobs */}
        <Route path="/jobs" element={<JobListings />} />
        <Route path="/jobs/:id" element={<JobDetails />} />

        {/* Candidate Features */}
        <Route path="/match-analysis" element={<MatchAnalysis />} />
        <Route path="/applications" element={<Applications />} />

        {/* Recruiter */}
        <Route
          path="/recruiter/dashboard"
          element={<RecruiterDashboard />}
        />
        <Route path="/recruiter/applicants" element={<RecruiterApplicants />} />
        <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
        {/* Notifications */}
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;