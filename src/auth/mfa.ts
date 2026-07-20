import { FirebaseError } from 'firebase/app'
import {
  FactorId,
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
  type MultiFactorError,
  type UserCredential,
} from 'firebase/auth'
import { getFirebaseAuth } from '@/auth/firebase'

export function isMfaRequiredError(error: unknown): error is MultiFactorError {
  return error instanceof FirebaseError && error.code === 'auth/multi-factor-auth-required'
}

export async function resolveTotpSignIn(
  error: MultiFactorError,
  oneTimePassword: string,
): Promise<UserCredential> {
  const auth = getFirebaseAuth()
  const resolver = getMultiFactorResolver(auth, error)
  const totpHint =
    resolver.hints.find((hint) => hint.factorId === FactorId.TOTP) ?? resolver.hints[0]

  if (!totpHint) {
    throw new Error('No MFA method available for this account.')
  }

  const assertion = TotpMultiFactorGenerator.assertionForSignIn(
    totpHint.uid,
    oneTimePassword.trim(),
  )

  return resolver.resolveSignIn(assertion)
}
