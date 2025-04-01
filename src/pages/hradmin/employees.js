import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Search, UserPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "@/redux/slices/employeeSlice";
import withAuth from "@/components/withAuth";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";

function Employees() {
  const [activeTab, setActiveTab] = useState("Basic");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const { employees, loading, err } = useSelector((state) => state.employees);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleRowClick = (employee) => {
    router.push({
      pathname: "/hradmin/addNewEmployee",
      query: { employee: JSON.stringify(employee), activeMainTab: activeTab },
    });
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const filteredEmployees = (employees || []).filter((employee) =>
    employee?.name?.toLowerCase().includes(searchInput.toLowerCase())
  );

  const tabs = ['Basic', 'ID Proofs', 'Salary Details', 'Bank Details', 'Leaves Policy'];

  const getTableHeaders = () => {
    switch (activeTab) {
      case 'Basic':
        return [
          { key: 'name', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone no.' },
          { key: 'department', label: 'Department' },
          { key: 'gender', label: 'Gender' },
          { key: 'title', label: 'Title' },
          { key: 'reportingManager', label: 'Reporting Manager' },
        ];
      case 'ID Proofs':
        return [
          { key: 'name', label: 'Name' },
          { key: 'aadharNo', label: 'Aadhar no.' },
          { key: 'panNo', label: 'PAN no.' },
          { key: 'voterId', label: 'Voter ID' },
          { key: 'passport', label: 'Passport no.' },
        ];
      case 'Salary Details':
        return [
          { key: 'name', label: 'Name' },
          { key: 'totalCtc', label: 'Total CTC' },
          { key: 'basic', label: 'Basic' },
          { key: 'hra', label: 'HRA' },
          { key: 'allowances', label: 'Allowance' },
          { key: 'pf', label: 'PF' },
        ];
      case 'Bank Details':
        return [
          { key: 'name', label: 'Name' },
          { key: 'accountHolderName', label: 'Account Holder Name' },
          { key: 'accountNumber', label: 'Account no.' },
          { key: 'bankName', label: 'Bank Name' },
          { key: 'ifscCode', label: 'IFSC' },
          { key: 'branchName', label: 'Branch Name' },
        ];
      default:
        return [];
    }
  };

  const getCellValue = (employee, key) => {
    if (!employee) return '';
    
    switch (activeTab) {
      case 'Basic':
        return employee[key] || '';
      case 'ID Proofs':
        if (key === 'name') return employee.name || '';
        return employee.idProofs ? employee.idProofs[key] || '' : '';
      case 'Salary Details':
        if (key === 'name') return employee.name || '';
        return employee.salaryDetails ? employee.salaryDetails[key] || '' : '';
      case 'Bank Details':
        if (key === 'name') return employee.name || '';
        return employee.bankDetails ? employee.bankDetails[key] || '' : '';
      default:
        return '';
    }
  };

  const headers = getTableHeaders();

  if (err) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className={`flex-1 ${isSidebarCollapsed ? "ml-16" : "ml-64"} transition-all duration-300`}>
          <HradminNavbar />
          <div className="p-6 mt-16">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Error: {err}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 ${isSidebarCollapsed ? "ml-16" : "ml-64"} transition-all duration-300`}>
        <HradminNavbar />

        <div className="p-6 mt-16">
          {/* Header with Add Employee button and Search */}
          <div className="flex justify-between items-center mb-6">
            <button 
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => router.push({ pathname: "/hradmin/addNewEmployee", query: { activeMainTab: activeTab } })}
            >
              <UserPlus className="h-5 w-5" />
              Add Employee
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Employee Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="w-full overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {headers.map((header) => (
                      <th 
                        key={header.key} 
                        className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                      >
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={headers.length} className="text-center py-3 text-sm text-gray-500">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                          Loading...
                        </div>
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={headers.length} className="text-center py-3 text-sm text-gray-500">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee, index) => (
                      <tr
                        key={employee._id || index}
                        onClick={() => handleRowClick(employee)}
                        className="hover:bg-blue-50/50 transition-colors cursor-pointer text-sm"
                      >
                        {headers.map((header) => (
                          <td 
                            key={header.key} 
                            className="py-2.5 px-4 whitespace-nowrap text-gray-600"
                          >
                            {getCellValue(employee, header.key)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Employees);
