import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { formatTimestampLong } from "@/utils/format-timestamp";
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
import { Transaction } from "@/types/custom-types";

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: () => void;
}

const TransactionHistoryTable: React.FC<TransactionTableProps> = ({
  transactions,
  onDelete,
}) => {
  const user_id = localStorage.getItem("user_id");

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Asset</TableHead>
          <TableHead>Ticker</TableHead>
          <TableHead>Date Purchased</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Price</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map(
          (transaction: {
            id: React.Key | null | undefined;
            asset_name:
              | string
              | number
              | boolean
              | React.ReactElement<
                  any,
                  string | React.JSXElementConstructor<any>
                >
              | Iterable<React.ReactNode>
              | React.ReactPortal
              | null
              | undefined;
            ticker:
              | string
              | number
              | boolean
              | React.ReactElement<
                  any,
                  string | React.JSXElementConstructor<any>
                >
              | Iterable<React.ReactNode>
              | React.ReactPortal
              | null
              | undefined;
            timestamp: string;
            quantity:
              | string
              | number
              | boolean
              | React.ReactElement<
                  any,
                  string | React.JSXElementConstructor<any>
                >
              | Iterable<React.ReactNode>
              | React.ReactPortal
              | null
              | undefined;
            price: number;
          }) => (
            <TableRow key={transaction.id} className={"cursor-pointer"}>
              <TableCell className="font-medium">
                {transaction.asset_name}
              </TableCell>
              <TableCell>{transaction.ticker}</TableCell>
              <TableCell>
                {formatTimestampLong(transaction.timestamp)}
              </TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell>${transaction.price.toFixed(2)}</TableCell>
              <TableCell>
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
                            transaction.id as number | null | undefined,
                            user_id,
                            onDelete,
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
          ),
        )}
      </TableBody>
    </Table>
  );
};

export { TransactionHistoryTable };
