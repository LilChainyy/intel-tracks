import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; referralCode?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!referralCode.trim()) {
      newErrors.referralCode = 'Referral code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateReferralCode = async (code: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('id, is_active, max_uses, current_uses, expires_at')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (error || !data) return false;
    if (!data.is_active) return false;
    if (data.max_uses !== null && data.current_uses >= data.max_uses) return false;
    if (data.expires_at && new Date(data.expires_at) < new Date()) return false;

    return true;
  };

  const incrementReferralCodeUse = async (code: string) => {
    const normalizedCode = code.toUpperCase().trim();
    await supabase.rpc('increment_referral_code_use' as never, { code_text: normalizedCode } as never);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const isValidCode = await validateReferralCode(referralCode);

        if (!isValidCode) {
          setErrors({ referralCode: 'Invalid or expired referral code' });
          toast({
            title: 'Invalid referral code',
            description: 'Please enter a valid referral code.',
            variant: 'destructive',
          });
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          toast({
            title: 'Sign in failed',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }

        toast({ title: 'Welcome back!' });
        onOpenChange(false);
        navigate('/home');
      } else {
        const isValidCode = await validateReferralCode(referralCode);

        if (!isValidCode) {
          setErrors({ referralCode: 'Invalid or expired referral code' });
          toast({
            title: 'Invalid referral code',
            description: 'Please enter a valid referral code to sign up.',
            variant: 'destructive',
          });
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Try signing in instead.',
              variant: 'destructive',
            });
            setIsLogin(true);
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }

        await incrementReferralCodeUse(referralCode);

        toast({ title: 'Account created successfully!' });
        onOpenChange(false);
        navigate('/home');
      }
    } catch (err) {
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setReferralCode('');
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            {isLogin ? 'Welcome back' : 'Get Early Access'}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {isLogin
              ? 'Sign in to your account'
              : 'Enter your referral code to join'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 ${errors.email ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode" className="text-slate-700">Referral Code</Label>
            <Input
              id="referralCode"
              type="text"
              placeholder="Enter your code"
              value={referralCode}
              onChange={(e) => {
                setReferralCode(e.target.value.toUpperCase());
                if (errors.referralCode) setErrors({ ...errors, referralCode: undefined });
              }}
              className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 uppercase ${errors.referralCode ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.referralCode && (
              <p className="text-sm text-red-500">{errors.referralCode}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-slate-900 text-white hover:bg-slate-800"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Sign In' : 'Get Access'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
            }}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            disabled={isLoading}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
