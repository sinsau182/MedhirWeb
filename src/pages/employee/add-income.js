import React, { useState, useEffect } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import withAuth from "@/components/withAuth";
import { useRouter } from "next/router";
import {
  fetchIncomeByEmployeeId,
  createIncome,
  updateIncome,
} from "@/redux/slices/incomesSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const AddIncome = () => {
  const employee = sessionStorage.getItem("employeeId");
  const { incomes, loading, error } = useSelector((state) => state.incomes);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const router = useRouter();
  const dispatch = useDispatch();
  const { id } = router.query;
  const isEdit = Boolean(id);
  const editIncome = incomes.find((i) => i.incomeId === id);

  // Form validation state
  const [formErrors, setFormErrors] = useState({});

  const [form, setForm] = useState({
    submittedBy: employee,
    project: "",
    client: "",
    amount: "",
    initiated: "",
    file: "",
    comments: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle file input
  const handleFileChange = (e) => {
    // Current implementation - treating file as string
    setForm((prev) => ({ ...prev, file: e.target.files[0]?.name || "" }));
    if (formErrors.file) {
      setFormErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  useEffect(() => {
    dispatch(fetchIncomeByEmployeeId());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && editIncome) {
      setForm({
        submittedBy: employee,
        project: editIncome.project || "",
        client: editIncome.client || "",
        amount: editIncome.amount || "",
        initiated: editIncome.initiated || "",
        file: editIncome.file || "",
        comments: editIncome.comments || "",
      });
    }
  }, [isEdit, editIncome, employee]);

  const validateForm = () => {
    const errors = {};
    if (!form.project) errors.project = "Project is required";
    if (!form.client) errors.client = "Client is required";
    if (!form.amount) errors.amount = "Amount is required";
    if (!form.file) errors.file = "File is required";
    if (form.amount && isNaN(form.amount))
      errors.amount = "Amount must be a number";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Format date to "DD MMM YYYY" format
      const today = new Date();
      const formattedDate = today.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const incomeData = {
        submittedBy: employee,
        companyId: sessionStorage.getItem("employeeCompanyId"),
        project: form.project,
        client: form.client,
        amount: parseFloat(form.amount),
        initiated: isEdit ? editIncome?.initiated : formattedDate,
        file: form.file, // Currently sending just the filename as string
        comments: form.comments,
        status: isEdit ? editIncome?.status : "Pending",
      };

      if (isEdit) {
        await dispatch(updateIncome({ ...incomeData, id })).unwrap();
      } else {
        await dispatch(createIncome(incomeData)).unwrap();
      }

      router.push("/employee/income");
    } catch (error) {
      toast.error(error || "Failed to save income. Please try again.");
    }
  };

  return (
    <>
      <HradminNavbar />
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div
        style={{
          maxWidth: 800,
          margin: isSidebarCollapsed ? "80px 0 0 120px" : "80px 0 0 290px",
          background: "#f8fafc",
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          padding: 36,
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 28 }}>
          {isEdit ? "Edit Income" : "Create New Income"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Project Name *</label>
              <input
                type="text"
                name="project"
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 6,
                  border: formErrors.project
                    ? "1px solid #ef4444"
                    : "1px solid #e5e7eb",
                  background: "#f3f4f6",
                }}
                value={form.project}
                onChange={handleChange}
                placeholder="Enter project name"
              />
              {formErrors.project && (
                <div style={{ color: "#ef4444", fontSize: 14, marginLeft: 8 }}>
                  {formErrors.project}
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Client Name *</label>
              <input
                type="text"
                name="client"
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 6,
                  border: formErrors.client
                    ? "1px solid #ef4444"
                    : "1px solid #e5e7eb",
                  background: "#f3f4f6",
                }}
                value={form.client}
                onChange={handleChange}
                placeholder="Enter client name"
              />
              {formErrors.client && (
                <div style={{ color: "#ef4444", fontSize: 14, marginLeft: 8 }}>
                  {formErrors.client}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500 }}>Amount *</label>
              <input
                type="text"
                name="amount"
                style={{
                  width: "100%",
                  marginTop: 6,
                  padding: 10,
                  borderRadius: 6,
                  border: formErrors.amount
                    ? "1px solid #ef4444"
                    : "1px solid #e5e7eb",
                  background: "#f3f4f6",
                }}
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
              />
              {formErrors.amount && (
                <div style={{ color: "#ef4444", fontSize: 14, marginLeft: 8 }}>
                  {formErrors.amount}
                </div>
              )}
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 500 }}>Payment Screenshot *</label>
            <div
              style={{ display: "flex", alignItems: "center", marginTop: 6 }}
            >
              <input
                id="file-upload"
                type="file"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                  marginRight: 16,
                  boxShadow: "0 1px 4px rgba(37,99,235,0.07)",
                }}
              >
                {form.file ? "Change File" : "Choose File"}
              </label>
              <span style={{ color: "#374151", fontSize: 15, fontWeight: 400 }}>
                {form.file ? form.file.name : "No file chosen"}
              </span>
              {formErrors.file && (
                <div style={{ color: "#ef4444", fontSize: 14, marginLeft: 8 }}>
                  {formErrors.file}
                </div>
              )}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontWeight: 500 }}>Comments</label>
            <textarea
              name="comments"
              style={{
                width: "100%",
                marginTop: 6,
                padding: 10,
                borderRadius: 6,
                border: formErrors.comments
                  ? "1px solid #ef4444"
                  : "1px solid #e5e7eb",
                background: "#f3f4f6",
              }}
              rows={3}
              value={form.comments}
              onChange={handleChange}
              placeholder="Add any additional information or context for this income"
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 24,
            }}
          >
            <button
              type="button"
              style={{
                background: "#fff",
                color: "#222",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "10px 24px",
                fontWeight: 500,
                fontSize: 16,
                cursor: "pointer",
              }}
              onClick={() => router.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 24px",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Create Income
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default withAuth(AddIncome);
