import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompanies } from "../redux/slices/companiesSlice";

export default function CompaniesPage() {
  const dispatch = useDispatch();
  const { companies, loading, error } = useSelector((state) => state.companies);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  return (
    <div>
      <h1>Companies</h1>
      {loading && <p>Loading companies...</p>}
      {error && <p>Error: {error}</p>}
      <ul>
        {companies.map((company) => (
          <li key={company.id}>{company.name} - {company.email} - {company.phone} - {company.regAdd} - {company.gst}</li>
        ))}
      </ul>
    </div>
  );
}
