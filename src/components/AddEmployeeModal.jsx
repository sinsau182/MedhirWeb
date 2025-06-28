export default function AddEmployeeModal({ onClose }) {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      department: "",
    });
  
    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      await fetch("/api/hradmin/employees", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      onClose();
    };
  
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
        <div className="bg-gray-900 p-6 rounded-xl">
          <h2 className="text-xl mb-4">Add Employee</h2>
          <input name="name" placeholder="Name" onChange={handleChange} className="block p-2 mb-2" />
          <input name="email" placeholder="Email" onChange={handleChange} className="block p-2 mb-2" />
          <input name="phone" placeholder="Phone" onChange={handleChange} className="block p-2 mb-2" />
          <input name="department" placeholder="Department" onChange={handleChange} className="block p-2 mb-2" />
          <button onClick={handleSubmit} className="bg-green-600 px-4 py-2 rounded-lg">Add</button>
          <button onClick={onClose} className="ml-2 bg-red-600 px-4 py-2 rounded-lg">Cancel</button>
        </div>
      </div>
    );
  }
  