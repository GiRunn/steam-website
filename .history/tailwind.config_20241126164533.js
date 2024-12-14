/** @type {import('tailwindcss').Config} */
module.exports = {
 content: [
   "./src/**/*.{js,jsx,ts,tsx}",
 ],
 darkMode: 'class',
 theme: {
   extend: {
     colors: {
       'steam-primary': '#171a21',
       'steam-secondary': '#1b2838',
       'steam-dark': '#171a21',
       'steam-light': '#1b2838',
       'steam-blue': '#66c0f4',
       'steam-blue-light': '#8ed4fd',
       'steam-blue-dark': '#417a9b',
       'steam-gray': '#2a475e',
       'steam-gray-light': '#c7d5e0',
       'steam-gray-dark': '#1b2838',
       'steam-green': '#5c7e10',
       'steam-purple': '#6b1c7a',
     },
     backgroundImage: {
       'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
       'gradient-steam': 'linear-gradient(180deg, #171a21 0%, #1b2838 100%)',
       'gradient-card': 'linear-gradient(180deg, rgba(27,40,56,0.4) 0%, rgba(27,40,56,0.8) 100%)',
       'gradient-button': 'linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)',
       'gradient-hover': 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
     },
     animation: {
       'slideUp': 'slideUp 0.5s ease forwards',
       'slideDown': 'slideDown 0.5s ease forwards',
       'slideLeft': 'slideLeft 0.5s ease forwards',
       'slideRight': 'slideRight 0.5s ease forwards',
       'fadeIn': 'fadeIn 0.5s ease forwards',
       'fadeOut': 'fadeOut 0.5s ease forwards',
       'lineMove': 'lineMove 2s linear infinite',
       'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
       'float': 'float 6s ease-in-out infinite',
       'gradient': 'gradient 15s ease infinite',
       'spin-slow': 'spin 3s linear infinite',
       'bounce-slow': 'bounce 3s ease-in-out infinite',
       'wave-slow': 'wave 15s linear infinite',
       'wave-fast': 'wave 12s linear infinite',
       'float': 'float 20s linear infinite',
     },
     keyframes: {
       slideUp: {
         '0%': { transform: 'translateY(20px)', opacity: '0' },
         '100%': { transform: 'translateY(0)', opacity: '1' },
       },
       slideDown: {
         '0%': { transform: 'translateY(-20px)', opacity: '0' },
         '100%': { transform: 'translateY(0)', opacity: '1' },
       },
       slideLeft: {
         '0%': { transform: 'translateX(20px)', opacity: '0' },
         '100%': { transform: 'translateX(0)', opacity: '1' },
       },
       slideRight: {
         '0%': { transform: 'translateX(-20px)', opacity: '0' },
         '100%': { transform: 'translateX(0)', opacity: '1' },
       },
       fadeIn: {
         '0%': { opacity: '0' },
         '100%': { opacity: '1' },
       },
       fadeOut: {
         '0%': { opacity: '1' },
         '100%': { opacity: '0' },
       },
       lineMove: {
         '0%': { transform: 'translateX(-100%)' },
         '100%': { transform: 'translateX(100%)' },
       },
       float: {
         '0%, 100%': { transform: 'translateY(0)' },
         '50%': { transform: 'translateY(-10px)' },
       },
       gradient: {
         '0%, 100%': {
           'background-size': '200% 200%',
           'background-position': 'left center',
         },
         '50%': {
           'background-size': '200% 200%',
           'background-position': 'right center',
         },
       },
     },
     spacing: {
       '72': '18rem',
       '84': '21rem',
       '96': '24rem',
       '128': '32rem',
     },
     maxWidth: {
       '8xl': '88rem',
       '9xl': '96rem',
     },
     minHeight: {
       'screen-75': '75vh',
       'screen-50': '50vh',
     },
     scale: {
       '102': '1.02',
     },
     zIndex: {
       '-1': '-1',
       '60': '60',
       '70': '70',
     },
     transitionDuration: {
       '400': '400ms',
     },
     transitionTimingFunction: {
       'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
     },
     backdropBlur: {
       'xs': '2px',
     },
     typography: {
       DEFAULT: {
         css: {
           color: '#c5c3c0',
           a: {
             color: '#66c0f4',
             '&:hover': {
               color: '#8ed4fd',
             },
           },
         },
       },
     },
     boxShadow: {
       'steam': '0 0 10px rgba(102, 192, 244, 0.2)',
       'steam-hover': '0 0 15px rgba(102, 192, 244, 0.4)',
       'steam-active': '0 0 20px rgba(102, 192, 244, 0.6)',
       'glow': '0 0 10px rgba(102, 192, 244, 0.5)',
       'glow-hover': '0 0 20px rgba(102, 192, 244, 0.7)',
     },
     gridTemplateColumns: {
       'auto-fit': 'repeat(auto-fit, minmax(250px, 1fr))',
       'auto-fill': 'repeat(auto-fill, minmax(250px, 1fr))',
     },
   },
 },
 variants: {
   extend: {
     backgroundColor: ['active', 'group-hover'],
     textColor: ['group-hover'],
     transform: ['group-hover'],
     scale: ['group-hover'],
     translate: ['group-hover'],
     boxShadow: ['hover', 'active'],
     opacity: ['group-hover'],
     blur: ['hover', 'group-hover'],
     grayscale: ['hover', 'group-hover'],
   },
 },
 plugins: [
   require('@tailwindcss/typography'),
   require('@tailwindcss/forms'),
   require('@tailwindcss/aspect-ratio'),
 ],
}