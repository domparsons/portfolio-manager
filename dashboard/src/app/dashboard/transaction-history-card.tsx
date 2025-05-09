import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimestamp } from "@/utils/format-timestamp";
import React from "react";

type TransactionType = "buy" | "sell";

interface Transaction {
  id: number;
  timestamp: string;
  quantity: number;
  asset_name: string;
  ticker: string;
  type: TransactionType;
  price: number;
}

const TransactionHistoryCard = () => {
  const [transactionHistory, setTransactionHistory] = React.useState<
    Transaction[]
  >([]);
  const user_id = localStorage.getItem("user_id");

  const getTransactionHistory = async () => {
    const response = await fetch(
      `http://localhost:8000/transaction/${user_id}?limit=${10}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    const data = await response.json();
    setTransactionHistory(data);
  };

  React.useEffect(() => {
    getTransactionHistory();
  }, []);

  return (
    <Card className={"mt-4"}>
      <CardHeader>
        <CardTitle>Recent Transaction History (GBP)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {transactionHistory.map((transaction, index) => (
            <div key={index} className="flex justify-between">
              <span className={"font-bold"}>{transaction.ticker}</span>
              <div className={"flex gap-4"}>
                <span className={"font-light"}>
                  {formatTimestamp(transaction.timestamp)}
                </span>
                £
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

export default TransactionHistoryCard;
