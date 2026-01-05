import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { formatTimestampLong } from "@/utils/formatters";
import { Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteTransaction } from "@/api/transaction";
import { TransactionTableProps } from "@/types/custom-types";
import { usePortfolioMetrics } from "@/context/portfolio-metrics";
import { Badge } from "@/components/ui/badge";

const TransactionHistoryTable: React.FC<TransactionTableProps> = ({
  transactions,
  onDelete,
}) => {
  const { refreshMetrics } = usePortfolioMetrics();

  return (
    <Table>
      <TableHeader>
        <TableRow className="text-sm sm:text-base">
          <TableHead className="p-1 sm:p-2">Asset</TableHead>
          <TableHead className="hidden md:table-cell p-1 sm:p-2">Ticker</TableHead>
          <TableHead className="hidden md:table-cell p-1 sm:p-2">Date Purchased</TableHead>
          <TableHead className="p-1 sm:p-2">Quantity</TableHead>
          <TableHead className="p-1 sm:p-2">Price</TableHead>
          <TableHead className="p-1 sm:p-2">Action</TableHead>
          <TableHead className="p-1 sm:p-2"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id} className="cursor-pointer text-sm sm:text-base">
            <TableCell className="font-medium p-1 sm:p-2">
              {transaction.asset_name}
            </TableCell>
            <TableCell className="hidden md:table-cell p-1 sm:p-2">{transaction.ticker}</TableCell>
            <TableCell className="hidden md:table-cell p-1 sm:p-2">{formatTimestampLong(transaction.timestamp)}</TableCell>
            <TableCell className="p-1 sm:p-2">{transaction.quantity}</TableCell>
            <TableCell className="p-1 sm:p-2">${transaction.price.toFixed(2)}</TableCell>
            <TableCell className="p-1 sm:p-2">
              {" "}
              <Badge variant={transaction.type}>
                {transaction.type === "buy" ? "Buy" : "Sell"}
              </Badge>
            </TableCell>
            <TableCell className="p-1 sm:p-2">
              <AlertDialog>
                <AlertDialogTrigger>
                  <Trash size={16} />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to delete this transaction?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        deleteTransaction(
                          transaction.id,
                          onDelete,
                          refreshMetrics,
                        )
                      }
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export { TransactionHistoryTable };
