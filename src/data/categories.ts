export interface Category {
  id: string;
  icon: string;
  name: string;
}

export const categories: Category[] = [
  { id: "stocks", icon: "📈", name: "Stocks" },
  { id: "crypto", icon: "💰", name: "Crypto" },
  { id: "predictions", icon: "🎲", name: "Predictions" },
  { id: "options", icon: "📊", name: "Options" },
  { id: "real-estate", icon: "🏠", name: "Real Estate" },
  { id: "alternatives", icon: "🎨", name: "Alternatives" },
  { id: "commodities", icon: "🌾", name: "Commodities" },
  { id: "forex", icon: "💱", name: "Forex" },
  { id: "robo-advisors", icon: "🤖", name: "Robo-Advisors" },
  { id: "defi", icon: "🔗", name: "DeFi" },
  { id: "banking", icon: "💳", name: "Banking" },
  { id: "bonds", icon: "📜", name: "Bonds" }
];
