import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import DemoBadge from "../components/DemoBadge.jsx";
import ToastContainer from "../components/ToastContainer.jsx";

export default function MainLayout() {
  return (
    <>
      <div id="bg-noise"></div>
      <div id="bg-glow"></div>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <DemoBadge />
      <ToastContainer />
    </>
  );
}
