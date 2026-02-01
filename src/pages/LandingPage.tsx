import { useNavigate } from 'react-router-dom';
import { TrendingUp, Target, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingHeader from '@/components/landing/LandingHeader';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    // Direct navigation to quiz onboarding - first step after login
    navigate('/quiz-onboarding');
  };
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LandingHeader onLoginClick={handleLoginClick} />

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Don't miss the next NVDA.
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            The high-growth assets wealthy kids learn about at dinner. Now accessible to every student.
          </p>
          <Button
            size="lg"
            className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-6 text-lg"
            onClick={handleLoginClick}
          >
            Get Early Access
          </Button>
        </div>
      </section>

      {/* Module 1: Exposure */}
      <section className="py-24 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-16">
            One place. Every asset.
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-8 border border-slate-100 rounded-lg">
              <TrendingUp className="w-10 h-10 text-slate-900 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Stocks</h3>
              <p className="text-slate-600">Identify the next wave early.</p>
            </div>

            <div className="p-8 border border-slate-100 rounded-lg">
              <Target className="w-10 h-10 text-slate-900 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Predictions</h3>
              <p className="text-slate-600">Trade on real-world outcomes.</p>
            </div>

            <div className="p-8 border border-slate-100 rounded-lg">
              <Coins className="w-10 h-10 text-slate-900 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Alt-Assets</h3>
              <p className="text-slate-600">Access tokenized RWA and private credit.</p>
            </div>
          </div>

          <p className="text-center text-slate-600 text-lg">
            Stop burning part-time job cash. Start scaling it.
          </p>
        </div>
      </section>

      {/* Module 2: The Edge */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            No wealthy parents required.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Most students are gatekept from high-alpha assets. We provide the logical rigor and systems thinking you need to understand how the 1% actually builds wealth.
          </p>
        </div>
      </section>

      {/* Module 3: The Outcome */}
      <section className="py-24 px-6 border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Graduate ahead.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-10">
            Turn your internship seeds into a portfolio. Solve for student loans before they start by getting exposed to the right assets while you're young.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white px-8"
            onClick={handleLoginClick}
          >
            Join Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Adamsmyth. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
