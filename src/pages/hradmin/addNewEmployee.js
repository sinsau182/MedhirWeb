// import { useState, useEffect } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { UserPlus, X } from "lucide-react";
// import { useRouter } from "next/router";
// import { useDispatch, useSelector } from "react-redux";
// import Link from "next/link";
// import { toast } from "sonner";
// import { createEmployee, updateEmployee } from "@/redux/slices/employeeSlice";
// import withAuth from "@/components/withAuth";
// import {
//   FaUserCircle,
//   FaUsers,
//   FaCalendarCheck,
//   FaMoneyCheckAlt,
//   FaCog,
//   FaArrowAltCircleUp,
// } from "react-icons/fa";
// import Sidebar from "@/components/Sidebar";
// import HradminNavbar from "@/components/HradminNavbar";

// function EmployeeForm() {
//   const router = useRouter();
//   const dispatch = useDispatch();
//   const { employees, err } = useSelector((state) => state.employees);
//   console.log(err);

//   const { activeMainTab, employee } = router.query;
//   const [activePage, setActivePage] = useState("Employees");
//   const [activeMain, setActiveMain] = useState(activeMainTab || "Basic");
//   const [employeeId, setEmployeeId] = useState(null);
//   const [selectedTab, setSelectedTab] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   const [previewModal, setPreviewModal] = useState({ show: false });

//   const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

//   const [employeeData, setEmployeeData] = useState({
//     employeeId: "",
//     name: "",
//     fatherName: "",
//     email: {
//       official: "",
//       personal: ""
//     },
//     phone: "",
//     department: "",
//     gender: "",
//     designation: "",
//     dateOfJoining: "",
//     reportingManager: "",
//     permanentAddress: "",
//     currentAddress: "",
//     pfDetails: {
//       isEnrolled: true,
//       uanNumber: ""
//     },
//     esicDetails: {
//       isEnrolled: false,
//       esicNumber: ""
//     },
//     overtimeEligible: false,
//     weeklyOff: [],
//     idProofs: {
//       aadharNo: "",
//       panNo: "",
//       passport: "",
//       drivingLicense: "",
//       voterId: "",
//     },
//     bankDetails: {
//       accountNumber: "",
//       accountHolderName: "",
//       ifscCode: "",
//       bankName: "",
//       branchName: "",
//     },
//     salaryDetails: { totalCtc: "", basic: "", allowances: "", hra: "", pf: "" },
//   });

//   useEffect(() => {
//     if (employee) {
//       try {
//         const parsedEmployee = JSON.parse(employee);
//         setEmployeeData((prev) => ({
//           ...prev,
//           ...parsedEmployee,
//           idProofs: { ...prev.idProofs, ...parsedEmployee.idProofs },
//           bankDetails: { ...prev.bankDetails, ...parsedEmployee.bankDetails },
//           salaryDetails: {
//             ...prev.salaryDetails,
//             ...parsedEmployee.salaryDetails,
//           },
//         }));
//         setEmployeeId(parsedEmployee.id);
//       } catch (error) {
//         console.error("Error parsing employee data", error);
//       }
//     }
//   }, [employee]);

//   const handleInputChange = (e) => {
//     setEmployeeData({ ...employeeData, [e.target.name]: e.target.value });
//   };

//   const handleNestedInputChange = (e, section, key) => {
//     setEmployeeData({
//       ...employeeData,
//       [section]: { ...employeeData[section], [key]: e.target.value || "" },
//     });
//   };

