declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    DISCORD_PUBLIC_KEY?: string;
    DISCORD_ADMIN_ROLE_IDS?: string;
  }
}
