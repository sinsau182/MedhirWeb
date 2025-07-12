import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Plus, 
  Edit, 
  Eye, 
  Copy, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  FileText,
  ChevronDown,
  MoreVertical,
  Download,
  Settings
} from 'lucide-react';

const FormsList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const router = useRouter();

  // Demo data - replace with actual API calls
  const demoForms = [
    {
      formId: 'form_1',
      title: 'Employee Onboarding Form',
      description: 'Complete form for new employee registration and documentation',
      totalFields: 12,
      responseCount: 45,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:20:00Z',
      status: 'active',
      hasConditionalLogic: true,
      hasValidation: true,
      hasFileUpload: true,
      smartFeatures: ['Auto-validation', 'Conditional Logic', 'File Upload'],
      createdBy: 'HR Admin',
      category: 'HR'
    },
    {
      formId: 'form_2',
      title: 'Customer Feedback Survey',
      description: 'Collect customer feedback and satisfaction ratings',
      totalFields: 8,
      responseCount: 123,
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-18T11:45:00Z',
      status: 'active',
      hasConditionalLogic: false,
      hasValidation: true,
      hasFileUpload: false,
      smartFeatures: ['Smart Validation', 'Auto-format'],
      createdBy: 'Sales Manager',
      category: 'Sales'
    },
    {
      formId: 'form_3',
      title: 'Leave Request Form',
      description: 'Employee leave application and approval workflow',
      totalFields: 6,
      responseCount: 78,
      createdAt: '2024-01-05T16:00:00Z',
      updatedAt: '2024-01-12T10:30:00Z',
      status: 'active',
      hasConditionalLogic: true,
      hasValidation: true,
      hasFileUpload: false,
      smartFeatures: ['Date Validation', 'Conditional Logic'],
      createdBy: 'HR Admin',
      category: 'HR'
    },
    {
      formId: 'form_4',
      title: 'Project Requirements Form',
      description: 'Capture project requirements and specifications',
      totalFields: 15,
      responseCount: 12,
      createdAt: '2024-01-08T12:45:00Z',
      updatedAt: '2024-01-15T09:20:00Z',
      status: 'draft',
      hasConditionalLogic: true,
      hasValidation: true,
      hasFileUpload: true,
      smartFeatures: ['Smart Fields', 'File Upload', 'Conditional Logic'],
      createdBy: 'Project Manager',
      category: 'Projects'
    }
  ];

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setForms(demoForms);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading forms:', error);
      setLoading(false);
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'active' && form.status === 'active') ||
                         (filterBy === 'draft' && form.status === 'draft') ||
                         (filterBy === 'category' && form.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch && matchesFilter;
  });

  const sortedForms = [...filteredForms].sort((a, b) => {
    switch (sortBy) {
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'updated':
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'responses':
        return b.responseCount - a.responseCount;
      default:
        return 0;
    }
  });

  const handleCreateForm = () => {
    router.push('/form-builder');
  };

  const handleEditForm = (formId) => {
    router.push(`/form-builder?edit=${formId}`);
  };

  const handleViewForm = (formId) => {
    router.push(`/form-viewer?form=${formId}`);
  };

  const handleDuplicateForm = (formId) => {
    const formToDuplicate = forms.find(f => f.formId === formId);
    if (formToDuplicate) {
      const duplicatedForm = {
        ...formToDuplicate,
        formId: `form_${Date.now()}`,
        title: `${formToDuplicate.title} (Copy)`,
        responseCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft'
      };
      setForms([duplicatedForm, ...forms]);
    }
  };

  const handleDeleteForm = (formId) => {
    if (window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      setForms(forms.filter(f => f.formId !== formId));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'HR':
        return 'bg-blue-100 text-blue-800';
      case 'Sales':
        return 'bg-purple-100 text-purple-800';
      case 'Projects':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Form Builder</h1>
          <p className="text-gray-600 mt-1">Create and manage dynamic forms with smart features</p>
        </div>
        <button 
          onClick={handleCreateForm}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Create New Form</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Forms</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="created">Created Date</option>
            <option value="updated">Updated Date</option>
            <option value="title">Title</option>
            <option value="responses">Responses</option>
          </select>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedForms.map(form => (
          <div key={form.formId} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            {/* Card Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{form.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                      {form.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{form.description}</p>
                  
                  <div className="flex items-center space-x-2 mt-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(form.category)}`}>
                      {form.category}
                    </span>
                    <span className="text-xs text-gray-500">by {form.createdBy}</span>
                  </div>
                </div>
                
                <div className="ml-4">
                  <div className="relative">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{form.totalFields}</div>
                  <div className="text-xs text-gray-500">Fields</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">{form.responseCount}</div>
                  <div className="text-xs text-gray-500">Responses</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.round((form.responseCount / Math.max(form.totalFields, 1)) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">Completion</div>
                </div>
              </div>

              {/* Smart Features */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {form.smartFeatures.slice(0, 3).map((feature, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      ✨ {feature}
                    </span>
                  ))}
                  {form.smartFeatures.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{form.smartFeatures.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-gray-500 mb-4">
                <div>Created: {formatDate(form.createdAt)}</div>
                <div>Updated: {formatDate(form.updatedAt)}</div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewForm(form.formId)}
                    className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded text-sm transition-colors"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEditForm(form.formId)}
                    className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded text-sm transition-colors"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleDuplicateForm(form.formId)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteForm(form.formId)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedForms.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No forms found' : 'No forms created yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms or filters' 
              : 'Create your first form to get started with our smart form builder'
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={handleCreateForm}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Create Your First Form</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FormsList; 