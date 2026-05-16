import { z } from 'zod';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/db';
import { cashSessions, posSales } from '@/db/schema';

export const openingAmountSchema = z.object({
  openingAmountCents: z.number().int().min(0),
});

export const closingAmountSchema = z.object({
  closingAmountCountedCents: z.number().int().min(0),
  notes: z.string().max(500).optional().default(''),
});

export type CashSessionRow = typeof cashSessions.$inferSelect;

export function calcExpectedAmountCents(
  openingAmountCents: number,
  sales: { totalCents: number; paymentMethod: string }[],
): number {
  const cashIn = sales
    .filter((s) => s.paymentMethod === 'cash')
    .reduce((a, s) => a + Number(s.totalCents), 0);
  return Number(openingAmountCents) + cashIn;
}

/** Returns currently open session for this user, or null. */
export async function getOpenSessionForUser(userId: number): Promise<CashSessionRow | null> {
  const [s] = await db
    .select()
    .from(cashSessions)
    .where(and(eq(cashSessions.openedBy, userId), isNull(cashSessions.closedAt)))
    .limit(1);
  return s ?? null;
}

export type OpenError = 'already_open';

export async function openCashSession(args: {
  userId: number;
  openingAmountCents: number;
}): Promise<{ ok: true; sessionId: number } | { ok: false; error: OpenError }> {
  const existing = await getOpenSessionForUser(args.userId);
  if (existing) return { ok: false, error: 'already_open' };

  const [ins] = await db
    .insert(cashSessions)
    .values({ openedBy: args.userId, openingAmountCents: args.openingAmountCents })
    .returning({ id: cashSessions.id });
  return { ok: true, sessionId: ins.id };
}

export type CloseError = 'not_found' | 'already_closed' | 'wrong_user';

export async function closeCashSession(args: {
  sessionId: number;
  userId: number;
  closingAmountCountedCents: number;
  notes: string;
}): Promise<
  | { ok: true; expectedCents: number; diffCents: number }
  | { ok: false; error: CloseError }
> {
  const [session] = await db
    .select()
    .from(cashSessions)
    .where(eq(cashSessions.id, args.sessionId))
    .limit(1);
  if (!session) return { ok: false, error: 'not_found' };
  if (session.closedAt) return { ok: false, error: 'already_closed' };
  if (session.openedBy !== args.userId) return { ok: false, error: 'wrong_user' };

  const sales = await db
    .select({ totalCents: posSales.totalCents, paymentMethod: posSales.paymentMethod })
    .from(posSales)
    .where(eq(posSales.cashSessionId, args.sessionId));
  const expected = calcExpectedAmountCents(Number(session.openingAmountCents), sales);
  const diff = args.closingAmountCountedCents - expected;

  await db
    .update(cashSessions)
    .set({
      closedBy: args.userId,
      closedAt: new Date(),
      closingAmountCountedCents: args.closingAmountCountedCents,
      closingAmountExpectedCents: expected,
      notes: args.notes,
    })
    .where(eq(cashSessions.id, args.sessionId));
  return { ok: true, expectedCents: expected, diffCents: diff };
}

export type SessionHistoryRow = {
  id: number;
  openedBy: number;
  openedByName: string;
  openedAt: string;
  closedAt: string | null;
  openingAmountCents: number;
  closingAmountExpectedCents: number | null;
  closingAmountCountedCents: number | null;
  diffCents: number | null;
  salesCount: number;
};

export async function listSessions(filters: { userIdScope?: number } = {}): Promise<SessionHistoryRow[]> {
  const scope = filters.userIdScope
    ? sql`WHERE cs.opened_by = ${filters.userIdScope}`
    : sql``;
  const r = await db.execute(sql`
    SELECT cs.id, cs.opened_by AS "openedBy",
      u.name AS "openedByName",
      cs.opened_at AS "openedAt", cs.closed_at AS "closedAt",
      cs.opening_amount_cents AS "openingAmountCents",
      cs.closing_amount_expected_cents AS "closingAmountExpectedCents",
      cs.closing_amount_counted_cents AS "closingAmountCountedCents",
      (cs.closing_amount_counted_cents - cs.closing_amount_expected_cents) AS "diffCents",
      COALESCE((SELECT COUNT(*)::int FROM pos_sales ps WHERE ps.cash_session_id = cs.id), 0) AS "salesCount"
    FROM cash_sessions cs
    JOIN users u ON u.id = cs.opened_by
    ${scope}
    ORDER BY cs.opened_at DESC
    LIMIT 100
  `);
  return r.rows.map((row) => {
    const o = row as Record<string, unknown>;
    return {
      id: Number(o.id),
      openedBy: Number(o.openedBy),
      openedByName: String(o.openedByName),
      openedAt: String(o.openedAt),
      closedAt: o.closedAt ? String(o.closedAt) : null,
      openingAmountCents: Number(o.openingAmountCents),
      closingAmountExpectedCents: o.closingAmountExpectedCents == null ? null : Number(o.closingAmountExpectedCents),
      closingAmountCountedCents: o.closingAmountCountedCents == null ? null : Number(o.closingAmountCountedCents),
      diffCents: o.diffCents == null ? null : Number(o.diffCents),
      salesCount: Number(o.salesCount),
    };
  });
}
