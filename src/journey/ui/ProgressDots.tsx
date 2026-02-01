export function ProgressDots({ total, active }: { total: number; active: number }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '12px 0' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === active ? 14 : 10,
            height: 10,
            borderRadius: 999,
            background: i === active ? 'var(--mg-good)' : '#dfe9e5',
            transition: 'all .2s',
          }}
        />
      ))}
    </div>
  );
}




