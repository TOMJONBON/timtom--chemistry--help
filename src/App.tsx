import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Shell } from "./components/layout";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Learn = lazy(() => import("./pages/Learn").then((module) => ({ default: module.Learn })));
const UnitPage = lazy(() => import("./pages/Learn").then((module) => ({ default: module.UnitPage })));
const SubunitPage = lazy(() => import("./pages/Learn").then((module) => ({ default: module.SubunitPage })));
const Practice = lazy(() => import("./pages/Practice"));
const Exam = lazy(() => import("./pages/Exam"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const Browse = lazy(() => import("./pages/Browse"));
const Periodic = lazy(() => import("./pages/Periodic"));
const Reference = lazy(() => import("./pages/Reference"));
const Calculators = lazy(() => import("./pages/Calculators"));
const ProgressPage = lazy(() => import("./pages/Progress"));
const Settings = lazy(() => import("./pages/Settings"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading page">
      <div className="skeleton h-3 w-28" />
      <div className="skeleton h-10 w-80 max-w-full" />
      <div className="skeleton h-4 w-2/3" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="skeleton h-52" />
        <div className="skeleton h-52" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Shell>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:unit" element={<UnitPage />} />
          <Route path="/learn/:unit/:sub" element={<SubunitPage />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/periodic" element={<Periodic />} />
          <Route path="/reference" element={<Reference />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Shell>
  );
}
