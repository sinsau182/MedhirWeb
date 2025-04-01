import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, Mail, MapPin, Phone, User } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Payslip = () => {
  const isMobile = useIsMobile();

  // Mock data for demonstration
  const employeeData = {
    name: "John Doe",
    employeeId: "EMP-12345",
    department: "Engineering",
    designation: "Senior Developer",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Tech Street, Silicon Valley, CA",
    payPeriod: "May 1-31, 2023",
    payDate: "June 5, 2023",
    workingDays: 22,
    daysWorked: 22,
    absences: 0,
    leaves: 0,
  };

  const earnings = [
    { description: "Basic Salary", amount: 5000 },
    { description: "House Rent Allowance", amount: 2000 },
    { description: "Transport Allowance", amount: 500 },
    { description: "Performance Bonus", amount: 1000 },
  ];

  const deductions = [
    { description: "Income Tax", amount: 800 },
    { description: "Provident Fund", amount: 600 },
    { description: "Health Insurance", amount: 200 },
    { description: "Professional Tax", amount: 100 },
  ];

  // Calculate totals
  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const netPay = totalEarnings - totalDeductions;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Payslip</h1>
        <Button asChild variant="outline">
            
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="bg-muted">
          <div className="flex justify-between items-center flex-wrap">
            <div>
              <CardTitle className="text-xl">Employee Payslip</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pay Period: {employeeData.payPeriod}
              </p>
            </div>
            <Badge variant="outline" className="text-base bg-primary text-primary-foreground px-4 py-1">
              Payment Date: {employeeData.payDate}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className={`grid ${isMobile ? "grid-cols-1 gap-6" : "grid-cols-2 gap-8"} mb-6`}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{employeeData.name}</p>
                <p className="text-sm text-muted-foreground">ID: {employeeData.employeeId}</p>
                <p className="text-sm text-muted-foreground">
                  {employeeData.designation}, {employeeData.department}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
              <p className="text-sm">{employeeData.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
              <p className="text-sm">{employeeData.phone}</p>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm">{employeeData.address}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">Working Days</p>
                <p className="text-sm text-muted-foreground">{employeeData.workingDays} days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">Days Worked</p>
                <p className="text-sm text-muted-foreground">{employeeData.daysWorked} days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">Absences</p>
                <p className="text-sm text-muted-foreground">{employeeData.absences} days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium">Leaves Taken</p>
                <p className="text-sm text-muted-foreground">{employeeData.leaves} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={`grid ${isMobile ? "grid-cols-1 gap-6" : "grid-cols-2 gap-8"} mb-6`}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earnings.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.description}</span>
                  <span className="font-medium">${item.amount.toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total Earnings</span>
                <span>${totalEarnings.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deductions.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.description}</span>
                  <span className="font-medium">${item.amount.toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total Deductions</span>
                <span>${totalDeductions.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">Net Pay</span>
            <span className="text-xl font-bold">${netPay.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payslip;
