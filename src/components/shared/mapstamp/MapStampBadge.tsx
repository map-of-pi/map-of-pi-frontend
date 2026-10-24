import Image from 'next/image';
import React from 'react';
import MapStampLogo from '../../../../public/images/mapstamp/Mapstamp_icon.png';

function MapStampBadge({ isActive, className, styleComponent, size = 17 }: {
    isActive: boolean;
    className?: string;
    styleComponent?: any;
    size?: number;
}) {
    if (!isActive) return null;

    const aspectRatio = MapStampLogo.width / MapStampLogo.height;
    const width = Math.round(aspectRatio * size);

    return (
        <div
        className={`relative inline-block ${className || ''}`}
        style={{ height: `${size}px`, width: `${width}px`, flexShrink: 0, ...styleComponent }}
        >
        <Image src={MapStampLogo} alt="MapStamp active" fill style={{ objectFit: 'contain' }} />
        </div>
    );
}

export default MapStampBadge;
