/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F2F5F6',
        panel: '#FFFFFF',
        ink: '#152631',
        inkmute: '#5C7078',
        line: '#D7E0E3',
        blueprint: '#1C4E73',
        blueprintdark: '#123A57',
        teal: '#3F8361',
        amber: '#C98A2B',
        rust: '#B23A2E'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      }
    }
  },
  plugins: []
};
