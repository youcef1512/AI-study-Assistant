
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'sm' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div 
            className={`${sizeClasses[size]} border-t-2 border-b-2 border-white rounded-full animate-spin`}
            style={{ borderTopColor: 'transparent' }}
        ></div>
    );
};
