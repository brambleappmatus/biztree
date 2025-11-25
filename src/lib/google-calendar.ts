import { google } from 'googleapis';

export const getGoogleOAuthClient = (redirectUri?: string) => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri || process.env.GOOGLE_REDIRECT_URI
    );
};

export const getGoogleCalendarClient = (accessToken: string, refreshToken: string) => {
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });
    return google.calendar({ version: 'v3', auth: oauth2Client });
};
