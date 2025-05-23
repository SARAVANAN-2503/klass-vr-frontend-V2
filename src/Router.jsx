import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import AllExperience from "./pages/teacher/allexperience/Experience";
import ProtectedRoute from "./services/ProtectedRouter"; // New protected route component
import Client from "./pages/systemadmin/client/Client";
import Subscription from "./pages/systemadmin/subscription/Subsciption";
import Roles from "./pages/systemadmin/roles/Roles";
import ViewClient from "./pages/systemadmin/client/ViewClient";
import Repository from "./pages/repo/Repository";
import Video from "./pages/repo/360video/Video";
import VideoView from "./pages/repo/view/VideoView";
import RepoView from "./pages/repo/view/RepoView";
import MyExperience from "./pages/teacher/myexperience/MyExperience";
import AddMyExperience from "./pages/teacher/myexperience/AddMyExperience";
import EditMyExperience from "./pages/teacher/myexperience/EditMyExperience";
import ViewFrameModel from "./pages/teacher/ViewFrameModel";
import ViewMyExperience from "./pages/teacher/myexperience/ViewMyExperience";
import ViewExperience from "./pages/teacher/allexperience/view/ViewExperience";
import AdminDashboard from "./pages/admin/dashboard/AdminDashboard";
import DeviceManagement from "./pages/admin/Management/Device/DeviceManage";
import TeacherManagement from "./pages/admin/Management/Teacher/TeacherManage";
import StudentManagement from "./pages/admin/Management/Student/StudentManage";
import DeviceConnect from "./pages/teacher/DeviceConnect";
import Contucted from "./pages/teacher/ExperienceContucted/Contucted";
import TeacherDashboard from "./pages/teacher/Dashboard/TeacherDashboard";
import SuperadminDashboard from "./pages/superadmin/SuperadminDashboard";
import Simulation from "./pages/repo/simulation/Simulation";
import Image360 from "./pages/repo/Image/Image";
import SimulationView from "./pages/repo/simulation/SimulationView";
import ImageView from "./pages/repo/view/ImageView";
import ContentRepo from "./pages/teacher/myexperience/ContentRepo";
import Dashboard from "./pages/systemadmin/dashboard/Dashboard";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected routes */}
        <Route
          path="/"
          element={<ProtectedRoute element={<TeacherDashboard />} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route path="/experience" element={<ProtectedRoute element={<AllExperience />} />}/>

        <Route path="/myexperience" element={<ProtectedRoute element={<MyExperience />} />}/>
        <Route path="/editexperience/:id" element={<ProtectedRoute element={<EditMyExperience />} />}/>
        <Route path="/admindashboard" element={<ProtectedRoute element={<AdminDashboard />} />}/>
        <Route path="/model" element={<ProtectedRoute element={<Repository />} />}/>
        <Route path="/video" element={<ProtectedRoute element={<Video />} />}/>
        <Route path="/image" element={<ProtectedRoute element={<Image360 />} />}/>
        <Route path="/simulation" element={<ProtectedRoute element={<Simulation />} />}/>
        <Route path="/deviceconnect" element={<ProtectedRoute element={<DeviceConnect />} />}/>
        <Route path="/video-view" element={<ProtectedRoute element={<VideoView />} />}/>
        <Route path="/image-view" element={<ProtectedRoute element={<ImageView />} />}/>
        <Route path="/model-view" element={<ProtectedRoute element={<RepoView />} />}/>
        <Route path="/simulation-view" element={<ProtectedRoute element={<SimulationView />} />}/>
        <Route path="/viewexperience/:id" element={<ProtectedRoute element={<ViewExperience />} />}/>
        <Route path="/experienceList" element={<ProtectedRoute element={<Contucted />} />}/>
        <Route path="/content_repo" element={<ProtectedRoute element={<ContentRepo />} />}/>
        <Route path="/viewmyexperience/:id" element={<ProtectedRoute element={<ViewMyExperience />} />}/>
        <Route path="/teacherDashboard" element={<ProtectedRoute element={<TeacherDashboard />} />}/>
        <Route path="/_dashboard" element={<ProtectedRoute element={<SuperadminDashboard />} />}/>
        <Route path="/client" element={<ProtectedRoute element={<Client />} />}/>
        <Route path="/subscription" element={<ProtectedRoute element={<Subscription />} />}/>
        <Route path="/client/:id" element={<ProtectedRoute element={<ViewClient />} />}/>
        <Route path="/roles" element={<ProtectedRoute element={<Roles />} />}/>
        <Route path="/unity" element={<ProtectedRoute element={<ViewFrameModel />} />}/>
        <Route path="/AddExperience" element={<ProtectedRoute element={<AddMyExperience />} />}/>
        <Route path="/devicemanagement" element={<ProtectedRoute element={<DeviceManagement />} />}/>
        <Route path="/teachermanagement" element={<ProtectedRoute element={<TeacherManagement />} />}/>
        <Route path="/studentmanagement" element={<ProtectedRoute element={<StudentManagement />} />}/>

        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
