// Enhanced Version (Currently Using)
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, Home } from 'lucide-react';

const GoBack = ({
  to,
  text,
  className = "",
  variant = "default", // default, minimal, button, home
  fallbackTo = "/unicollab",
  fallbackText = "Go back to posts",
  showIcon = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we should use browser history or direct link
  const hasHistory = window.history.length > 1;
  const isHomePage = location.pathname === '/unicollab' || location.pathname === '/';

  // Don't show on home page
  if (isHomePage) return null;

  const handleGoBack = () => {
    if (hasHistory) {
      navigate(-1);
    } else if (to) {
      navigate(to);
    } else {
      navigate(fallbackTo);
    }
  };

  const getDisplayText = () => {
    if (text) return text;
    if (to) return `Back to ${to.split('/').pop()}`;
    if (hasHistory) return 'Go back';
    return fallbackText;
  };

  const getIcon = () => {
    if (variant === 'home') return <Home className="h-4 w-4" />;
    if (variant === 'minimal') return <ChevronLeft className="h-4 w-4" />;
    return <ArrowLeft className="h-4 w-4" />;
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleGoBack}
        className={`inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ${className}`}
      >
        {showIcon && getIcon()}
        {getDisplayText()}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleGoBack}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
      >
        {showIcon && getIcon()}
        {getDisplayText()}
      </button>
    );
  }

  if (variant === 'home') {
    return (
      <Link
        to={to || fallbackTo}
        className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors ${className}`}
      >
        {showIcon && getIcon()}
        {getDisplayText()}
      </Link>
    );
  }

  // Default variant - uses browser history when available
  return (
    <div className={`mb-4 ${className}`}>
      <button
        onClick={handleGoBack}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors"
      >
        {showIcon && getIcon()}
        {getDisplayText()}
      </button>
    </div>
  );
};

export default GoBack;
