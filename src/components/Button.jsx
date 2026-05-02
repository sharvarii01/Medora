import React from 'react';
import './Button.css';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  return (
    <button className={`med-btn med-btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
};
