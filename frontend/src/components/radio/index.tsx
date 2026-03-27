// @ts-ignore
import cls from './style.module.scss';

// eslint-disable-next-line react/prop-types
export function Radio({ id, label, name }) { // , name, value, children
  return (
    <div className={cls.radio}>
      <input id={id} type="radio" name={name} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
