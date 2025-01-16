import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'
import { configure } from '@testing-library/react'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

configure({
  testIdAttribute: 'data-testid',
})
