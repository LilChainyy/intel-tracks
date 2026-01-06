import { motion } from 'framer-motion';
import { RotateCcw, ChevronRight, Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useQuiz } from '@/context/QuizContext';
import { Progress } from '@/components/ui/progress';

const answerLabels: Record<string, Record<string, string>> = {
  risk: {
    safe: '稳健型',
    balanced: '平衡型',
    growth: '成长型',
    yolo: '激进型'
  },
  timeline: {
    short: '少于1年',
    medium: '1-3年',
    long: '3-5年',
    forever: '5年以上'
  },
  sectors: {
    tech: '科技',
    energy: '能源',
    healthcare: '医疗',
    finance: '金融',
    consumer: '消费',
    industrial: '工业',
    space: '航天',
    entertainment: '娱乐'
  }
};

export function ProfileScreen() {
  const { quizCompleted, setCurrentScreen } = useApp();
  const { state, resetQuiz, startQuiz } = useQuiz();

  const handleTakeQuiz = () => {
    resetQuiz();
    startQuiz();
    setCurrentScreen('quiz');
  };

  const handleRetakeQuiz = () => {
    resetQuiz();
    startQuiz();
    setCurrentScreen('quiz');
  };

  const summaryItems = quizCompleted
    ? [
        {
          label: '风险偏好',
          value: answerLabels.risk[state.answers.risk as string] || '未设置'
        },
        {
          label: '行业偏好',
          value: Array.isArray(state.answers.sectors)
            ? state.answers.sectors.map((s) => answerLabels.sectors[s]).join('、')
            : '未设置'
        },
        {
          label: '投资期限',
          value: answerLabels.timeline[state.answers.timeline as string] || '未设置'
        }
      ]
    : [];

  // Mock progress data - in production this would come from user_research_xp table
  const progressData = {
    level: 2,
    levelName: '进阶投资者',
    currentXP: 1250,
    nextLevelXP: 2000,
    companiesResearched: 3,
    theoriesCreated: 2,
    daysActive: 8,
    currentStreak: 3
  };

  const xpProgress = (progressData.currentXP / progressData.nextLevelXP) * 100;

  return (
    <div className="min-h-screen pb-24 px-6">
      {/* Header */}
      <div className="pt-12 pb-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-foreground"
        >
          个人中心
        </motion.h1>
      </div>

      {/* Investment DNA or Quiz CTA */}
      {quizCompleted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-xl font-bold text-foreground text-center mb-2">你的投资 DNA</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">根据你的答案，我们发现了以下特点</p>
          <div className="space-y-3">
            {summaryItems.map((item) => (
              <div key={item.label} className="card-surface p-4">
                <span className="text-sm text-muted-foreground block mb-1">{item.label}</span>
                <span className="text-base font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={handleRetakeQuiz}
            className="w-full mt-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重新测试
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="section-header mb-3">个性化设置</h3>
          <div className="card-surface p-6 text-center">
            <h4 className="font-semibold text-foreground mb-1">开始测试</h4>
            <p className="text-sm text-muted-foreground mb-4">
              找到适合你投资风格的主题
            </p>
            <button onClick={handleTakeQuiz} className="btn-primary">
              开始测试
            </button>
          </div>
        </motion.div>
      )}

      {/* Your Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h3 className="section-header mb-3">🎓 我的进度</h3>
        <div className="card-surface p-5">
          {/* Level Display */}
          <div className="text-center mb-4">
            <p className="text-lg font-bold text-foreground">
              等级 {progressData.level}：{progressData.levelName}
            </p>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-4">
            <Progress value={xpProgress} className="h-3" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              {progressData.currentXP.toLocaleString()} / {progressData.nextLevelXP.toLocaleString()} XP 升至等级 {progressData.level + 1}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{progressData.companiesResearched}</p>
              <p className="text-xs text-muted-foreground">已研究公司</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{progressData.theoriesCreated}</p>
              <p className="text-xs text-muted-foreground">已创建理论</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground">{progressData.daysActive}</p>
              <p className="text-xs text-muted-foreground">活跃天数</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                {progressData.currentStreak} 天 <Flame className="w-4 h-4 text-orange-500" />
              </p>
              <p className="text-xs text-muted-foreground">连续打卡</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Store Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => setCurrentScreen('store')}
          className="w-full card-surface p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎁</span>
            <div className="text-left">
              <p className="font-semibold text-foreground">奖励商城</p>
              <p className="text-sm text-muted-foreground">用 XP 兑换礼品卡</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </motion.div>
    </div>
  );
}
