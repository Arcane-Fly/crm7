export default {
  plugins: {
    'postcss-import': {},
    '@tailwindcss/nesting': {},
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    'postcss-preset-env': {
      features: { 'nesting-rules': false },
    },
  },
}
