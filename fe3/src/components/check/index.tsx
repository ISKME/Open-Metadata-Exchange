// @ts-ignore
import cls from './style.module.scss';

// eslint-disable-next-line react/prop-types
export function Check({ id, label }) { // , name, value, children
  return (
    <div className={cls.check}>
      <input id={id} type="checkbox" />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
