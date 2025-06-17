import { useCallback } from "react";
import { toast } from "react-hot-toast"; 

const useFileUpload = (setFormData) => {
  const handleFileUpload = useCallback((documentType, file) => {
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (file.size > maxSize) {
      toast.error("File size should not exceed 5MB");
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid PDF or image file");
      return;
    }

    const fieldMappings = {
      aadharNo: { imgField: "aadharImgUrl" },
      panNo: { imgField: "pancardImgUrl" },
      passport: { imgField: "passportImgUrl" },
      drivingLicense: { imgField: "drivingLicenseImgUrl" },
      voterId: { imgField: "voterIdImgUrl" },
      passbookImgUrl: { imgField: "passbookImgUrl" },
    };

    const fields = fieldMappings[documentType];
    if (!fields) return;

    setFormData((prev) => {
      const targetSection =
        documentType === "passbookImgUrl" ? "bankDetails" : "idProofs";

      return {
        ...prev,
        [targetSection]: {
          ...prev[targetSection],
          [fields.imgField]: file,
        },
      };
    });
  }, [setFormData]);

  return { handleFileUpload };
};

export default useFileUpload;