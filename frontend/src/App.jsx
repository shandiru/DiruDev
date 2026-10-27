import { Routes, Route, Navigate } from "react-router-dom";
import SiteLayout from "./components/SiteLayout.jsx";
import Home from "./pages/Home.jsx";
import Blog from "./pages/Blog.jsx";
import Post from "./pages/Post.jsx";
import AdminLogin from "./admin/Login.jsx";
import AdminLayout from "./admin/Layout.jsx";
import Overview from "./admin/Overview.jsx";
import Events from "./admin/Events.jsx";
import Messages from "./admin/Messages.jsx";
import Posts from "./admin/Posts.jsx";
import PostEditor from "./admin/PostEditor.jsx";
import AdminProjects from "./admin/Projects.jsx";
import ProjectEditor from "./admin/ProjectEditor.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Post />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Overview />} />
        <Route path="events" element={<Events />} />
        <Route path="messages" element={<Messages />} />
        <Route path="posts" element={<Posts />} />
        <Route path="posts/new" element={<PostEditor />} />
        <Route path="posts/:id" element={<PostEditor />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="projects/new" element={<ProjectEditor />} />
        <Route path="projects/:id" element={<ProjectEditor />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
