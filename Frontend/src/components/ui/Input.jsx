import './Input.css';

const Input = ({
  label,
  type = 'text',
  error,
  hint,
  icon,
  iconPosition = 'left',
  className = '',
  required = false,
  ...props
}) => {
  const inputClassNames = [
    'input',
    error && 'input--error',
    icon && `input--has-icon-${iconPosition}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      
      <div className="input-container">
        {icon && iconPosition === 'left' && (
          <span className="input-icon input-icon--left">{icon}</span>
        )}
        
        {type === 'textarea' ? (
          <textarea
            className={inputClassNames}
            {...props}
          />
        ) : (
          <input
            type={type}
            className={inputClassNames}
            {...props}
          />
        )}
        
        {icon && iconPosition === 'right' && (
          <span className="input-icon input-icon--right">{icon}</span>
        )}
      </div>
      
      {error && (
        <span className="input-error">{error}</span>
      )}
      
      {hint && !error && (
        <span className="input-hint">{hint}</span>
      )}
    </div>
  );
};

export default Input;