//   const handleEmployeeSubmit = async (event) => {
//     event.preventDefault();
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     const validatePhone = (phone) => {
//       const regex = /^[0-9]{10}$/;
//       return regex.test(phone);
//     };

//     if (!employeeData.name || !employeeData.phone) {
//       toast.error("Name and Phone are required fields.");
//       setLoading(false);
//       return;
//     }

//     if (!validatePhone(employeeData.phone)) {
//       toast.error("Invalid phone number.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const filteredData = JSON.parse(
//         JSON.stringify(employeeData, (key, value) =>
//           value === "" ? null : value
//         )
//       );

//       if (employeeId) {
//         await dispatch(
//           updateEmployee({ id: employeeId, updatedData: filteredData })
//         ).unwrap();
//         toast.success("Employee updated successfully");
//       } else {
//         await dispatch(createEmployee(filteredData)).unwrap();
//         toast.success("Employee created successfully");
//       }
//       router.push("/hradmin/employees");
//     } catch (err) {
//       toast.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTabClick = (tab) => {
//     router.push({
//       pathname: "/hradmin/employees",
//       query: { tab },
//     });
//   };

//   const handleLogout = () => {
//     router.push("/login");
//     localStorage.removeItem("token");
//   };

//   const mainTabs = [
//     "Basic",
//     "ID Proofs",
//     "Salary Details",
//     "Bank Details",
//     "Leaves Policy",
//   ];
//   const subTabs = [
//     "ID Proofs",
//     "Salary Details",
//     "Bank Details",
//     "Leaves & Policies",
//   ];

//   useEffect(() => {
//     if (activeMainTab) setActiveMain(activeMainTab);
//   }, [activeMainTab]);

//   const handlePhotoUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Handle the file upload logic here
//       console.log("Uploaded file:", file);
//     }
//   };

//   const handleFileUpload = (e, key) => {
//     const file = e.target.files[0];
//     if (file) {
//       console.log(`Uploaded file for ${key}:`, file);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">

//       <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

//       <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
//         <HradminNavbar />

//         <div className="p-4 pt-24">
//           <div className="flex items-center justify-between mb-4">
//             <h1 className="text-2xl font-bold text-gray-800 ml-2">New Employee</h1>
//           </div>

//           <form onSubmit={handleEmployeeSubmit}>
//         {/* Employee Card */}
//         <Card className="p-6 bg-white relative">
//           <div className="flex items-center justify-between">
//             <input
//               name="name"
//               className="text-3xl font-bold text-gray-500 border-b-2 border-gray-300 focus:border-black w-[60%] bg-transparent focus:outline-none"
//               value={employeeData.name}
//               onChange={handleInputChange}
//               placeholder="Employee Name"
//               onFocus={(e) => (e.target.style.color = "black")}
//               required
//             />
//             {/* Tabs */}
//             <div className="flex items-center gap-3">
//               {subTabs.map((tab, index) => (
//                 <button
//                   key={tab}
//                   type="button"
//                   className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm
//                     ${selectedTab === tab
//                       ? "bg-blue-600 text-white"
//                       : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
//                     }`}
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setSelectedTab(selectedTab === tab ? null : tab);
//                   }}
//                 >
//                   {tab === "ID Proofs" && (
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7h3a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h3m3-3h3a2 2 0 012 2v3M9 7h3m6 3v2m0 4v2m0-8h.01M9 17h.01" />
//                     </svg>
//                   )}
//                   {tab === "Salary Details" && (
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                   )}
//                   {tab === "Bank Details" && (
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                     </svg>
//                   )}
//                   {tab === "Leaves & Policies" && (
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//                     </svg>
//                   )}
//                   <span className="font-medium">{tab}</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="mt-2 flex items-center gap-4">
//             <input
//               name="designation"
//               className="w-[30%] bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-black focus:outline-none text-gray-400"
//               placeholder="Designation"
//               onChange={handleInputChange}
//               value={employeeData.designation}
//             />
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="overtimeEligible"
//                 checked={employeeData.overtimeEligible}
//                 onChange={(e) => setEmployeeData(prev => ({
//                   ...prev,
//                   overtimeEligible: e.target.checked
//                 }))}
//                 className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//               />
//               <label htmlFor="overtimeEligible" className="ml-2 text-sm text-gray-600">
//                 Overtime Eligible
//               </label>
//             </div>
//           </div>

//           {/* Tab Content */}
//           <div className="mt-6">
//             {/* ID Proofs Section */}
//             {selectedTab === "ID Proofs" && (
//               <div className="p-4">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Identity Documents</h3>
//                 <div className="grid grid-cols-2 gap-x-8 gap-y-4">
//                   {[
//                     { label: "Aadhar No.", key: "aadharNo" },
//                     { label: "PAN No.", key: "panNo" },
//                     { label: "Passport", key: "passport" },
//                     { label: "Driving License", key: "drivingLicense" },
//                     { label: "Voter ID", key: "voterId" },
//                   ].map(({ label, key }, index) => (
//                     <div key={index} className="flex items-center">
//                       <label className="text-gray-600 text-sm font-medium min-w-[180px]">
//                         {label}
//                       </label>
//                       <div className="flex-1 flex items-center gap-2">
//                         <input
//                           className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-gray-700 py-1"
//                           value={employeeData.idProofs[key] || ""}
//                           onChange={(e) => handleNestedInputChange(e, "idProofs", key)}
//                         />
//                         <input
//                           type="file"
//                           accept="image/*,application/pdf"
//                           id={`upload-${key}`}
//                           className="hidden"
//                           onChange={(e) => handleFileUpload(e, key)}
//                         />
//                         <label
//                           htmlFor={`upload-${key}`}
//                           className="cursor-pointer text-gray-400 hover:text-blue-500 transition-colors relative group"
//                         >
//                           <FaArrowAltCircleUp size={18} />
//                           <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
//                             Upload {label}
//                           </span>
//                         </label>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Salary Details Section */}
//             {selectedTab === "Salary Details" && (
//               <div className="p-4">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Compensation Details</h3>
//                 <div className="grid grid-cols-2 gap-x-8 gap-y-4">
//                   {[
//                     { label: "Basic", key: "totalCtc" },
//                     { label: "HRA", key: "basic" },
//                     { label: "PF", key: "hra" },
//                     { label: "Allowances", key: "allowances" },
//                   ].map(({ label, key }, index) => (
//                     <div key={index} className="flex items-center">
//                       <label className="text-gray-600 text-sm font-medium min-w-[180px]">
//                         {label}
//                       </label>
//                       <input
//                         type="number"
//                         className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-gray-700 py-1"
//                         value={employeeData.salaryDetails[key] || ""}
//                         onChange={(e) => {
//                           handleNestedInputChange(e, "salaryDetails", key);
//                           // Calculate Total CTC
//                           const values = {
//                             ...employeeData.salaryDetails,
//                             [key]: e.target.value
//                           };
//                           const total = (
//                             parseFloat(values.totalCtc || 0) +
//                             parseFloat(values.basic || 0) +
//                             parseFloat(values.hra || 0) +
//                             parseFloat(values.allowances || 0)
//                           );
//                           setEmployeeData(prev => ({
//                             ...prev,
//                             salaryDetails: {
//                               ...prev.salaryDetails,
//                               pf: total.toFixed(2)
//                             }
//                           }));
//                         }}
//                       />
//                     </div>
//                   ))}
//                 </div>
//                 <div className="mt-6 flex justify-end">
//                   <div>
//                     <label className="text-gray-800 text-sm font-semibold block mb-2">
//                       Total CTC
//                     </label>
//                     <input
//                       className="w-48 bg-gray-50 border-b-2 border-blue-500 focus:border-blue-600 focus:outline-none text-gray-700 font-bold text-lg py-1"
//                       value={employeeData.salaryDetails.pf || "0"}
//                       readOnly
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Bank Details Section */}
//             {selectedTab === "Bank Details" && (
//               <div className="p-4">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Banking Information</h3>
//                 <div className="grid grid-cols-2 gap-x-8 gap-y-4">
//                   {[
//                     { label: "Account Number", key: "accountNumber" },
//                     { label: "Account Holder Name", key: "accountHolderName" },
//                     { label: "IFSC", key: "ifscCode" },
//                     { label: "Bank Name", key: "bankName" },
//                     { label: "Branch Name", key: "branchName" },
//                   ].map(({ label, key }, index) => (
//                     <div key={index} className="flex items-center">
//                       <label className="text-gray-600 text-sm font-medium min-w-[180px]">
//                         {label}
//                       </label>
//                       <input
//                         className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-gray-700 py-1"
//                         value={employeeData.bankDetails[key] || ""}
//                         onChange={(e) => handleNestedInputChange(e, "bankDetails", key)}
//                       />
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-6 flex justify-end">
//                   <div className="flex items-center">
//                     <input
//                       type="file"
//                       accept="image/*"
//                       id="passbook-upload"
//                       className="hidden"
//                       onChange={(e) => handleFileUpload(e, 'passbook')}
//                     />
//                     <label
//                       htmlFor="passbook-upload"
//                       className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition flex items-center gap-2"
//                     >
//                       <FaArrowAltCircleUp size={16} />
//                       Upload Passbook Photo
//                     </label>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Basic Details Section - Only show when no tab is selected */}
//           {!selectedTab && (
//             <>
//               {/* Three Column Layout */}
//               <div className="grid grid-cols-3 gap-6 mt-6">
//                 {/* First Column */}
//                 <div className="space-y-4">
//                   {[
//                     { label: "Father's Name", key: "fatherName" },
//                     { label: "Gender", key: "gender" },
//                   ].map(({ label, key, type }, index) => (
//                     <div key={index} className="flex items-center space-x-0">
//                       <label className="text-gray-600 text-sm min-w-[120px]">
//                         {label}
//                       </label>
//                       <input
//                         type={type || "text"}
//                         name={key}
//                         className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
//                         value={key.includes('.')
//                           ? employeeData[key.split('.')[0]][key.split('.')[1]]
//                           : employeeData[key]}
//                         onChange={(e) => {
//                           if (key.includes('.')) {
//                             const [section, field] = key.split('.');
//                             handleNestedInputChange(e, section, field);
//                           } else {
//                             handleInputChange(e);
//                           }
//                         }}
//                       />
//                     </div>
//                   ))}
//                 </div>

