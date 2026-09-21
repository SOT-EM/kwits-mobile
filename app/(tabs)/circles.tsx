import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { PeopleIcon } from "@/components/ui/icons";
import { COLORS } from "@/constants/colors";
import { CIRCLES } from "@/lib/circles";
import type { Circle } from "@/types";

export default function CirclesScreen() {
	const router = useRouter();

	return (
		<View className="flex-1 bg-background">
			<View className="h-16 flex-row items-center justify-between px-4">
				<Text className="font-sans-semibold text-[15px] text-foreground">
					Your Circles ({CIRCLES.length})
				</Text>

				<Pressable
					accessibilityRole="button"
					accessibilityLabel="Manage circles"
					className="h-8 w-8 items-center justify-center rounded-full bg-input active:opacity-70"
				>
					<PeopleIcon size={17} color={COLORS.muted} />
				</Pressable>
			</View>

			<ScrollView
				className="flex-1"
				contentContainerClassName="px-4 pb-6"
				showsVerticalScrollIndicator={false}
			>
				{CIRCLES.map((circle) => (
					<CircleItem
						key={circle.id}
						circle={circle}
						onPress={() => router.push(`/circles/${circle.id}`)}
					/>
				))}
			</ScrollView>
		</View>
	);
}

function CircleItem({ circle, onPress }: { circle: Circle; onPress: () => void }) {
	return (
		<Pressable
			accessibilityRole="button"
			accessibilityLabel={`Open ${circle.name}`}
			onPress={onPress}
			className="mb-0.5 h-14 flex-row items-center rounded-[10px] px-2 active:bg-input"
		>
			<View className="mr-2 h-[38px] w-[38px] items-center justify-center rounded-full bg-[#D9F0FF]">
				<View className="h-5 w-5 items-center justify-center rounded-[5px] bg-[#48B8F2]">
					<Text className="font-sans-semibold text-xs text-on-primary">{circle.initial}</Text>
				</View>
			</View>

			<Text className="flex-1 font-sans text-xs text-[#555555]">{circle.name}</Text>
			<Text className="mr-1 text-[22px] font-light leading-6 text-muted">›</Text>
		</Pressable>
	);
}
