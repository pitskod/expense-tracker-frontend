import React, { memo } from 'react';
import logo from "./assets/logo.svg";

export const Logo = memo(() => {
  return <img src={logo} alt="YAET Logo" />;
});

Logo.displayName = 'Logo';