import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import './Alert.css';

const Alert = ({
  children,
  type = 'info',
  dismissible = false,
  onDismiss,
  icon,
  className = '',
}) => {
  const icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
    info: Info,
  };

  const Icon = icon || icons[type];

  const classNames = [
    'alert',
    `alert--${type}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} role="alert">
      <div className="alert__icon">
        <Icon size={20} />
      </div>
      
      <div className="alert__content">
        {children}
      </div>
      
      {dismissible && (
        <button
          className="alert__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;
