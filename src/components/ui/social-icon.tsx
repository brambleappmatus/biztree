import React from 'react';
import { SocialIcon as ReactSocialIcon } from 'react-social-icons';

interface SocialIconProps {
    network: string;
    url?: string;
    className?: string;
    bgColor?: string;
    fgColor?: string;
}

export function SocialIcon({ network, url, className = "w-6 h-6", bgColor, fgColor = "white" }: SocialIconProps) {
    return (
        <ReactSocialIcon
            network={network}
            url={url}
            className={className}
            bgColor={bgColor}
            fgColor={fgColor}
            style={{ width: '100%', height: '100%' }}
        />
    );
}
