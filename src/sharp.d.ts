declare module "sharp" {
  interface SharpInstance {
    png(): SharpInstance;
    toBuffer(): Promise<Buffer>;
  }

  interface SharpOptions {
    failOn?: string;
  }

  interface Sharp {
    (input?: Buffer | string, options?: SharpOptions): SharpInstance;
  }

  const sharp: Sharp;
  export default sharp;
}
