import { useState } from "react";
import { addEmployee } from "../api/employees";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

export default function EmployeeAdd() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pictureName, setPictureName] = useState("");

  async function handleAddEmployee(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!localStorage.getItem("token")) {
      setError("Log in before adding an employee.");
      return;
    }

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const picture = form.get("profile_picture");
    if (picture?.size) {
      if (!allowedImageTypes.includes(picture.type)) {
        setError("Profile picture must be a JPEG, PNG, or WebP image.");
        return;
      }
      if (picture.size > 2 * 1024 * 1024) {
        setError("Profile picture must be 2 MB or smaller.");
        return;
      }
    } else {
      form.delete("profile_picture");
    }

    try {
      await addEmployee(form);
      formElement.reset();
      setPictureName("");
      setMessage("Employee added successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Could not connect to the server.");
    }
  }

  return (
    <section className="page-shell narrow-shell">
      <div className="page-heading">
        <span className="eyebrow">PEOPLE DIRECTORY</span>
        <h1>Add an employee</h1>
        <p>Enter the employee details and add an optional profile photo.</p>
      </div>
      <form className="panel form-grid" onSubmit={handleAddEmployee}>
        <label>First name<input name="first_name" autoComplete="given-name" required /></label>
        <label>Last name<input name="last_name" autoComplete="family-name" required /></label>
        <label>Email<input type="email" name="email" autoComplete="email" required /></label>
        <label>Position<input name="position" required /></label>
        <label>Department<input name="department" required /></label>
        <label>Salary<input type="number" name="salary" min="0" step="0.01" required /></label>
        <label>Date of joining<input type="date" name="date_of_joining" required /></label>
        <label className="wide-field">Profile picture <span className="field-hint">Optional · JPEG, PNG, or WebP · up to 2 MB</span>
          <input type="file" name="profile_picture" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPictureName(event.target.files?.[0]?.name || "")} />
          {pictureName && <small className="field-hint">Selected: {pictureName}</small>}
        </label>
        {error && <p className="form-error wide-field" role="alert">{error}</p>}
        {message && <p className="form-success wide-field" role="status">{message}</p>}
        <div className="form-actions wide-field">
          <button className="button-primary" type="submit">Save employee</button>
          <a className="button-secondary" href="/contact">Cancel</a>
        </div>
      </form>
    </section>
  );
}
