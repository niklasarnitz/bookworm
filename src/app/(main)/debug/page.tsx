import { env } from "~/env";

export default function DebugPage() {
  const NODE_ENV = env.NODE_ENV;

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">{NODE_ENV}</h1>
    </div>
  );
}
