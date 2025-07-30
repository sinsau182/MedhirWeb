// Employee page implementation based on PRD
import { useState, useEffect } from 'react';
import { FaReceipt, FaPlus, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { AddExpenseForm } from '../../components/Forms';
import Sidebar from "../../components/Sidebar";
import HradminNavbar from "../../components/HradminNavbar";
import { toast } from 'sonner';
import SearchBarWithFilter from '../../components/SearchBarWithFilter';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllExpenses } from '../../redux/slices/expensesSlice';

const Employee = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddForm, setShowAddForm] = useState(null);
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const dispatch = useDispatch();
  const { expenses, loading, error } = useSelector(state => state.expenses);
  
  useEffect(() => {
    if (showAddForm === null) {
      dispatch(fetchAllExpenses());
    }
  }, [dispatch, showAddForm]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const handleTabClick = (tab) => setActiveTab(tab);
  const handleAddClick = () => setShowAddForm('expense');
  const handleBackFromForm = () => setShowAddForm(null);

  const handleExpenseSubmit = (expenseData) => {
    toast.success('Expense added successfully!');
    setShowAddForm(null);
    dispatch(fetchAllExpenses()); // Refresh expenses list after adding a new expense
  };

  const tabs = [
    { id: 'expenses', label: 'Reimbursements', icon: FaReceipt },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderAddForm = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <button onClick={handleBackFromForm} className="mr-4 text-gray-600 hover:text-blue-600 flex items-center gap-2">
            <FaArrowLeft className="w-5 h-5" /> <span>Back</span>
          </button>
          <h2 className="text-xl font-bold text-gray-900">Add New Expense</h2>
        </div>
        <AddExpenseForm
          onSubmit={handleExpenseSubmit}
          onSuccess={() => {
            toast.success('Expense added successfully!');
          }}
          onCancel={handleBackFromForm}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (showAddForm) {
      return renderAddForm();
    }

    switch (activeTab) {
      case 'expenses':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-8">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                  <FaReceipt className="w-10 h-10 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Reimbursements Found</h3>
                <p className="text-gray-600 text-center max-w-md mb-6">
                  You haven&apos;t submitted any reimbursement requests yet. Start by adding your first expense to claim reimbursements for business-related costs.
                </p>
                <button
                  onClick={() => setShowAddForm('expense')}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <FaPlus className="w-4 h-4" />
                  Submit Your First Reimbursement
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Expense Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Project/Job</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Receipt</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Proof</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{expense.date}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{expense.expenseType}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{expense.expenseCategory}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{formatCurrency(expense.amount)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm ${expense.vendor?.name !== null ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                          {expense.vendor?.name}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm ${expense.projectId !== null ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                          {expense.projectId}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 max-w-xs truncate" title={expense.notesDescription}>
                        {expense.notesDescription}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            expense.receiptInvoiceUrl !== null
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                          style={{ cursor: expense.receiptInvoiceUrl ? 'pointer' : 'default' }}
                          onClick={() => {
                            if (expense.receiptInvoiceUrl) setModalImageUrl(expense.receiptInvoiceUrl);
                          }}
                        >
                          {expense.receiptInvoiceUrl !== null ? '📎' : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            expense.paymentProof === 'Yes'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                          style={{ cursor: expense.paymentProofUrl ? 'pointer' : 'default' }}
                          onClick={() => {
                            if (expense.paymentProofUrl) setModalImageUrl(expense.paymentProofUrl);
                          }}
                        >
                          {expense.paymentProofUrl !== null ? '📎' : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        currentRole={"employee"}
      />
      <div className={`flex-1 ${isSidebarCollapsed ? "ml-16" : "ml-56"} transition-all duration-300 overflow-x-auto`}>
        <HradminNavbar />
        <div className="p-6 pt-24">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employees</h1>
          </div>
          <div className="flex justify-between items-center mb-6 bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={handleAddClick}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 font-semibold shadow-sm mr-6 text-sm"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Reimb.</span>
              </button>
              <nav className="flex space-x-6">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center space-x-2 whitespace-nowrap pb-1 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            <SearchBarWithFilter />
          </div>
          {renderContent()}
        </div>
      </div>
      {modalImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-2xl"
              onClick={() => setModalImageUrl(null)}
            >
              &times;
            </button>
            <img
              src={modalImageUrl}
              alt="Payment Proof"
              className="max-w-full max-h-[70vh] mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Employee;