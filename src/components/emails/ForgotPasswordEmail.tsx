import * as React from 'react';

interface ForgotPasswordEmailProps {
    name: string;
    resetLink: string;
}

export const ForgotPasswordEmail: React.FC<ForgotPasswordEmailProps> = ({ name, resetLink }) => (
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
                    🔐 Reset hesla
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
                    Ahoj <strong>{name}</strong>,
                </p>
                <p style={{
                    fontSize: '16px',
                    lineHeight: '1.6',
                    color: '#334155'
                }}>
                    Dostali sme požiadavku na reset hesla pre váš BizTree účet. Ak ste túto požiadavku nevykonali, môžete tento email ignorovať.
                </p>

                {/* Info Card */}
                <div style={{
                    backgroundColor: '#fef3c7',
                    borderRadius: '12px',
                    padding: '20px',
                    margin: '24px 0',
                    border: '1px solid #fbbf24'
                }}>
                    <p style={{
                        margin: 0,
                        fontSize: '14px',
                        color: '#92400e',
                        lineHeight: '1.6'
                    }}>
                        ⚠️ <strong>Dôležité:</strong> Tento odkaz je platný len 1 hodinu. Po uplynutí času budete musieť požiadať o nový reset hesla.
                    </p>
                </div>

                {/* Reset Button */}
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <a
                        href={resetLink}
                        style={{
                            display: 'inline-block',
                            backgroundColor: '#667eea',
                            color: '#ffffff',
                            padding: '14px 32px',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '16px',
                            boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)'
                        }}
                    >
                        🔑 Resetovať heslo
                    </a>
                </div>

                <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#64748b',
                    textAlign: 'center',
                    margin: '16px 0 0 0'
                }}>
                    Kliknutím na tlačidlo sa dostanete na stránku pre nastavenie nového hesla.
                </p>

                {/* Alternative Link */}
                <div style={{
                    backgroundColor: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '20px',
                    margin: '24px 0',
                    border: '1px solid #e2e8f0'
                }}>
                    <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '13px',
                        color: '#64748b',
                        fontWeight: '600'
                    }}>
                        Ak tlačidlo nefunguje, skopírujte tento odkaz:
                    </p>
                    <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#667eea',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace'
                    }}>
                        {resetLink}
                    </p>
                </div>

                <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#64748b',
                    margin: '24px 0 0 0'
                }}>
                    Ak ste nepožiadali o reset hesla, váš účet je stále v bezpečí. Môžete tento email ignorovať.
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
