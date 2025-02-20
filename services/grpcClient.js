import { Empty } from "google-protobuf/google/protobuf/empty_pb";  // ✅ Correct import
import { CompanyServiceClient } from "../src/generated/company_grpc_web_pb";
import { CompanyRequest, Company } from "../src/generated/company_pb";

const client = new CompanyServiceClient("http://localhost:8080", null, null);

export const getAllCompanies = async () => {
  return new Promise((resolve, reject) => {
    client.getAllCompanies(new Empty(), {}, (err, response) => {  // ✅ Use Empty()
      if (err) {
        reject(err);
      } else {
        resolve(response.toObject());
      }
    });
  });
};

// import { CompanyServiceClient } from '../generated/company_grpc_web_pb';

// const client = new CompanyServiceClient('http://192.168.0.200:9091', null, null);

// export default client;

