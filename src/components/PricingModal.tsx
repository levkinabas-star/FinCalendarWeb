import { lazy, Suspense } from 'react';
import Modal from './Modal';

const Pricing = lazy(() => import('../pages/Pricing'));

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PricingModal({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} fullHeight>
      <Suspense fallback={
        <div className="flex items-center justify-center" style={{ height: '60vh' }}>
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#F59E0B', borderTopColor: 'transparent' }} />
        </div>
      }>
        <Pricing isModal onClose={onClose} />
      </Suspense>
    </Modal>
  );
}
