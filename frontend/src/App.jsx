import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { VotingProvider } from "./context/VotingContext.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import Landing from "./pages/Landing.jsx";
import Election from "./pages/Election.jsx";
import Vote from "./pages/Vote.jsx";
import Review from "./pages/Review.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import BlockchainExplorer from "./pages/BlockchainExplorer.jsx";
import Audit from "./pages/Audit.jsx";
import Admin from "./pages/Admin.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import NotFound from "./pages/NotFound.jsx";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <VotingProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/election" element={<Election />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/review" element={<Review />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/blockchain" element={<BlockchainExplorer />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </VotingProvider>
  );
}
