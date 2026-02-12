import { ChevronRight } from 'lucide-react';
import './PageHeader.css';

const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  actions,
  sticky = true 
}) => {
  return (
    <div className={`page-header ${sticky ? 'page-header--sticky' : ''}`}>
      {breadcrumbs.length > 0 && (
        <nav className="page-header__breadcrumbs" aria-label="Breadcrumb">
          <ol className="breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="breadcrumbs__item">
                {index > 0 && (
                  <ChevronRight size={16} className="breadcrumbs__separator" />
                )}
                {crumb.href ? (
                  <a href={crumb.href} className="breadcrumbs__link">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="breadcrumbs__current">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="page-header__main">
        <div className="page-header__text">
          <h1 className="page-header__title">{title}</h1>
          {subtitle && (
            <p className="page-header__subtitle">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="page-header__actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
