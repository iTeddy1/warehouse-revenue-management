/* eslint-disable */

import '@testing-library/jest-dom/vitest'
import { Headers, Request } from 'node-fetch'

import { server } from '../mocks/server'

// @ts-ignore
globalThis.Request = Request
// @ts-ignore
globalThis.Headers = Headers

// Suppress console errors and warnings during tests
const originalError = console.error
const originalWarn = console.warn

console.error = (...args: any[]) => {
  // Suppress specific Redux store warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Store does not have a valid reducer') ||
      args[0].includes('HTMLFormElement.prototype.requestSubmit') ||
      args[0].includes('combineReducers'))
  ) {
    return
  }
  originalError.call(console, ...args)
}

console.warn = (...args: any[]) => {
  // Suppress Redux and other test warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Store does not have a valid reducer') ||
      args[0].includes('combineReducers'))
  ) {
    return
  }
  originalWarn.call(console, ...args)
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => server.resetHandlers())

afterAll(() => {
  server.close()
  console.error = originalError
  console.warn = originalWarn
})
