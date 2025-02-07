export default {
  plugins: {
    'postcss-import': {},
    'postcss-nesting': {},
    '@tailwindcss/postcss': {},
    autoprefixer: {},
    'postcss-preset-env': {
      features: { 'nesting-rules': false },
    },
  },
}
