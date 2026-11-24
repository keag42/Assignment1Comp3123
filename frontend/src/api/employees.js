import api from "./client";

export const getEmployees = () => api.get("/api/v1/emp/employees");

export const getEmployee = (id) => api.get(`/api/v1/emp/employees/${id}`);

export const searchEmployees = (params) =>
  api.get("/api/v1/emp/employees/search", { params });

export const addEmployee = (employee) =>
  api.post("/api/v1/emp/employees", employee);

export const updateEmployee = (id, employee) =>
  api.put(`/api/v1/emp/employees/${id}`, employee);

export const deleteEmployee = (id) =>
  api.delete("/api/v1/emp/employees", { params: { eid: id } });
