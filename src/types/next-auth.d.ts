import "next-auth";

declare module "next-auth" {
    interface User {
        role: string;
        onboardingCompleted: boolean;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            role: string;
            onboardingCompleted: boolean;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string;
        onboardingCompleted: boolean;
    }
}
