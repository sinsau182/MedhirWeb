import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Define styles
const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 12 },
  header: { textAlign: "center", fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  section: { marginBottom: 10, padding: 10, borderBottom: "1px solid black" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  label: { fontWeight: "bold" },
});

const PayslipPDF = ({ payslipData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>PAYSLIP for {payslipData.monthYearDisplay}</Text>

      {/* Employee Details */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text>{payslipData.employeeName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>EMP ID:</Text>
          <Text>{payslipData.employeeId || "TLD187"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date of Joining:</Text>
          <Text>{payslipData.dateOfJoining || "01-01-2023"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Designation:</Text>
          <Text>{payslipData.designation || "Software Intern"}</Text>
        </View>
      </View>

      {/* Net Pay */}
      <View style={styles.section}>
        <Text style={styles.label}>Net Pay:</Text>
        <Text>₹ {payslipData.netPay || "19,000"}</Text>
      </View>
    </Page>
  </Document>
);

export default PayslipPDF;