//                 {/* Second Column */}
//                 <div className="space-y-4">
//                   {[
//                     { label: "Department", key: "department" },
//                     { label: "Date of Joining", key: "dateOfJoining", type: "date" },
//                     { label: "Reporting Manager", key: "reportingManager" },
//                   ].map(({ label, key, type }, index) => (
//                     <div key={index} className="flex items-center space-x-0">
//                       <label className="text-gray-600 text-sm min-w-[120px]">
//                         {label}
//                       </label>
//                       <input
//                         type={type || "text"}
//                         name={key}
//                         className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
//                         value={key.includes('.')
//                           ? employeeData[key.split('.')[0]][key.split('.')[1]]
//                           : employeeData[key]}
//                         onChange={(e) => {
//                           if (key.includes('.')) {
//                             const [section, field] = key.split('.');
//                             handleNestedInputChange(e, section, field);
//                           } else {
//                             handleInputChange(e);
//                           }
//                         }}
//                       />
//                     </div>
//                   ))}
//                 </div>

//                 {/* Third Column - Additional Details */}
//                 <div className="space-y-4">
//                   {/* PF Details */}
//                   <div className="flex items-center">
//                     <div className="w-[150px] flex items-center">
//                       <input
//                         type="checkbox"
//                         id="pfEnrolled"
//                         checked={employeeData.pfDetails.isEnrolled}
//                         onChange={(e) =>
//                           handleNestedInputChange(
//                             { target: { value: e.target.checked } },
//                             "pfDetails",
//                             "isEnrolled"
//                           )
//                         }
//                         className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                       />
//                       <label htmlFor="pfEnrolled" className="ml-2 text-sm text-gray-600">
//                         PF Enrolled
//                       </label>
//                     </div>
//                     <input
//                       className={`flex-1 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none text-gray-700 ${
//                         !employeeData.pfDetails.isEnrolled ? 'opacity-50' : ''
//                       }`}
//                       value={employeeData.pfDetails.uanNumber || ""}
//                       onChange={(e) => handleNestedInputChange(e, "pfDetails", "uanNumber")}
//                       disabled={!employeeData.pfDetails.isEnrolled}
//                       placeholder="UAN"
//                     />
//                   </div>

