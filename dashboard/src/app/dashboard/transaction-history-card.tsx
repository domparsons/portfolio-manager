import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatTimestampShort, formatCurrencyValue } from "@/utils/formatters";
import React from "react";
import { Transaction } from "@/types/custom-types";
import { getTransactionHistory } from "@/api/transaction";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { Spinner } from "@/components/ui/spinner";

const TransactionHistoryCard = ({ className }: { className?: string }) => {
  const [transactionHistory, setTransactionHistory] = React.useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  const loadTransactions = async () => {
    if (!user_id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await getTransactionHistory(setTransactionHistory);
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Failed to load transaction history:", apiError);
      setError("Failed to load transactions");

      if (apiError.status >= 500) {
        toast.error("Server error loading transactions");
      }
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadTransactions();
  }, [user_id]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Transaction History</CardTitle>
        <CardDescription>Recent buy and sell transactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 overflow-auto flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Spinner className={"size-5"} />
              <p className="text-sm text-gray-500">Loading transactions...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {error}
          </div>
        ) : transactionHistory.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          <>
            {transactionHistory.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between border-b pb-3 last:border-b-0"
              >
                <div className="flex gap-3">
                  <div
                    className={`w-1 rounded ${transaction.type === "buy" ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{transaction.asset_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.type.charAt(0).toUpperCase() +
                        transaction.type.slice(1)}{" "}
                      {transaction.quantity}{" "}
                      {transaction.quantity === 1 ? "share" : "shares"} @{" "}
                      {formatCurrencyValue(transaction.price)}
                    </p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-medium">
                      {formatCurrencyValue(
                        transaction.quantity * transaction.price,
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimestampShort(transaction.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export { TransactionHistoryCard };
