import { useCallback, useEffect, useState } from "react";
import { deleteEmployee, getEmployees } from "../api/employees";

const apiBase = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function EmployeeView() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getEmployees();
      setEmployees(response.data.emps || []);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not load employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setError("Log in to view your employee directory.");
      setLoading(false);
      return;
    }
    loadEmployees();
  }, [loadEmployees]);

  async function handleDelete(employee) {
    if (!window.confirm(`Delete ${employee.first_name} ${employee.last_name}? This cannot be undone.`)) return;
    setError("");
    try {
      await deleteEmployee(employee._id);
      setEmployees((current) => current.filter((item) => item._id !== employee._id));
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not delete employee.");
    }
  }

  return (
    <section className="page-shell">
      <div className="page-heading heading-row">
        <div>
          <span className="eyebrow">PEOPLE DIRECTORY</span>
          <h1>Your employees</h1>
          <p>Manage the employee records in your account.</p>
        </div>
        <a className="button-primary" href="/services">＋ Add employee</a>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
      {loading && <div className="panel empty-state">Loading your employees…</div>}
      {!loading && !error && employees.length === 0 && (
        <div className="panel empty-state"><h2>No employees yet</h2><p>Add your first employee to start building your directory.</p><a className="button-primary" href="/services">Add employee</a></div>
      )}
      {!loading && employees.length > 0 && (
        <div className="employee-grid">
          {employees.map((employee) => (
            <article className="employee-card" key={employee._id}>
              {employee.profile_picture ? (
                <img className="employee-avatar" src={`${apiBase}${employee.profile_picture}`} alt={`${employee.first_name} ${employee.last_name}`} />
              ) : (
                <div className="employee-avatar avatar-placeholder" aria-hidden="true">{employee.first_name?.[0]}{employee.last_name?.[0]}</div>
              )}
              <div className="employee-card-main">
                <span className="employee-department">{employee.department}</span>
                <h2>{employee.first_name} {employee.last_name}</h2>
                <p className="employee-position">{employee.position}</p>
                <p className="employee-email">{employee.email}</p>
                <p className="employee-meta">Joined {employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : "—"} · ${Number(employee.salary).toLocaleString()}</p>
              </div>
              <div className="card-actions">
                <a className="button-secondary" href={`/employee?id=${encodeURIComponent(employee._id)}`}>View / edit</a>
                <button className="button-danger" type="button" onClick={() => handleDelete(employee)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
