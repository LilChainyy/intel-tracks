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
import { Loader2 } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; referralCode?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email';
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

  // Generate a consistent password from referral code (acts as password)
  const getPasswordFromReferralCode = (code: string): string => {
    // Use referral code as password (since it's required anyway)
    // In production, you might want to hash this differently
    return `ref_${code.toUpperCase().trim()}_pass`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedReferralCode = referralCode.toUpperCase().trim();
      
      // Debug: log current mode
      console.log('Form mode:', isLogin ? 'LOGIN' : 'SIGNUP');
      
      // Validate referral code first
      const isValidCode = await validateReferralCode(normalizedReferralCode);
      if (!isValidCode) {
        setErrors({ referralCode: 'Invalid or expired referral code' });
        toast({
          title: 'Invalid referral code',
          description: 'Please enter a valid referral code.',
          variant: 'destructive',
        });
        return;
      }

      const password = getPasswordFromReferralCode(normalizedReferralCode);

      if (isLogin) {
        // Login: email + referral code
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          // If user doesn't exist, suggest signup
          if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
            toast({
              title: 'Account not found',
              description: 'Email not found. Please sign up first.',
              variant: 'destructive',
            });
            setIsLogin(false);
          } else {
            toast({
              title: 'Sign in failed',
              description: 'Invalid email or referral code.',
              variant: 'destructive',
            });
          }
          return;
        }

        toast({ title: 'Welcome back!' });
        onOpenChange(false);
        navigate('/home');
      } else {
        // SIGNUP: email + referral code
        console.log('=== SIGNUP MODE ===');
        console.log('Attempting signup with:', { email: normalizedEmail, hasReferralCode: !!normalizedReferralCode });
        
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
            data: {
              referral_code_used: normalizedReferralCode,
            },
          },
        });

        console.log('Signup response:', { 
          hasUser: !!data?.user, 
          hasSession: !!data?.session,
          error: error?.message 
        });

        if (error) {
          console.error('Signup error details:', {
            message: error.message,
            status: error.status,
            name: error.name
          });
          
          // Handle specific error cases
          const errorMsg = error.message.toLowerCase();
          
          if (errorMsg.includes('already registered') || 
              errorMsg.includes('user already registered') || 
              errorMsg.includes('already been registered') ||
              errorMsg.includes('email address is already registered')) {
            toast({
              title: 'Account already exists',
              description: 'This email is already registered. Please sign in instead.',
              variant: 'destructive',
            });
            setIsLogin(true);
            setIsLoading(false);
            return;
          }
          
          // Show the actual error message
          toast({
            title: 'Sign up failed',
            description: error.message || 'Unable to create account. Please check your email and referral code.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        // Signup succeeded - increment referral code usage
        incrementReferralCodeUse(normalizedReferralCode).catch(err => {
          console.error('Failed to increment referral code:', err);
          // Don't block signup if this fails
        });

        // Check if user was created and signed in
        if (data?.user) {
          console.log('User created successfully:', data.user.id);
          
          // If we have a session, user is signed in
          if (data.session) {
            toast({ title: 'Account created successfully!' });
            onOpenChange(false);
            navigate('/home');
          } else {
            // Email confirmation might be required
            toast({
              title: 'Account created!',
              description: 'Please check your email to confirm your account, or sign in if email confirmation is disabled.',
            });
            // Optionally switch to login mode
            setIsLogin(true);
          }
        } else {
          // No user created - this shouldn't happen without an error
          toast({
            title: 'Sign up incomplete',
            description: 'Account creation may have failed. Please try again.',
            variant: 'destructive',
          });
        }
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
            <Label htmlFor="referralCode" className="text-slate-700">Referral Code</Label>
            <Input
              id="referralCode"
              type="text"
              placeholder="Enter your referral code"
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
