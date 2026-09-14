import React from "react";
import { Text, View } from "react-native";
import { PERSONAL_RECORD_META } from "@/schemas/live-workout.schema";
import type { PersonalRecordType } from "@/schemas/workout-history.schema";

interface SetRecordBadgesProps {
  records: readonly PersonalRecordType[];
}

/** MAX (1RM) / SERIA (best set volume) / POWT. (most reps) for a set that beat the user's record. */
export function SetRecordBadges({ records }: SetRecordBadgesProps) {
  if (records.length === 0) return null;

  return (
    <View testID="set-record-badges" className="items-center gap-0.5">
      {records.map((type) => {
        const meta = PERSONAL_RECORD_META[type];
        return (
          <View
            key={type}
            accessibilityLabel={`Rekord: ${meta.label}`}
            className="rounded-full border px-1 py-px"
            style={{ borderColor: `${meta.color}66`, backgroundColor: `${meta.color}26` }}
          >
            <Text className="text-[8px] font-black" style={{ color: meta.color }}>
              {meta.short}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
