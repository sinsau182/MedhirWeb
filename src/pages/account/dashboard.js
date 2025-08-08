import { useEffect, useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { useDispatch, useSelector } from 'react-redux';
import { FaFileInvoiceDollar, FaReceipt, FaFileAlt, FaTruckLoading, FaUserTie, FaUsers, FaMoneyBillWave, FaPlus, FaTimes } from 'react-icons/fa';
import { fetchInvoices, createInvoice } from '@/redux/slices/invoiceSlice';
import { fetchReceipts } from '@/redux/slices/receiptSlice';
import { fetchBills } from '@/redux/slices/BillSlice';
import { fetchPurchaseOrders } from '@/redux/slices/PurchaseOrderSlice';
import { fetchVendors } from '@/redux/slices/vendorSlice';
import { fetchCustomers } from '@/redux/slices/customerSlice';
import { AddInvoiceForm, AddReceiptForm, AddBillForm, AddPurchaseOrderForm, AddVendorForm, AddClientForm, BulkPaymentForm } from '@/components/Forms';
import { toast } from 'sonner';
import { useMemo } from 'react';

const Modal = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes /></button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-2 p-3 bg-white rounded-lg border hover:shadow transition text-left flex-1 basis-0 min-w-0 whitespace-nowrap">
    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
      <Icon />
    </div>
    <div className="min-w-0">
      <div className="text-xs text-gray-500">Quick Action</div>
      <div className="font-semibold text-gray-900 text-sm truncate">{label}</div>
    </div>
    <div className="ml-auto text-gray-400"><FaPlus /></div>
  </button>
);

