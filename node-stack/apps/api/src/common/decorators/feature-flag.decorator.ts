import { SetMetadata } from "@nestjs/common";

import { FEATURE_FLAG_KEY } from "@/common/guards/feature-flag.guard.js";

export const FeatureFlag = (flagKey: string): ReturnType<typeof SetMetadata> =>
  SetMetadata(FEATURE_FLAG_KEY, flagKey);
