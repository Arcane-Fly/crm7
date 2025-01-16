import type { Meta, StoryObj } from '@storybook/react'
import { RateCalculator } from './RateCalculator'

const meta: Meta<typeof RateCalculator> = {
  title: 'Components/RateCalculator',
  component: RateCalculator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof RateCalculator>

export const Default: Story = {
  args: {
    orgId: 'test-org-id',
  },
}

export const WithError: Story = {
  args: {
    orgId: 'invalid-org-id',
  },
  parameters: {
    mockData: [
      {
        url: '/api/rates/templates?org_id=invalid-org-id',
        method: 'GET',
        status: 404,
        response: {
          error: 'Organization not found',
        },
      },
    ],
  },
}

export const Loading: Story = {
  args: {
    orgId: 'loading-org-id',
  },
  parameters: {
    mockData: [
      {
        url: '/api/rates/templates?org_id=loading-org-id',
        method: 'GET',
        delay: 3000,
        response: {
          data: [],
        },
      },
    ],
  },
}
