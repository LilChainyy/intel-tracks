import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { categories } from '@/data/categories';

export default function HomePage() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'stocks') {
      navigate('/stocks');
    } else {
      navigate(`/${categoryId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Adamsmyth
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Discover Financial Products
          </p>
        </motion.div>

        {/* Category Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              onClick={() => handleCategoryClick(category.id)}
              className="group card-surface p-6 md:p-8 flex flex-col items-center justify-center gap-3 hover:bg-secondary/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform">
                {category.icon}
              </span>
              <span className="text-sm md:text-base font-medium text-foreground">
                {category.name}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
