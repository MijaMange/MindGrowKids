import { useAvatarStore } from '../../state/useAvatarStore';
import './wardrobe.css';

const colors = [
  '#3b2d2a',
  '#6b4f4a',
  '#caa472',
  '#f6d8c2',
  '#E7C3A1',
  '#C6956B',
  '#9C6A49',
  '#6B4226',
  '#3C2415',
  '#86b7ee',
  '#9ccfc2',
  '#f4c36a',
  '#e67a7a',
  '#2b2b2b',
];

export function WardrobePanel() {
  const { avatar, set, reset } = useAvatarStore();

  function colorDot(
    c: string,
    key: keyof typeof avatar | 'hair.color' | 'eyeColor' | 'bodyTone'
  ) {
    return (
      <button
        key={c}
        className="dot"
        style={{ background: c }}
        onClick={() => {
          if (key === 'hair.color') set({ hair: { ...avatar.hair, color: c } });
          else set({ [key as any]: c } as any);
        }}
        title={c}
      />
    );
  }

  function randomize() {
    const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    set({
      bodyTone: pick(colors.slice(3, 6)),
      hair: { style: pick(['short', 'bun']), color: pick(colors) },
      eye: pick(['round', 'smile']),
      eyeColor: '#2b2b2b',
      mouth: pick(['smile', 'open']),
      outfitType: pick(['set', 'topsBottoms']),
      top: pick(['tee', 'hoodie']),
      bottom: pick(['shorts', 'skirt']),
      set: pick(['overalls']),
      accessory: pick(['', 'glasses', 'cap']),
      bg: pick(['mint', 'sunset', 'ocean']),
    });
  }

  return (
    <div className="ward">
      <section>
        <h4>Hår</h4>
        <div className="row">
          <button
            onClick={() => set({ hair: { ...avatar.hair, style: 'short' } })}
            className={avatar.hair.style === 'short' ? 'sel' : ''}
          >
            Kort
          </button>
          <button
            onClick={() => set({ hair: { ...avatar.hair, style: 'bun' } })}
            className={avatar.hair.style === 'bun' ? 'sel' : ''}
          >
            Tofsar
          </button>
          <button
            onClick={() => set({ hair: { ...avatar.hair, style: 'curly' } })}
            className={avatar.hair.style === 'curly' ? 'sel' : ''}
          >
            Lockigt
          </button>
          <button
            onClick={() => set({ hair: { ...avatar.hair, style: 'afro' } })}
            className={avatar.hair.style === 'afro' ? 'sel' : ''}
          >
            Afro
          </button>
          <button
            onClick={() => set({ hair: { ...avatar.hair, style: 'long' } })}
            className={avatar.hair.style === 'long' ? 'sel' : ''}
          >
            Långt
          </button>
          <button
            onClick={() => set({ hair: { ...avatar.hair, style: 'hijab' } })}
            className={avatar.hair.style === 'hijab' ? 'sel' : ''}
          >
            Hijab
          </button>
        </div>
        <div className="row">{colors.map((c) => colorDot(c, 'hair.color'))}</div>
      </section>

      <section>
        <h4>Ögon & mun</h4>
        <div className="row">
          <button
            onClick={() => set({ eye: 'round' })}
            className={avatar.eye === 'round' ? 'sel' : ''}
          >
            Runda
          </button>
          <button
            onClick={() => set({ eye: 'smile' })}
            className={avatar.eye === 'smile' ? 'sel' : ''}
          >
            Leende
          </button>
          <button
            onClick={() => set({ mouth: 'smile' })}
            className={avatar.mouth === 'smile' ? 'sel' : ''}
          >
            🙂
          </button>
          <button
            onClick={() => set({ mouth: 'open' })}
            className={avatar.mouth === 'open' ? 'sel' : ''}
          >
            😮
          </button>
        </div>
      </section>

      <section>
        <h4>Kläder</h4>
        <div className="row">
          <button
            onClick={() => set({ outfitType: 'set' })}
            className={avatar.outfitType === 'set' ? 'sel' : ''}
          >
            Overall
          </button>
          <button
            onClick={() => set({ outfitType: 'topsBottoms' })}
            className={avatar.outfitType === 'topsBottoms' ? 'sel' : ''}
          >
            Tröja + nederdel
          </button>
        </div>
        {avatar.outfitType === 'set' ? (
          <div className="row">
            <button
              onClick={() => set({ set: 'overalls' })}
              className={avatar.set === 'overalls' ? 'sel' : ''}
            >
              Hängsel
            </button>
          </div>
        ) : (
          <>
            <div className="row">
              <button
                onClick={() => set({ top: 'tee' })}
                className={avatar.top === 'tee' ? 'sel' : ''}
              >
                T-shirt
              </button>
              <button
                onClick={() => set({ top: 'hoodie' })}
                className={avatar.top === 'hoodie' ? 'sel' : ''}
              >
                Hoodie
              </button>
            </div>
            <div className="row">
              <button
                onClick={() => set({ bottom: 'shorts' })}
                className={avatar.bottom === 'shorts' ? 'sel' : ''}
              >
                Shorts
              </button>
              <button
                onClick={() => set({ bottom: 'skirt' })}
                className={avatar.bottom === 'skirt' ? 'sel' : ''}
              >
                Kjol
              </button>
            </div>
          </>
        )}
      </section>

      <section>
        <h4>Accessoar & bakgrund</h4>
        <div className="row">
          <button
            onClick={() => set({ accessory: '' })}
            className={avatar.accessory === '' ? 'sel' : ''}
          >
            Ingen
          </button>
          <button
            onClick={() => set({ accessory: 'glasses' })}
            className={avatar.accessory === 'glasses' ? 'sel' : ''}
          >
            Glasögon
          </button>
          <button
            onClick={() => set({ accessory: 'cap' })}
            className={avatar.accessory === 'cap' ? 'sel' : ''}
          >
            Keps
          </button>
          <button
            onClick={() => set({ accessory: 'headphones' })}
            className={avatar.accessory === 'headphones' ? 'sel' : ''}
          >
            Hörlurar
          </button>
          <button
            onClick={() => set({ accessory: 'flower' })}
            className={avatar.accessory === 'flower' ? 'sel' : ''}
          >
            Blomma
          </button>
        </div>
        <div className="row">
          <button
            onClick={() => set({ bg: 'mint' })}
            className={avatar.bg === 'mint' ? 'sel' : ''}
          >
            Mint
          </button>
          <button
            onClick={() => set({ bg: 'sunset' })}
            className={avatar.bg === 'sunset' ? 'sel' : ''}
          >
            Solnedgång
          </button>
          <button
            onClick={() => set({ bg: 'ocean' })}
            className={avatar.bg === 'ocean' ? 'sel' : ''}
          >
            Ocean
          </button>
          <button
            onClick={() => set({ bg: 'forest' })}
            className={avatar.bg === 'forest' ? 'sel' : ''}
          >
            Skog
          </button>
          <button
            onClick={() => set({ bg: 'sunrise' })}
            className={avatar.bg === 'sunrise' ? 'sel' : ''}
          >
            Soluppgång
          </button>
        </div>
      </section>

      <div className="row">
        <button onClick={randomize}>🎲 Slumpa</button>
        <button onClick={reset}>🔄 Reset</button>
      </div>
    </div>
  );
}

