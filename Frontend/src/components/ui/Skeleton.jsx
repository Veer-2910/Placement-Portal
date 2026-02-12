import React from 'react';

const Skeleton = ({ width, height, borderRadius = "8px", className = "" }) => {
    return (
        <div 
            className={`skeleton-loader ${className}`}
            style={{ 
                width: width || '100%', 
                height: height || '20px', 
                borderRadius 
            }}
        >
            <style>{`
                .skeleton-loader {
                    background: linear-gradient(
                        90deg, 
                        var(--card-bg) 25%, 
                        rgba(14, 165, 233, 0.1) 50%, 
                        var(--card-bg) 75%
                    );
                    background-size: 200% 100%;
                    animation: skeleton-loading 1.5s infinite linear;
                    border: 1px solid var(--sidebar-border);
                }

                @keyframes skeleton-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};

export default Skeleton;
