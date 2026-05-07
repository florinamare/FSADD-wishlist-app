export function SkeletonItem() {
  return (
    <div className="item-card" style={{ opacity: 1 }}>
      <div className="item-top">
        <div className="skeleton skeleton-circle" style={{ width: 20, height: 20, flexShrink: 0 }} />
        <div className="skeleton skeleton-circle" style={{ width: 9, height: 9, flexShrink: 0 }} />
        <div className="item-info">
          <div className="skeleton" style={{ height: 15, width: '55%', borderRadius: 6 }} />
          <div className="skeleton" style={{ height: 12, width: '30%', borderRadius: 6, marginTop: 6 }} />
        </div>
        <div className="skeleton" style={{ height: 15, width: 60, borderRadius: 6 }} />
      </div>
    </div>
  );
}
