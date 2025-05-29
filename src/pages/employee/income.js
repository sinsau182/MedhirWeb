import React, { useState, useEffect } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import withAuth from "@/components/withAuth";
import { useRouter } from "next/router";
import { FiEye, FiCopy } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { fetchIncomeByEmployeeId } from "@/redux/slices/incomesSlice";

const Income = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const router = useRouter();
  const dispatch = useDispatch();
  const { incomes, loading, error } = useSelector((state) => state.incomes);
  console.log(incomes);


  useEffect(() => {
    dispatch(fetchIncomeByEmployeeId());
  }, [dispatch]);


  // Status color mapping
  const statusColors = {
    Pending: '#FFF7C2',
    Approved: '#C2FFC2',
    Rejected: '#FFC2C2',
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const handleRowClick = (income) => {
    router.push(`/employee/add-income?id=${income.incomeId}`);
  };

  return (
    <>
      <HradminNavbar />
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div style={{ marginLeft: isSidebarCollapsed ? 64 : 220, marginTop: 48, padding: '32px 32px 32px 32px', background: '#fafbfc', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <h2 style={{ margin: 0, fontWeight: 600, fontSize: 22, color: '#374151' }}>Income</h2>
          <button
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginLeft: 16 }}
            onClick={() => router.push('/employee/add-income')}
          >
            Add Income
          </button>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', padding: 0, marginTop: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f5f6fa', textAlign: 'left' }}>
                {/* <th style={{ padding: '16px 12px' }}>ID</th> */}
                <th style={{ padding: '16px 12px' }}>Project</th>
                <th style={{ padding: '16px 12px' }}>Client</th>
                <th style={{ padding: '16px 12px' }}>Amount</th>
                <th style={{ padding: '16px 12px' }}>Initiated</th>
                <th style={{ padding: '16px 12px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '16px 12px', textAlign: 'center', verticalAlign: 'middle' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((row) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                  onClick={() => handleRowClick(row)}
                  onMouseOver={e => e.currentTarget.style.background = '#f5f6fa'}
                  onMouseOut={e => e.currentTarget.style.background = ''}
                >
                  {/* <td style={{ padding: '14px 12px', fontWeight: 600 }}>{row.incomeId}</td> */}
                  <td style={{ padding: '14px 12px' }}>{row.project}</td>
                  <td style={{ padding: '14px 12px' }}>{row.client}</td>
                  <td style={{ padding: '14px 12px' }}>{row.amount}</td>
                  <td style={{ padding: '14px 12px' }}>{formatDate(row.initiated)}</td>
                  <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                    <span style={{ background: statusColors[row.status], color: '#444', borderRadius: 12, padding: '4px 16px', fontWeight: 500, fontSize: 15 }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <FiEye className="w-5 h-5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default withAuth(Income);  