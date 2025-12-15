import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimestampShort } from "@/utils/formatters";
import React from "react";
import { Transaction } from "@/types/custom-types";
import { getTransactionHistory } from "@/api/transaction";
import { useAuth0 } from "@auth0/auth0-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";

const TransactionHistoryCard = () => {
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
      await getTransactionHistory(user_id, setTransactionHistory);
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
    <Card>
      <CardHeader>
        <CardTitle>Recent Transaction History (USD)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
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
          <div className="flex flex-col gap-2">
            {transactionHistory.map((transaction, index) => (
              <div key={index} className="flex justify-between">
                <span className={"font-bold"}>{transaction.ticker}</span>
                <div className={"flex gap-4"}>
                  <span className={"font-light"}>
                    {formatTimestampShort(transaction.timestamp)}
                  </span>
                  $
                  {parseFloat(
                    (transaction.quantity * transaction.price).toFixed(2),
                  )}
                  <Badge variant={transaction.type}>
                    {transaction.type === "buy" ? "Buy" : "Sell"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { TransactionHistoryCard };
