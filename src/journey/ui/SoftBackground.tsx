export default function SoftBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(60% 40% at 50% 0%, var(--mg-soft), transparent 60%)',
        zIndex: -1,
      }}
    />
  );
}




