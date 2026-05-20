import type { ImportColorStylesResult } from "../../lib/types/tokens.ts"

export const importSummaryFixtures = {
  success: {
    summary: {
      created: 3,
      replaced: 1,
      skipped: 0,
      failed: 0,
      failures: [],
    } satisfies ImportColorStylesResult,
    convertedColorCount: 2,
    modePairCount: 2,
  },
  partial: {
    summary: {
      created: 2,
      replaced: 0,
      skipped: 1,
      failed: 1,
      failures: [
        {
          name: "Color / Semantic / Accent",
          reason: "Color Style could not be updated.",
        },
      ],
    } satisfies ImportColorStylesResult,
    convertedColorCount: 1,
    modePairCount: 1,
  },
  failed: {
    summary: {
      created: 0,
      replaced: 0,
      skipped: 0,
      failed: 2,
      failures: [
        {
          name: "Color / Brand / Primary",
          reason: "Permission changed while importing.",
        },
        {
          name: "Color / Semantic / Danger",
          reason: "Framer rejected the color style update.",
        },
      ],
    } satisfies ImportColorStylesResult,
    convertedColorCount: 0,
    modePairCount: 0,
  },
}
