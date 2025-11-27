export default function BusinessPolicyPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Obchodné podmienky</h1>

                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-8">
                        Posledná aktualizácia: {new Date().toLocaleDateString('sk-SK')}
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Všeobecné ustanovenia</h2>
                        <p className="text-gray-700 mb-4">
                            Táto obchodná politika upravuje podmienky používania služby BizTree a vzťahy medzi
                            poskytovateľom služby a užívateľmi. Zakúpením akejkoľvek licencie alebo predplatného
                            súhlasíte s týmito podmienkami.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Zmeny funkcií a cenových plánov</h2>
                        <p className="text-gray-700 mb-4">
                            <strong>Vyhradzujeme si právo:</strong>
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                            <li>
                                <strong>Upravovať funkcie a vlastnosti</strong> jednotlivých cenových plánov (Free, Business, Pro)
                                kedykoľvek počas trvania predplatného alebo licencie.
                            </li>
                            <li>
                                <strong>Pridávať, odstraňovať alebo meniť funkcie</strong> v rámci aktualizácií produktu,
                                a to aj pre existujúcich užívateľov.
                            </li>
                            <li>
                                <strong>Presúvať funkcie medzi plánmi</strong> - funkcia, ktorá bola súčasťou vášho plánu
                                pri zakúpení, môže byť v budúcnosti presunutá do vyššieho alebo nižšieho plánu.
                            </li>
                            <li>
                                <strong>Upravovať ceny</strong> pre nové predplatné a licencie. Zmeny cien sa nevzťahujú
                                na už aktívne predplatné počas ich trvania.
                            </li>
                        </ul>
                        <p className="text-gray-700 mb-4">
                            O významných zmenách vás budeme informovať e-mailom minimálne 30 dní vopred.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Lifetime (doživotné) licencie</h2>

                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
                            <p className="text-amber-800 font-semibold">
                                ⚠️ Dôležité informácie pre držiteľov Lifetime licencií
                            </p>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Definícia Lifetime licencie</h3>
                        <p className="text-gray-700 mb-4">
                            Lifetime (doživotná) licencia znamená prístup k službe BizTree bez opakovaných platieb,
                            za podmienok uvedených v tejto politike.
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Trvanie Lifetime licencie</h3>
                        <p className="text-gray-700 mb-4">
                            <strong>Lifetime licencia je platná minimálne 5 rokov</strong> od dátumu zakúpenia.
                            Po uplynutí 5 rokov si vyhradzujeme právo:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                            <li>
                                <strong>Ukončiť podporu</strong> pre Lifetime licencie s výpovednou lehotou 90 dní.
                            </li>
                            <li>
                                <strong>Zrušiť Lifetime licencie</strong> v prípade ukončenia prevádzky služby BizTree.
                            </li>
                            <li>
                                <strong>Ponúknuť prechod</strong> na štandardné mesačné alebo ročné predplatné
                                za zvýhodnenú cenu.
                            </li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Zmeny funkcií pre Lifetime licencie</h3>
                        <p className="text-gray-700 mb-4">
                            Lifetime licencie <strong>neposkytujú záruku nezmeneného rozsahu funkcií</strong>.
                            Platia pre ne rovnaké pravidlá ako pre bežné predplatné:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                            <li>Funkcie môžu byť pridané, odstránené alebo upravené</li>
                            <li>Funkcie môžu byť presunuté do iných cenových plánov</li>
                            <li>Držitelia Lifetime licencií budú mať prístup k funkcionalite zodpovedajúcej
                                aktuálnemu stavu ich plánu (Business Lifetime alebo Pro Lifetime)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 Ukončenie služby</h3>
                        <p className="text-gray-700 mb-4">
                            V prípade ukončenia prevádzky služby BizTree:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                            <li>Poskytneme minimálne 6-mesačnú výpovednú lehotu</li>
                            <li>Umožníme export všetkých vašich dát</li>
                            <li>Lifetime licencie nebudú oprávnené na vrátenie peňazí po uplynutí 5 rokov od zakúpenia</li>
                            <li>Pred uplynutím 5 rokov môže byť poskytnutá čiastočná náhrada podľa zostávajúceho obdobia</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Mesačné a ročné predplatné</h2>
                        <p className="text-gray-700 mb-4">
                            Pre mesačné a ročné predplatné platia nasledujúce podmienky:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                            <li>Predplatné sa automaticky obnovuje, pokiaľ ho nezrušíte</li>
                            <li>Zrušenie je možné kedykoľvek, prístup zostáva aktívny do konca plateného obdobia</li>
                            <li>Zmeny cien sa uplatnia až pri ďalšom obnovení predplatného</li>
                            <li>7-dňová skúšobná doba je dostupná pre nových užívateľov</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Vrátenie peňazí</h2>
                        <p className="text-gray-700 mb-4">
                            <strong>Mesačné a ročné predplatné:</strong>
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                            <li>Počas 7-dňovej skúšobnej doby môžete zrušiť bez poplatku</li>
                            <li>Po skúšobnej dobe nie je možné vrátenie peňazí</li>
                        </ul>
                        <p className="text-gray-700 mb-4">
                            <strong>Lifetime licencie:</strong>
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                            <li>Vrátenie peňazí je možné do 14 dní od zakúpenia</li>
                            <li>Po 14 dňoch nie je možné vrátenie peňazí</li>
                            <li>Po uplynutí 5 rokov od zakúpenia nie je možné vrátenie peňazí v žiadnom prípade</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Aktualizácie a údržba</h2>
                        <p className="text-gray-700 mb-4">
                            Služba BizTree je neustále aktualizovaná a vylepšovaná. Vyhradzujeme si právo:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                            <li>Vykonávať plánovanú údržbu s minimálnym vplyvom na dostupnosť služby</li>
                            <li>Implementovať bezpečnostné aktualizácie bez predchádzajúceho upozornenia</li>
                            <li>Upravovať používateľské rozhranie a používateľskú skúsenosť</li>
                            <li>Pridávať nové funkcie, ktoré môžu byť dostupné len pre vyššie plány</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Kontakt</h2>
                        <p className="text-gray-700 mb-4">
                            V prípade otázok týkajúcich sa tejto obchodnej politiky nás kontaktujte na:
                        </p>
                        <p className="text-gray-700">
                            <strong>Email:</strong> hello@biztree.bio<br />
                            <strong>Podpora:</strong> 24/7
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Zmeny tejto politiky</h2>
                        <p className="text-gray-700 mb-4">
                            Vyhradzujeme si právo upravovať túto obchodnú politiku. O významných zmenách
                            vás budeme informovať e-mailom minimálne 30 dní vopred. Pokračovaním v používaní
                            služby po nadobudnutí účinnosti zmien vyjadrujete súhlas s aktualizovanou politikou.
                        </p>
                    </section>

                    <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">
                            Zakúpením akejkoľvek licencie alebo predplatného služby BizTree potvrdzujete,
                            že ste si prečítali, porozumeli a súhlasíte s touto obchodnou politikou.
                        </p>
                    </div>
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
