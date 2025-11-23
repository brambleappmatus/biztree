import React from "react";

export default function PrivacyPage() {
    return (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8">Ochrana osobných údajov</h1>

            <div className="prose dark:prose-invert">
                <p className="mb-4">
                    Vaše súkromie je pre nás dôležité. Tento dokument vysvetľuje, ako spracúvame vaše osobné údaje pri používaní platformy Biztree.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">1. Aké údaje zbierame</h2>
                <p className="mb-4">
                    Pri rezervácii služby zbierame údaje potrebné na vytvorenie a správu rezervácie, ako sú vaše meno, emailová adresa a telefónne číslo.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">2. Ako údaje používame</h2>
                <p className="mb-4">
                    Vaše údaje poskytujeme výlučne poskytovateľovi služby, u ktorého si robíte rezerváciu, aby vás mohol kontaktovať a poskytnúť vám službu. Vaše údaje nepredávame tretím stranám na marketingové účely.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">3. Bezpečnosť</h2>
                <p className="mb-4">
                    Používame moderné bezpečnostné opatrenia na ochranu vašich údajov pred neoprávneným prístupom, zmenou alebo zničením.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">4. Vaše práva</h2>
                <p className="mb-4">
                    Máte právo požadovať prístup k vašim údajom, ich opravu alebo vymazanie. V prípade otázok nás kontaktujte.
                </p>
            </div>
        </div>
    );
}
