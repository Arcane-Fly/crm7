```typescript
// Split multiple assertions into separate waitFor blocks
await waitFor(() => {
  expect(screen.getByText('Rate Calculation')).toBeInTheDocument()
})

await waitFor(() => {
  expect(screen.getByText('$100.00')).toBeInTheDocument()
})
```
