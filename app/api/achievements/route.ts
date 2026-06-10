import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { getAchievementsForUser } from '@/services/achievements/achievements.service';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const achievements = await getAchievementsForUser(session.user.id);
    return Response.json({ achievements });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
