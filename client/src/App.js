import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import KitchenStaffDashboard from './pages/KitchenStaffDashboard';
import UserManagement from './pages/UserManagement';
import LocationManagement from './pages/LocationManagement';
import Records from './pages/Records';
// import FoodTemperaturePage from './pages/FoodTemperaturePage'; // Old page, will be removed or deprecated
import FoodTemperatureAddPage from './pages/FoodTemperatureAddPage';
import FoodTemperatureListPage from './pages/FoodTemperatureListPage';
import MyRecordsListPage from './pages/MyRecordsListPage'; // New page for kitchen staff's own records
// Import new Probe Calibration pages
import ProbeCalibrationListPage from './pages/ProbeCalibrationListPage';
import ProbeCalibrationAddPage from './pages/ProbeCalibrationAddPage';
// Import new Delivery pages
import DeliveryListPage from './pages/DeliveryListPage';
import DeliveryAddPage from './pages/DeliveryAddPage';
// Import new Equipment Temperature pages
import EquipmentTemperatureListPage from './pages/EquipmentTemperatureListPage';
import EquipmentTemperatureAddPage from './pages/EquipmentTemperatureAddPage';
// Placeholders for other record types
import PrivateRoute from './components/PrivateRoute';
import AuthCheck from './components/AuthCheck';
// Import the new EquipmentManagementPage
import EquipmentManagementPage from './pages/EquipmentManagementPage';
import InformationPage from './pages/InformationPage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthCheck>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" /> : <Login />}
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  {user?.role === 'admin' ? (
                    <AdminDashboard />
                  ) : (
                    <KitchenStaffDashboard />
                  )}
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <UserManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/locations"
              element={
                <PrivateRoute>
                  <LocationManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/records"
              element={
                <PrivateRoute>
                  <Records />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-records"
              element={
                <PrivateRoute>
                  <MyRecordsListPage />
                </PrivateRoute>
              }
            />
            {/* Food Temperature Record Routes */}
            <Route
              path="/records/food-temperature/add"
              element={
                <PrivateRoute>
                  <FoodTemperatureAddPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/records/food-temperature"
              element={
                <PrivateRoute>
                  <FoodTemperatureListPage />
                </PrivateRoute>
              }
            />
            {/* Probe Calibration Record Routes */}
            <Route
              path="/records/probe-calibration"
              element={
                <PrivateRoute>
                  <ProbeCalibrationListPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/records/probe-calibration/add"
              element={
                <PrivateRoute>
                  <ProbeCalibrationAddPage />
                </PrivateRoute>
              }
            />
            {/* Delivery Record Routes */}
            <Route
              path="/records/delivery"
              element={
                <PrivateRoute>
                  <DeliveryListPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/records/delivery/add"
              element={
                <PrivateRoute>
                  <DeliveryAddPage />
                </PrivateRoute>
              }
            />
            {/* Equipment Temperature Record Routes */}
            <Route
              path="/records/equipment-temperature"
              element={
                <PrivateRoute>
                  <EquipmentTemperatureListPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/records/equipment-temperature/add"
              element={
                <PrivateRoute>
                  <EquipmentTemperatureAddPage />
                </PrivateRoute>
              }
            />
            {/* Equipment Management Route */}
            <Route
              path="/equipment"
              element={
                <PrivateRoute>
                  <EquipmentManagementPage />
                </PrivateRoute>
              }
            />
            {/* Information Page Route */}
            <Route
              path="/info"
              element={
                <PrivateRoute>
                  <InformationPage />
                </PrivateRoute>
              }
            />
            {/* Add routes for other record types here following the /add and /list pattern */}
          </Routes>
        </Router>
      </AuthCheck>
    </ThemeProvider>
  );
}

export default App;
