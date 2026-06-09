import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface Props {
  itemName: string | null;
  boughtBy: string | null;
  onClose: () => void;
}

export const PurchasedModal = ({ itemName, boughtBy, onClose }: Props) => {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <span className="modal-emoji">🎉</span>
        <h3 className="modal-title">cineva a cumpărat!</h3>
        {itemName && <p className="modal-item">{itemName}</p>}
        {boughtBy && (
          <p className="modal-buyer">
            cumpărat de <strong>{boughtBy}</strong>
          </p>
        )}
        <button
          className="btn-confirm confirm-add"
          style={{ marginTop: '1rem' }}
          onClick={onClose}
        >
          super! ↗
        </button>
      </div>
    </div>
  );
};
