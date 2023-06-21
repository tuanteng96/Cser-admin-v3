import React from "react";
import { Routes, Route } from "react-router-dom";
import CallNow from "../features/CallNow";
import CustomerCare from "../features/CustomerCare";

export default function RoutesPage() {
  return (
    <Routes>
      <Route path="*" element={<CustomerCare />} />
      <Route path="/call" element={<CallNow />} />
    </Routes>
  );
}
