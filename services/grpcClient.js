import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import { CompanyServiceClient } from "../src/generated/company_grpc_web_pb";
import { Company, CompanyRequest } from "../src/generated/company_pb";

const client = new CompanyServiceClient("http://localhost:8080", null, null);

export const getAllCompanies = async () => {
  return new Promise((resolve, reject) => {
    client.getAllCompanies(new Empty(), {}, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.toObject());
      }
    });
  });
};

export const createCompany = async (companyData) => {
  return new Promise((resolve, reject) => {
    const company = new Company();
    company.setName(companyData.name);
    company.setEmail(companyData.email);
    company.setPhone(companyData.phone);
    company.setGst(companyData.gst);
    company.setRegadd(companyData.regAdd);

    client.createCompany(company, {}, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.toObject());
      }
    });
  });
};
