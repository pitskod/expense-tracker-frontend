# Performance Optimization Guide

This document describes the performance optimization setup and tools used in the Expense Tracker frontend application.

## DevTools Setup

### 1. React DevTools (Recommended)
React DevTools is a browser extension that provides:
- Component tree inspection
- Props and state inspection
- **Profiler for performance analysis** ⭐ (Primary tool for React 19)
- Component render tracking

**Installation:**
- [Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox Extension](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
- [Edge Extension](https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil)

**Usage:**
1. Open browser DevTools (F12)
2. Navigate to the "⚛️ Components" tab to inspect components
3. Navigate to the "⚛️ Profiler" tab to record and analyze render performance
   - Click "Record" to start profiling
   - Interact with your application
   - Click "Stop" to view the performance report
   - Analyze the flamegraph to identify components with excessive re-renders

### 2. why-did-you-render (Not Available for React 19)
⚠️ **Note:** `why-did-you-render` is currently not compatible with React 19 (it only supports React 16-18). 

The code is set up to use it if it becomes available in the future, but for React 19, please use **React DevTools Profiler** instead, which provides similar functionality and is actively maintained for the latest React versions.

### 3. Performance Monitor
A custom utility for tracking component render performance.

**Location:** `src/utils/performance.ts`

**Usage in Browser Console:**
```javascript
// View performance report
window.__performanceMonitor.logReport();

// Get metrics for a specific component
window.__performanceMonitor.getMetrics('Expenses');

// Reset all metrics
window.__performanceMonitor.reset();
```

## Optimizations Applied

### Component Memoization
The following components are wrapped with `React.memo` to prevent unnecessary re-renders:
- `Button`
- `Input`
- `Icon`
- `PasswordInput`
- `InputLabel`
- `Logo`
- `Loader`
- `DatePicker`
- `AuthContent`
- `AuthDesktopBackground`
- `UploadInvoiceModal`

### Callback Memoization
The `Expenses` component uses `useCallback` for all event handlers to maintain stable function references:
- `handleSignOut`
- `resetCreateForm`
- `formatDateForInput`
- `handleEditExpense`
- `handleDeleteExpense`
- `handleDragStart`
- `handleDragOver`
- `handleDragLeave`
- `handleDrop`
- `handleDragEnd`
- `handleInvoiceUploadSuccess`
- `handleCreateExpense`
- `handleToggleMenu`
- `handleDrawerOpen`
- `handleDrawerClose`

### Value Memoization
Components use `useMemo` for expensive computations:
- **Expenses component**: `rows` - memoized expense list
- **Input/PasswordInput components**: `hasValue`, `className` - memoized computed values
- **Icon component**: `xlinkHref`, `style` - memoized SVG references

### Pure Functions
Pure utility functions are moved outside components to prevent recreation:
- `formatDate`
- `formatCategory`
- `getCurrencySymbol`
- `formatAmount`
- `getTodayDateString`
- `validateFile` (UploadInvoiceModal)

## Performance Benchmarks

### Before Optimization
- ❌ Components re-rendered on every parent render
- ❌ Event handlers recreated on every render (causing child re-renders)
- ❌ Expensive computations recalculated unnecessarily
- ❌ No visibility into unnecessary re-renders

### After Optimization
- ✅ Components only re-render when props/state actually change
- ✅ Event handlers have stable references (prevents child re-renders)
- ✅ Computed values cached with `useMemo`
- ✅ React DevTools Profiler available for performance analysis
- ✅ Performance monitor available for runtime metrics

## Verification Steps

1. **Install React DevTools:**
   - Install the browser extension (see links above)
   - Open browser DevTools (F12)
   - Verify the "⚛️ Components" and "⚛️ Profiler" tabs are visible

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Profile with React DevTools:**
   - Open browser DevTools (F12)
   - Navigate to the "⚛️ Profiler" tab
   - Click "Record" to start profiling
   - Interact with the application (click buttons, navigate, etc.)
   - Click "Stop" to view the performance report
   - Analyze the flamegraph:
     - Look for components with high render times
     - Identify components that re-render frequently
     - Check if memoized components are working correctly (they shouldn't re-render unless props change)

4. **Check Performance Monitor (optional):**
   ```javascript
   // In browser console
   window.__performanceMonitor.logReport();
   ```

5. **Verify Optimizations:**
   - Components should only re-render when their props/state change
   - Event handlers should have stable references
   - Expensive computations should be cached

## Best Practices

1. **Use React.memo for pure components** - Prevents re-renders when props haven't changed
2. **Use useCallback for event handlers** - Maintains stable function references
3. **Use useMemo for expensive computations** - Caches calculated values
4. **Move pure functions outside components** - Prevents recreation on every render
5. **Monitor performance regularly** - Use React DevTools Profiler to identify bottlenecks
6. **Profile in production mode** - Development mode adds overhead; profile production builds for accurate metrics

## Troubleshooting

### React DevTools not showing
- Ensure the extension is installed and enabled
- Refresh the page after installing
- Check that you're viewing a page that uses React

### Performance Monitor not available
- Check browser console for initialization messages
- Ensure you're in development mode
- The monitor is available at `window.__performanceMonitor`

### Components still re-rendering unnecessarily
- Check that props are stable (not recreated objects/arrays)
- Verify callbacks are memoized with `useCallback`
- Ensure parent components aren't causing re-renders
- Use React DevTools Profiler to identify the root cause
- Check the flamegraph to see which components are rendering and why

### Performance issues in production
- Profile in production mode (build and preview the app)
- Use React DevTools Profiler on the production build
- Check network tab for slow API calls
- Verify code splitting is working correctly
- Check bundle size with source map explorer

