import { useState, useEffect } from "react";
import AddEmployeeModal from "@/components/AddEmployeeModal";

export default function EmployeeTable() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("/api/hradmin/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data));
  }, []);

  return (
    <div className="bg-gray-900 p-6 rounded-xl">
      <button onClick={() => setShowModal(true)} className="bg-blue-600 px-4 py-2 rounded-lg">
        + Add Employee
      </button>

      <table className="w-full mt-4">
        <thead>
          <tr className="bg-gray-800">
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id} className="bg-gray-700">
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>{emp.department}</td>
              <td>
                <button className="text-yellow-400 px-2">Edit</button>
                <button className="text-red-400 px-2">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && <AddEmployeeModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
