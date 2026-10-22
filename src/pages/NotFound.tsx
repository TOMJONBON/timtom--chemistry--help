import { Link } from "react-router-dom";
import { FlaskConical } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <div className="grid size-16 place-items-center rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        <FlaskConical size={28} className="text-[var(--accent)]" />
      </div>
      <p className="mt-4 font-serif text-5xl">404</p>
      <h1 className="mt-2 font-serif text-2xl">This solution didn&apos;t precipitate.</h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
        The page you asked for is not in the course. Try the dashboard, or search with ⌘K.
      </p>
      <div className="mt-5 flex gap-2">
        <Link to="/" className="btn btn-primary">Back to dashboard</Link>
        <Link to="/learn" className="btn btn-secondary">Open Learn</Link>
      </div>
    </div>
  );
}
