/**
 * identities.ts — identity-management API (accesscore `identitymanage` slice).
 *
 * MVP scope: list users (`type=user`). Create/edit/lock/unlock/change-password
 * wrappers land with the operation modals (PR-10).
 */
import { http } from '@gocell/request'
import type { HttpAuthUserGetV1Response } from '@gocell/contracts'

/** Collection endpoint for user identities (shared by list + create). */
export const USERS_URL = '/api/v1/access/users'

/**
 * A single identity row. Reuses the real get-contract `data` shape
 * (id/username/email/status/createdAt/updatedAt) so the row type stays
 * codegen-derived even while the list envelope is provisional.
 */
export type Identity = HttpAuthUserGetV1Response['data']

/**
 * BR-005 pending: `http.auth.user.list` is not yet delivered by the backend
 * (see docs/backend-requirements/BR-005-user-list.md — the `/users` route group
 * registers 8 handlers, no `list`). The envelope mirrors the established
 * cursor-pagination convention shared by HttpAuditListV1Response and
 * HttpAuthRoleListV1Response (`{ data, nextCursor, hasMore }`). Once the backend
 * ships the schema and `pnpm codegen` derives HttpAuthUserListV1Response, delete
 * this interface and import the generated type instead.
 */
export interface UserListPage {
  data: Identity[]
  nextCursor: string
  hasMore: boolean
}

export interface ListUsersParams {
  cursor?: string
  limit?: number
}

/** GET /users — cursor-paginated identity list. */
export async function listUsers(params: ListUsersParams = {}): Promise<UserListPage> {
  const res = await http.get<UserListPage>(USERS_URL, { params })
  return res.data
}
