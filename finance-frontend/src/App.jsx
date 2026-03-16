import { BrowserRouter, Routes, Route } from "react-router-dom";


import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import TransactionsPage from "./pages/TransactionsPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

function App() {
  return (
    
    <BrowserRouter>
      <Routes>
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>

          <Route element={<AppLayout />}>

            <Route path="/" element={<Dashboard />} />

            <Route
              path="/transactions"
              element={<TransactionsPage />}
            />

          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;