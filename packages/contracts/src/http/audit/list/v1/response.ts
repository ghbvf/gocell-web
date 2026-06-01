/* eslint-disable */
/**
 * AUTO-GENERATED — DO NOT EDIT BY HAND.
 * Source: gocell/contracts/http/audit/list/v1/response.schema.json
 * 由 `pnpm codegen` 派生；CI 经 `git diff --exit-code` 守门只读。
 */

export interface HttpAuditListV1Response {
  data: {
    id: string;
    eventId: string;
    eventType: string;
    actorId: string;
    subjectId?: string;
    /**
     * Opaque cross-cell correlation identifier from the originating request context. Lets consumers stitch an audited action back to its request. Empty for entries predating its introduction.
     */
    correlationId?: string;
    occurredAt?: string;
    timestamp: string;
    payload?: unknown;
  }[];
  nextCursor: string;
  hasMore: boolean;
}
