import React from "react";

export default function DisclaimerPage() {
    return (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold mb-8">Vylúčenie zodpovednosti</h1>

            <div className="prose dark:prose-invert">
                <p className="mb-4">
                    Biztree je sprostredkovateľská platforma. Nie sme poskytovateľom služieb, ktoré sú na platforme inzerované.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">Zodpovednosť za služby</h2>
                <p className="mb-4">
                    Za poskytovanie služieb, ich kvalitu, bezpečnosť a súlad s právnymi predpismi plne zodpovedá konkrétny poskytovateľ služby (vendor). Biztree nenesie žiadnu zodpovednosť za škody, zranenia alebo iné ujmy vzniknuté v súvislosti s využitím služieb rezervovaných cez našu platformu.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-3">Kontaktovanie poskytovateľa</h2>
                <p className="mb-4">
                    V prípade akýchkoľvek otázok, sťažností alebo požiadaviek týkajúcich sa konkrétnej služby alebo rezervácie, prosím, kontaktujte priamo poskytovateľa služby. Kontaktné údaje nájdete v detaile rezervácie alebo na profile poskytovateľa.
                </p>
            </div>
        </div>
    );
}
