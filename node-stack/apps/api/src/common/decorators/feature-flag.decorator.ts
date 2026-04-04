import { SetMetadata } from "@nestjs/common";

import { FEATURE_FLAG_KEY } from "../guards/feature-flag.guard";

export const FeatureFlag = (flagKey: string) =>
  SetMetadata(FEATURE_FLAG_KEY, flagKey);
