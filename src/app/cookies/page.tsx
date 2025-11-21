import React from "react";

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto prose prose-blue">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Zásady používania súborov cookie</h1>

                <p className="text-gray-600 mb-6">
                    Posledná aktualizácia: {new Date().toLocaleDateString('sk-SK')}
                </p>

                <p className="mb-4">
                    Tieto Zásady používania súborov cookie vysvetľujú, čo sú súbory cookie, ako ich používame, typy súborov cookie, ktoré používame, t.j. informácie, ktoré zhromažďujeme pomocou súborov cookie a ako sa tieto informácie používajú, a ako ovládať preferencie súborov cookie.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Čo sú súbory cookie?</h2>
                <p className="mb-4">
                    Súbory cookie sú malé textové súbory, ktoré sa používajú na ukladanie malých informácií. Ukladajú sa do vášho zariadenia, keď sa webová stránka načíta do vášho prehliadača. Tieto súbory cookie nám pomáhajú, aby webová stránka fungovala správne, bola bezpečnejšia, poskytovala lepšiu používateľskú skúsenosť a aby sme pochopili, ako webová stránka funguje a analyzovali, čo funguje a kde je potrebné zlepšenie.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Ako používame súbory cookie?</h2>
                <p className="mb-4">
                    Ako väčšina online služieb, naša webová stránka používa súbory cookie prvej strany a súbory cookie tretích strán na niekoľko účelov. Súbory cookie prvej strany sú väčšinou potrebné na to, aby webová stránka fungovala správne, a nezhromažďujú žiadne vaše osobné údaje.
                </p>
                <p className="mb-4">
                    Súbory cookie tretích strán používané na našej webovej stránke slúžia najmä na pochopenie toho, ako webová stránka funguje, ako s ňou interagujete, na udržanie bezpečnosti našich služieb a celkovo na poskytovanie lepšej a vylepšenej používateľskej skúsenosti a na urýchlenie vašich budúcich interakcií s našou webovou stránkou.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Typy súborov cookie, ktoré používame</h2>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li><strong>Nevyhnutné:</strong> Niektoré súbory cookie sú nevyhnutné na to, aby ste mohli využívať plnú funkčnosť našej stránky. Umožňujú nám udržiavať relácie používateľov a predchádzať akýmkoľvek bezpečnostným hrozbám. Nezhromažďujú ani neuchovávajú žiadne osobné údaje.</li>
                    <li><strong>Štatistické:</strong> Tieto súbory cookie ukladajú informácie, ako je počet návštevníkov webovej stránky, počet jedinečných návštevníkov, ktoré stránky webovej stránky boli navštívené, zdroj návštevy atď. Tieto údaje nám pomáhajú pochopiť a analyzovať, ako dobre webová stránka funguje a kde je potrebné zlepšenie.</li>
                    <li><strong>Funkčné:</strong> Tieto súbory cookie pomáhajú určitým nepodstatným funkciám na našej webovej stránke. Tieto funkcie zahŕňajú vkladanie obsahu, ako sú videá, alebo zdieľanie obsahu webovej stránky na platformách sociálnych médií.</li>
                </ul>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Ako môžem ovládať preferencie súborov cookie?</h2>
                <p className="mb-4">
                    Ak sa rozhodnete zmeniť svoje preferencie neskôr počas relácie prehliadania, môžete na svojej obrazovke kliknúť na kartu "Zásady ochrany osobných údajov a súborov cookie". Tým sa znova zobrazí oznámenie o súhlase, ktoré vám umožní zmeniť vaše preferencie alebo úplne odvolať váš súhlas.
                </p>
                <p className="mb-4">
                    Okrem toho rôzne prehliadače poskytujú rôzne metódy na blokovanie a odstraňovanie súborov cookie používaných webovými stránkami. Môžete zmeniť nastavenia svojho prehliadača tak, aby ste zablokovali/vymazali súbory cookie.
                </p>
            </div>
        </div>
    );
}
