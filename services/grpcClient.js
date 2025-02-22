import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import {
  CompanyServiceClient,
} from "../src/generated/company_grpc_web_pb";
import {
  Company,
  CompanyRequest,
  UpdateCompanyRequest,
  DeleteCompanyRequest
} from "../src/generated/company_pb";

const client = new CompanyServiceClient("http://localhost:8081", null, null);

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
    company.setRegadd(companyData.regadd);

    client.createCompany(company, {}, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.toObject());
      }
    });
  });
};

export const updateCompany = async (companyData) => {
  return new Promise((resolve, reject) => {
    const updateRequest = new UpdateCompanyRequest();
    updateRequest.setId(companyData.id);
    updateRequest.setName(companyData.name);
    updateRequest.setEmail(companyData.email);
    updateRequest.setPhone(companyData.phone);
    updateRequest.setGst(companyData.gst);
    updateRequest.setRegadd(companyData.regadd);

    client.updateCompany(updateRequest, {}, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.toObject());
      }
    });
  });
};

export const deleteCompany = async (companyId) => {
  return new Promise((resolve, reject) => {
    const deleteRequest = new DeleteCompanyRequest();
    deleteRequest.setId(companyId);

    client.deleteCompany(deleteRequest, {}, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response.toObject());
      }
    });
  });
};
