import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'linear-gradient(135deg, #061a36, #0a3d7a)' }}>
      <div style={{ width: 260, height: 260, borderRadius: 76, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.12)', border: '5px solid rgba(186,230,253,.65)', color: '#fcd34d', fontSize: 142, fontWeight: 900, letterSpacing: -18 }}>AW</div>
      <div style={{ marginTop: 28, fontSize: 34, fontWeight: 800, letterSpacing: 2 }}>ANALYTICS</div>
    </div>,
    { ...size }
  );
}
