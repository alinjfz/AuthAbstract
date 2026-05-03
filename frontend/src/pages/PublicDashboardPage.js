import React from "react";
import { Link } from "react-router-dom";
import { LOGIN_URL, REGISTER_URL } from "../constants/routes";

const stats = [
  { label: "Active Users",    value: "2,481",  trend: "+12% this month"  },
  { label: "Requests Today",  value: "18,392", trend: "+5% vs yesterday" },
  { label: "Uptime",          value: "99.9%",  trend: "Last 30 days"     },
  { label: "Auth Events",     value: "4,200",  trend: "This week"        },
];

const features = [
  { title: "JWT Auth",             desc: "Secure httpOnly cookie-based JWT authentication, ready out of the box." },
  { title: "Email Verification",   desc: "Token-based email verification flow, fully wired end-to-end."          },
  { title: "Password Reset",       desc: "Send reset links by email and confirm securely with a token."          },
  { title: "Profile Management",   desc: "View and manage user profiles with a clean, responsive UI."            },
];

const activity = [
  { text: "New user registered",        time: "2 min ago",   badge: "success"   },
  { text: "Password reset requested",   time: "15 min ago",  badge: "warning"   },
  { text: "Email verified",             time: "1 hr ago",    badge: "info"      },
  { text: "Login from new device",      time: "3 hr ago",    badge: "primary"   },
  { text: "Profile updated",            time: "yesterday",   badge: "secondary" },
];

export default function PublicDashboardPage() {
  return (
    <div className="public-dashboard">

      {/* Hero */}
      <div className="text-center py-4 mb-2">
        <h1 className="fw-semibold mb-2" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}>
          Build faster with AuthAbstract
        </h1>
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: 500, fontSize: "0.95rem" }}>
          A complete authentication starter — login, register, password reset,
          email verification, and profile management, ready to go.
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link to={REGISTER_URL} className="btn btn-primary px-4 fw-semibold">
            Get Started
          </Link>
          <Link to={LOGIN_URL} className="btn btn-outline-secondary px-4">
            Sign In
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        {stats.map((s) => (
          <div key={s.label} className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100 p-3">
              <div className="fw-bold fs-4 mb-1" style={{ color: "#22528e" }}>{s.value}</div>
              <div className="fw-semibold small mb-1">{s.label}</div>
              <div className="text-muted" style={{ fontSize: "0.75rem" }}>{s.trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Features + Activity */}
      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100 p-3">
            <h6 className="fw-semibold mb-3">What's included</h6>
            <div className="row g-3">
              {features.map((f) => (
                <div key={f.title} className="col-12 col-sm-6">
                  <div className="p-3 rounded-3 h-100" style={{ background: "#f8f9fa" }}>
                    <div className="fw-semibold small mb-1">{f.title}</div>
                    <div className="text-muted" style={{ fontSize: "0.8rem" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100 p-3">
            <h6 className="fw-semibold mb-3">Recent Activity</h6>
            <ul className="list-unstyled mb-0">
              {activity.map((a, i) => (
                <li key={i} className={`d-flex align-items-center gap-2 py-2 ${i < activity.length - 1 ? "border-bottom" : ""}`}>
                  <span
                    className={`badge bg-${a.badge} rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0`}
                    style={{ width: 10, height: 10 }}
                  />
                  <span className="flex-grow-1 small">{a.text}</span>
                  <span className="text-muted flex-shrink-0" style={{ fontSize: "0.72rem" }}>{a.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}
