interface ToneSliderProps {
  value: number;                     // 0..100
  onChange: (v: number) => void;
}

export function ToneSlider({ value, onChange }: ToneSliderProps) {
  const label = value < 33 ? 'formal' : value > 66 ? 'casual' : 'equilibrado';
  return (
    <div className="br-slider-wrap">
      <div className="br-slider-labels">
        <span className={value < 33 ? 'mid' : ''}>formal</span>
        <span className={value >= 33 && value <= 66 ? 'mid' : ''}>equilibrado</span>
        <span className={value > 66 ? 'mid' : ''}>casual</span>
      </div>
      <div className="br-slider">
        <div className="fill" style={{ width: `${value}%` }} />
        <div className="ticks"><span/><span/><span/><span/><span/></div>
        <div className="thumb" style={{ left: `${value}%` }} />
      </div>
      {/* Native input sits on top for real interaction (invisible, full-width) */}
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        aria-label={`Tono: ${label}`}
        className="br-slider-native"
      />
    </div>
  );
}
