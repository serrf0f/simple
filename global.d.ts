declare module "*.css" {
  const content: string;
  export default content;
}

interface Bindings {
  // DB: D1Database;
  // KV: KVNamespace;
  // DURABLE_OBJECT: DurableObjectNamespace;
  // BUCKET: R2Bucket;
  // AI: any;
  // SERVICE: Fetcher;
  // MY_QUEUE: Queue<any>;
  // ANALYTICS_ENGINE: AnalyticsEngineDataset;
  // ENVIRONMENT: string;
  // SECRET: string;
  [key: string]: any;
}