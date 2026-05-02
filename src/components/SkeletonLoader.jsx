import React from 'react';
import './SkeletonLoader.css';

export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-lines">
              <div className="skeleton-line title"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="skeleton-lines">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        );
      case 'stat':
        return (
          <div className="skeleton-stat">
            <div className="skeleton-icon"></div>
            <div className="skeleton-lines">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line title"></div>
            </div>
          </div>
        );
      default:
        return <div className="skeleton-line"></div>;
    }
  };

  return (
    <div className="skeleton-container">
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
      ))}
    </div>
  );
};
