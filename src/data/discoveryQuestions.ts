export interface MarketQuestion {
  id: string;
  question: string;
  options: string[];
  popular: string;  // The majority answer
  explanation: string;
}

export interface ThemeQuestion {
  id: string;
  question: string;
  options: string[];
  popular: string;
  explanation: string;
}

export interface ThemeData {
  themeId: string;
  themeName: string;
  icon: string;
  questions: ThemeQuestion[];
}

// Market questions - show one at a time, daily limit of 10
export const marketQuestions: MarketQuestion[] = [
  {
    id: "market-1",
    question: "Fed 下周开会。你觉得科技股会...",
    options: ["涨", "跌", "没什么变化"],
    popular: "涨",
    explanation: "降息通常利好成长股，但市场可能已经 price in 了。"
  },
  {
    id: "market-2",
    question: "AI 公司估值是泡沫吗？",
    options: ["是，很快会崩", "不是，还有空间", "很难说"],
    popular: "不是，还有空间",
    explanation: "AI 公司收入增长速度快于互联网泡沫时期。"
  },
  {
    id: "market-3",
    question: "你觉得 2024 年美股会...",
    options: ["继续涨", "横盘震荡", "大跌"],
    popular: "继续涨",
    explanation: "历史上选举年通常对股市有利。"
  },
  {
    id: "market-4",
    question: "中国股市今年会反弹吗？",
    options: ["会，机会来了", "不会，还要等", "说不准"],
    popular: "说不准",
    explanation: "政策支持 vs 经济基本面，市场分歧很大。"
  },
  {
    id: "market-5",
    question: "黄金还能买吗？",
    options: ["能，避险首选", "不能，太贵了", "少量配置"],
    popular: "少量配置",
    explanation: "地缘政治不确定性支撑金价，但已创新高。"
  },
  {
    id: "market-6",
    question: "电动车行业谁会赢？",
    options: ["特斯拉", "中国车企", "传统车企"],
    popular: "中国车企",
    explanation: "比亚迪销量已超特斯拉，成本优势明显。"
  },
  {
    id: "market-7",
    question: "你会买加密货币吗？",
    options: ["会，机会难得", "不会，风险太大", "观望中"],
    popular: "观望中",
    explanation: "比特币 ETF 获批后资金流入，但波动性仍高。"
  },
  {
    id: "market-8",
    question: "美元会继续走强吗？",
    options: ["会", "不会", "维持现状"],
    popular: "维持现状",
    explanation: "利率见顶但降息节奏不确定。"
  },
  {
    id: "market-9",
    question: "你觉得现在是买房好时机吗？",
    options: ["是", "不是", "看地区"],
    popular: "看地区",
    explanation: "利率高企但库存紧张，各地情况不同。"
  },
  {
    id: "market-10",
    question: "明年科技股还是领头羊吗？",
    options: ["是", "不是", "轮动到其他板块"],
    popular: "是",
    explanation: "AI 浪潮才刚开始，科技股仍有动能。"
  }
];

