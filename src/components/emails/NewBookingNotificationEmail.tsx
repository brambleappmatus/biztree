import * as React from 'react';

interface NewBookingNotificationEmailProps {
    ownerName: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    serviceName: string;
    date: string;
    time: string;
}

export const NewBookingNotificationEmail: React.FC<NewBookingNotificationEmailProps> = ({
    ownerName,
    customerName,
    customerEmail,
    customerPhone,
    serviceName,
    date,
    time,
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
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                    🔔 Nová rezervácia!
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
                    Ahoj <strong>{ownerName}</strong>,
                </p>
                <p style={{
                    fontSize: '16px',
                    lineHeight: '1.6',
                    color: '#334155'
                }}>
                    Máte novú rezerváciu od zákazníka <strong>{customerName}</strong>.
                </p>

                {/* Booking Details Card */}
                <div style={{
                    backgroundColor: '#ecfdf5',
                    borderRadius: '12px',
                    padding: '24px',
                    margin: '24px 0',
                    border: '1px solid #a7f3d0'
                }}>
                    <h2 style={{
                        margin: '0 0 16px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#065f46'
                    }}>
                        📋 Detaily rezervácie
                    </h2>

                    <div style={{ marginBottom: '12px' }}>
                        <span style={{ color: '#059669', fontSize: '14px', fontWeight: '500' }}>Služba</span>
                        <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                            {serviceName}
                        </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <span style={{ color: '#059669', fontSize: '14px', fontWeight: '500' }}>Dátum a čas</span>
                        <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                            📅 {date} o {time}
                        </div>
                    </div>
                </div>

                {/* Customer Contact Card */}
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
                        👤 Kontakt na zákazníka
                    </h2>

                    <div style={{ marginBottom: '12px' }}>
                        <span style={{ color: '#64748b', fontSize: '14px' }}>Meno</span>
                        <div style={{ color: '#1e293b', fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                            {customerName}
                        </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <span style={{ color: '#64748b', fontSize: '14px' }}>Email</span>
                        <div style={{ marginTop: '4px' }}>
                            <a href={`mailto:${customerEmail}`} style={{
                                color: '#667eea',
                                fontSize: '16px',
                                fontWeight: '500',
                                textDecoration: 'none'
                            }}>
                                📧 {customerEmail}
                            </a>
                        </div>
                    </div>

                    <div>
                        <span style={{ color: '#64748b', fontSize: '14px' }}>Telefón</span>
                        <div style={{ marginTop: '4px' }}>
                            <a href={`tel:${customerPhone}`} style={{
                                color: '#667eea',
                                fontSize: '16px',
                                fontWeight: '500',
                                textDecoration: 'none'
                            }}>
                                📱 {customerPhone}
                            </a>
                        </div>
                    </div>
                </div>

                <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#64748b',
                    textAlign: 'center',
                    margin: '24px 0 0 0'
                }}>
                    Rezerváciu môžete spravovať vo svojom dashboarde.
                </p>
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
