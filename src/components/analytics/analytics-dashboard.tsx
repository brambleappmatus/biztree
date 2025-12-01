'use client'

import { useState, useTransition } from 'react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Users, Clock, MousePointer, Globe, Calendar as CalendarIcon, ChevronDown, X, Lock } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { sk } from 'date-fns/locale'
import { isFeatureAllowed } from '@/lib/subscription-limits'
import { PremiumModal } from '@/components/ui/premium-modal'

interface AnalyticsData {
    totalViews: number
    uniqueVisitors: number
    avgTimeSpent: number
    totalClicks: number
    viewsOverTime: { date: string; views: number }[]
    deviceBreakdown: { name: string; value: number }[]
    topReferrers: { referrer: string; count: number }[]
}

interface AnalyticsDashboardProps {
    data: AnalyticsData
    tierName?: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function AnalyticsDashboard({ data, tierName }: AnalyticsDashboardProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()

    // Local state for optimistic updates
    const [activePeriod, setActivePeriod] = useState(searchParams.get('period') || '30d')
    const [showCustomPicker, setShowCustomPicker] = useState(false)
    const [customDateRange, setCustomDateRange] = useState({
        from: searchParams.get('from') || '',
        to: searchParams.get('to') || ''
    })
    const [showPremiumModal, setShowPremiumModal] = useState(false)

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${minutes}m ${secs}s`
    }

    const handlePeriodChange = (period: string) => {
        if (period === 'custom') {
            setActivePeriod('custom')
            setShowCustomPicker(!showCustomPicker)
            return
        }

        setShowCustomPicker(false)
        setActivePeriod(period) // Optimistic update

        startTransition(() => {
            const params = new URLSearchParams(searchParams)
            params.set('period', period)
            params.delete('from')
            params.delete('to')
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    const applyCustomRange = () => {
        if (!customDateRange.from || !customDateRange.to) return

        setShowCustomPicker(false)

        startTransition(() => {
            const params = new URLSearchParams(searchParams)
            params.set('period', 'custom')
            params.set('from', customDateRange.from)
            params.set('to', customDateRange.to)
            router.push(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    const periods = [
        { label: '7 dní', value: '7d' },
        { label: '30 dní', value: '30d' },
        { label: 'Mesiac', value: 'month' },
        { label: 'Rok', value: 'year' },
    ]

    const isLocked = !isFeatureAllowed(tierName, 'advancedAnalytics');

    return (
        <div className="space-y-8">
            <div
                className={isLocked ? "filter blur-sm pointer-events-none select-none cursor-pointer" : ""}
                onClick={() => isLocked && setShowPremiumModal(true)}
            >
                {/* Period Picker */}
                <div className="flex justify-end relative">
                    <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
                        {periods.map((period) => (
                            <button
                                key={period.value}
                                onClick={() => handlePeriodChange(period.value)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activePeriod === period.value
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                    }`}
                            >
                                {period.label}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePeriodChange('custom')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${activePeriod === 'custom'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-black/5'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <CalendarIcon className="w-3 h-3" />
                            Vlastné
                        </button>
                    </div>

                    {/* Custom Date Picker Popover */}
                    {showCustomPicker && (
                        <div className="absolute top-full right-0 mt-2 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 z-50 w-72 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Vyberte obdobie</h4>
                                <button onClick={() => setShowCustomPicker(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Od</label>
                                    <input
                                        type="date"
                                        value={customDateRange.from}
                                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, from: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Do</label>
                                    <input
                                        type="date"
                                        value={customDateRange.to}
                                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, to: e.target.value }))}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={applyCustomRange}
                                    disabled={!customDateRange.from || !customDateRange.to}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Použiť
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`space-y-8 transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Celkové zobrazenia</h3>
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.totalViews.toLocaleString()}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Unikátni návštevníci</h3>
                                <Users className="w-5 h-5 text-green-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.uniqueVisitors.toLocaleString()}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Priemerný čas</h3>
                                <Clock className="w-5 h-5 text-orange-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatTime(data.avgTimeSpent)}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Celkové kliky</h3>
                                <MousePointer className="w-5 h-5 text-purple-500" />
                            </div>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.totalClicks.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Views Over Time - Full Width */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Zobrazenia v čase</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.viewsOverTime}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        color: '#f3f4f6'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Device Breakdown - Full Width */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Zariadenia</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={data.deviceBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {data.deviceBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        color: '#f3f4f6'
                                    }}
                                    itemStyle={{ color: '#f3f4f6' }}
                                    labelStyle={{ color: '#f3f4f6' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Referrers - Full Width */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Top zdroje návštevnosti
                        </h3>
                        <div className="space-y-3">
                            {data.topReferrers.length > 0 ? (
                                data.topReferrers.map((ref, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 mr-4">
                                            {ref.referrer || 'Priama návšteva'}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {ref.count}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">Žiadne dáta</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                featureName="Pokročilá analytika"
                description="Získajte detailný prehľad o návštevnosti, zdrojoch a správaní zákazníkov."
            />
        </div>
    )
}
