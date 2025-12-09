// @ts-ignore
import cls from './style.module.scss';

// eslint-disable-next-line react/prop-types
export function Switch({ id }) {
  return (
    <div className={cls.switch}>
      <input type="checkbox" id={id} />
      <label htmlFor={id}>Toggle</label>
    </div>
  );
}
