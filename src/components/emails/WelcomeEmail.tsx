import * as React from 'react';

interface WelcomeEmailProps {
    name: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ name }) => (
    <div style={{ fontFamily: 'sans-serif', lineHeight: '1.5', color: '#333' }}>
        <h1>Vitajte v BizTree!</h1>
        <p>Ahoj {name},</p>
        <p>Sme radi, že ste sa pridali k BizTree. Váš účet bol úspešne vytvorený.</p>
        <p>Teraz si môžete vytvoriť svoj profil a začať prijímať rezervácie.</p>
        <br />
        <p>S pozdravom,</p>
        <p>Tím BizTree</p>
    </div>
);
