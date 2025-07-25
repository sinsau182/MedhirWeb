import React, { useState, useEffect } from "react";
import Select from "react-select";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createDepartment, fetchDepartments } from "@/redux/slices/departmentSlice";
import { fetchLeavePolicies } from "@/redux/slices/leavePolicySlice";
import { toast } from "sonner";
import { fetchMasterModules } from "@/redux/slices/masterModulesSlice";

const weekDays = [
  { value: "Sunday", label: "Sunday" },
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
];

export default function DepartmentFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialValues = {},
  companyId,
}) {
  const dispatch = useDispatch();
  const { policies } = useSelector((state) => state.leavePolicy);
  const { modules: masterModules, loading: masterModulesLoading } = useSelector(
    (state) => state.masterModules
  );
  const [form, setForm] = useState({
    name: initialValues.name || "",
    description: initialValues.description || "",
    
    leavePolicy: initialValues.leavePolicy || "",
    weeklyHolidays: initialValues.weeklyHolidays || [],
    assignedModules: initialValues.assignedModules || [],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const prevIsOpen = React.useRef(false);

  useEffect(() => {
    dispatch(fetchLeavePolicies());
    dispatch(fetchMasterModules());
  }, [dispatch]);

  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      setForm({
        name: initialValues.name || "",
        description: initialValues.description || "",
        
        leavePolicy: initialValues.leavePolicy || "",
        weeklyHolidays: initialValues.weeklyHolidays || [],
        assignedModules: initialValues.assignedModules || [],
      });
      setErrors({});
    }
    prevIsOpen.current = isOpen;
  }, [isOpen, initialValues]);

  const masterModulesOptions = Array.isArray(masterModules) && masterModules.length > 0
    ? masterModules
        .filter(module => module && module.moduleId && module.moduleName) // Filter out invalid modules
        .map((module) => ({
          value: module.moduleId,
          label: module.moduleName,
        }))
    : [];

  const leavePolicyOptions = (policies || []).map((policy) => ({
    value: policy.leavePolicyId,
    label: policy.name,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    setForm((prev) => ({ ...prev, [name]: selectedOption }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleMultiSelectChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;
    setForm((prev) => ({ ...prev, [name]: selectedOption }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Department name is required";
    
    
    if (!form.weeklyHolidays || form.weeklyHolidays.length === 0)
      newErrors.weeklyHolidays = "Weekly holidays are required";
    if (!form.assignedModules || form.assignedModules.length === 0)
      newErrors.assignedModules = "At least one module is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const departmentData = {
        name: form.name,
        description: form.description || "",
        
        leavePolicy: form.leavePolicy.value,
        weeklyHolidays: form.weeklyHolidays.map((d) => d.value),
        companyId,
        assignedModules: Array.isArray(form.assignedModules) 
          ? form.assignedModules.map((module) => ({
              moduleId: module.value,
              moduleName: module.label,
            }))
          : [],
      };
      await dispatch(createDepartment(departmentData)).unwrap();
      toast.success("Department added successfully!");
      dispatch(fetchDepartments());
      setForm({
        name: "",
        description: "",
        
        leavePolicy: "",
        weeklyHolidays: [],
        assignedModules: [],
      });
      setErrors({});
      setLoading(false);
      if (onSuccess) onSuccess(departmentData);
      if (onClose) onClose();
    } catch (error) {
      setLoading(false);
      if (error?.message?.includes("already exists") || error?.message?.includes("duplicate")) {
        setErrors({ name: "Department name already exists" });
        toast.error("A department with this name already exists.");
      } else {
        toast.error(error?.message || "Failed to add department. Please try again.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[600px]">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Add Department</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter department name"
              value={form.name}
              onChange={handleChange}
              required
            />
            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter department description"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Policy <span className="text-red-500"></span>
            </label>
            <Select
              name="leavePolicy"
              options={leavePolicyOptions}
              className="react-select"
              classNamePrefix="select"
              placeholder="Select leave policy"
              value={form.leavePolicy}
              onChange={handleSelectChange}
            />
            {errors.leavePolicy && <div className="text-red-500 text-xs mt-1">{errors.leavePolicy}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weekly Holidays <span className="text-red-500">*</span>
            </label>
            <Select
              name="weeklyHolidays"
              isMulti
              options={weekDays}
              className="react-select"
              classNamePrefix="select"
              placeholder="Select weekly holidays"
              value={form.weeklyHolidays}
              onChange={handleMultiSelectChange}
            />
            {errors.weeklyHolidays && <div className="text-red-500 text-xs mt-1">{errors.weeklyHolidays}</div>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Modules <span className="text-red-500">*</span>
            </label>
            <Select
              name="assignedModules"
              isMulti
              options={masterModulesOptions}
              className="react-select"
              classNamePrefix="select"
              placeholder="Select modules"
              value={form.assignedModules}
              onChange={handleMultiSelectChange}
            />
            {errors.assignedModules && <div className="text-red-500 text-xs mt-1">{errors.assignedModules}</div>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 