/// <reference types="@welldone-software/why-did-you-render" />
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
      trackAllPureComponents: true,
      trackHooks: true,
      logOwnerReasons: true,
      collapseGroups: true,
      trackExtraHooks: [
        [require('react-router-dom'), 'useNavigate'],
        [require('react-router-dom'), 'useLocation'],
        [require('react-hook-form'), 'useForm'],
        [require('react-hook-form'), 'Controller'],
      ],
      include: [
        /.*/,
      ],
      exclude: [
        /^BrowserRouter/,
        /^RouterProvider/,
        /^Routes/,
        /^Route/,
        /^Link/,
      ],
    });
    console.log('✅ why-did-you-render initialized');
  } catch (error) {
    // why-did-you-render not available or incompatible with React 19
  }
}

