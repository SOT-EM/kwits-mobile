import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import { ChevronLeftIcon } from "@/components/ui/icons";
import { TAB_BAR_BOTTOM_MARGIN } from "@/components/layout/TabBar";
import { COLORS } from "@/constants/colors";
import { PILL_NAV } from "@/constants/motion";
import { SUGGESTED_MEMBERS } from "@/lib/circles";
import { useGoBack } from "@/hooks/useGoBack";

export default function CircleMembersScreen() {
	const { circleId } = useLocalSearchParams<{ circleId: string }>();
	const goBack = useGoBack("/(tabs)/circles");
	const insets = useSafeAreaInsets();
	const [search, setSearch] = useState("");
	const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

	const filteredMembers = useMemo(
		() =>
			SUGGESTED_MEMBERS.filter((member) =>
				member.name.toLowerCase().includes(search.trim().toLowerCase()),
			),
		[search],
	);

	const toggleMember = (memberId: string) => {
		setSelectedMembers((current) =>
			current.includes(memberId)
				? current.filter((id) => id !== memberId)
				: [...current, memberId],
		);
	};

	const confirmDiscard = () => {
		Alert.alert("Discard circle?", "Are you sure you discard this circle?", [
			{ text: "No", style: "cancel" },
			{ text: "Discard", style: "destructive", onPress: goBack },
		]);
	};

	return (
		<SafeAreaView className="flex-1 bg-background" edges={["top"]}>
			<View className="h-12 flex-row items-center justify-between px-3">
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Go back"
					onPress={confirmDiscard}
					className="h-6 w-6 items-center justify-center rounded-full bg-input active:opacity-70"
				>
					<ChevronLeftIcon size={16} color={COLORS.muted} />
				</Pressable>

				<Text className="absolute left-0 right-0 text-center font-sans-semibold text-[13px] text-foreground">
					New Circle
				</Text>

				<View className="h-[34px] w-[34px] items-center justify-center rounded-full border-2 border-background bg-skeleton shadow-sm">
					<Text className="font-sans-semibold text-[7px] text-muted">IMG</Text>
				</View>
			</View>

			<ScrollView
				className="flex-1"
				contentContainerStyle={{
					paddingHorizontal: 12,
					paddingBottom:
						PILL_NAV.expandedCircleSize +
						PILL_NAV.expandedPaddingV * 2 +
						insets.bottom +
						TAB_BAR_BOTTOM_MARGIN,
				}}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<View className="mt-0.5 h-[31px] flex-row items-center rounded-full bg-input px-2">
					<Text className="mr-1 text-[17px] leading-5 text-muted">⌕</Text>
					<TextInput
						value={search}
						onChangeText={setSearch}
						placeholder="Search"
						placeholderTextColor={COLORS.muted}
						className="flex-1 p-0 font-sans text-[10px] text-foreground"
					/>
				</View>

				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Invite members"
					className="mt-2 h-20 items-center justify-center rounded-[15px] border border-dashed border-hairline active:bg-input"
				>
					<Text className="font-sans text-[10px] text-[#C5C5C5]">Invite members</Text>
				</Pressable>

				<Text className="mt-[17px] font-sans-semibold text-[9px] text-foreground">Suggested</Text>

				<View className="mt-1">
					{filteredMembers.map((member) => {
						const isSelected = selectedMembers.includes(member.id);

						return (
							<Pressable
								key={member.id}
								onPress={() => toggleMember(member.id)}
								accessibilityRole="checkbox"
								accessibilityState={{ checked: isSelected }}
								className="h-[43px] flex-row items-center"
							>
								<View
									className={`mr-2 h-[27px] w-[27px] items-center justify-center rounded-full ${member.color === "yellow" ? "bg-[#FFF0C4]" : "bg-[#C9EDFF]"}`}
								>
									<Text className="font-sans-semibold text-[5px] text-on-primary">IMG</Text>
								</View>

								<Text className="flex-1 font-sans text-[9px] text-[#4A4A4A]">{member.name}</Text>

								<View
									className={`mr-1 h-[11px] w-[11px] items-center justify-center rounded-full border-[1.5px] ${isSelected ? "border-primary" : "border-muted"}`}
								>
									{isSelected ? <View className="h-[5px] w-[5px] rounded-full bg-primary" /> : null}
								</View>
							</Pressable>
						);
					})}
				</View>
			</ScrollView>

			<View
				className="absolute bottom-0 left-0 right-0"
				style={{
					paddingBottom: insets.bottom + TAB_BAR_BOTTOM_MARGIN,
					paddingHorizontal: PILL_NAV.expandedSideMargin,
				}}
			>
				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Next"
					onPress={() => console.log("Selected members:", circleId, selectedMembers)}
					style={{
						height:
							PILL_NAV.expandedCircleSize + PILL_NAV.expandedPaddingV * 2,
					}}
					className="items-center justify-center rounded-full bg-primary active:opacity-80"
				>
					<Text className="font-sans-semibold text-[9px] text-on-primary">Next</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}