import { useEffect, useState } from 'react';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetch('/api/companies')
      .then((res) => res.json())
      .then((data) => setCompanies(data.companies)) // Adjust key based on response structure
      .catch((err) => console.error('Error fetching companies:', err));
  }, []);

  return (
    <div>
      <h1>Companies</h1>
      <ul>
        {companies.map((company, index) => (
          <li key={index}>{company.name}</li> // Adjust field based on response
        ))}
      </ul>
    </div>
  );
}
