import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

/**
 * Formats a YYYY-MM-DD date string into a more readable format for preview.
 * Falls back to original value if parsing fails.
 */
function formatDateForPreview(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

/**
 * Minimal modal shell (no external dependencies).
 */
function ModalShell({ title, onClose, children }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16
      }}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: "pointer"
        }}
      />
      {/* Panel */}
      <div
        style={{
          position: "relative",
          width: "min(720px, 100%)",
          borderRadius: 16,
          overflow: "hidden",
          background: "#0b1220",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45)"
        }}
      >
        <div
          style={{
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.10)"
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.95)" }}>{title}</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              appearance: "none",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.9)",
              borderRadius: 10,
              padding: "8px 10px",
              cursor: "pointer",
              fontWeight: 700
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

/**
 * Schedule Meeting modal UI.
 * - Keeps existing date & time pickers (implemented here as native inputs).
 * - Adds required "Meeting Purpose" textarea (UI-only).
 * - Shows preview/summary of entered values before confirming.
 */
function ScheduleMeetingModal({ open, onClose }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");

  const [touched, setTouched] = useState({ date: false, startTime: false, endTime: false, purpose: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const purposeTrimmed = useMemo(() => purpose.trim(), [purpose]);

  const errors = useMemo(() => {
    const next = {};
    if (!date) next.date = "Please choose a date.";
    if (!startTime) next.startTime = "Please choose a start time.";
    if (!endTime) next.endTime = "Please choose an end time.";
    if (startTime && endTime && endTime <= startTime) next.endTime = "End time must be after start time.";
    if (!purposeTrimmed) next.purpose = "Meeting purpose is required.";
    return next;
  }, [date, startTime, endTime, purposeTrimmed]);

  const canSubmit = Object.keys(errors).length === 0;

  // Reset on open/close for a clean UX.
  useEffect(() => {
    if (!open) return;
    setDate("");
    setStartTime("");
    setEndTime("");
    setPurpose("");
    setTouched({ date: false, startTime: false, endTime: false, purpose: false });
    setSubmitAttempted(false);
  }, [open]);

  if (!open) return null;

  const showError = (field) => submitAttempted || touched[field];

  const inputBase = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.95)",
    outline: "none"
  };

  const labelStyle = { fontSize: 12, fontWeight: 800, letterSpacing: 0.3, color: "rgba(255,255,255,0.85)" };

  return (
    <ModalShell title="Schedule Meeting" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitAttempted(true);
          if (!canSubmit) return;

          // UI-only confirmation (no backend).
          // Keeping UX minimal: just close after a basic client-side "confirm".
          onClose();
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 14
          }}
        >
          <div style={{ gridColumn: "span 12" }}>
            <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 13, lineHeight: 1.35 }}>
              Pick a date and time, then provide a short agenda so the intern knows what to prepare.
            </div>
          </div>

          {/* Date */}
          <div style={{ gridColumn: "span 12" }}>
            <label style={labelStyle} htmlFor="meeting-date">
              Date
            </label>
            <div style={{ marginTop: 8 }}>
              <input
                id="meeting-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, date: true }))}
                style={inputBase}
              />
              {showError("date") && errors.date ? (
                <div style={{ marginTop: 8, color: "#EF4444", fontSize: 12, fontWeight: 700 }}>{errors.date}</div>
              ) : null}
            </div>
          </div>

          {/* Time pickers */}
          <div style={{ gridColumn: "span 6" }}>
            <label style={labelStyle} htmlFor="meeting-start">
              Start time
            </label>
            <div style={{ marginTop: 8 }}>
              <input
                id="meeting-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, startTime: true }))}
                style={inputBase}
              />
              {showError("startTime") && errors.startTime ? (
                <div style={{ marginTop: 8, color: "#EF4444", fontSize: 12, fontWeight: 700 }}>
                  {errors.startTime}
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ gridColumn: "span 6" }}>
            <label style={labelStyle} htmlFor="meeting-end">
              End time
            </label>
            <div style={{ marginTop: 8 }}>
              <input
                id="meeting-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, endTime: true }))}
                style={inputBase}
              />
              {showError("endTime") && errors.endTime ? (
                <div style={{ marginTop: 8, color: "#EF4444", fontSize: 12, fontWeight: 700 }}>{errors.endTime}</div>
              ) : null}
            </div>
          </div>

          {/* NEW: Meeting Purpose */}
          <div style={{ gridColumn: "span 12" }}>
            <label style={labelStyle} htmlFor="meeting-purpose">
              Meeting Purpose <span style={{ color: "#F97316" }}>*</span>
            </label>
            <div style={{ marginTop: 8 }}>
              <textarea
                id="meeting-purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, purpose: true }))}
                placeholder="Describe the purpose or agenda..."
                rows={4}
                style={{
                  ...inputBase,
                  resize: "vertical",
                  minHeight: 110
                }}
              />
              {showError("purpose") && errors.purpose ? (
                <div style={{ marginTop: 8, color: "#EF4444", fontSize: 12, fontWeight: 700 }}>{errors.purpose}</div>
              ) : (
                <div style={{ marginTop: 8, color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                  Keep it concise—bullets are fine.
                </div>
              )}
            </div>
          </div>

          {/* Preview / summary */}
          <div style={{ gridColumn: "span 12" }}>
            <div
              style={{
                borderRadius: 14,
                padding: 14,
                border: "1px solid rgba(16, 185, 129, 0.25)",
                background: "rgba(16, 185, 129, 0.10)"
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 900, color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>
                Preview
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 10 }}>
                <div style={{ gridColumn: "span 12", color: "rgba(255,255,255,0.75)", fontSize: 13 }}>
                  <span style={{ fontWeight: 800, color: "rgba(255,255,255,0.92)" }}>When:</span>{" "}
                  {date ? formatDateForPreview(date) : "—"}{" "}
                  {startTime && endTime ? `• ${startTime}–${endTime}` : ""}
                </div>

                <div style={{ gridColumn: "span 12" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.88)", marginBottom: 6 }}>
                    Purpose:
                  </div>
                  <div
                    style={{
                      whiteSpace: "pre-wrap",
                      borderRadius: 12,
                      padding: 12,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(0,0,0,0.18)",
                      color: purposeTrimmed ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.45)",
                      fontSize: 13,
                      lineHeight: 1.45
                    }}
                  >
                    {purposeTrimmed || "Describe the purpose or agenda..."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ gridColumn: "span 12", display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                borderRadius: 12,
                padding: "10px 14px",
                border: "1px solid rgba(255,255,255,0.16)",
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.9)",
                cursor: "pointer",
                fontWeight: 800
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!canSubmit && submitAttempted}
              style={{
                borderRadius: 12,
                padding: "10px 14px",
                border: "1px solid rgba(0,0,0,0.0)",
                background: "#0f766e", // dark teal themed button
                color: "white",
                cursor: "pointer",
                fontWeight: 900,
                opacity: !canSubmit && submitAttempted ? 0.65 : 1
              }}
              title={!canSubmit ? "Please complete required fields" : "Confirm meeting"}
            >
              Confirm Meeting
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState("dark");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className="App">
      <header
        className="App-header"
        style={{
          // Light teal dashboard background per request; keep bold/dark shell on top.
          background:
            theme === "light"
              ? "linear-gradient(135deg, rgba(45,212,191,0.20) 0%, rgba(16,185,129,0.12) 40%, rgba(0,0,0,0.00) 100%), #ecfeff"
              : "linear-gradient(135deg, rgba(15,118,110,0.35) 0%, rgba(249,115,22,0.12) 40%, rgba(0,0,0,0.00) 100%), #050a14"
        }}
      >
        <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>

        <div
          style={{
            width: "min(980px, 92vw)",
            textAlign: "left",
            padding: "28px 22px",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.10)",
            background: theme === "light" ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.06)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.22)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.3 }}>
                Mentor Dashboard
              </div>
              <div style={{ marginTop: 6, color: theme === "light" ? "rgba(0,0,0,0.60)" : "rgba(255,255,255,0.70)", fontSize: 14 }}>
                Schedule meetings, review intern updates, and keep everything aligned.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsScheduleOpen(true)}
              style={{
                borderRadius: 14,
                padding: "12px 16px",
                border: "1px solid rgba(0,0,0,0.0)",
                background: "#0f766e", // dark teal
                color: "white",
                cursor: "pointer",
                fontWeight: 900,
                whiteSpace: "nowrap"
              }}
            >
              Schedule Meeting
            </button>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gap: 14
            }}
          >
            <div
              style={{
                gridColumn: "span 12",
                borderRadius: 16,
                padding: 16,
                background: theme === "light" ? "rgba(45,212,191,0.16)" : "rgba(16,185,129,0.10)",
                border: "1px solid rgba(16,185,129,0.20)"
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 6 }}>Tip</div>
              <div style={{ fontSize: 13, color: theme === "light" ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.70)", lineHeight: 1.45 }}>
                Use the new <strong>Meeting Purpose</strong> field to share agenda and expected prep. It’s required before confirming.
              </div>
            </div>
          </div>
        </div>

        <ScheduleMeetingModal open={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
      </header>
    </div>
  );
}

export default App;
