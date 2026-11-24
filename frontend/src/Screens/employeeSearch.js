import { useState } from "react";
import { searchEmployees } from "../api/employees";

export default function EmployeeSearch() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();
    setError("");
    setEmployees([]);
    setSearched(false);

    const form = new FormData(event.currentTarget);
    const department = form.get("department").trim();
    const position = form.get("position").trim();
    if (!department && !position) {
      setError("Enter a department, a position, or both to search.");
      return;
    }

    if (!localStorage.getItem("token")) {
      setError("Log in to search your employees.");
      return;
    }

    const params = {};
    if (department) params.department = department;
    if (position) params.position = position;
    setLoading(true);

    try {
      const response = await searchEmployees(params);

      setEmployees(Array.isArray(response.data) ? response.data : []);
      setSearched(true);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ width: "min(900px, 92vw)", margin: "24px auto" }}>
      <h2>Search Employees</h2>
      <form onSubmit={handleSearch}>
        <label>
          Department <input name="department" placeholder="e.g. Engineering" />
        </label>
        <br />
        <label>
          Position <input name="position" placeholder="e.g. Developer" />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p role="alert" style={{ color: "salmon" }}>{error}</p>}
      {searched && employees.length === 0 && <p>No matching employees found.</p>}
      {employees.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ margin: "20px auto", borderCollapse: "collapse", color: "white" }}>
            <thead>
              <tr>
                {["Name", "Email", "Position", "Department", "Salary", "Date joined"].map((heading) => (
                  <th key={heading} style={{ padding: 8, borderBottom: "1px solid white" }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id}>
                  <td style={{ padding: 8 }}>{employee.first_name} {employee.last_name}</td>
                  <td style={{ padding: 8 }}>{employee.email}</td>
                  <td style={{ padding: 8 }}>{employee.position}</td>
                  <td style={{ padding: 8 }}>{employee.department}</td>
                  <td style={{ padding: 8 }}>{employee.salary}</td>
                  <td style={{ padding: 8 }}>{employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
