import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { MongoClient } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var __authConnectPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var __authInstance: any;
}

function getConnectedClient(): Promise<MongoClient> {
  if (!global.__authConnectPromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not set');

    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      heartbeatFrequencyMS: 10_000,
      maxIdleTimeMS: 60_000,
    });

    global.__authConnectPromise = client
      .connect()
      .then(() => client)
      .catch((err) => {
        // Clear so the next request gets a fresh attempt
        global.__authConnectPromise = undefined;
        global.__authInstance = undefined;
        throw err;
      });
  }
  return global.__authConnectPromise;
}

async function getInstance(): Promise<ReturnType<typeof betterAuth>> {
  if (global.__authInstance) return global.__authInstance;

  const client = await getConnectedClient();

  if (!global.__authInstance) {
    const dbName = process.env.MONGODB_DB_NAME ?? 'streak-counter';
    global.__authInstance = betterAuth({
      database: mongodbAdapter(client.db(dbName), { client }),
      secret: process.env.BETTER_AUTH_SECRET!,
      baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
      emailAndPassword: { enabled: true },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      },
      trustedOrigins: [
        process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
        process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      ],
    });
  }

  return global.__authInstance;
}

// Lazy proxy — callers use auth.api.* and auth.handler unchanged.
// Real instance is created only after MongoDB connection is confirmed.
export const auth = new Proxy({} as ReturnType<typeof betterAuth>, {
  has(_target, prop: string | symbol) {
    // toNextJsHandler checks `"handler" in auth`; without this trap the proxy
    // would return false (empty target) and fall back to calling auth as a function.
    return prop === 'handler' || prop === 'api';
  },
  get(_target, prop: string) {
    if (prop === 'handler') {
      return async (request: Request): Promise<Response> => {
        const instance = await getInstance();
        return instance.handler(request);
      };
    }
    if (prop === 'api') {
      return new Proxy({} as ReturnType<typeof betterAuth>['api'], {
        get(_t, method: string) {
          return async (...args: unknown[]) => {
            const instance = await getInstance();
            return (instance.api as Record<string, (...a: unknown[]) => unknown>)[method](...args);
          };
        },
      });
    }
    return (async () => {
      const instance = await getInstance();
      return (instance as unknown as Record<string, unknown>)[prop];
    })();
  },
});
