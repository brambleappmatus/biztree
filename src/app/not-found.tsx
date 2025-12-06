import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden relative p-4">
            {/* Huge 404 Number in Background - Top positioned */}
            <div className="absolute top-0 left-0 right-0 flex items-start justify-center pointer-events-none select-none overflow-hidden" style={{ height: '50vh' }}>
                <div
                    className="font-bold text-[12rem] sm:text-[20rem] md:text-[25rem] lg:text-[30rem] leading-none text-[#ebebeb] tracking-tighter opacity-40 mt-[-2rem]"
                    style={{
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
                    }}
                >
                    404
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto w-full">
                {/* Character */}
                <div className="relative w-full max-w-[280px] sm:max-w-[350px] md:max-w-[450px] aspect-square mb-12">
                    <Image
                        src="/404-character.png"
                        alt="Lost character"
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority
                    />
                </div>

                {/* Text Content - Clearly below character */}
                <div className="text-center space-y-6 px-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                        Page Not Found
                    </h1>
                    <p className="text-lg md:text-xl text-gray-500 max-w-md mx-auto leading-relaxed">
                        Oops! Looks like this page got lost. Let's get you back on track.
                    </p>

                    {/* Back to Home Button */}
                    <div className="pt-4">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1"
                        >
                            Go Back Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
