import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { format } from 'date-fns';
import { getInsights } from '@/services/insights/insights.service';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const today = format(new Date(), 'yyyy-MM-dd');

  try {
    const insights = await getInsights(session.user.id, today);
    return Response.json(insights);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
