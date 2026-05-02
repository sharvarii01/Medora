import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { ChevronRight, X, CheckCircle } from 'lucide-react';
import './OnboardingTour.css';

const TOUR_STEPS = [
  {
    target: '.nav-brand',
    title: 'Welcome to Medora',
    content: 'Your complete enterprise healthcare ecosystem. Let us show you around!',
    position: 'bottom'
  },
  {
    target: '.search-btn-nav',
    title: 'Global Search',
    content: 'Press Ctrl+K or click here to search for doctors, patients, or invoices across the entire system instantly.',
    position: 'bottom'
  },
  {
    target: '.nav-user',
    title: 'Your Profile',
    content: 'Access your dedicated dashboard, settings, or switch between Patient and Doctor views.',
    position: 'bottom'
  },
  {
    target: '.theme-toggle',
    title: 'Dark Mode',
    content: 'Working late? Toggle dark mode for a comfortable viewing experience.',
    position: 'bottom'
  }
];

export const OnboardingTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('medora_tour_seen');
    if (!hasSeenTour) {
      // Small delay to let UI render first
      const t = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [isOpen, currentStep]);

  const updatePosition = () => {
    const step = TOUR_STEPS[currentStep];
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
      // Scroll into view if needed
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('medora_tour_seen', 'true');
  };

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="onboarding-overlay">
      {/* Highlight Cutout */}
      {targetRect && (
        <div 
          className="onboarding-highlight"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16
          }}
        />
      )}

      {/* Tour Dialog */}
      <div 
        className="onboarding-dialog animate-fade-in"
        style={targetRect ? {
          top: targetRect.top + targetRect.height + 20,
          left: Math.max(20, Math.min(targetRect.left, window.innerWidth - 350))
        } : {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <button className="onboarding-close" onClick={handleClose}>
          <X size={16} />
        </button>
        <div className="onboarding-step-indicator">
          Step {currentStep + 1} of {TOUR_STEPS.length}
        </div>
        <h3 className="onboarding-title">{step.title}</h3>
        <p className="onboarding-content">{step.content}</p>
        <div className="onboarding-footer">
          <div className="onboarding-dots">
            {TOUR_STEPS.map((_, i) => (
              <span key={i} className={`dot ${i === currentStep ? 'active' : ''}`} />
            ))}
          </div>
          <Button variant="primary" className="onboarding-next" onClick={handleNext}>
            {currentStep === TOUR_STEPS.length - 1 ? (
              <><CheckCircle size={16} /> Finish</>
            ) : (
              <>Next <ChevronRight size={16} /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
