import React from "react";
import { Modal, Pressable, Text } from "react-native";
import { SET_TAG_META } from "@/schemas/live-workout.schema";
import { SetTagSchema, type SetTag } from "@/schemas/workout-history.schema";

interface SetTagDialogProps {
  visible: boolean;
  currentTag: SetTag | null;
  onSelect: (tag: SetTag | null) => void;
  onRemoveSet: () => void;
  onClose: () => void;
}

interface TagOptionProps {
  testID: string;
  short: string;
  label: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
}

function TagOption({ testID, short, label, color, isSelected, onPress }: TagOptionProps) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      className={`flex-row items-center gap-3 rounded-xl px-3 py-3 border ${
        isSelected ? "bg-[#1E1E22] border-[#007AFF]" : "bg-[#18181B] border-[#27272A]"
      } active:bg-[#27272A]`}
    >
      <Text className="w-8 text-center text-base font-black" style={{ color }}>
        {short}
      </Text>
      <Text className="text-sm font-bold text-white">{label}</Text>
    </Pressable>
  );
}

/** Opened from the set number: regular set, warm-up (R), drop set (D), failed (NU) or remove the set. */
export function SetTagDialog({ visible, currentTag, onSelect, onRemoveSet, onClose }: SetTagDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} testID="set-tag-dialog">
      <Pressable className="flex-1 justify-center bg-black/70 px-6" onPress={onClose} accessibilityLabel="Zamknij">
        <Pressable className="rounded-3xl bg-[#121214] border border-[#27272A] p-4 gap-2" onPress={() => undefined}>
          <Text className="text-base font-black text-white pb-1">Rodzaj serii</Text>
          <TagOption
            testID="set-tag-regular"
            short="1"
            label="Normalna seria"
            color="#A1A1AA"
            isSelected={currentTag === null}
            onPress={() => onSelect(null)}
          />
          {SetTagSchema.options.map((tag) => (
            <TagOption
              key={tag}
              testID={`set-tag-${tag}`}
              short={SET_TAG_META[tag].short}
              label={SET_TAG_META[tag].label}
              color={SET_TAG_META[tag].color}
              isSelected={currentTag === tag}
              onPress={() => onSelect(tag)}
            />
          ))}
          <Pressable
            testID="set-tag-remove"
            onPress={onRemoveSet}
            accessibilityRole="button"
            className="items-center rounded-xl py-3 mt-1 bg-[#EF4444]/10 border border-[#EF4444]/30 active:bg-[#EF4444]/20"
          >
            <Text className="text-sm font-black text-[#EF4444]">Usuń serię</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
