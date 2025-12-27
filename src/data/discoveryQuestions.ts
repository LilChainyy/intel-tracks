export interface MarketPulseQuestion {
  id: string;
  question: string;
  options: string[];
  explanation: string;
}

export interface ThemeQuestion {
  id: string;
  question: string;
  options: string[];
  popular: string;
  explanation: string;
}

export interface ThemeDiscovery {
  themeId: string;
  themeName: string;
  questions: ThemeQuestion[];
}

// Market Pulse questions - rotate daily
export const marketPulseQuestions: MarketPulseQuestion[] = [
  {
    id: "market-fed",
    question: "Fed 下周开会。你觉得科技股会...",
    options: ["涨", "跌", "没什么变化"],
    explanation: "降息通常利好成长股，但市场可能已经 price in 了。"
  }
];

// Theme discovery data
export const themeDiscoveryData: ThemeDiscovery[] = [
  {
    themeId: "nuclear",
    themeName: "Nuclear Renaissance",
    questions: [
      {
        id: "nuclear-1",
        question: "微软、谷歌、亚马逊最近都在买同一样东西。是什么？",
        options: ["太阳能农场", "核电站", "石油公司"],
        popular: "核电站",
        explanation: "AI 数据中心需要 24/7 稳定供电，核能是唯一选择。"
      },
      {
        id: "nuclear-2",
        question: "这对谁最有利？",
        options: ["挖铀矿的公司", "太阳能公司", "石油公司"],
        popular: "挖铀矿的公司",
        explanation: "铀是核电站的燃料，需求正在暴涨。"
      },
      {
        id: "nuclear-3",
        question: "铀矿股今年涨了多少？",
        options: ["大概 20%", "大概 50%", "超过 80%"],
        popular: "超过 80%",
        explanation: "Cameco (CCJ) 今年涨了 81%。"
      }
    ]
  }
];

// Get today's market pulse question (rotates based on day)
export function getTodaysMarketPulse(): MarketPulseQuestion {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return marketPulseQuestions[dayOfYear % marketPulseQuestions.length];
}

// Get current theme discovery
export function getCurrentThemeDiscovery(): ThemeDiscovery {
  // For MVP, just return the first theme
  return themeDiscoveryData[0];
}

// Generate fake agreement percentage
export function generateAgreementPercentage(isPopular: boolean): number {
  if (isPopular) {
    return Math.floor(Math.random() * 20) + 55; // 55-75%
  }
  return Math.floor(Math.random() * 15) + 20; // 20-35%
}
