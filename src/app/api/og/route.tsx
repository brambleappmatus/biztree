import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Get details from query params
        const name = searchParams.get('name') || 'BizTree Profile';
        const tag = searchParams.get('tag') || 'BizTree';
        const image = searchParams.get('image');
        const theme = searchParams.get('theme') || 'blue';

        // Map themes to colors (approximate)
        const themeColors: Record<string, string> = {
            blue: '#2563eb',
            emerald: '#059669',
            coral: '#e11d48',
            purple: '#7c3aed',
            amber: '#d97706',
            cyan: '#0891b2',
            pink: '#db2777',
            rose: '#e11d48',
            orange: '#ea580c',
            teal: '#0d9488',
            indigo: '#4f46e5',
            violet: '#7c3aed',
            fuchsia: '#c026d3',
            lime: '#65a30d',
            sky: '#0284c7',
            gray: '#4b5563',
            slate: '#475569',
            zinc: '#52525b',
            neutral: '#52525b',
            stone: '#57534e',
            red: '#dc2626',
            yellow: '#ca8a04',
            green: '#16a34a',
        };

        const accentColor = themeColors[theme] || themeColors.blue;

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#111827', // Dark background
                        backgroundImage: 'radial-gradient(circle at 25px 25px, #374151 2%, transparent 0%), radial-gradient(circle at 75px 75px, #374151 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                        fontFamily: 'sans-serif',
                    }}
                >
                    {/* Profile Image */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '200px',
                            height: '200px',
                            borderRadius: '100px',
                            overflow: 'hidden',
                            border: `8px solid ${accentColor}`,
                            marginBottom: '40px',
                            backgroundColor: '#1f2937',
                        }}
                    >
                        {image ? (
                            <img
                                src={image}
                                alt={name}
                                width="200"
                                height="200"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    fontSize: '80px',
                                    color: '#9ca3af',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                {name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <div
                        style={{
                            fontSize: '60px',
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: '20px',
                            textAlign: 'center',
                            padding: '0 40px',
                            lineHeight: 1.2,
                        }}
                    >
                        {name}
                    </div>

                    {/* Tag / Subdomain */}
                    <div
                        style={{
                            fontSize: '30px',
                            color: accentColor,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            padding: '10px 30px',
                            borderRadius: '50px',
                            fontWeight: 'bold',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                        }}
                    >
                        {tag}
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
