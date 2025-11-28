"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

export default function LandingFooter() {
    const { t } = useLanguage();

    return (
        <footer className="py-12 border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/logo.svg" alt="BizTree" className="w-8 h-8" />
                            <span className="text-xl font-bold text-gray-900">BizTree</span>
                        </div>
                        <p className="text-gray-600 text-sm max-w-md">
                            {t.footer.description}
                        </p>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">{t.footer.legal}</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/business-policy" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                                    {t.footer.terms}
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                                    {t.footer.privacy}
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="text-gray-600 hover:text-blue-600 text-sm transition-colors">
                                    {t.footer.cookies}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">{t.footer.contact}</h3>
                        <ul className="space-y-2">
                            <li className="text-gray-600 text-sm">
                                {t.common.email}: hello@biztree.bio
                            </li>
                            <li className="text-gray-600 text-sm">
                                {t.footer.support}: 24/7
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} BizTree. {t.footer.rights}</p>
                </div>
            </div>
        </footer>
    );
}
