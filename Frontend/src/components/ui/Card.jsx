import './Card.css';

const Card = ({
  children,
  variant = 'default',
  padding = 'default',
  header,
  footer,
  className = '',
  ...props
}) => {
  const classNames = [
    'card',
    `card--${variant}`,
    `card--padding-${padding}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} {...props}>
      {header && (
        <div className="card__header">
          {header}
        </div>
      )}
      
      <div className="card__body">
        {children}
      </div>
      
      {footer && (
        <div className="card__footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