// Theme data with questions for unlocking
export const themesData: ThemeData[] = [
  {
    themeId: "nuclear",
    themeName: "Nuclear Renaissance",
    icon: "⚛️",
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
  },
  {
    themeId: "netflix",
    themeName: "Streaming Wars Winners",
    icon: "📺",
    questions: [
      {
        id: "netflix-1",
        question: "Netflix 广告会员数量达到多少了？",
        options: ["1000万", "4000万", "1亿"],
        popular: "4000万",
        explanation: "广告会员在18个月内从0增长到4000万。"
      },
      {
        id: "netflix-2",
        question: "打击密码共享后，Netflix 一个季度增加了多少订阅？",
        options: ["500万", "1300万", "3000万"],
        popular: "1300万",
        explanation: "密码共享打击比预期效果更好。"
      },
      {
        id: "netflix-3",
        question: "流媒体大战的最终赢家可能有几家？",
        options: ["1-2家", "3-4家", "5家以上"],
        popular: "3-4家",
        explanation: "市场正在整合，只有少数玩家能盈利。"
      }
    ]
  },
  {
    themeId: "defense",
    themeName: "Defense & Aerospace",
    icon: "🛡️",
    questions: [
      {
        id: "defense-1",
        question: "2024年美国国防预算是多少？",
        options: ["5000亿美元", "8860亿美元", "1万亿美元"],
        popular: "8860亿美元",
        explanation: "创历史新高，还在继续增长。"
      },
      {
        id: "defense-2",
        question: "欧洲国防支出处于什么水平？",
        options: ["二战后最低", "冷战以来最高", "和往年差不多"],
        popular: "冷战以来最高",
        explanation: "俄乌战争后，北约国家纷纷增加军费。"
      },
      {
        id: "defense-3",
        question: "主要国防承包商的订单积压到哪一年？",
        options: ["2025年", "2028年", "2030年后"],
        popular: "2030年后",
        explanation: "洛克希德马丁等公司订单已排到2030年之后。"
      }
    ]
  },
  {
    themeId: "space",
    themeName: "Space Economy",
    icon: "🚀",
    questions: [
      {
        id: "space-1",
        question: "SpaceX 发射成本比10年前降低了多少？",
        options: ["50%", "70%", "90%"],
        popular: "90%",
        explanation: "可重复使用火箭彻底改变了太空经济学。"
      },
      {
        id: "space-2",
        question: "Starlink 卫星数量达到多少颗？",
        options: ["1000颗", "3000颗", "7000颗"],
        popular: "7000颗",
        explanation: "SpaceX 正在建设全球最大的卫星网络。"
      },
      {
        id: "space-3",
        question: "国际空间站什么时候退役？",
        options: ["2025年", "2030年", "2035年"],
        popular: "2030年",
        explanation: "私人空间站将接替 ISS。"
      }
    ]
  },
  {
    themeId: "pets",
    themeName: "Pet Economy",
    icon: "🐕",
    questions: [
      {
        id: "pets-1",
        question: "美国宠物年支出是多少？",
        options: ["500亿美元", "1000亿美元", "1470亿美元"],
        popular: "1470亿美元",
        explanation: "宠物已经成为家庭成员，支出持续增长。"
      },
      {
        id: "pets-2",
        question: "美国宠物保险渗透率是多少？",
        options: ["4%", "15%", "25%"],
        popular: "4%",
        explanation: "对比英国的25%，美国市场还有很大空间。"
      },
      {
        id: "pets-3",
        question: "Chewy 的自动续订收入占比是多少？",
        options: ["30%", "55%", "78%"],
        popular: "78%",
        explanation: "订阅模式创造了极强的用户粘性。"
      }
    ]
  },
  {
    themeId: "barbell",
    themeName: "Retail Barbell",
    icon: "🛒",
    questions: [
      {
        id: "barbell-1",
        question: "Costco 今年股价涨了多少？",
        options: ["+15%", "+30%", "+45%"],
        popular: "+45%",
        explanation: "会员制零售商在消费分化中受益。"
      },
      {
        id: "barbell-2",
        question: "中端零售商（如 Kohl's）的命运是？",
        options: ["复苏中", "挣扎求存", "已经倒闭"],
        popular: "挣扎求存",
        explanation: "消费者要么追求极致性价比，要么追求高端体验。"
      },
      {
        id: "barbell-3",
        question: "零售的未来是？",
        options: ["只剩线上", "两极分化", "回归线下"],
        popular: "两极分化",
        explanation: "便宜的更便宜，贵的更贵，中间消失。"
      }
    ]
  },
  {
    themeId: "longevity",
    themeName: "Future of Longevity",
    icon: "🧬",
    questions: [
      {
        id: "longevity-1",
        question: "贝佐斯投资 Altos Labs 多少钱？",
        options: ["5亿美元", "30亿美元", "100亿美元"],
        popular: "30亿美元",
        explanation: "细胞重编程是抗衰老研究的前沿。"
      },
      {
        id: "longevity-2",
        question: "GLP-1 减肥药让哪家公司成为欧洲市值最高？",
        options: ["诺华", "诺和诺德", "罗氏"],
        popular: "诺和诺德",
        explanation: "Ozempic/Wegovy 创造了史上最快增长的药物类别。"
      },
      {
        id: "longevity-3",
        question: "FDA 开始承认什么是可治疗的病症？",
        options: ["肥胖", "衰老", "秃头"],
        popular: "衰老",
        explanation: "这是抗衰老领域的里程碑式监管转变。"
      }
    ]
  }
];

// Generate fake percentage - majority answer gets 55-75%, others get lower
export function generatePercentage(isPopular: boolean): number {
  if (isPopular) {
    return Math.floor(Math.random() * 20) + 55; // 55-75%
  }
  return Math.floor(Math.random() * 15) + 15; // 15-30%
}

// Get today's date string for tracking daily limits
export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}
