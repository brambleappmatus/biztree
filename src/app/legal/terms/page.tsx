import React from "react";

export default function TermsPage() {
    return (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8">Obchodné podmienky</h1>

            <div className="prose dark:prose-invert">
                <p className="mb-4">
                    Tieto obchodné podmienky upravujú používanie platformy Biztree. Používaním tejto služby súhlasíte s týmito podmienkami.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">1. Úvodné ustanovenia</h2>
                <p className="mb-4">
                    Biztree je technologická platforma, ktorá umožňuje poskytovateľom služieb spravovať svoje rezervácie a zákazníkom rezervovať si termíny.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">2. Vzťah medzi stranami</h2>
                <p className="mb-4">
                    Biztree nie je poskytovateľom samotných služieb (napr. masáže, kaderníctvo, konzultácie), ktoré si cez platformu rezervujete. Zmluva o poskytnutí služby vzniká výlučne medzi vami (zákazníkom) a poskytovateľom služby.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">3. Zodpovednosť</h2>
                <p className="mb-4">
                    Biztree nenesie zodpovednosť za kvalitu, bezpečnosť alebo legálnosť služieb ponúkaných poskytovateľmi, ani za pravdivosť informácií uvedených v ich profiloch. Akékoľvek reklamácie alebo spory týkajúce sa služby musia byť riešené priamo s poskytovateľom.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">4. Rezervácie a storno</h2>
                <p className="mb-4">
                    Podmienky rezervácie a stornovania termínov si určuje každý poskytovateľ individuálne. Prosím, informujte sa o týchto podmienkach priamo u poskytovateľa služby.
                </p>
            </div>
        </div>
    );
}
