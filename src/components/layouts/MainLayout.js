import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';
import Sidebar from '../common/Sidebar';
import '../../styles/layouts/MainLayout.css';

const MainLayout = ({ user, setUser }) => {
  return (
    <div className="main-layout">
      <Header user={user} setUser={setUser} />
      <div className="main-content-wrapper">
        <Sidebar user={user} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
