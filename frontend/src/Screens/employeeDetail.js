import { useEffect, useState } from "react";
import { getEmployee, updateEmployee } from "../api/employees";

const apiBase = process.env.REACT_APP_API_URL || "http://localhost:3000";
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
function dateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export default function EmployeeDetail() {
  const employeeId = new URLSearchParams(window.location.search).get("id");
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadEmployee() {
      if (!localStorage.getItem("token")) {
        setError("Log in to view this employee.");
        setLoading(false);
        return;
      }
      if (!employeeId) {
        setError("Employee ID is missing from the URL.");
        setLoading(false);
        return;
      }
      try {
        const response = await getEmployee(employeeId);
        if (active) setEmployee(response.data.employee);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.error || "Could not load employee.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadEmployee();
    return () => { active = false; };
  }, [employeeId]);

  async function handleUpdate(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const picture = form.get("profile_picture");
    if (picture?.size && !allowedImageTypes.includes(picture.type)) {
      setError("Profile picture must be a JPEG, PNG, or WebP image.");
      return;
    }
    if (picture?.size > 2 * 1024 * 1024) {
      setError("Profile picture must be 2 MB or smaller.");
      return;
    }
    if (!picture?.size) form.delete("profile_picture");

    try {
      await updateEmployee(employeeId, form);
      const refreshed = await getEmployee(employeeId);
      setEmployee(refreshed.data.employee);
      setMessage("Employee updated successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not update employee.");
    }
  }

  return (
    <section className="page-shell narrow-shell">
      <a className="back-link" href="/contact">← Back to employees</a>
      <div className="page-heading">
        <span className="eyebrow">EMPLOYEE RECORD</span>
        <h1>{employee ? `${employee.first_name} ${employee.last_name}` : "View / edit employee"}</h1>
        <p>Review and update this employee’s information.</p>
      </div>
      {loading && <div className="panel empty-state">Loading employee…</div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {employee && !loading && (
        <form className="panel form-grid" onSubmit={handleUpdate}>
          {employee.profile_picture && <img className="detail-avatar wide-field" src={`${apiBase}${employee.profile_picture}`} alt={`${employee.first_name} ${employee.last_name}`} />}
          <label>First name<input name="first_name" defaultValue={employee.first_name} required /></label>
          <label>Last name<input name="last_name" defaultValue={employee.last_name} required /></label>
          <label>Email<input type="email" name="email" defaultValue={employee.email} required /></label>
          <label>Position<input name="position" defaultValue={employee.position} required /></label>
          <label>Department<input name="department" defaultValue={employee.department} required /></label>
          <label>Salary<input type="number" name="salary" min="0" step="0.01" defaultValue={employee.salary} required /></label>
          <label>Date of joining<input type="date" name="date_of_joining" defaultValue={dateInputValue(employee.date_of_joining)} required /></label>
          <label className="wide-field">Replace profile picture <span className="field-hint">Optional · JPEG, PNG, or WebP · up to 2 MB. Leave blank to keep current picture.</span>
            <input type="file" name="profile_picture" accept="image/jpeg,image/png,image/webp" />
          </label>
          {error && <p className="form-error wide-field" role="alert">{error}</p>}
          {message && <p className="form-success wide-field" role="status">{message}</p>}
          <div className="form-actions wide-field">
            <button className="button-primary" type="submit">Save changes</button>
            <a className="button-secondary" href="/contact">Cancel</a>
          </div>
        </form>
      )}
    </section>
  );
}
