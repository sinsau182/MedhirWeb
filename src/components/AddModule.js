import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompanies } from "@/redux/slices/companiesSlice";
import { fetchUsers } from "@/redux/slices/usersSlice";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

const AddModule = () => {
  const dispatch = useDispatch();
  const { companies, loading: companiesLoading } = useSelector((state) => state.companies);
  const { users, loading: usersLoading } = useSelector((state) => state.users);

  const [formData, setFormData] = useState({
    companyId: "",
    userId: "",
    moduleName: "",
  });

  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement module creation logic
    console.log("Form submitted:", formData);
  };

  if (companiesLoading || usersLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Add New Module
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Company</InputLabel>
        <Select
          name="companyId"
          value={formData.companyId}
          onChange={handleChange}
          label="Company"
          required
        >
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>User</InputLabel>
        <Select
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          label="User"
          required
        >
          {users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Module Name"
        name="moduleName"
        value={formData.moduleName}
        onChange={handleChange}
        required
        sx={{ mb: 2 }}
      />

      <Button type="submit" variant="contained" color="primary" fullWidth>
        Add Module
      </Button>
    </Box>
  );
};

export default AddModule; 