import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Profile Screen
    'profile.title': 'Profile',
    'profile.investmentDna': 'Your Investment DNA',
    'profile.investmentDnaDesc': "Based on your answers, here's what we found",
    'profile.retakeQuiz': 'Retake Quiz',
    'profile.personalize': 'Personalize',
    'profile.takeQuiz': 'Take the Quiz',
    'profile.takeQuizDesc': 'Find themes that match your investment style',
    'profile.startQuiz': 'Start Quiz',
    'profile.progress': '🎓 YOUR PROGRESS',
    'profile.level': 'Level',
    'profile.xpToLevel': 'XP to Level',
    'profile.companiesResearched': 'Companies Researched',
    'profile.theoriesCreated': 'Theories Created',
    'profile.daysActive': 'Days Active',
    'profile.currentStreak': 'Current Streak',
    'profile.days': 'days',
    'profile.rewardsStore': 'Rewards Store',
    'profile.rewardsStoreDesc': 'Redeem your XP for gift cards',
    'profile.language': 'Language',
    
    // Risk labels
    'risk.safe': 'Steady wins',
    'risk.balanced': 'Balanced',
    'risk.growth': 'Growth',
    'risk.yolo': 'Moon shots',
    
    // Timeline labels
    'timeline.short': '< 1 year',
    'timeline.medium': '1-3 years',
    'timeline.long': '3-5 years',
    'timeline.forever': '5+ years',
    
    // Sector labels
    'sector.tech': 'Tech',
    'sector.energy': 'Energy',
    'sector.healthcare': 'Healthcare',
    'sector.finance': 'Finance',
    'sector.consumer': 'Consumer',
    'sector.industrial': 'Industrial',
    'sector.space': 'Space',
    'sector.entertainment': 'Entertainment',
    
    // Summary labels
    'summary.risk': 'Risk',
    'summary.sectors': 'Sectors',
    'summary.timeline': 'Timeline',
    'summary.notSet': 'Not set',
    
    // Level names
    'level.intermediate': 'Intermediate Investor',
    
    // Store Screen
    'store.title': 'Rewards Store',
    'store.yourBalance': 'Your Balance',
    'store.credits': 'Credits',
    'store.redeemGiftCards': 'Redeem Gift Cards',
    'store.redeemDesc': 'Exchange your earned XP credits for gift cards from your favorite brands.',
    'store.redeem': 'Redeem',
    'store.locked': 'Locked',
    'store.viewAll': 'View All Rewards (12 available)',
    
    // AI Advisor
    'advisor.title': 'AI Advisor',
    'advisor.online': 'Online',
    'advisor.askAnything': 'Ask me anything about investing...',
    'advisor.thinking': 'Thinking...',
    'advisor.welcome': "Hi! I'm your AI financial advisor. Ask me anything about stocks, investing strategies, market trends, or financial planning. I'm here to help!",
    'advisor.send': 'Send',
  },
  zh: {
    // Profile Screen
    'profile.title': '个人中心',
    'profile.investmentDna': '你的投资 DNA',
    'profile.investmentDnaDesc': '根据你的答案，我们发现了以下特点',
    'profile.retakeQuiz': '重新测试',
    'profile.personalize': '个性化设置',
    'profile.takeQuiz': '开始测试',
    'profile.takeQuizDesc': '找到适合你投资风格的主题',
    'profile.startQuiz': '开始测试',
    'profile.progress': '🎓 我的进度',
    'profile.level': '等级',
    'profile.xpToLevel': 'XP 升至等级',
    'profile.companiesResearched': '已研究公司',
    'profile.theoriesCreated': '已创建理论',
    'profile.daysActive': '活跃天数',
    'profile.currentStreak': '连续打卡',
    'profile.days': '天',
    'profile.rewardsStore': '奖励商城',
    'profile.rewardsStoreDesc': '用 XP 兑换礼品卡',
    'profile.language': '语言',
    
    // Risk labels
    'risk.safe': '稳健型',
    'risk.balanced': '平衡型',
    'risk.growth': '成长型',
    'risk.yolo': '激进型',
    
    // Timeline labels
    'timeline.short': '少于1年',
    'timeline.medium': '1-3年',
    'timeline.long': '3-5年',
    'timeline.forever': '5年以上',
    
    // Sector labels
    'sector.tech': '科技',
    'sector.energy': '能源',
    'sector.healthcare': '医疗',
    'sector.finance': '金融',
    'sector.consumer': '消费',
    'sector.industrial': '工业',
    'sector.space': '航天',
    'sector.entertainment': '娱乐',
    
    // Summary labels
    'summary.risk': '风险偏好',
    'summary.sectors': '行业偏好',
    'summary.timeline': '投资期限',
    'summary.notSet': '未设置',
    
    // Level names
    'level.intermediate': '进阶投资者',
    
    // Store Screen
    'store.title': '奖励商城',
    'store.yourBalance': '你的余额',
    'store.credits': '积分',
    'store.redeemGiftCards': '兑换礼品卡',
    'store.redeemDesc': '用你赚取的 XP 积分兑换心仪品牌的礼品卡。',
    'store.redeem': '兑换',
    'store.locked': '未解锁',
    'store.viewAll': '查看全部奖励（12 个可用）',
    
    // AI Advisor
    'advisor.title': 'AI 顾问',
    'advisor.online': '在线',
    'advisor.askAnything': '问我任何关于投资的问题...',
    'advisor.thinking': '思考中...',
    'advisor.welcome': '您好！我是您的 AI 理财顾问。您可以问我任何关于股票、投资策略、市场趋势或财务规划的问题，我很乐意帮助您！',
    'advisor.send': '发送',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
