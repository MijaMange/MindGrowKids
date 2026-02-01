import './logo.css';

export function Logo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`mg-logo ${size}`}>
      <span className="mg-word">MIND</span>
      <span className="mg-word grow">GROW</span>
    </div>
  );
}


