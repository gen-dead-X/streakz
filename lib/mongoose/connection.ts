import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConn: typeof mongoose | undefined;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (global.__mongooseConn) return global.__mongooseConn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  global.__mongooseConn = await mongoose.connect(uri);
  return global.__mongooseConn;
}
