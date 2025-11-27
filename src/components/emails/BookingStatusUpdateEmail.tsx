import * as React from 'react';

interface BookingStatusUpdateEmailProps {
    customerName: string;
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
    status: 'confirmed' | 'cancelled';
    location?: string;
}

export const BookingStatusUpdateEmail: React.FC<BookingStatusUpdateEmailProps> = ({
    customerName,
    businessName,
    serviceName,
    date,
    time,
    status,
    location,
}) => {
    const isConfirmed = status === 'confirmed';
    const headerColor = isConfirmed ? '#10b981' : '#ef4444';
    const headerGradient = isConfirmed
        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    const emoji = isConfirmed ? '✅' : '❌';
    const title = isConfirmed ? 'Rezervácia potvrdená!' : 'Rezervácia zrušená';
    const message = isConfirmed
        ? `${businessName} potvrdil vašu rezerváciu. Tešíme sa na stretnutie s Vami!`
        : `${businessName} zrušil vašu rezerváciu. Ospravedlňujeme sa za nepríjemnosti.`;

    return (
        <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            backgroundColor: '#f8fafc',
            padding: '40px 20px'
        }}>
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                {/* Header */}
                <div style={{
                    background: headerGradient,
                    padding: '32px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        margin: 0,
                        color: '#ffffff',
                        fontSize: '28px',
                        fontWeight: '700',
                        letterSpacing: '-0.5px'
                    }}>
                        {emoji} {title}
                    </h1>
                </div>

                {/* Content */}
                <div style={{ padding: '32px' }}>
                    <p style={{
                        fontSize: '16px',
                        lineHeight: '1.6',
                        color: '#334155',
                        marginTop: 0
                    }}>
                        Ahoj <strong>{customerName}</strong>,
                    </p>
                    <p style={{
                        fontSize: '16px',
                        lineHeight: '1.6',
                        color: '#334155'
                    }}>
                        {message}
                    </p>

                    {/* Booking Details Card */}
                    <div style={{
                        backgroundColor: isConfirmed ? '#ecfdf5' : '#fef2f2',
                        borderRadius: '12px',
                        padding: '24px',
                        margin: '24px 0',
                        border: `1px solid ${isConfirmed ? '#a7f3d0' : '#fecaca'}`
                    }}>
                        <h2 style={{
                            margin: '0 0 16px 0',
                            fontSize: '18px',
                            fontWeight: '600',
                            color: isConfirmed ? '#065f46' : '#991b1b'
                        }}>
                            Detaily rezervácie
                        </h2>

                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ color: '#64748b', fontSize: '14px' }}>Poskytovateľ</span>
                            <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                                {businessName}
                            </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ color: '#64748b', fontSize: '14px' }}>Služba</span>
                            <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                                {serviceName}
                            </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <span style={{ color: '#64748b', fontSize: '14px' }}>Dátum a čas</span>
                            <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                                📅 {date} o {time}
                            </div>
                        </div>

                        {location && (
                            <div>
                                <span style={{ color: '#64748b', fontSize: '14px' }}>Miesto</span>
                                <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                                    📍 {location}
                                </div>
                            </div>
                        )}
                    </div>

                    {!isConfirmed && (
                        <p style={{
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: '#64748b',
                            textAlign: 'center',
                            margin: '24px 0 0 0',
                            fontStyle: 'italic'
                        }}>
                            Ak máte otázky, kontaktujte prosím {businessName} priamo.
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '24px 32px',
                    borderTop: '1px solid #e2e8f0',
                    textAlign: 'center'
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#64748b'
                    }}>
                        Powered by <strong style={{ color: '#667eea' }}>BizTree</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};
