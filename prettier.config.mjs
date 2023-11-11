/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  bracketSpacing: false,
  bracketSameLine: true,
  singleQuote: true,
  trailingComma: 'all',
  arrowParens: 'avoid',
  plugins: ['prettier-plugin-tailwindcss', 'prettier-plugin-prisma'],
};

export default config;
