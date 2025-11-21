import React from "react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto prose prose-blue">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Zásady ochrany osobných údajov</h1>

                <p className="text-gray-600 mb-6">
                    Posledná aktualizácia: {new Date().toLocaleDateString('sk-SK')}
                </p>

                <p className="mb-4">
                    V BizTree ("my", "nás" alebo "náš") sa zaväzujeme chrániť vaše súkromie. Tieto Zásady ochrany osobných údajov vysvetľujú, ako zhromažďujeme, používame, zverejňujeme a chránime vaše informácie, keď používate našu webovú stránku a služby.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Informácie, ktoré zhromažďujeme</h2>
                <p className="mb-4">
                    Môžeme zhromažďovať informácie o vás rôznymi spôsobmi. Informácie, ktoré môžeme zhromažďovať prostredníctvom Služby, závisia od obsahu a materiálov, ktoré používate, a zahŕňajú:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li><strong>Osobné údaje:</strong> Meno, e-mailová adresa a ďalšie kontaktné údaje, ktoré nám dobrovoľne poskytnete pri registrácii alebo pri kontaktovaní nás.</li>
                    <li><strong>Údaje o používaní:</strong> Informácie o vašej aktivite na našej stránke, vrátane času prihlásenia, trvania návštevy a navštívených stránok.</li>
                </ul>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Ako používame vaše informácie</h2>
                <p className="mb-4">
                    Informácie, ktoré o vás zhromažďujeme, môžeme použiť na:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li>Vytvorenie a správu vášho účtu.</li>
                    <li>Poskytovanie a správu našich služieb.</li>
                    <li>Zlepšovanie našich služieb a vývoj nových funkcií.</li>
                    <li>Komunikáciu s vami ohľadom aktualizácií, ponúk a noviniek.</li>
                </ul>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Zdieľanie vašich informácií</h2>
                <p className="mb-4">
                    Vaše informácie môžeme zdieľať v nasledujúcich situáciách:
                </p>
                <ul className="list-disc pl-5 mb-4 space-y-2">
                    <li><strong>Poskytovatelia služieb:</strong> Môžeme zdieľať vaše informácie s tretími stranami, ktoré pre nás vykonávajú služby (napr. spracovanie platieb, hosting).</li>
                    <li><strong>Zákonné požiadavky:</strong> Môžeme zverejniť vaše informácie, ak to vyžaduje zákon alebo ak veríme, že je to nevyhnutné na ochranu našich práv.</li>
                </ul>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Bezpečnosť vašich informácií</h2>
                <p className="mb-4">
                    Používame administratívne, technické a fyzické bezpečnostné opatrenia na ochranu vašich osobných údajov. Hoci sme prijali primerané kroky na zabezpečenie osobných údajov, ktoré nám poskytujete, upozorňujeme, že žiadne bezpečnostné opatrenia nie sú dokonalé alebo nepreniknuteľné a žiadny prenos údajov nemožno zaručiť proti akémukoľvek zachyteniu alebo inému typu zneužitia.
                </p>

                <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Kontaktujte nás</h2>
                <p className="mb-4">
                    Ak máte otázky alebo pripomienky k týmto Zásadám ochrany osobných údajov, kontaktujte nás na:
                </p>
                <p className="font-medium">
                    support@biztree.bio
                </p>
            </div>
        </div>
    );
}
