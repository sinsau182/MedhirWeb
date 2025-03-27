import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const AdvanceRequestTable = ({ requests, isLoading, onAction, isPending }) => {
  if (isLoading) {
    return <AdvanceRequestTableSkeleton />;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Employee ID</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Employee Name</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Department</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Advance Amount</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Request Date</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Repayment Terms</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Reason</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length > 0 ? (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.user.employeeId}</TableCell>
                <TableCell>{request.user.name}</TableCell>
                <TableCell>{request.user.department}</TableCell>
                <TableCell>${parseFloat(request.amount.toString()).toFixed(2)}</TableCell>
                <TableCell>{format(new Date(request.requestDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{request.repaymentTerms}</TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="success"
                    size="iconSm"
                    onClick={() => onAction(request.id, 'approved')}
                    disabled={isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="iconSm"
                    onClick={() => onAction(request.id, 'rejected')}
                    disabled={isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No pending advance requests found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const AdvanceRequestTableSkeleton = () => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Employee ID</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Employee Name</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Department</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Advance Amount</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Request Date</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Repayment Terms</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Reason</TableHead>
            <TableHead className="text-xs font-medium text-gray-500 uppercase">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(3)].map((_, index) => (
            <TableRow key={index}>
              {[...Array(7)].map((_, cellIndex) => (
                <TableCell key={cellIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
              <TableCell className="space-x-2">
                <Skeleton className="h-8 w-8 rounded-md inline-block" />
                <Skeleton className="h-8 w-8 rounded-md inline-block" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdvanceRequestTable;
