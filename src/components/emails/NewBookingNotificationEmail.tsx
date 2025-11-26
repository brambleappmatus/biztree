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
    <div style={{ fontFamily: 'sans-serif', lineHeight: '1.5', color: '#333' }}>
        <h1>Nová rezervácia!</h1>
        <p>Ahoj {ownerName},</p>
        <p>Máte novú rezerváciu od <strong>{customerName}</strong>.</p>

        <div style={{ padding: '20px', backgroundColor: '#f0f7ff', borderRadius: '8px', margin: '20px 0', border: '1px solid #cce3ff' }}>
            <h3 style={{ marginTop: 0 }}>Detaily rezervácie</h3>
            <p><strong>Služba:</strong> {serviceName}</p>
            <p><strong>Dátum:</strong> {date}</p>
            <p><strong>Čas:</strong> {time}</p>
            <hr style={{ border: 'none', borderTop: '1px solid #cce3ff', margin: '15px 0' }} />
            <h3 style={{ marginTop: 0 }}>Kontakt na zákazníka</h3>
            <p><strong>Meno:</strong> {customerName}</p>
            <p><strong>Email:</strong> <a href={`mailto:${customerEmail}`}>{customerEmail}</a></p>
            <p><strong>Telefón:</strong> <a href={`tel:${customerPhone}`}>{customerPhone}</a></p>
        </div>

        <p>Rezerváciu môžete spravovať vo svojom dashboarde.</p>
    </div>
);
