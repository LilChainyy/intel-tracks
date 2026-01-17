import { motion } from 'framer-motion';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TopNav } from '@/components/navigation/TopNav';

export default function SavedPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Saved Items
          </h1>
          
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Your saved themes, stocks, and predictions will appear here.
          </p>
          
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
