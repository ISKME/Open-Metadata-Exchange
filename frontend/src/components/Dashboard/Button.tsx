import cls from "./styles.module.scss";

export default function ({ children, onClick = () => {} }) {
  return (
    <button type="button" className={cls.rButton} onClick={onClick}>
      {children}
    </button>
  );
}
