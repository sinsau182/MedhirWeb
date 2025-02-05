const address = "/api/superadmin/companies";
// /api/superadmin/companies
// http://localhost:3001/companies

export const fetchCompanies = async () => {
    const res = await fetch(`${address}`);
    return res.json();
  };
  
  export const createCompany = async (companyData) => {
    const res = await fetch(`${address}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyData),
    });
    return res.json();
  };
  
  export const updateCompany = async (id, updateData) => {
    const res = await fetch(`${address}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updateData }),
    });
    return res.json();
  };
  
  export const deleteCompany = async (id) => {
    const res = await fetch(`${address}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res.json();
  };






  
  export const fetchUsers = async () => {
    const res = await fetch("/api/superadmin/user");
    return res.json();
  };


    export const createUser = async (userData) => {
        const res = await fetch("/api/superadmin/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        });
        return res.json();
    };

    export const updateUser = async (id, updateData) => {
        const res = await fetch("/api/superadmin/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updateData }),
        });
        return res.json();
    };

    export const deleteUser = async (id) => {
        const res = await fetch("/api/superadmin/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        });
        return res.json();
    };
  