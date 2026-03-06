import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import CompleteProfile from "./components/CompleteProfile";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import RoleGuard from "./components/RoleGuard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      {
        index: true, 
        element: <Navigate to="/signin" replace />,
      },
      {
        path: "signin",
        element: <Signin />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "complete-profile",
        element: <CompleteProfile />,
      },
      {
        path: "dashboard",
        element: (
          <RoleGuard allowedRoles={["visitor", "student", "staff"]}>
            <UserDashboard />
          </RoleGuard>
        ),
      },
      {
        path: "admin-dashboard",
        element: (
          <RoleGuard allowedRoles={["admin"]}>
            <AdminDashboard />
          </RoleGuard>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/signin" replace />,
      },
    ],
  },
]);