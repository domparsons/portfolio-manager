import { toast } from "sonner";

export const runMonteCarloSimulations = async () => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/monte_carlo/`, {
      headers: {
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      toast("There was an error running the Monte Carlo simulation.");
      return;
    }
    const response = await res.json();
    console.log(response);

    return [
      response.final_values,
      response.portfolio_paths,
      response.shares_accumulated,
      response.total_invested,
    ];
  } catch (error) {
    console.error("Error running the Monte Carlo simulation:", error);
    toast("There was an error running the Monte Carlo simulation.");
  }
};
