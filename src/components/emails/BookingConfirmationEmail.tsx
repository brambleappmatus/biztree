import * as React from 'react';

interface BookingConfirmationEmailProps {
    customerName: string;
    serviceName: string;
    date: string;
    time: string;
    location?: string;
    googleCalendarLink?: string;
    appleCalendarLink?: string;
}

export const BookingConfirmationEmail: React.FC<BookingConfirmationEmailProps> = ({
    customerName,
    serviceName,
    date,
    time,
    location,
    googleCalendarLink,
    appleCalendarLink,
}) => (
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    ✓ Rezervácia prijatá
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
                    Vaša rezervácia bola úspešne prijatá a čaká na potvrdenie poskytovateľom.
                </p>

                {/* Booking Details Card */}
                <div style={{
                    backgroundColor: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '24px',
                    margin: '24px 0',
                    border: '1px solid #e2e8f0'
                }}>
                    <h2 style={{
                        margin: '0 0 16px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1e293b'
                    }}>
                        Detaily rezervácie
                    </h2>

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

                {/* Calendar Buttons */}
                {(googleCalendarLink || appleCalendarLink) && (
                    <div style={{ marginTop: '32px' }}>
                        <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            marginBottom: '12px',
                            fontWeight: '500'
                        }}>
                            Pridať do kalendára:
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {googleCalendarLink && (
                                <a
                                    href={googleCalendarLink}
                                    style={{
                                        display: 'inline-block',
                                        backgroundColor: '#4285f4',
                                        color: '#ffffff',
                                        padding: '12px 24px',
                                        textDecoration: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        boxShadow: '0 2px 4px rgba(66, 133, 244, 0.3)'
                                    }}
                                >
                                    📅 Google Calendar
                                </a>
                            )}
                            {appleCalendarLink && (
                                <a
                                    href={appleCalendarLink}
                                    style={{
                                        display: 'inline-block',
                                        backgroundColor: '#000000',
                                        color: '#ffffff',
                                        padding: '12px 24px',
                                        textDecoration: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                                    }}
                                >
                                    Apple Calendar
                                </a>
                            )}
                        </div>
                    </div>
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
