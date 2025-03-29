import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Edit, Calendar } from 'lucide-react';
const payrollData = [{
  id: 1,
  name: 'John Doe',
  paidDays: 20,
  monthlyCTC: '₹5000',
  thisMonthSalary: '₹4500',
  basic: '₹3000',
  deductions: '₹500',
  taxes: '₹200',
  professionalTax: '₹100',
  reimbursement: '₹300',
  advanceTaken: '₹400',
  netPay: '₹3500'
}, {
  id: 2,
  name: 'Jane Smith',
  paidDays: 22,
  monthlyCTC: '₹6000',
  thisMonthSalary: '₹5500',
  basic: '₹3500',
  deductions: '₹600',
  taxes: '₹300',
  professionalTax: '₹200',
  reimbursement: '₹400',
  advanceTaken: '₹500',
  netPay: '₹4500'
}, {
  id: 3,
  name: 'Alice Johnson',
  paidDays: 18,
  monthlyCTC: '₹4000',
  thisMonthSalary: '₹3500',
  basic: '₹2500',
  deductions: '₹400',
  taxes: '₹200',
  professionalTax: '₹100',
  reimbursement: '₹300',
  advanceTaken: '₹200',
  netPay: '₹3300'
}];
const PayrollTable = () => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-8" />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                    </Button>
                    <Button variant="outline" className="gap-2 font-medium rounded-sm text-xs text-slate-950">
                        <Calendar className="h-4 w-4" />
                        <span>January 2025</span>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="salary" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="salary" className="text-blue-600 data-[state=active]:bg-blue-50">
                        Salary Statement
                    </TabsTrigger>
                    <TabsTrigger value="advance">Advance</TabsTrigger>
                    <TabsTrigger value="reimbursement">Reimbursement</TabsTrigger>
                    <TabsTrigger value="payment">Payment History</TabsTrigger>
                </TabsList>

                <TabsContent value="salary">
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead>Name</TableHead>
                                            <TableHead>Paid Days</TableHead>
                                            <TableHead>Monthly CTC</TableHead>
                                            <TableHead>This Month Salary</TableHead>
                                            <TableHead>Basic</TableHead>
                                            <TableHead>Deductions</TableHead>
                                            <TableHead>Taxes</TableHead>
                                            <TableHead>Professional Tax</TableHead>
                                            <TableHead>Reimbursement</TableHead>
                                            <TableHead>Advance Taken</TableHead>
                                            <TableHead>Net Pay</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payrollData.map((employee) => (
                                            <TableRow key={employee.id}>
                                                <TableCell className="font-medium">{employee.name}</TableCell>
                                                <TableCell>{employee.paidDays}</TableCell>
                                                <TableCell>{employee.monthlyCTC}</TableCell>
                                                <TableCell>{employee.thisMonthSalary}</TableCell>
                                                <TableCell>{employee.basic}</TableCell>
                                                <TableCell>{employee.deductions}</TableCell>
                                                <TableCell>{employee.taxes}</TableCell>
                                                <TableCell>{employee.professionalTax}</TableCell>
                                                <TableCell>{employee.reimbursement}</TableCell>
                                                <TableCell>{employee.advanceTaken}</TableCell>
                                                <TableCell className="font-medium">{employee.netPay}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="advance">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center h-40">
                                <p className="text-muted-foreground">Advance payment information will appear here</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="reimbursement">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center h-40">
                                <p className="text-muted-foreground">Reimbursement information will appear here</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center h-40">
                                <p className="text-muted-foreground">Payment history will appear here</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
export default PayrollTable;