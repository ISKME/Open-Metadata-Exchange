/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-unused-vars */
import { Link, LinkProps } from 'react-router-dom';
import { FC, memo } from 'react';

interface AppLinkProps extends LinkProps {
  className?: string;
  text: string;
}

export const AppLink: FC<AppLinkProps> = memo((props) => {
  const {
    to,
    text,
    ...otherProps
  } = props;

  return (
    <Link
      to={to}
      {...otherProps}
    >
      <span>
        {text}
      </span>
    </Link>
  );
});
