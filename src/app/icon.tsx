import { ImageResponse } from 'next/og';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: '#0A1628',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #004B63, #00897B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="35" r="15" fill="#FF6F61" opacity="0.9" />
            <rect x="25" y="55" width="50" height="30" rx="4" fill="white" opacity="0.95" />
            <rect x="30" y="60" width="12" height="20" rx="2" fill="#004B63" />
            <rect x="44" y="60" width="12" height="20" rx="2" fill="#004B63" />
            <rect x="58" y="60" width="12" height="20" rx="2" fill="#004B63" />
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
