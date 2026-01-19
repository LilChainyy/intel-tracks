export interface Category {
  id: string;
  name: string;
}

export const categories: Category[] = [
  { id: "stocks", name: "Stocks" },
  { id: "crypto", name: "Crypto" },
  { id: "predictions", name: "Predictions" },
  { id: "options", name: "Options" },
  { id: "real-estate", name: "Real Estate" },
  { id: "alternatives", name: "Alternatives" },
  { id: "commodities", name: "Commodities" },
  { id: "forex", name: "Forex" },
  { id: "robo-advisors", name: "Robo-Advisors" },
  { id: "defi", name: "DeFi" },
  { id: "banking", name: "Banking" },
  { id: "bonds", name: "Bonds" }
];
