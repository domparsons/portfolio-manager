"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { Asset } from "@/types/custom-types";
import { usePortfolioMetrics } from "@/context/portfolio-metrics";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { createTransaction } from "@/api/transaction";
import { ApiError } from "@/lib/api-client";
import { DatePicker } from "@/app/date-picker";

type TransactionButtonsProps = {
  transactionType: "buy" | "sell";
  setTransactionType: React.Dispatch<React.SetStateAction<"buy" | "sell">>;
  asset: Asset;
  onTransactionSuccess?: () => void;
};

const TransactionButtons: React.FC<TransactionButtonsProps> = ({
  transactionType,
  setTransactionType,
  asset,
  onTransactionSuccess,
}) => {
  const [numberOfShares, setNumberOfShares] = React.useState<number>(1);
  const [executionPrice, setExecutionPrice] = React.useState<number>(
    asset.latest_price,
  );
  const [executionDate, setExecutionDate] = React.useState<Date>();

  const numberOfSharesValid = numberOfShares > 0;
  const executionPriceValid = executionPrice > 0;
  const executionDateValid =
    executionDate !== undefined && executionDate <= new Date();
  const areInputsValid =
    numberOfSharesValid && executionPriceValid && executionDateValid;
  const { refreshMetrics } = usePortfolioMetrics();

  React.useEffect(() => {
    const today = new Date();
    setExecutionDate(today);
  }, []);

  function renderTransactionDescription() {
    const formattedDate = executionDate?.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const totalValue = executionPrice * numberOfShares;

    const formatCurrency = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: asset.currency,
    }).format(totalValue);

    const invalidClass = "text-red-500 font-semibold";

    return (
      <DialogDescription className="text-muted-foreground text-sm mt-1">
        {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
        ing{" "}
        <span className={numberOfSharesValid ? "" : invalidClass}>
          <strong>{numberOfShares}</strong>{" "}
          {numberOfShares === 1 ? "share" : "shares"}
        </span>{" "}
        of <strong>{asset.asset_name}</strong> on{" "}
        <span className={executionDateValid ? "" : invalidClass}>
          <strong>{formattedDate || "Invalid date"}</strong>
        </span>{" "}
        for{" "}
        <span className={executionPriceValid ? "" : invalidClass}>
          <strong>{formatCurrency}</strong>
        </span>
      </DialogDescription>
    );
  }
  const { user } = useAuth0();
  const user_id = user?.sub ?? null;

  const [modalOpen, setModalOpen] = React.useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    setModalOpen(false);
    e.preventDefault();

    try {
      await createTransaction(
        user_id,
        asset,
        transactionType,
        numberOfShares,
        executionPrice,
        executionDate,
      );
      toast("Transaction created successfully!");
      onTransactionSuccess?.(); // Refresh transaction history
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Failed to create transaction:", apiError);
      toast("Failed to create transaction.");
    } finally {
      await refreshMetrics();
    }
  };
  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen} modal={false}>
      <DialogTrigger asChild>
        <Button
          className={"bg-green-600"}
          onClick={() => {
            setTransactionType("buy");
            setModalOpen(true);
          }}
        >
          Buy
        </Button>
      </DialogTrigger>
      <DialogTrigger asChild>
        <Button
          className={"bg-red-600"}
          onClick={() => {
            setTransactionType("sell");
            setModalOpen(true);
          }}
        >
          Sell
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-1">
            {renderTransactionDescription()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              No. of Shares
            </Label>
            <Input
              placeholder="Number of Shares"
              type="number"
              className={"col-span-3"}
              value={numberOfShares}
              onChange={(e) => setNumberOfShares(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Price
            </Label>
            <Input
              placeholder="Execution Price"
              className={"col-span-3"}
              type="number"
              value={executionPrice}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (!isNaN(value)) {
                  setExecutionPrice(value);
                }
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Date
            </Label>
            <DatePicker
              date={executionDate}
              setDate={setExecutionDate}
              label={"something"}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={!areInputsValid}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionButtons;
