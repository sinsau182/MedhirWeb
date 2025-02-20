import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const PROTO_PATH = '@/proto/company.proto'; // Adjust the path to your .proto file

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const CompanyService = grpc.loadPackageDefinition(packageDefinition).com.example.company.CompanyService;

const client = new CompanyService(
  '192.168.0.200:9090',
  grpc.credentials.createInsecure()
);

export default function handler(req, res) {
  client.getAllCompanies({}, (error, response) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).json(response);
    }
  });
}
