import { Component, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error("Portfolio render error:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center px-5 py-12">
          <section className="w-full max-w-xl  border border-line bg-surface p-8 shadow-xl shadow-slate-900/5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Portfolio</p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">This page could not load.</h1>
            <p className="mt-2 text-muted">Refresh the page. If it continues, send this error to your developer:</p>
            <pre className="mt-5 overflow-x-auto whitespace-pre-wrap  bg-bg p-4 text-sm text-ink">{this.state.error.message}</pre>
            <button type="button" onClick={() => window.location.reload()} className="mt-5  bg-accent px-4 py-2.5 font-semibold text-on-accent">Reload page</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>
);
