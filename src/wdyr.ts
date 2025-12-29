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
        // Track React Router hooks
        [require('react-router-dom'), 'useNavigate'],
        [require('react-router-dom'), 'useLocation'],
        // Track React Hook Form hooks
        [require('react-hook-form'), 'useForm'],
        [require('react-hook-form'), 'Controller'],
      ],
      include: [
        /.*/, // Track all components
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
    console.warn('⚠️ why-did-you-render not available. Install it with: npm install --save-dev @welldone-software/why-did-you-render');
  }
}

