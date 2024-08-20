/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace PrismaJson {
    type Attributes = Record<string, string | number | boolean>;
  }
}