export default function AccountDashboard() {
  const dispatch = useDispatch();
  const { invoices, loading: invoicesLoading } = useSelector(state => state.invoices);
  const { receipts, loading: receiptsLoading } = useSelector(state => state.receipts);
  const { bills, loading: billsLoading } = useSelector(state => state.bills);
  const { purchaseOrders, loading: poLoading } = useSelector(state => state.purchaseOrders);

  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [showBillForm, setShowBillForm] = useState(false);
  const [showPOForm, setShowPOForm] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showBulkPaymentForm, setShowBulkPaymentForm] = useState(false);

  useEffect(() => {
    // Seed data for the dashboard
    dispatch(fetchInvoices());
    dispatch(fetchReceipts());
    dispatch(fetchBills());
    dispatch(fetchPurchaseOrders());
    dispatch(fetchVendors());
    dispatch(fetchCustomers());
  }, [dispatch]);

  // Helpers for safe date parsing and currency formatting
  const parseDate = (d) => {
    if (!d) return null;
    const tryFields = [d, d?.date, d?.createdAt];
    for (const v of tryFields) {
      const dt = new Date(v);
      if (!Number.isNaN(dt.getTime())) return dt;
    }
    return null;
  };
  const formatINR = (n) => `₹${Number(n || 0).toFixed(2)}`;

  // Derived KPIs only
  const kpis = useMemo(() => {
    // Invoices
    const totalInvoiced = invoices?.reduce((s, i) => s + Number(i.totalAmount || 0), 0);
    const paidInvoices = invoices?.filter(i => String(i.status || '').toLowerCase().includes('paid')) || [];
    const totalPaid = paidInvoices.reduce((s, i) => s + Number(i.totalAmount || 0), 0);
    const outstanding = Math.max(0, totalInvoiced - totalPaid);
    const overdueCount = (invoices || []).filter(i =>
      String(i.status || '').toLowerCase().includes('overdue')
    ).length;

    // Receipts
    const monthNow = new Date();
    const receiptsThisMonth = (receipts || []).filter(r => {
      const d = parseDate(r.receiptDate || r.date || r.createdAt);
      return d && d.getMonth() === monthNow.getMonth() && d.getFullYear() === monthNow.getFullYear();
    });
    const totalReceiptsThisMonth = receiptsThisMonth.reduce((s, r) => s + Number(r.amountReceived || r.amount || 0), 0);

    // Bills
    const unpaidBills = (bills || []).filter(b => !String(b.paymentStatus || '').toLowerCase().includes('paid'));
    const unpaidBillsAmount = unpaidBills.reduce((s, b) => s + Number(b.finalAmount || b.total || 0), 0);

    // POs
    const pendingPOs = (purchaseOrders || []).filter(po => !String(po.status || 'Created').toLowerCase().includes('approved'));
    return [
      { title: 'Outstanding', value: formatINR(outstanding), sub: `Paid ${formatINR(totalPaid)} of ${formatINR(totalInvoiced)}` },
      { title: 'Overdue Invoices', value: overdueCount, sub: 'needs attention' },
      { title: 'Receipts (This Month)', value: formatINR(totalReceiptsThisMonth), sub: `${receiptsThisMonth.length} receipts` },
      { title: 'Unpaid Bills', value: formatINR(unpaidBillsAmount), sub: `${unpaidBills.length} bills` },
      { title: 'Pending POs', value: pendingPOs.length, sub: 'awaiting approval' },
    ];
  }, [invoices, receipts, bills, purchaseOrders]);

  const handleInvoiceSubmit = (data) => {
    dispatch(createInvoice(data))
      .unwrap()
      .then(() => {
        toast.success('Invoice added');
        dispatch(fetchInvoices());
        setShowInvoiceForm(false);
      })
      .catch((err) => toast.error(err?.message || 'Failed to add invoice'));
  };

  const sectionCard = (title, loading, rows, columns) => (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b font-semibold text-gray-800">{title}</div>
      <div className="p-4 overflow-x-auto">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : rows && rows.length > 0 ? (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="text-left py-2 px-3 text-gray-500 uppercase text-xs">{col.label}</th>
                ))}
                <th className="text-left py-2 px-3 text-gray-500 uppercase text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.slice(0, 5).map((r, idx) => (
                <tr key={r.id || r.invoiceNumber || r.receiptNumber || r.billId || r.purchaseOrderId || idx}>
                  {columns.map(col => (
                    <td key={col.key} className="py-2 px-3">{col.render ? col.render(r) : r[col.key]}</td>
                  ))}
                  <td className="py-2 px-3">
                    <div className="flex gap-2 text-xs">
                      <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={() => toast.info('Open details in respective module')}>View</button>
                      <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={() => toast.info('Quick action coming soon')}>Action</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-500">No data</div>
        )}
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accounts Dashboard</h1>
          <p className="text-gray-600">Handle all accounting tasks from one place</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((k, i) => (
            <div key={i} className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500">{k.title}</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">{k.value}</div>
              <div className="text-xs text-gray-500 mt-1">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions - single horizontal row (no scroll), evenly squeezed */}
        <div className="flex gap-3 overflow-x-hidden pb-2 items-stretch">
          <QuickActionCard icon={FaFileInvoiceDollar} label="Create Invoice" onClick={() => setShowInvoiceForm(true)} />
          <QuickActionCard icon={FaReceipt} label="Record Receipt" onClick={() => setShowReceiptForm(true)} />
          <QuickActionCard icon={FaFileAlt} label="Add Bill" onClick={() => setShowBillForm(true)} />
          <QuickActionCard icon={FaTruckLoading} label="Purchase Order" onClick={() => setShowPOForm(true)} />
          <QuickActionCard icon={FaMoneyBillWave} label="Bulk Payment" onClick={() => setShowBulkPaymentForm(true)} />
        </div>

        {/* Charts removed as requested */}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sectionCard(
            'Recent Invoices',
            invoicesLoading,
            invoices,
            [
              { key: 'invoiceNumber', label: 'Invoice' },
              { key: 'customer', label: 'Customer', render: r => r.customer?.customerName || '-' },
              { key: 'totalAmount', label: 'Total', render: r => formatINR(r.totalAmount) },
              { key: 'status', label: 'Status' },
            ]
          )}

          {sectionCard(
            'Recent Receipts',
            receiptsLoading,
            receipts,
            [
              { key: 'receiptNumber', label: 'Receipt' },
              { key: 'customer', label: 'Customer', render: r => r.customer?.customerName || '-' },
              { key: 'amountReceived', label: 'Amount', render: r => formatINR(r.amountReceived) },
              { key: 'paymentMethod', label: 'Method' },
            ]
          )}

          {sectionCard(
            'Recent Bills',
            billsLoading,
            bills,
            [
              { key: 'billNumber', label: 'Bill No.' },
              { key: 'vendorName', label: 'Vendor', render: r => r.vendorName || '-' },
              { key: 'finalAmount', label: 'Amount', render: r => formatINR(r.finalAmount) },
              { key: 'paymentStatus', label: 'Status' },
            ]
          )}

          {sectionCard(
            'Recent Purchase Orders',
            poLoading,
            purchaseOrders,
            [
              { key: 'purchaseOrderNumber', label: 'PO No.' },
              { key: 'vendorName', label: 'Vendor', render: r => r.vendorName || '-' },
              { key: 'purchaseOrderDate', label: 'Date' },
              { key: 'status', label: 'Status', render: r => r.status || 'Created' },
            ]
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal title="Create Invoice" isOpen={showInvoiceForm} onClose={() => setShowInvoiceForm(false)}>
        <AddInvoiceForm onSubmit={handleInvoiceSubmit} onCancel={() => setShowInvoiceForm(false)} />
      </Modal>

      <Modal title="Record Receipt" isOpen={showReceiptForm} onClose={() => setShowReceiptForm(false)}>
        <AddReceiptForm onSubmit={() => { setShowReceiptForm(false); dispatch(fetchReceipts()); dispatch(fetchInvoices()); }} onCancel={() => setShowReceiptForm(false)} />
      </Modal>

      <Modal title="Add Bill" isOpen={showBillForm} onClose={() => setShowBillForm(false)}>
        <AddBillForm onCancel={() => { setShowBillForm(false); dispatch(fetchBills()); }} />
      </Modal>

      <Modal title="Create Purchase Order" isOpen={showPOForm} onClose={() => setShowPOForm(false)}>
        <AddPurchaseOrderForm onCancel={() => { setShowPOForm(false); dispatch(fetchPurchaseOrders()); }} />
      </Modal>

      <Modal title="Add Vendor" isOpen={showVendorForm} onClose={() => setShowVendorForm(false)}>
        <AddVendorForm onCancel={() => { setShowVendorForm(false); dispatch(fetchVendors()); }} />
      </Modal>

      <Modal title="Add Customer" isOpen={showCustomerForm} onClose={() => setShowCustomerForm(false)}>
        <AddClientForm onSubmit={() => { setShowCustomerForm(false); dispatch(fetchCustomers()); }} onCancel={() => setShowCustomerForm(false)} />
      </Modal>

      <Modal title="Bulk Payment" isOpen={showBulkPaymentForm} onClose={() => setShowBulkPaymentForm(false)}>
        <BulkPaymentForm onCancel={() => { setShowBulkPaymentForm(false); dispatch(fetchBills()); }} />
      </Modal>
    </MainLayout>
  );
}

