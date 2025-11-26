import * as React from 'react';

interface BookingConfirmationEmailProps {
    customerName: string;
    serviceName: string;
    date: string;
    time: string;
    location?: string;
    googleCalendarLink?: string;
}

export const BookingConfirmationEmail: React.FC<BookingConfirmationEmailProps> = ({
    customerName,
    serviceName,
    date,
    time,
    location,
    googleCalendarLink,
}) => (
    <div style={{ fontFamily: 'sans-serif', lineHeight: '1.5', color: '#333' }}>
        <h1>Potvrdenie rezervácie</h1>
        <p>Ahoj {customerName},</p>
        <p>Vaša rezervácia bola úspešne potvrdená.</p>
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', margin: '20px 0' }}>
            <p><strong>Služba:</strong> {serviceName}</p>
            <p><strong>Dátum:</strong> {date}</p>
            <p><strong>Čas:</strong> {time}</p>
            {location && <p><strong>Miesto:</strong> {location}</p>}
        </div>

        {googleCalendarLink && (
            <div style={{ marginTop: '20px' }}>
                <a
                    href={googleCalendarLink}
                    style={{
                        backgroundColor: '#000',
                        color: '#fff',
                        padding: '10px 20px',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        fontWeight: 'bold'
                    }}
                >
                    Pridať do Google Kalendára
                </a>
            </div>
        )}

        <br />
        <p>Tešíme sa na Vás!</p>
    </div>
);
