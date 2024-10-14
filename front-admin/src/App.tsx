import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import UserManagementPage from './pages/UserManagement';
import ProductManagementPage from './pages/ProductManagement';
import MainCategoryManagementPage from './pages/CategoryManagement';
import UpdateProductPage from './pages/UpdateProductPage';
import Navbar from './layouts/Navbar';
import Sidebar from './layouts/Sidebar';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Navbar />}>
        <Route path="/" element={<LoginPage />} />
        <Route element={<Sidebar />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/products" element={<ProductManagementPage />} />
          <Route path="/update-product/:id" element={<UpdateProductPage />} />
          <Route path="/categories/main" element={<MainCategoryManagementPage />} />
          <Route path="/categories/sub" element={<MainCategoryManagementPage />} />
          <Route path="/oreders" element={<DashboardPage />} />
        </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;