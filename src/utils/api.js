export const fetchCompanies = async () => {
    const res = await fetch("/api/superadmin/companies");
    return res.json();
  };
  
  export const createCompany = async (companyData) => {
    const res = await fetch("/api/superadmin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyData),
    });
    return res.json();
  };
  
  export const updateCompany = async (id, updateData) => {
    const res = await fetch("/api/superadmin/companies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updateData }),
    });
    return res.json();
  };
  
  export const deleteCompany = async (id) => {
    const res = await fetch("/api/superadmin/companies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res.json();
  };
  