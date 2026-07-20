import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { listBadges } from '@/api/adminCatalog'
import {
  getUser,
  setUserBadges,
  updateUser,
  updateUserRoles,
} from '@/api/adminUsers'
import { useAuth } from '@/auth/AuthProvider'
import { DetailPane } from '@/components/layout/MasterDetail'
import type { DetailOutletContext } from '@/components/layout/detailOutlet'
import { ActionModal } from '@/components/shared/ActionModal'
import { MoneyText } from '@/components/shared/MoneyText'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useApiError } from '@/hooks/useApiError'
import { boolLabel, formatDate } from '@/lib/utils'
import type { AdminUserDetail, Badge as BadgeType } from '@/types/admin'

export function UserDetailPage() {
  const { id } = useParams()
  const userId = Number(id)
  const navigate = useNavigate()
  const { listPath } = useOutletContext<DetailOutletContext>()
  const { adminUser, refreshAccessToken } = useAuth()
  const toast = useToast()
  const onError = useApiError()

  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [catalogBadges, setCatalogBadges] = useState<BadgeType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string | boolean>>({})
  const [selectedBadges, setSelectedBadges] = useState<string[]>([])
  const [roles, setRoles] = useState({ is_staff: false, is_superuser: false })
  const [confirm, setConfirm] = useState<null | 'ban' | 'verify' | 'roles'>(null)

  const close = () => navigate(listPath)

  const load = useCallback(async () => {
    if (!Number.isFinite(userId)) return
    setLoading(true)
    try {
      const [u, badges] = await Promise.all([getUser(userId), listBadges()])
      setUser(u)
      setCatalogBadges(badges)
      setSelectedBadges(u.badges.map((b) => b.slug))
      setRoles({ is_staff: u.is_staff, is_superuser: u.is_superuser })
      setForm({
        email: u.email,
        username: u.username ?? '',
        first_name: u.first_name,
        last_name: u.last_name,
        bio: u.bio,
        phone_number: u.phone_number ?? '',
        profile_picture: u.profile_picture,
        profile_banner_url: u.profile_banner_url ?? '',
        creator_category: u.creator_category ?? '',
        country: u.country,
        department: u.department,
        city: u.city,
        is_active: u.is_active,
        is_public: u.is_public,
        is_verified: u.is_verified,
      })
    } catch (err) {
      onError(err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [userId, onError])

  useEffect(() => {
    void load()
  }, [load])

  function setField(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function saveProfile(extra?: Record<string, string | boolean>) {
    setSaving(true)
    try {
      if (extra && ('is_active' in extra || 'is_verified' in extra)) {
        await refreshAccessToken()
      }
      const payload = {
        email: String(form.email),
        username: String(form.username) || null,
        first_name: String(form.first_name),
        last_name: String(form.last_name),
        bio: String(form.bio),
        phone_number: String(form.phone_number) || null,
        profile_picture: String(form.profile_picture),
        profile_banner_url: String(form.profile_banner_url),
        creator_category: String(form.creator_category) || null,
        country: String(form.country),
        department: String(form.department),
        city: String(form.city),
        is_active: Boolean(form.is_active),
        is_public: Boolean(form.is_public),
        is_verified: Boolean(form.is_verified),
        ...extra,
      }
      const updated = await updateUser(userId, payload)
      setUser(updated)
      toast.success('User updated')
      setConfirm(null)
    } catch (err) {
      onError(err)
    } finally {
      setSaving(false)
    }
  }

  async function saveBadges() {
    setSaving(true)
    try {
      const badges = await setUserBadges(userId, selectedBadges)
      setUser((prev) => (prev ? { ...prev, badges } : prev))
      toast.success('Badges updated (award notifications may be sent)')
    } catch (err) {
      onError(err)
    } finally {
      setSaving(false)
    }
  }

  async function saveRoles() {
    setSaving(true)
    try {
      await refreshAccessToken()
      const updated = await updateUserRoles(userId, roles)
      setUser(updated)
      toast.success('Roles updated')
      setConfirm(null)
    } catch (err) {
      onError(err)
    } finally {
      setSaving(false)
    }
  }

  if (!Number.isFinite(userId)) {
    return (
      <DetailPane open title="Invalid user" onClose={close}>
        <EmptyState title="Invalid user id" />
      </DetailPane>
    )
  }

  if (loading) {
    return (
      <DetailPane open title="User" onClose={close}>
        <Spinner label="Loading user…" />
      </DetailPane>
    )
  }

  if (!user) {
    return (
      <DetailPane open title="Not found" onClose={close}>
        <EmptyState title="User not found" />
      </DetailPane>
    )
  }

  const isSelf = adminUser?.id === user.id
  const displayName = user.username || user.email

  return (
    <>
      <DetailPane
        open
        title={displayName}
        subtitle={
          <>
            {user.is_verified ? (
              <Badge tone="completed">Verified</Badge>
            ) : (
              <Badge tone="paid">Unverified</Badge>
            )}
            <span className="text-xs text-text-muted">
              #{user.id} · {formatDate(user.date_joined)}
            </span>
          </>
        }
        onClose={close}
        footer={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="dark" className="flex-1" disabled={saving} onClick={() => void saveProfile()}>
              Save profile
            </Button>
            <Button
              type="button"
              variant="accent"
              className="flex-1"
              disabled={saving || Boolean(form.is_verified)}
              onClick={() => setConfirm('verify')}
            >
              Verify
            </Button>
          </div>
        }
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <Avatar name={displayName} src={user.profile_picture} size="xl" />
          <div className="mt-3 font-semibold">{displayName}</div>
          <div className="text-sm text-text-muted">{user.email}</div>
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {user.is_active ? <Badge tone="completed">Active</Badge> : <Badge tone="danger">Banned</Badge>}
            {user.is_staff ? <Badge>Staff</Badge> : null}
            {user.is_superuser ? <Badge tone="brand">Superuser</Badge> : null}
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-canvas p-3">
            <div className="text-xs text-text-muted">Wallet HTG</div>
            <MoneyText amount={user.balance_htg} currency="HTG" className="font-semibold" />
          </div>
          <div className="rounded-xl bg-canvas p-3">
            <div className="text-xs text-text-muted">Wallet USD</div>
            <MoneyText amount={user.balance_usd} currency="USD" className="font-semibold" />
          </div>
        </div>

        <section className="mb-5 space-y-3">
          <h3 className="text-sm font-semibold">Profile</h3>
          <Input label="Email" value={String(form.email ?? '')} onChange={(e) => setField('email', e.target.value)} />
          <Input label="Username" value={String(form.username ?? '')} onChange={(e) => setField('username', e.target.value)} />
          <Input label="First name" value={String(form.first_name ?? '')} onChange={(e) => setField('first_name', e.target.value)} />
          <Input label="Last name" value={String(form.last_name ?? '')} onChange={(e) => setField('last_name', e.target.value)} />
          <Input label="Phone" value={String(form.phone_number ?? '')} onChange={(e) => setField('phone_number', e.target.value)} />
          <Input label="Category slug" value={String(form.creator_category ?? '')} onChange={(e) => setField('creator_category', e.target.value)} />
          <Input label="Country" value={String(form.country ?? '')} onChange={(e) => setField('country', e.target.value)} />
          <Input label="Department" value={String(form.department ?? '')} onChange={(e) => setField('department', e.target.value)} />
          <Input label="City" value={String(form.city ?? '')} onChange={(e) => setField('city', e.target.value)} />
          <Input label="Profile picture URL" value={String(form.profile_picture ?? '')} onChange={(e) => setField('profile_picture', e.target.value)} />
          <Input label="Banner URL" value={String(form.profile_banner_url ?? '')} onChange={(e) => setField('profile_banner_url', e.target.value)} />
          <Select
            label="Public profile"
            value={form.is_public ? 'true' : 'false'}
            onChange={(e) => setField('is_public', e.target.value === 'true')}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
          <Textarea label="Bio" value={String(form.bio ?? '')} onChange={(e) => setField('bio', e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="danger"
              disabled={saving || !form.is_active}
              onClick={() => setConfirm('ban')}
            >
              Ban user
            </Button>
            {!form.is_active ? (
              <Button
                type="button"
                variant="secondary"
                disabled={saving}
                onClick={() => void saveProfile({ is_active: true })}
              >
                Unban
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-text-muted">
            Verifying sends approval email/notification. Banning sets is_active=false and revokes tokens.
          </p>
        </section>

        <section className="mb-5 space-y-3">
          <h3 className="text-sm font-semibold">Badges</h3>
          <div className="space-y-2">
            {catalogBadges.map((b) => {
              const checked = selectedBadges.includes(b.slug)
              return (
                <label
                  key={b.slug}
                  className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      setSelectedBadges((prev) =>
                        e.target.checked ? [...prev, b.slug] : prev.filter((s) => s !== b.slug),
                      )
                    }}
                  />
                  <span>{b.name}</span>
                  <span className="text-xs text-text-muted">({b.slug})</span>
                </label>
              )
            })}
          </div>
          <Button type="button" variant="secondary" disabled={saving} onClick={() => void saveBadges()}>
            Save badges
          </Button>
        </section>

        {adminUser?.is_superuser ? (
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Roles (superuser)</h3>
            {isSelf ? (
              <p className="text-sm text-warning">You cannot edit your own roles.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={roles.is_staff}
                      onChange={(e) =>
                        setRoles((r) => ({
                          ...r,
                          is_staff: e.target.checked,
                          is_superuser: e.target.checked ? r.is_superuser : false,
                        }))
                      }
                    />
                    Staff
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={roles.is_superuser}
                      onChange={(e) =>
                        setRoles((r) => ({
                          is_superuser: e.target.checked,
                          is_staff: e.target.checked ? true : r.is_staff,
                        }))
                      }
                    />
                    Superuser
                  </label>
                </div>
                <p className="text-xs text-text-muted">
                  Current: staff={boolLabel(user.is_staff)}, superuser={boolLabel(user.is_superuser)}
                </p>
                <Button type="button" variant="secondary" disabled={saving} onClick={() => setConfirm('roles')}>
                  Save roles
                </Button>
              </>
            )}
          </section>
        ) : null}
      </DetailPane>

      <ActionModal
        open={confirm === 'ban'}
        title="Ban user?"
        confirmLabel="Ban"
        variant="danger"
        busy={saving}
        onClose={() => setConfirm(null)}
        onConfirm={() => void saveProfile({ is_active: false })}
      >
        This sets is_active=false and revokes Firebase tokens. The user cannot use the app until unbanned.
      </ActionModal>
      <ActionModal
        open={confirm === 'verify'}
        title="Mark verified?"
        confirmLabel="Verify"
        variant="accent"
        busy={saving}
        onClose={() => setConfirm(null)}
        onConfirm={() => void saveProfile({ is_verified: true })}
      >
        Setting is_verified=true sends a verification approved email and in-app notification.
      </ActionModal>
      <ActionModal
        open={confirm === 'roles'}
        title="Update roles?"
        confirmLabel="Save roles"
        variant="dark"
        busy={saving}
        onClose={() => setConfirm(null)}
        onConfirm={() => void saveRoles()}
      >
        This changes staff/superuser flags and may sync the Firebase admin claim.
      </ActionModal>
    </>
  )
}
