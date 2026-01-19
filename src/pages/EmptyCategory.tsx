import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { TopNav } from '@/components/navigation/TopNav';
import { categories } from '@/data/categories';

export default function EmptyCategory() {
  const { category } = useParams<{ category: string }>();
  
  const categoryData = categories.find(c => c.id === category);
  
  if (!categoryData) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Category Not Found</h1>
          <Link to="/" className="text-primary hover:text-primary/80">
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {categoryData.name}
          </h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xl md:text-2xl text-primary font-semibold mb-4">
              Coming Soon
            </p>
            
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              We're building this category. Check back soon for updates.
            </p>
            
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Categories
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
