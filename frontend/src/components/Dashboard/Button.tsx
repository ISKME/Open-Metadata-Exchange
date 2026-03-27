import cls from './styles.module.scss'

export default function({ children, onClick = () => {} }) {
  return (
    <div className={cls.rButton} onClick={onClick}>
      {children}
    </div>
  )
}
