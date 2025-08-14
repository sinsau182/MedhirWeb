import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchManagerEmployees } from "@/redux/slices/managerEmployeeSlice";
import {
  FaUsers,
  FaBullseye,
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaExternalLinkAlt,
  FaFilter,
  FaCrown,
  FaPlus,
  FaClock, // added
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import MainLayout from '@/components/MainLayout';
import AddLeadModal from '@/components/Sales/AddLeadModal';
import Link from 'next/link';
import { toast } from 'sonner';
import { fetchPipelines } from '@/redux/slices/pipelineSlice';


// --- MOCK DATA (Replace with API data) ---
const MOCK_DATA = {
  kpis: {
    // kept existing to avoid side effects elsewhere
    newLeads: { value: 42, change: 15 },
    conversionRate: { value: '18%', convertedCount: 12, change: -2 },
    avgDealValue: { value: 250000, change: 10 },
    revenueWon: { value: 1250000, change: 25 },

    // added for the two new cards
    avgDurationMonths: { value: 2.6, change: -5 },      // e.g., average duration time
    avgSalesCycleMonths: { value: 3.8, change: -8 },    // e.g., average sales cycle
  },
  pipelineForecast: {
    funnel: [
      { name: 'New', value: 150 },
      { name: 'Contacted', value: 110 },
      { name: 'Qualified', value: 70 },
      { name: 'Quoted', value: 45 },
      { name: 'Converted', value: 25 },
    ],
  },
  teamPerformance: {
    leaderboard: [
      { rank: 1, name: 'Alice', dealsWon: 12, activities: 150 },
      { rank: 2, name: 'Bob', dealsWon: 9, activities: 120 },
      { rank: 3, name: 'Charlie', dealsWon: 7, activities: 95 },
    ],
    sourcePerformance: [
      { name: 'Website', value: 400 },
      { name: 'Referral', value: 300 },
      { name: 'Social Media', value: 200 },
      { name: 'Cold Call', value: 100 },
    ],
  },
  // Targets & Results mock
  currency: 'INR',
  targets: [
    { metric: 'revenue', target: 1200000, unit: 'currency' },
    { metric: 'deals_won', target: 25, unit: 'count' },
  ],
  results: {
    revenue: 980000,
    deals_won: 18,
  },
};

const defaultLeadData = {
  name: "",
  contactNumber: "",
  email: "",
  projectType: "",
  propertyType: "",
  address: "",
  area: "",
  budget: "",
  designStyle: "",
  leadSource: "",
  preferredContact: "",
  notes: "",
  status: "New",
  rating: 0,
  salesRep: null,
  designer: null,
  callDescription: null,
  callHistory: [],
  nextCall: null,
  quotedAmount: null,
  finalQuotation: null,
  signupAmount: null,
  paymentDate: null,
  paymentMode: null,
  panNumber: null,
  discount: null,
  reasonForLost: null,
  reasonForJunk: null,
  submittedBy: null,
  paymentDetailsFileName: null,
  bookingFormFileName: null,
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// --- Reusable Components ---
function KpiCard({ icon, label, value, change, currency = false, convertedCount }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <div className="flex items-center gap-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-xl font-bold text-gray-800">
            {currency && '₹'}
            {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          </p>
          {convertedCount && (
            <p className="text-xs text-gray-600 mt-1">
              {convertedCount} converted this month
            </p>
          )}
        </div>
      </div>
      <p className={`text-xs mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? `+${change}%` : `${change}%`} vs last month
      </p>
    </div>
  );
}

function SectionCard({ title, children, viewAllLink, right }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        <div className="flex items-center gap-3">
          {right}
          {viewAllLink && (
            <Link href={viewAllLink} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View All <FaExternalLinkAlt size={12}/>
            </Link>
          )}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SalesPipelineFunnel({ data }) {
  return (
    <SectionCard title="Sales Pipeline Funnel">
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
          <Tooltip cursor={{ fill: '#f3f4f6' }} />
          <Bar dataKey="value" fill="#3B82F6" barSize={26}>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </SectionCard>
  );
}

function TeamLeaderboard({ data }) {
  return (
    <SectionCard title="Team Leaderboard" viewAllLink="/manager/team">
      {data.map(member => (
        <div key={member.rank} className="flex items-center gap-4 text-sm">
          <div className="font-bold text-gray-500 w-6">{member.rank === 1 ? <FaCrown className="text-yellow-500"/> : member.rank}.</div>
          <div className="flex-grow font-semibold text-gray-800">{member.name}</div>
          <div className="text-right">
            <p className="font-semibold">{member.dealsWon} <span className="text-gray-500 font-normal">deals</span></p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{member.activities} <span className="text-gray-500 font-normal">activities</span></p>
          </div>
        </div>
      ))}
    </SectionCard>
  );
}

function LeadSourcePerformance({ data }) {
  return (
    <SectionCard title="Lead Source Performance">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fill="#8884d8">
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </SectionCard>
  );
}

// --- Targets & Results (New) ---
function formatCurrency(currency, value) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(value || 0);
  } catch {
    return `₹${(value || 0).toLocaleString('en-IN')}`;
  }
}
function getPeriodBounds(period) {
  const now = new Date();
  if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    const startMonth = q * 3;
    const start = new Date(now.getFullYear(), startMonth, 1);
    const end = new Date(now.getFullYear(), startMonth + 3, 0);
    return { start, end };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}
function getExpectedPct(start, end) {
  const today = new Date();
  const clamped = today < start ? start : today > end ? end : today;
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysElapsed = Math.floor((clamped - start) / msPerDay) + 1;
  const daysTotal = Math.floor((end - start) / msPerDay) + 1;
  return { expectedPct: daysElapsed / daysTotal, daysElapsed, daysTotal };
}
function StatusChip({ status }) {
  const map = {
    'On Track': 'bg-green-100 text-green-700 border-green-200',
    'At Risk': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Off Track': 'bg-red-100 text-red-700 border-red-200',
    'No Target': 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return <span className={`px-2 py-0.5 text-xs rounded border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>{status}</span>;
}

function TargetsResults({ targets = [], results = {}, currency = 'INR' }) {
  const [period, setPeriod] = useState('month'); // 'month' | 'quarter'
  const { start, end } = useMemo(() => getPeriodBounds(period), [period]);
  const { expectedPct } = useMemo(() => getExpectedPct(start, end), [start, end]);

  const metricDefs = [
    { key: 'revenue', title: 'Revenue', unit: 'currency' },
    { key: 'deals_won', title: 'Deals Won', unit: 'count' },
];

  const targetByMetric = useMemo(() => {
    const map = {};
    (targets || []).forEach(t => { map[t.metric] = t; });
    return map;
  }, [targets]);

  const items = metricDefs.map(m => {
    const target = targetByMetric[m.key]?.target ?? null;
    const actual = results?.[m.key] ?? 0;
    const expectedActual = target != null ? target * expectedPct : null;

    let status = 'No Target';
    if (target != null && target > 0) {
      if (actual >= expectedActual * 0.9) status = 'On Track';
      else if (actual >= expectedActual * 0.6) status = 'At Risk';
      else status = 'Off Track';
    }

    const pctToTarget = target ? Math.min(1, Math.max(0, actual / target)) : 0;
    const color =
      status === 'On Track' ? 'bg-green-500' :
      status === 'At Risk' ? 'bg-yellow-500' :
      status === 'Off Track' ? 'bg-red-500' : 'bg-gray-400';

    const fmt = (val) => m.unit === 'currency'
      ? formatCurrency(currency, val || 0)
      : (val || 0).toLocaleString('en-IN');

    return {
      ...m,
      target, actual, pctToTarget, color, status, fmt
    };
  });

  const revTarget = targetByMetric['revenue']?.target ?? null;
  const revActual = results?.['revenue'] ?? null;
  const overallAttainment = revTarget ? Math.round(((revActual || 0) / revTarget) * 100) : null;

  const toggle = (
    <div className="inline-flex border border-gray-200 rounded-md overflow-hidden">
      <button
        className={`px-3 py-1 text-sm ${period === 'month' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
        onClick={() => setPeriod('month')}
      >
        Month
      </button>
      <button
        className={`px-3 py-1 text-sm border-l border-gray-200 ${period === 'quarter' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
        onClick={() => setPeriod('quarter')}
      >
        Quarter
      </button>
    </div>
  );

  return (
    <SectionCard title="Targets & Results" right={toggle}>
      <div className="flex items-center justify-end text-sm text-gray-600">
        {overallAttainment != null
          ? <span>Overall Attainment: <span className="font-semibold text-gray-800">{overallAttainment}%</span></span>
          : <span className="italic">Overall attainment not set</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.key} className="rounded-md border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{item.title}</p>
              <StatusChip status={item.status} />
            </div>

            {item.target != null ? (
              <>
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-semibold text-gray-900">
                    {item.fmt(item.actual)}
                  </span> of {item.fmt(item.target)} — {Math.round(item.pctToTarget * 100)}%
                </p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${Math.round(item.pctToTarget * 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500 mt-2 italic">No target set for this period</p>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// --- Main Page ---
function MainDashboard() {
  const [dashboardData, setDashboardData] = useState(MOCK_DATA);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const { employees: managerEmployees, loading: managerEmployeesLoading } = useSelector((state) => state.managerEmployee);
  const { pipelines } = useSelector((state) => state.pipelines);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchManagerEmployees());
  }, [dispatch]);

  // Load pipeline stages for funnel chart
  useEffect(() => {
    dispatch(fetchPipelines());
  }, [dispatch]);

  const funnelData = useMemo(() => {
    console.log('Raw pipelines data:', pipelines);
    console.log('Pipelines type:', typeof pipelines);
    console.log('Pipelines length:', pipelines?.length);
    
    if (!pipelines || pipelines.length === 0) {
      console.log('No pipelines data, using mock data');
      return MOCK_DATA.pipelineForecast.funnel;
    }
    
    // Sort pipelines by order
    const sorted = [...pipelines].sort((a, b) => {
      const ao = typeof a.orderIndex === 'number' ? a.orderIndex : (a.order || 0);
      const bo = typeof b.orderIndex === 'number' ? b.orderIndex : (b.order || 0);
      return ao - bo;
    });
    
    console.log('Sorted pipelines:', sorted);
    
    // Filter out Lost and Junk stages
    const filtered = sorted.filter(stage => 
      stage.formType !== 'LOST' && stage.formType !== 'JUNK'
    );
    
    console.log('Filtered pipelines:', filtered);
    
    // Map pipeline stages to funnel data with actual lead counts
    const result = filtered.map(stage => {
      const leadCount = stage.leads ? stage.leads.length : 0;
      console.log(`Stage ${stage.formType}: ${leadCount} leads`, stage.leads);
      return {
        name: stage.formType || stage.name,
        value: leadCount,
      };
    });
    
    console.log('Final funnel data:', result);
    return result;
  }, [pipelines]);

  const handleAddLeadSubmit = (formData) => {
    if (!formData.salesRep || !formData.designer) {
      toast.error('Please assign both Sales Person and Designer.');
      return;
    }
    const leadData = { ...defaultLeadData, ...formData, status: formData.status || "New", submittedBy: "SALESMANAGER" };
    const newId = `LEAD${Math.floor(Math.random() * 100000)}`;
    setDashboardData(prev => ({
      ...prev,
      kpis: {
        ...prev.kpis,
        newLeads: { ...prev.kpis.newLeads, value: prev.kpis.newLeads.value + 1 }
      },
      pipelineForecast: {
        ...prev.pipelineForecast,
        funnel: prev.pipelineForecast.funnel.map(stage => 
          stage.name === 'New' ? { ...stage, value: stage.value + 1 } : stage
        )
      }
    }));
    toast.success(`Lead "${formData.name}" added successfully!`);
    setShowAddLeadModal(false);
  };

  return (
    <MainLayout>
      <div className="p-4 bg-gray-50 h-screen overflow-hidden">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Replaced New Leads with Avg. Duration Time (months) */}
          <KpiCard
            icon={<FaClock size={22}/>}
            label="Avg. Duration Time"
            value={`${dashboardData.kpis.avgDurationMonths.value} months`}
            change={dashboardData.kpis.avgDurationMonths.change}
          />
          <KpiCard 
            icon={<FaBullseye size={22}/>} 
            label="Conversion Rate" 
            value={dashboardData.kpis.conversionRate.value} 
            change={dashboardData.kpis.conversionRate.change} 
            convertedCount={dashboardData.kpis.conversionRate.convertedCount}
          />
          <KpiCard
            icon={<FaHandHoldingUsd size={22}/>}
            label="Avg. Deal Value"
            value={dashboardData.kpis.avgDealValue.value}
            change={dashboardData.kpis.avgDealValue.change}
            currency={true}
          />
          {/* Replaced Revenue Won with Avg. Sales Cycle (months) */}
          <KpiCard
            icon={<FaClock size={22}/>}
            label="Avg. Sales Cycle"
            value={`${dashboardData.kpis.avgSalesCycleMonths.value} months`}
            change={dashboardData.kpis.avgSalesCycleMonths.change}
          />
        </div>

        {/* Content order: Mobile shows Targets & Results before other modules; Desktop shows it after */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 order-2 lg:order-1">
            <TeamLeaderboard data={dashboardData.teamPerformance.leaderboard} />
            <SalesPipelineFunnel data={funnelData} />
            <LeadSourcePerformance data={dashboardData.teamPerformance.sourcePerformance} />
          </div>

          <div className="order-1 lg:order-2">
            <TargetsResults
              targets={dashboardData.targets}
              results={dashboardData.results}
              currency={dashboardData.currency}
            />
          </div>
        </div>

        {/* Add Lead Modal */}
        <AddLeadModal
          isOpen={showAddLeadModal}
          onClose={() => setShowAddLeadModal(false)}
          onSubmit={handleAddLeadSubmit}
          initialData={defaultLeadData}
          isManagerView={true}
          salesPersons={managerEmployees}
          designers={managerEmployees}
          salesPersonsLoading={managerEmployeesLoading}
          designersLoading={managerEmployeesLoading}
        />
      </div>
    </MainLayout>
  );
}

export default MainDashboard;