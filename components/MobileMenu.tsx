// components/MobileMenu.tsx
import React from 'react';

const MobileMenu = () => {
  // The 'categories' prop is no longer accepted or used in this simplified version.
  // If MobileMenu is called with props in Layout.tsx, that's fine, they'll just be ignored.
  return (
    <button style={{
      border: '5px solid red',
      background: 'lime',
      fontSize: '20px',
      padding: '10px',
      color: 'black',
      zIndex: 10000,
      position: 'relative' // Ensure it's not hidden by other elements due to stacking context
    }}>
      TEST HAMBURGER
    </button>
  );
};

export default MobileMenu;
