import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimestampShort } from "@/utils/format-timestamp";
import React from "react";
import { apiClient, ApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { Transaction } from "@/types/custom-types";

const TransactionHistoryCard = () => {
  const [transactionHistory, setTransactionHistory] = React.useState<
    Transaction[]
  >([]);
  const user_id = localStorage.getItem("user_id");

  const getTransactionHistory = async () => {
    if (!user_id) return;

    try {
      const data = await apiClient.get<Transaction[]>(
        `/transaction/${user_id}`,
        {
          params: { limit: 10 },
        },
      );
      setTransactionHistory(data);
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Error fetching transaction history:", apiError);
      toast("There was an error fetching transaction history.");
    }
  };

  React.useEffect(() => {
    getTransactionHistory();
  }, []);

  return (
    <Card className={"mt-4"}>
      <CardHeader>
        <CardTitle>Recent Transaction History (USD)</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export { TransactionHistoryCard };
