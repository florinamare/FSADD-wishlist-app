import ConfettiBoom from 'react-confetti-boom';

interface Props {
  itemName: string | null;
  boughtBy: string | null;
  onClose: () => void;
}

export const PurchasedModal = ({ itemName, boughtBy, onClose }: Props) => {
  return (
    <>
      <ConfettiBoom
        mode="boom"
        particleCount={280}
        shapeSize={11}
        spreadDeg={52}
        x={0.5}
        y={0.45}
        launchSpeed={1.4}
        colors={['#5E5CE6', '#FF9F0A', '#34C759', '#FF3B30', '#007AFF', '#FF6B9D', '#FFD60A', '#30D158']}
        effectCount={2}
        effectInterval={600}
        style={{ zIndex: 3000 }}
      />

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <span className="modal-emoji">🎁</span>
          <h3 className="modal-title">cineva a cumpărat!</h3>

          {boughtBy && (
            <div className="modal-buyer-badge">
              {boughtBy}
            </div>
          )}

          {itemName && <p className="modal-item">{itemName}</p>}

          {!boughtBy && (
            <p className="modal-buyer">cineva a bifat asta pentru tine</p>
          )}

          <button
            className="btn-add"
            style={{ marginTop: '1.25rem', marginLeft: 0, width: '100%', justifyContent: 'center', display: 'flex' }}
            onClick={onClose}
          >
            mulțumesc! 🙌
          </button>
        </div>
      </div>
    </>
  );
};
