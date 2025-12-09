/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-unused-vars */
import { classNames } from 'shared/lib/classNames/classNames';
import { ButtonHTMLAttributes, FC, memo } from 'react';
import cls from './Button.module.scss';

export enum ThemeButton {
    CLEAR = 'clear',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{
    className?: string;
    theme?: ThemeButton;
}

export const Button: FC<ButtonProps> = memo((props) => {
  const {
    className,
    children,
    theme,
    title,
    ...otherProps
  } = props;

  return (
    <button
      type="button"
      className={classNames(cls.Button, { [cls[theme]]: true }, [className])}
      {...otherProps}
    >
      {title}
      {children}
    </button>
  );
});
