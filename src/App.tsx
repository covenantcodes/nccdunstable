import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import {
  About,
  Contact,
  Events,
  Give,
  Home,
  Ministries,
  NotFound,
  Sermons,
} from "./pages/PublicPages";
import { AdminLogin, AdminRoute } from "./pages/AdminPages";
import { SmoothScroll } from "./components/SmoothScroll";

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/events" element={<Events />} />
        {/* <Route path="/ministries" element={<Ministries />} /> */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/give" element={<Give />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
