import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { PROFILE_URL } from "../constants/routes";

const tasks = [
  { label: "Review pull request #42",     status: "In Progress", badge: "warning"   },
  { label: "Update API documentation",    status: "Pending",     badge: "secondary" },
  { label: "Fix login redirect bug",      status: "Done",        badge: "success"   },
  { label: "Write unit tests",            status: "Pending",     badge: "secondary" },
  { label: "Deploy to staging",           status: "Done",        badge: "success"   },
];

const statColors = ["#22528e", "#198754", "#fd7e14", "#6f42c1"];

function DashboardPage({ user }) {
  const name = user?.name || "there";

  const stats = [
    { label: "Tasks",     value: 7  },
    { label: "Messages",  value: 12 },
    { label: "Projects",  value: 3  },
    { label: "Completed", value: 24 },
  ];

  return (
    <div className="logged-dashboard">

      {/* Header */}
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-4">
        <div>
          <h4 className="fw-semibold mb-1">Hello, {name}</h4>
          <p className="text-muted small mb-0">Here's what's happening today.</p>
        </div>
        <Link to={PROFILE_URL} className="btn btn-outline-primary btn-sm">
          My Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-3">
        {stats.map((s, i) => (
          <div key={s.label} className="col-6 col-md-3">
            <div className="card border-0 shadow-sm h-100 p-3">
              <div className="fw-bold fs-3 mb-1" style={{ color: statColors[i] }}>
                {s.value}
              </div>
              <div className="text-muted small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tasks + Quick Actions */}
      <div className="row g-3">
        <div className="col-12 col-md-7">
          <div className="card border-0 shadow-sm h-100 p-3">
            <h6 className="fw-semibold mb-3">Recent Tasks</h6>
            <ul className="list-unstyled mb-0">
              {tasks.map((t, i) => (
                <li key={i} className={`d-flex align-items-center gap-2 py-2 ${i < tasks.length - 1 ? "border-bottom" : ""}`}>
                  <span className="flex-grow-1 small">{t.label}</span>
                  <span className={`badge bg-${t.badge}`}>{t.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-12 col-md-5">
          <div className="card border-0 shadow-sm h-100 p-3">
            <h6 className="fw-semibold mb-3">Quick Actions</h6>
            <div className="d-grid gap-2">
              <button className="btn btn-outline-primary btn-sm text-start">+ New Task</button>
              <button className="btn btn-outline-secondary btn-sm text-start">+ New Project</button>
              <button className="btn btn-outline-secondary btn-sm text-start">Send Message</button>
              <button className="btn btn-outline-secondary btn-sm text-start">View Reports</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

const mapStateToProps = (state) => ({ user: state.auth.user });
export default connect(mapStateToProps)(DashboardPage);
