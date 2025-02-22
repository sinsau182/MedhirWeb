export const fetchEmployees = async () => {
  const res = await fetch("/api/hradmin/employee");
  return res.json();
};


export const createEmployee = async (employeeData) => {
  const res = await fetch("/api/hradmin/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employeeData),
  });
  return res.json();
}


export const updateEmployee = async (id, updateData) => {
  try {
    const res = await fetch("/api/hradmin/employee", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updateData }),
    });

    let responseData;
    try {
      responseData = await res.json(); // Read response once
    } catch (error) {
      console.log("Error parsing JSON response:", error);
      console.error("Error parsing JSON response:", error);
      responseData = { error: "Invalid JSON response from server" }; // Handle JSON parsing errors
    }

    if (!res.ok) {
      throw new Error(`Failed to update employee: ${responseData.error || JSON.stringify(responseData)}`);
    }

    return responseData;
  } catch (error) {
    console.error("Error updating employee:", error);
    return { error: error.message };
  }
};


export const deleteEmployee = async (id) => {
  const res = await fetch("/api/hradmin/employee", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  return res.json();
};
