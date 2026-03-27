import cls from './styles.module.scss'

export default function({ title, content }) {
  return (
    <div className={cls.widgetSectionHeader}>
      <div className={cls.widgetSectionHeaderTitle}>
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 3.58887H8C9.06087 3.58887 10.0783 4.01029 10.8284 4.76044C11.5786 5.51059 12 6.528 12 7.58887V21.5889C12 20.7932 11.6839 20.0302 11.1213 19.4675C10.5587 18.9049 9.79565 18.5889 9 18.5889H2V3.58887Z" stroke="black" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 3.58887H16C14.9391 3.58887 13.9217 4.01029 13.1716 4.76044C12.4214 5.51059 12 6.528 12 7.58887V21.5889C12 20.7932 12.3161 20.0302 12.8787 19.4675C13.4413 18.9049 14.2044 18.5889 15 18.5889H22V3.58887Z" stroke="black" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{title}</span>
      </div>
      <p className={cls.widgetSectionDescription}>{content}</p>
    </div>
  )
}