//                   {/* ESIC Details */}
//                   <div className="flex items-center">
//                     <div className="w-[150px] flex items-center">
//                       <input
//                         type="checkbox"
//                         id="esicEnrolled"
//                         checked={employeeData.esicDetails.isEnrolled}
//                         onChange={(e) =>
//                           handleNestedInputChange(
//                             { target: { value: e.target.checked } },
//                             "esicDetails",
//                             "isEnrolled"
//                           )
//                         }
//                         className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                       />
//                       <label htmlFor="esicEnrolled" className="ml-2 text-sm text-gray-600">
//                         ESIC Enrolled
//                       </label>
//                     </div>
//                     <input
//                       className={`flex-1 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none text-gray-700 ${
//                         !employeeData.esicDetails.isEnrolled ? 'opacity-50' : ''
//                       }`}
//                       value={employeeData.esicDetails.esicNumber || ""}
//                       onChange={(e) => handleNestedInputChange(e, "esicDetails", "esicNumber")}
//                       disabled={!employeeData.esicDetails.isEnrolled}
//                       placeholder="ESIC No."
//                     />
//                   </div>

//                   {/* Weekly Off */}
//                   <div className="flex items-center">
//                     <div className="w-[150px]">
//                       <label className="text-sm text-gray-600">Weekly Off:</label>
//                     </div>
//                     <div className="flex-1 relative">
//                       <div
//                         className="relative cursor-pointer"
//                         onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                       >
//                         <input
//                           type="text"
//                           readOnly
//                           value={employeeData.weeklyOff.join(", ")}
//                           className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-gray-700 py-1 pr-8 cursor-pointer"
//                           placeholder="Select days"
//                         />
//                         <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
//                           <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                           </svg>
//                         </div>
//                       </div>
//                       {isDropdownOpen && (
//                         <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
//                           {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
//                             <div
//                               key={day}
//                               className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
//                                 employeeData.weeklyOff.includes(day) ? 'bg-blue-50 text-blue-600' : ''
//                               }`}
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 const newWeeklyOff = employeeData.weeklyOff.includes(day)
//                                   ? employeeData.weeklyOff.filter(d => d !== day)
//                                   : [...employeeData.weeklyOff, day];
//                                 setEmployeeData(prev => ({
//                                   ...prev,
//                                   weeklyOff: newWeeklyOff
//                                 }));
//                               }}
//                             >
//                               <div className="flex items-center justify-between">
//                                 <span>{day}</span>
//                                 {employeeData.weeklyOff.includes(day) && (
//                                   <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//                                   </svg>
//                                 )}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Horizontal Line */}
//               <div className="border-t border-gray-300 my-4 -mx-6"></div>

//               {/* Vertical Layout for Additional Fields */}
//               <div className="space-y-4 mt-6">
//                 {/* Phone Numbers in horizontal layout */}
//                 <div className="flex items-center gap-6">
//                   <div className="flex-1 flex items-center">
//                     <label className="text-gray-600 text-sm min-w-[150px]">Phone 1</label>
//                     <input
//                       type="tel"
//                       name="phone"
//                       className="flex-1 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
//                       value={employeeData.phone}
//                       onChange={handleInputChange}
//                       required
//                     />
//                   </div>
//                   <div className="flex-1 flex items-center">
//                     <label className="text-gray-600 text-sm min-w-[150px]">Phone 2</label>
//                     <input
//                       type="tel"
//                       name="phone2"
//                       className="flex-1 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
//                       value={employeeData.phone2}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                 </div>

//                 {/* Email addresses in horizontal layout */}
//                 <div className="flex items-center gap-6">
//                   <div className="flex-1 flex items-center">
//                     <label className="text-gray-600 text-sm min-w-[150px]">Email Personal</label>
//                     <input
//                       type="email"
//                       name="email.personal"
//                       className="flex-1 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
//                       value={employeeData.email.personal}
//                       onChange={(e) => handleNestedInputChange(e, "email", "personal")}
//                     />
//                   </div>
//                   <div className="flex-1 flex items-center">
//                     <label className="text-gray-600 text-sm min-w-[150px]">Email Official</label>
//                     <input
//                       type="email"
//                       name="email.official"
//                       className="flex-1 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
//                       value={employeeData.email.official}
//                       onChange={(e) => handleNestedInputChange(e, "email", "official")}
//                     />
//                   </div>
//                 </div>

//                 {/* Addresses */}
//                 <div className="flex items-center">
//                   <label className="text-gray-600 text-sm min-w-[150px]">Current Address</label>
//                   <input
//                     type="text"
//                     name="currentAddress"
//                     className="flex-1 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
//                     value={employeeData.currentAddress}
//                     onChange={handleInputChange}
//                   />
//                 </div>

//                 <div className="flex items-center">
//                   <label className="text-gray-600 text-sm min-w-[150px]">Permanent Address</label>
//                   <input
//                     type="text"
//                     name="permanentAddress"
//                     className="flex-1 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
//                     value={employeeData.permanentAddress}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//               </div>
//             </>
//           )}
//         </Card>

//         {/* Submit Button */}
//         <div className="mt-6 flex justify-end gap-4">
//           <Button
//             type="submit"
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
//             disabled={loading}
//           >
//             {loading
//               ? "Saving..."
//               : employeeId
//               ? "Update Employee"
//               : "Add Employee"}
//           </Button>
//           <Button
//             type="button"
//             className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
//             onClick={() => router.push("/hradmin/employees")}
//           >
//             Cancel
//           </Button>
//         </div>
//       </form>

//         </div>
//       </div>

