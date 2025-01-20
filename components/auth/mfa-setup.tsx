'use client'

import * as React from 'react'
import { useMFA } from '@/lib/auth/mfa-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export function MFASetup() {
  const { isEnabled, isEnrolling, setupMFA, verifyMFA, disableMFA } = useMFA()
  const [qrCode, setQrCode] = React.useState<string>('')
  const [secret, setSecret] = React.useState<string>('')
  const [token, setToken] = React.useState('')
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [error, setError] = React.useState<string>('')

  const handleSetup = async () => {
    try {
      const { qrCode, secret } = await setupMFA()
      setQrCode(qrCode)
      setSecret(secret)
      setError('')
    } catch (err) {
      setError('Failed to set up MFA. Please try again.')
    }
  }

  const handleVerify = async () => {
    if (!token) {
      setError('Please enter a verification code')
      return
    }

    try {
      setIsVerifying(true)
      const success = await verifyMFA(token)
      if (!success) {
        setError('Invalid verification code')
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  if (isEnabled) {
    return (
      <Card className='p-6'>
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold'>Multi-Factor Authentication</h2>
          <p className='text-sm text-muted-foreground'>
            MFA is currently enabled for your account.
          </p>
          <Button variant='destructive' onClick={disableMFA}>
            Disable MFA
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className='p-6'>
      <div className='space-y-6'>
        <div>
          <h2 className='text-lg font-semibold'>Set up Multi-Factor Authentication</h2>
          <p className='text-sm text-muted-foreground'>
            Enhance your account security by enabling MFA.
          </p>
        </div>

        {error && (
          <Alert variant='destructive'>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!qrCode ? (
          <Button onClick={handleSetup} disabled={isEnrolling}>
            {isEnrolling && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Set up MFA
          </Button>
        ) : (
          <div className='space-y-6'>
            <div className='space-y-2'>
              <Label>Scan QR Code</Label>
              <div className='relative h-64 w-64'>
                <Image src={qrCode} alt='QR Code' fill className='object-contain' />
              </div>
              <p className='text-sm text-muted-foreground'>
                Scan this QR code with your authenticator app.
              </p>
            </div>

            <div className='space-y-2'>
              <Label>Manual Entry Code</Label>
              <p className='font-mono text-sm'>{secret}</p>
              <p className='text-sm text-muted-foreground'>
                If you can't scan the QR code, enter this code manually in your authenticator app.
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='token'>Verification Code</Label>
              <Input
                id='token'
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder='Enter 6-digit code'
                maxLength={6}
              />
            </div>

            <Button onClick={handleVerify} disabled={isVerifying || !token}>
              {isVerifying && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Verify and Enable
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
