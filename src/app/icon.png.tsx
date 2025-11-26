import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
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
                    backgroundColor: '#2563eb',
                    borderRadius: '6px',
                }}
            >
                {/* BizTree logo - simplified tree icon */}
                <svg width="24" height="24" viewBox="0 0 512 512" fill="none">
                    <path d="M256 384V128" stroke="white" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M256 320L160 224" stroke="white" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M256 256L352 160" stroke="white" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="160" cy="224" r="32" fill="white" />
                    <circle cx="352" cy="160" r="32" fill="white" />
                    <circle cx="256" cy="128" r="32" fill="white" />
                    <circle cx="256" cy="384" r="32" fill="white" />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