//       {/* Preview Modal */}
//       {previewModal.show && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-4 max-w-3xl w-full mx-4">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold">Preview Employee Details</h2>
//               <button onClick={() => setPreviewModal({ show: false })} className="text-gray-500 hover:text-gray-700">
//                 <X className="h-6 w-6" />
//               </button>
//             </div>
//             {/* Preview content */}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default withAuth(EmployeeForm);

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toast } from "sonner";
import { createEmployee, updateEmployee } from "@/redux/slices/employeeSlice";
import withAuth from "@/components/withAuth";
import {
  FaUserCircle,
  FaUsers,
  FaCalendarCheck,
  FaMoneyCheckAlt,
  FaCog,
  FaArrowAltCircleUp,
} from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { motion } from "framer-motion";
import {
  FiUser,
  FiBook,
  FiDollarSign,
  FiCreditCard,
  FiShield,
  FiUpload,
} from "react-icons/fi";
import Select from "react-select";

// Add this CSS class to your global styles or component
const inputGroupClass =
  "relative border border-gray-200 rounded-lg focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 bg-gray-50 transition-all duration-200";
const inputClass =
  "w-full px-3 py-2 bg-transparent outline-none text-gray-700 text-sm";
const floatingLabelClass =
  "absolute -top-2.5 left-2 bg-white px-1 text-sm font-medium text-gray-700 transition-all duration-200";

const MultiSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <div className={inputGroupClass} ref={dropdownRef}>
      <label className={floatingLabelClass}>
        {label} <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-pointer min-h-[42px]`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {value.length > 0 ? (
              value.map((day) => (
                <span
                  key={day}
                  className="bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded"
                >
                  {day}
                </span>
              ))
            ) : (
              <span className="text-gray-500">Select days</span>
            )}
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
            {options.map((option) => (
              <div
                key={option}
                className={`px-4 py-2.5 cursor-pointer hover:bg-gray-100 ${
                  value.includes(option) ? "bg-blue-50" : ""
                }`}
                onClick={() => toggleOption(option)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={() => {}}
                    className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Add this function to generate the next employee ID
const generateEmployeeId = (lastEmployeeId) => {
  if (!lastEmployeeId) return "EMP001";
  const currentNumber = parseInt(lastEmployeeId.slice(3));
  return `EMP${(currentNumber + 1).toString().padStart(3, "0")}`;
};

function EmployeeForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { employees, err } = useSelector((state) => state.employees);
  console.log(err);

  const { activeMainTab, employee } = router.query;
  const [activePage, setActivePage] = useState("Employees");
  const [activeMain, setActiveMain] = useState(activeMainTab || "Basic");
  const [employeeId, setEmployeeId] = useState(null);
  const [selectedTab, setSelectedTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [previewModal, setPreviewModal] = useState({ show: false });
  const [activeSection, setActiveSection] = useState("personal");
  const [lastEmployeeId, setLastEmployeeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const weekDayOptions = [
    { value: "Sunday", label: "Sunday" },
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
  ];

  const [formData, setFormData] = useState({
    personal: {
      employeeId: "",
      name: "",
      fatherName: "",
      gender: "",
      phone: "",
      phone2: "",
      email: {
        personal: "",
        official: "",
      },
      currentAddress: "",
      permanentAddress: "",
      department: "",
      designation: "",
      dateOfJoining: "",
      reportingManager: "",
      overtimeEligible: false,
      weeklyOff: [],
    },
    statutory: {
      pfEnrolled: true,
      uanNumber: "",
      esicEnrolled: false,
      esicNumber: "",
    },
    documents: {
      aadharNo: "",
      panNo: "",
      passport: "",
      drivingLicense: "",
      voterId: "",
    },
    bank: {
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
      upiId: "",
      upiPhone: "",
    },
    salary: {
      basic: "",
      hra: "",
      allowances: "",
      pf: "",
      totalCtc: "",
      annualCTC: "",
      monthlyCTC: "",
      employerPF: "",
      employeePF: "",
    },
  });

  useEffect(() => {
    if (employee) {
      try {
        const parsedEmployee = JSON.parse(employee);
        setFormData((prev) => ({
          ...prev,
          personal: { ...prev.personal, ...parsedEmployee },
          documents: { ...prev.documents, ...parsedEmployee.idProofs },
          bank: { ...prev.bank, ...parsedEmployee.bankDetails },
          salary: { ...prev.salary, ...parsedEmployee.salaryDetails },
          statutory: { ...prev.statutory, ...parsedEmployee.statutory },
        }));
        setEmployeeId(parsedEmployee.id);
      } catch (error) {
        console.error("Error parsing employee data", error);
      }
    }
  }, [employee]);

  // Update your EmployeeForm component
  useEffect(() => {
    if (!formData.personal.employeeId) {
      // Simply set it to EMP001 for new employees
      handleInputChange("personal", "employeeId", "EMP001");
    }
  }, []);

  const calculateTotalCTC = (salaryData) => {
    const values = {
      basic: parseFloat(salaryData.basic) || 0,
      hra: parseFloat(salaryData.hra) || 0,
      allowances: parseFloat(salaryData.allowances) || 0,
      pf: parseFloat(salaryData.pf) || 0,
    };
    return values.basic + values.hra + values.allowances + values.pf;
  };

  const calculateMonthlyCTC = (annualCTC) => {
    const annual = parseFloat(annualCTC) || 0;
    return (annual / 12).toFixed(2);
  };

  const calculatePFContributions = (basicSalary) => {
    const basic = parseFloat(basicSalary) || 0;
    return {
      employer: (basic * 0.12).toFixed(2), // 12% of basic salary
      employee: (basic * 0.12).toFixed(2), // 12% of basic salary
    };
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };

      // Calculate Monthly CTC when Annual CTC changes
      if (section === "salary" && field === "annualCTC") {
        const annual = parseFloat(value) || 0;
        updatedData.salary.monthlyCTC = (annual / 12).toFixed(2);
      }

      // Calculate PF contributions when Basic Salary changes and PF is enrolled
      if (
        section === "salary" &&
        field === "basic" &&
        prev.statutory.pfEnrolled
      ) {
        const pfContributions = calculatePFContributions(value);
        updatedData.salary.employerPF = pfContributions.employer;
        updatedData.salary.employeePF = pfContributions.employee;

        // Calculate HRA as 40% of basic salary
        const basic = parseFloat(value) || 0;
        updatedData.salary.hra = (basic * 0.4).toFixed(2);
      }

      // Calculate Allowances when Monthly CTC, HRA, Basic, or PF changes
      if (
        section === "salary" &&
        (field === "monthlyCTC" ||
          field === "hra" ||
          field === "basic" ||
          field === "employerPF" ||
          field === "employeePF")
      ) {
        const monthlyCTC = parseFloat(updatedData.salary.monthlyCTC) || 0;
        const hra = parseFloat(updatedData.salary.hra) || 0;
        const basic = parseFloat(updatedData.salary.basic) || 0;
        const employerPF = parseFloat(updatedData.salary.employerPF) || 0;
        const employeePF = parseFloat(updatedData.salary.employeePF) || 0;

        const allowances = monthlyCTC - (hra + employeePF + employerPF + basic);
        updatedData.salary.allowances = allowances.toFixed(2);
      }

      return updatedData;
    });
  };

  const handleNestedInputChange = (section, parentField, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentField]: {
          ...prev[section][parentField],
          [field]: value,
        },
      },
    }));
  };

  const validateForm = () => {
    const { personal } = formData;
    if (!personal.employeeId) {
      toast.error("Employee ID is required");
      return false;
    }
    if (!personal.employeeId.match(/^EMP\d{3}$/)) {
      toast.error("Employee ID must be in the format EMP followed by 3 digits");
      return false;
    }
    if (!personal.name || !personal.phone) {
      toast.error("Name and Phone are required fields");
      return false;
    }
    if (!/^[0-9]{10}$/.test(personal.phone)) {
      toast.error("Invalid phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        ...formData.personal,
        idProofs: formData.documents,
        bankDetails: formData.bank,
        salaryDetails: formData.salary,
        statutory: formData.statutory,
      };

      if (employeeId) {
        await dispatch(
          updateEmployee({ id: employeeId, updatedData: payload })
        ).unwrap();
        toast.success("Employee updated successfully");
      } else {
        await dispatch(createEmployee(payload)).unwrap();
        toast.success("Employee created successfully");
      }
      router.push("/hradmin/employees");
    } catch (err) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    router.push({
      pathname: "/hradmin/employees",
      query: { tab },
    });
  };

  const handleLogout = () => {
    router.push("/login");
    localStorage.removeItem("token");
  };

  const mainTabs = [
    "Basic",
    "ID Proofs",
    "Salary Details",
    "Bank Details",
    "Leaves Policy",
  ];
  const subTabs = [
    "ID Proofs",
    "Salary Details",
    "Bank Details",
    "Leaves & Policies",
  ];

  useEffect(() => {
    if (activeMainTab) setActiveMain(activeMainTab);
  }, [activeMainTab]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle the file upload logic here
      console.log("Uploaded file:", file);
    }
  };

  const handleFileUpload = (documentType, file) => {
    if (file) {
      setFormData((prev) => ({
        ...prev,
        bank: {
          ...prev.bank,
          [documentType]: file,
        },
      }));
    }
  };

  const sections = [
    { id: "personal", label: "Personal Details", icon: FiUser },
    { id: "idProofs", label: "ID Proofs", icon: FiBook },
    { id: "bank", label: "Bank Details", icon: FiCreditCard },
    { id: "salary", label: "Salary", icon: FiDollarSign },
  ];

  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <HradminNavbar />
        <div className="p-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                {employee ? "✏️ Edit Employee" : "New Employee"}
              </h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl shadow-sm p-6 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20 z-0" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-50 rounded-full -ml-16 -mb-16 z-0" />

                {/* Section Tabs */}
                <div className="relative z-10 flex gap-4 mb-8 border-b border-gray-100 pb-2">
                  {sections.map((section) => (
                    <motion.button
                      key={section.id}
                      type="button"
                      className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        activeSection === section.id
                          ? "bg-blue-50 text-blue-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => setActiveSection(section.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <section.icon
                        className={`w-4 h-4 ${
                          activeSection === section.id
                            ? "text-blue-500"
                            : "text-gray-400"
                        }`}
                      />
                      {section.label}
                    </motion.button>
                  ))}
                </div>

                {/* Form Content */}
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  {/* Personal Details Section */}
                  {activeSection === "personal" && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Personal Information
                        </h3>
                        <div className={inputGroupClass}>
                          <label className={floatingLabelClass}>
                            Employee ID <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            className={inputClass}
                            value={formData.personal.employeeId || ""}
                            onChange={(e) => {
                              // Ensure the input follows the EMP### format
                              const value = e.target.value.toUpperCase();
                              if (value === "" || value.match(/^EMP\d{0,3}$/)) {
                                handleInputChange(
                                  "personal",
                                  "employeeId",
                                  value
                                );
                              }
                            }}
                            maxLength={6} // Limit to EMP### format
                          />
                        </div>

                        <div className={inputGroupClass}>
                          <label className={floatingLabelClass}>
                            Employee Name{" "}
                            <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            className={inputClass}
                            value={formData.personal.name || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "personal",
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Enter employee name"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              Father's Name
                            </label>
                            <input
                              type="text"
                              className={inputClass}
                              value={formData.personal.fatherName || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "personal",
                                  "fatherName",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={inputGroupClass}>
                            <label className={floatingLabelClass}>Gender</label>
                            <select
                              className={inputClass}
                              value={formData.personal.gender || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "personal",
                                  "gender",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Phone",
                              field: "phone",
                              required: true,
                              type: "tel",
                            },
                            {
                              label: "Alternate Phone",
                              field: "phone2",
                              type: "tel",
                            },
                          ].map(({ label, field, required, type }) => (
                            <div key={field} className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                {label}{" "}
                                {required && (
                                  <span className="text-red-400">*</span>
                                )}
                              </label>
                              <input
                                type={type || "text"}
                                required={required}
                                className={inputClass}
                                value={formData.personal[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "personal",
                                    field,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Personal Email",
                              field: "email.personal",
                              type: "email",
                            },
                            {
                              label: "Official Email",
                              field: "email.official",
                              type: "email",
                            },
                          ].map(({ label, field, type }) => (
                            <div key={field} className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                {label}
                              </label>
                              <input
                                type={type}
                                className={inputClass}
                                value={
                                  field.includes(".")
                                    ? formData.personal.email[
                                        field.split(".")[1]
                                      ]
                                    : formData.personal[field] || ""
                                }
                                onChange={(e) => {
                                  if (field.includes(".")) {
                                    handleNestedInputChange(
                                      "personal",
                                      "email",
                                      field.split(".")[1],
                                      e.target.value
                                    );
                                  } else {
                                    handleInputChange(
                                      "personal",
                                      field,
                                      e.target.value
                                    );
                                  }
                                }}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Addresses */}
                        {[
                          { label: "Current Address", field: "currentAddress" },
                          {
                            label: "Permanent Address",
                            field: "permanentAddress",
                          },
                        ].map(({ label, field }) => (
                          <div key={field} className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              {label}
                            </label>
                            <textarea
                              className={inputClass}
                              rows="2"
                              value={formData.personal[field] || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "personal",
                                  field,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>

                      {/* Right Column - Professional Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Professional Information
                        </h3>

                        <MultiSelect
                          label="Weekly Off"
                          options={weekDays}
                          value={formData.personal.weeklyOff || []}
                          onChange={(selected) =>
                            handleInputChange("personal", "weeklyOff", selected)
                          }
                        />

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Department",
                              field: "department",
                            },
                            {
                              label: "Designation",
                              field: "designation",
                            },
                          ].map(({ label, field, required }) => (
                            <div key={field} className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                {label}{" "}
                              </label>
                              <input
                                type="text"
                                className={inputClass}
                                value={formData.personal[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "personal",
                                    field,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Date of Joining",
                              field: "dateOfJoining",
                              type: "date",
                            },
                            {
                              label: "Reporting Manager",
                              field: "reportingManager",
                            },
                          ].map(({ label, field, type, required }) => (
                            <div key={field} className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                {label}{" "}
                              </label>
                              <input
                                type={type || "text"}
                                className={inputClass}
                                value={formData.personal[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "personal",
                                    field,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>

                        {/* Statutory Details */}
                        <div className="space-y-4 border-t pt-4 mt-4">
                          <h4 className="text-md font-medium text-gray-700">
                            Statutory Details
                          </h4>

                          <div className="flex flex-col space-y-4">
                            {/* PF Section */}
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="pfEnrolled"
                                  checked={formData.statutory.pfEnrolled}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "statutory",
                                      "pfEnrolled",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <label
                                  htmlFor="pfEnrolled"
                                  className="ml-2 text-sm text-gray-700"
                                >
                                  PF Enrolled
                                </label>
                              </div>

                              {formData.statutory.pfEnrolled && (
                                <div className={inputGroupClass}>
                                  <label className={floatingLabelClass}>
                                    UAN Number
                                  </label>
                                  <input
                                    type="text"
                                    className={inputClass}
                                    value={formData.statutory.uanNumber || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "statutory",
                                        "uanNumber",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </div>

                            {/* ESIC Section */}
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="esicEnrolled"
                                  checked={formData.statutory.esicEnrolled}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "statutory",
                                      "esicEnrolled",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <label
                                  htmlFor="esicEnrolled"
                                  className="ml-2 text-sm text-gray-700"
                                >
                                  ESIC Enrolled
                                </label>
                              </div>

                              {formData.statutory.esicEnrolled && (
                                <div className={inputGroupClass}>
                                  <label className={floatingLabelClass}>
                                    ESIC Number
                                  </label>
                                  <input
                                    type="text"
                                    className={inputClass}
                                    value={formData.statutory.esicNumber || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "statutory",
                                        "esicNumber",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ID Proofs Section (renamed from documents) */}
                  {activeSection === "idProofs" && (
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Identity Documents
                      </h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {[
                          {
                            label: "Aadhar No.",
                            key: "aadharNo",
                            docType: "Aadhar Card",
                          },
                          {
                            label: "PAN No.",
                            key: "panNo",
                            docType: "PAN Card",
                          },
                          {
                            label: "Passport",
                            key: "passport",
                            docType: "Passport",
                          },
                          {
                            label: "Driving License",
                            key: "drivingLicense",
                            docType: "Driving License",
                          },
                          {
                            label: "Voter ID",
                            key: "voterId",
                            docType: "Voter ID",
                          },
                        ].map(({ label, key, docType }) => (
                          <div key={key} className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              {label}{" "}
                            </label>
                            <div className="relative flex items-center">
                              <input
                                className={`${inputClass} pr-10`}
                                value={formData.documents[key] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "documents",
                                    key,
                                    e.target.value
                                  )
                                }
                              />
                              <div className="absolute right-3 group">
                                <label
                                  htmlFor={`upload-${key}`}
                                  className="cursor-pointer"
                                >
                                  <FiUpload className="w-5 h-5 text-gray-500 hover:text-blue-600" />
                                  <span className="invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                                    Upload {docType}
                                  </span>
                                </label>
                                <input
                                  type="file"
                                  id={`upload-${key}`}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) =>
                                    handleFileUpload(key, e.target.files[0])
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bank Details Section */}
                  {activeSection === "bank" && (
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Banking Information
                      </h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {[
                          { label: "Account Number", key: "accountNumber" },
                          {
                            label: "Account Holder Name",
                            key: "accountHolderName",
                          },
                          { label: "IFSC Code", key: "ifscCode" },
                          { label: "Bank Name", key: "bankName" },
                          { label: "Branch Name", key: "branchName" },
                          { label: "UPI ID", key: "upiId" },
                          { label: "UPI Phone Number", key: "upiPhone" },
                        ].map(({ label, key }) => (
                          <div key={key} className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              {label}
                            </label>
                            <input
                              className={inputClass}
                              value={formData.bank[key] || ""}
                              onChange={(e) =>
                                handleInputChange("bank", key, e.target.value)
                              }
                            />
                          </div>
                        ))}
                      </div>

                      {/* Document Upload Section */}
                      <div className="mt-6 space-y-4">
                        <h4 className="text-md font-medium text-gray-700">
                          Account Verification Document
                        </h4>
                        <div className="flex items-start space-x-6">
                          {/* Passbook Photo Upload */}
                          <div className="flex-1">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <input
                                  type="file"
                                  id="passbook-upload"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) =>
                                    handleFileUpload(
                                      "passbookPhoto",
                                      e.target.files[0]
                                    )
                                  }
                                />
                                <label
                                  htmlFor="passbook-upload"
                                  className="cursor-pointer text-center"
                                >
                                  <div className="flex flex-col items-center space-y-2">
                                    <FiUpload className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600">
                                      Upload Passbook/Cancelled Cheque
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Click to upload or drag and drop
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      PDF or Image file
                                    </span>
                                  </div>
                                </label>
                              </div>
                              {formData.bank.passbookPhoto && (
                                <div className="mt-2 text-sm text-gray-600">
                                  File: {formData.bank.passbookPhoto.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Salary Section */}
                  {activeSection === "salary" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Salary Details
                      </h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {[
                          { label: "Annual CTC", field: "annualCTC" },
                          { label: "Monthly CTC", field: "monthlyCTC" },
                          { label: "Basic Salary", field: "basic" },
                          { label: "HRA", field: "hra" },
                          { label: "Allowances", field: "allowances" },
                        ].map(({ label, field }) => (
                          <div key={field} className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              {label}
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                ₹
                              </span>
                              <input
                                type="number"
                                className={`${inputClass} pl-8 ${
                                  field === "monthlyCTC" ||
                                  field === "allowances" ||
                                  field === "hra"
                                    ? "bg-gray-50"
                                    : ""
                                }`}
                                value={formData.salary[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "salary",
                                    field,
                                    e.target.value
                                  )
                                }
                                readOnly={
                                  field === "monthlyCTC" ||
                                  field === "allowances" ||
                                  field === "hra"
                                }
                              />
                            </div>
                          </div>
                        ))}

                        {/* PF Contributions - Only shown if PF is enrolled */}
                        {formData.statutory.pfEnrolled && (
                          <>
                            <div className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                Employer PF Contribution
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  ₹
                                </span>
                                <input
                                  type="text"
                                  className={`${inputClass} pl-8 bg-gray-50`}
                                  value={
                                    formData.salary.employerPF ||
                                    calculatePFContributions(
                                      formData.salary.basic
                                    ).employer
                                  }
                                  readOnly
                                />
                              </div>
                            </div>

                            <div className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                Employee PF Contribution
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  ₹
                                </span>
                                <input
                                  type="text"
                                  className={`${inputClass} pl-8 bg-gray-50`}
                                  value={
                                    formData.salary.employeePF ||
                                    calculatePFContributions(
                                      formData.salary.basic
                                    ).employee
                                  }
                                  readOnly
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 flex justify-end gap-4">
                <motion.button
                  type="button"
                  className="px-6 py-3 rounded-xl bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 transition-all duration-200"
                  onClick={() => router.push("/hradmin/employees")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {employee ? "Update Employee" : "Add Employee"}
                      </span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Preview Employee Details
              </h2>
              <button
                onClick={() => setPreviewModal({ show: false })}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* Preview content */}
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(EmployeeForm);
