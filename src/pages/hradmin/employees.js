import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Search, UserPlus, Calendar } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "@/redux/slices/employeeSlice";
import withAuth from "@/components/withAuth";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { Badge } from "@/components/ui/badge";

function Employees() {
  const [activeTab, setActiveTab] = useState("Basic");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [selectedYear, setSelectedYear] = useState("2024");
  const router = useRouter();
  const dispatch = useDispatch();
  const { employees, loading, err } = useSelector((state) => state.employees);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  console.log("Employees:", employees);

  const handleRowClick = (employee) => {
    // Map the active tab to the corresponding section in the Add New Employee form
    let activeSection = "personal"; // Default to personal section
    
    switch (activeTab) {
      case "ID Proofs":
        activeSection = "idProofs";
        break;
      case "Salary Details":
        activeSection = "salary";
        break;
      case "Bank Details":
        activeSection = "bank";
        break;
      default:
        activeSection = "personal";
    }
    
    router.push({
      pathname: "/hradmin/addNewEmployee",
      query: { 
        employee: JSON.stringify(employee), 
        activeMainTab: activeTab,
        activeSection: activeSection 
      },
    });
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  const handleMonthSelection = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsCalendarOpen(false);
  };

  const filteredEmployees = (employees || []).filter((employee) =>
    employee?.name?.toLowerCase().includes(searchInput.toLowerCase())
  );

  const tabs = ['Basic', 'ID Proofs', 'Salary Details', 'Bank Details', 'Leaves Policy'];

  const getTableHeaders = () => {
    switch (activeTab) {
      case 'Basic':
        return [
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'name', label: 'Name' },
          { key: 'fathersName', label: "Father's Name" },
          { key: 'phone', label: 'Phone No.' },
          { key: 'emailOfficial', label: 'Email(Off.)' },
          { key: 'joiningDate', label: 'DOJ' },
          { key: 'designation', label: 'Designation' },
          { key: 'currentAddress', label: 'Current Address' },
        ];
      case 'ID Proofs':
        return [
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'name', label: 'Name' },
          { key: 'aadharNo', label: 'Aadhar no.' },
          { key: 'panNo', label: 'PAN no.' },
          { key: 'voterId', label: 'Voter ID' },
          { key: 'passport', label: 'Passport no.' },
          { key: 'drivingLicense', label: 'Driving License' },
        ];
      case 'Salary Details':
        return [
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'name', label: 'Name' },
          { key: 'annualCtc', label: 'Annual CTC' },
          { key: 'monthlyCtc', label: 'Monthly CTC' },
          { key: 'basicSalary', label: 'Basic' },
          { key: 'hra', label: 'HRA' },
          { key: 'allowances', label: 'Allowance' },
          { key: 'employerPfContribution', label: 'Employer PF' },
          { key: 'employeePfContribution', label: 'Employee PF' },
        ];
      case 'Bank Details':
        return [
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'name', label: 'Name' },
          { key: 'accountHolderName', label: 'Account Holder Name' },
          { key: 'accountNumber', label: 'Account no.' },
          { key: 'bankName', label: 'Bank Name' },
          { key: 'branchName', label: 'Branch Name' },
          { key: 'upiId', label: 'UPI ID' },
          { key: 'upiPhoneNumber', label: 'UPI Number' },
          { key: 'passbookDoc', label: 'Passbook Doc' },
        ];
      case 'Leaves Policy':
        return [
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'name', label: 'Name' },
          { key: 'department', label: 'Department' },
          { key: 'leavePolicy', label: 'Leave Policy' },
          { key: 'leaveType', label: 'Leave Types' }
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
        if (key === 'name' || key === 'employeeId') return employee[key] || '';
        return employee.idProofs ? employee.idProofs[key] || '' : '';
      case 'Salary Details':
        if (key === 'name' || key === 'employeeId') return employee[key] || '';
        return employee.salaryDetails ? employee.salaryDetails[key] || '' : '';
      case 'Bank Details':
        if (key === 'name' || key === 'employeeId') return employee[key] || '';
        if (key === 'passbookDoc') {
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // const modal = document.createElement('div');
                // modal.innerHTML = `
                //   <div class="bg-white p-4 rounded-lg max-w-md">
                //     <div class="flex justify-between items-center mb-4">
                //       <h3 class="text-lg font-semibold">Passbook Document</h3>
                //       <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
                //         <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                //           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                //         </svg>
                //       </button>
                //     </div>
                //     <div class="text-center py-4">
                //       <p class="text-gray-600">No doc uploaded</p>
                //     </div>
                //   </div>
                // `;
                // document.body.appendChild(modal);
              }}
              className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
            >
              View Doc
            </button>
          );
        }
        return employee.bankDetails ? employee.bankDetails[key] || '' : '';
      case 'Leaves Policy':
        if (key === 'name' || key === 'employeeId' || key === 'department') return employee[key] || '';
        if (key === 'leavePolicy') return employee.leaveDetails ? employee.leaveDetails[key] || '-' : '-';
        if (key === 'leaveType') {
          const leaveTypes = employee.leaveDetails?.leaveTypes || [];
          return leaveTypes.join(', ') || '-';
        }
        return '';
      default:
        return '';
    }
  };

  const headers = getTableHeaders();

  const handlePassbookView = (imageUrl) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Passbook Document</h3>
          <button class="text-gray-500 hover:text-gray-700" onclick="this.closest('.fixed').remove()">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <img src="${imageUrl}" alt="Passbook" class="max-w-full h-auto" />
      </div>
    `;
    document.body.appendChild(modal);
  };

  const renderBankDetailsRow = (row) => (
    <tr key={row.id}>
      <td className="px-5 py-4 text-sm">{row.name}</td>
      <td className="px-5 py-4 text-sm">{row.accountHolderName}</td>
      <td className="px-5 py-4 text-sm">{row.accountNumber}</td>
      <td className="px-5 py-4 text-sm">{row.bankName}</td>
      <td className="px-5 py-4 text-sm">{row.ifscCode}</td>
      <td className="px-5 py-4 text-sm">{row.branchName}</td>
      <td className="px-5 py-4 text-sm">{row.upiId}</td>
      <td className="px-5 py-4 text-sm">{row.upiNumber}</td>
      <td className="px-5 py-4 text-sm">
        <button
          onClick={() => handlePassbookView(row.passbookDoc)}
          className="text-blue-600 hover:text-blue-800"
        >
          View Details
        </button>
      </td>
    </tr>
  );

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
          {/* Header with Search and Title */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 mb-4">
                Employee Management
              </h1>
              <button
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => router.push({ pathname: "/hradmin/addNewEmployee", query: { activeMainTab: activeTab } })}
              >
                <UserPlus className="h-5 w-5" />
                Add Employee
              </button>
            </div>
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="Search..."
                className="w-full md:w-72 pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="w-full">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {headers.map((header) => (
                      <th 
                        key={header.key} 
                        className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider"
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
                    filteredEmployees.map((employee) => (
                      <tr 
                        key={employee.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(employee)}
                      >
                        {headers.map((header) => (
                          <td 
                            key={header.key}
                            className="py-3 px-4 text-sm text-gray-800 truncate"
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
