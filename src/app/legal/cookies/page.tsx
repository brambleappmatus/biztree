export default function CookiesPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Zásady používania cookies</h1>

                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-8">
                        Posledná aktualizácia: {new Date().toLocaleDateString('sk-SK')}
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Čo sú cookies?</h2>
                        <p className="text-gray-700 mb-4">
                            Cookies sú malé textové súbory, ktoré sa ukladajú do vášho zariadenia pri návšteve
                            našej webovej stránky. Pomáhajú nám zlepšovať funkčnosť stránky a poskytovať vám
                            lepšiu používateľskú skúsenosť.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Aké cookies používame?</h2>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Nevyhnutné cookies</h3>
                        <p className="text-gray-700 mb-4">
                            Tieto cookies sú potrebné pre základnú funkčnosť stránky a nemožno ich vypnúť:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                            <li><strong>Autentifikačné cookies</strong> - udržiavajú vás prihlásených</li>
                            <li><strong>Bezpečnostné cookies</strong> - chránia vás pred útokmi</li>
                            <li><strong>Preferenčné cookies</strong> - pamätajú si vaše nastavenia (jazyk, téma)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Analytické cookies</h3>
                        <p className="text-gray-700 mb-4">
                            Pomáhajú nám pochopiť, ako návštevníci používajú našu stránku:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                            <li>Počet návštevníkov</li>
                            <li>Najnavštevovanejšie stránky</li>
                            <li>Čas strávený na stránke</li>
                            <li>Zdroj návštevnosti</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ako spravovať cookies?</h2>
                        <p className="text-gray-700 mb-4">
                            Väčšina webových prehliadačov automaticky akceptuje cookies, ale môžete si nastaviť
                            prehliadač tak, aby cookies odmietol alebo vás upozornil pred ich prijatím.
                        </p>
                        <p className="text-gray-700 mb-4">
                            Upozorňujeme, že vypnutie cookies môže ovplyvniť funkčnosť našej stránky a niektoré
                            funkcie nemusia byť dostupné.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Kontakt</h2>
                        <p className="text-gray-700 mb-4">
                            Ak máte otázky týkajúce sa používania cookies, kontaktujte nás na:
                        </p>
                        <p className="text-gray-700">
                            <strong>Email:</strong> support@biztree.sk
                        </p>
                    </section>
                </div>

                <div className="mt-12 text-center">
                    <a
                        href="/"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Späť na hlavnú stránku
                    </a>
                </div>
            </div>
        </div>
    );
}
