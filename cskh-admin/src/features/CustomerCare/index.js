import React from "react";
import { Routes, Route } from "react-router-dom";
import History from "./pages/History";
import Home from "./pages/Home";
import Information from "./pages/Information";

function CustomerCare(props) {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path=":id" element={<Information />} />
      <Route path=":id/lich-su" element={<History />} />
    </Routes>
  );
}

export default CustomerCare;
