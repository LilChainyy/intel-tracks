import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';

export function RewardModal() {
  const { showRewardModal, setShowRewardModal, claimReward } = useApp();

  const handleClaim = () => {
    // Open placeholder URL
    window.open('https://example.com/claim', '_blank');
    claimReward();
  };

  const handleDismiss = () => {
    setShowRewardModal(false);
  };

  return (
    <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <span className="text-6xl">🎉</span>
          </div>
          <DialogTitle className="text-xl text-center">
            You unlocked $5 trading credit!
          </DialogTitle>
          <DialogDescription className="text-center">
            Claim it on our partner platform
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleClaim} className="w-full">
            Login to claim →
          </Button>
          <Button variant="ghost" onClick={handleDismiss} className="w-full">
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
