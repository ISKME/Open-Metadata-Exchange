// @ts-ignore
import cls from './style.module.scss';

// eslint-disable-next-line react/prop-types
export const Tooltip = ({ text, children, className = '' }) => {
  return (
    <div className={`${cls.tooltip} ${className}`}>
      {children}
      <span className={cls.tooltipText}>{text}</span>
    </div>
  );
};
