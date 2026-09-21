import { useCallback, useEffect, useRef, type ComponentType } from "react";
import { Pressable, StyleSheet, type LayoutChangeEvent } from "react-native";
import { useRouter, type Href } from "expo-router";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { HomeIcon, IslandIcon, PeopleIcon, PlusIcon, ReceiptIcon } from "@/components/ui/icons";
import { COLORS } from "@/constants/colors";
import { DURATION, EASE, PILL_NAV } from "@/constants/motion";
import type { IconProps } from "@/types";

const ICON_SIZE = 20;
export const TAB_BAR_BOTTOM_MARGIN = 16;

/** Space a screen must leave free at the bottom so the floating bar covers nothing. */
export const TAB_BAR_RESERVED_HEIGHT =
  PILL_NAV.expandedCircleSize + PILL_NAV.expandedPaddingV * 2 + TAB_BAR_BOTTOM_MARGIN * 2;

type TabItem = {
  key: string;
  label: string;
  Icon: ComponentType<IconProps>;
} & (
    | { route: string; href?: never }
    /** For slots the design shows that have no tab screen of their own. */
    | { route?: never; href: Href }
  );

const ITEMS: readonly TabItem[] = [
  { key: "home", label: "Dashboard", Icon: HomeIcon, route: "index" },
  //instead of a profile tab, we have a people tab that shows circles, in accordance with gwy's comment in figma design.
  { key: "people", label: "Circles", Icon: PeopleIcon, route: "circles" },
  { key: "trips", label: "Trips", Icon: IslandIcon, route: "trips" },
  { key: "receipts", label: "Payment QR codes", Icon: ReceiptIcon, route: "index" },
];

export function TabBar({ state, navigation, insets }: BottomTabBarProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const collapsed = useSharedValue(0);
  const slotLefts = useSharedValue<number[]>([]);
  const slotWidths = useSharedValue<number[]>([]);

  const activeRoute = state.routes[state.index]?.name;
  // First match wins, so only ever one slot is marked even when two share a route.
  const activeIndex = Math.max(
    ITEMS.findIndex((item) => item.route !== undefined && item.route === activeRoute),
    0,
  );

  const slideIndex = useSharedValue(activeIndex);
  const layouts = useRef<({ x: number; width: number } | undefined)[]>([]);
  const hasMounted = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleCollapse = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      collapsed.value = withTiming(1, {
        duration: reduceMotion ? 0 : DURATION.slow,
        easing: EASE.standard,
      });
    }, PILL_NAV.idleCollapseDelay);
  }, [collapsed, reduceMotion]);

  const expandNow = useCallback(() => {
    collapsed.value = withTiming(0, {
      duration: reduceMotion ? 0 : DURATION.base,
      easing: EASE.decelerate,
    });
    scheduleCollapse();
  }, [collapsed, reduceMotion, scheduleCollapse]);

  useEffect(() => {
    scheduleCollapse();
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [scheduleCollapse]);

  // Snap on the first pass, slide after. Keyed off the route rather than the
  // press so a deep link or a programmatic jump moves the circle too.
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      slideIndex.value = activeIndex;
      return;
    }
    slideIndex.value = withTiming(activeIndex, {
      duration: reduceMotion ? 0 : DURATION.base,
      easing: EASE.standard,
    });
  }, [activeIndex, reduceMotion, slideIndex]);

  const handleSlotLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    layouts.current[index] = { x, width };
    slotLefts.value = ITEMS.map((_, i) => layouts.current[i]?.x ?? 0);
    slotWidths.value = ITEMS.map((_, i) => layouts.current[i]?.width ?? 0);
  };

  const handlePress = (item: TabItem) => {
    expandNow();

    if (item.href) {
      router.push(item.href);
      return;
    }

    // Renaming a screen should dim a slot, not crash the whole bar.
    const route = state.routes.find((candidate) => candidate.name === item.route);
    if (!route) return;

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (activeRoute !== route.name && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const rootStyle = useAnimatedStyle(() => ({
    paddingHorizontal: interpolate(
      collapsed.value,
      [0, 1],
      [PILL_NAV.expandedSideMargin, PILL_NAV.collapsedSideMargin],
      Extrapolation.CLAMP,
    ),
  }));

  const rowStyle = useAnimatedStyle(() => ({
    gap: interpolate(
      collapsed.value,
      [0, 1],
      [PILL_NAV.expandedGap, PILL_NAV.collapsedGap],
      Extrapolation.CLAMP,
    ),
  }));

  const pillStyle = useAnimatedStyle(() => ({
    paddingHorizontal: interpolate(
      collapsed.value,
      [0, 1],
      [PILL_NAV.expandedPaddingH, PILL_NAV.collapsedPaddingH],
      Extrapolation.CLAMP,
    ),
    // No vertical padding: the slots span the full height so their touch
    // targets stay as tall as the bar, and the indicator is inset visually
    // instead. That keeps the collapsed target well clear of the 44pt floor.
    height:
      interpolate(
        collapsed.value,
        [0, 1],
        [PILL_NAV.expandedCircleSize, PILL_NAV.collapsedCircleSize],
        Extrapolation.CLAMP,
      ) +
      interpolate(
        collapsed.value,
        [0, 1],
        [PILL_NAV.expandedPaddingV, PILL_NAV.collapsedPaddingV],
        Extrapolation.CLAMP,
      ) *
      2,
  }));

  const indicatorStyle = useAnimatedStyle(() => {
    const height = interpolate(
      collapsed.value,
      [0, 1],
      [PILL_NAV.expandedCircleSize, PILL_NAV.collapsedCircleSize],
      Extrapolation.CLAMP,
    );
    const padV = interpolate(
      collapsed.value,
      [0, 1],
      [PILL_NAV.expandedPaddingV, PILL_NAV.collapsedPaddingV],
      Extrapolation.CLAMP,
    );
    const overhang = interpolate(
      collapsed.value,
      [0, 1],
      [PILL_NAV.expandedOverhang, PILL_NAV.collapsedOverhang],
      Extrapolation.CLAMP,
    );
    const lefts = slotLefts.value;
    const widths = slotWidths.value;

    if (lefts.length === 0) {
      return { opacity: 0, top: padV, left: 0, width: 0, height, borderRadius: height / 2 };
    }

    const position = Math.min(Math.max(slideIndex.value, 0), lefts.length - 1);
    const from = Math.floor(position);
    const to = Math.ceil(position);
    const progress = position - from;

    const left = lefts[from] + (lefts[to] - lefts[from]) * progress;
    const width = widths[from] + (widths[to] - widths[from]) * progress;

    return {
      opacity: 1,
      top: padV,
      left: 0,
      // translateX rather than an animated `left`, so sliding never re-lays out.
      transform: [{ translateX: left - overhang }],
      width: width + overhang * 2,
      height,
      borderRadius: height / 2,
    };
  });

  const actionStyle = useAnimatedStyle(() => {
    const size =
      interpolate(
        collapsed.value,
        [0, 1],
        [PILL_NAV.expandedCircleSize, PILL_NAV.collapsedCircleSize],
        Extrapolation.CLAMP,
      ) +
      interpolate(
        collapsed.value,
        [0, 1],
        [PILL_NAV.expandedPaddingV, PILL_NAV.collapsedPaddingV],
        Extrapolation.CLAMP,
      ) *
      2;

    return { width: size, height: size, borderRadius: size / 2 };
  });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[{ paddingBottom: insets.bottom + TAB_BAR_BOTTOM_MARGIN }, rootStyle]}
      className="absolute bottom-0 left-0 right-0"
    >
      <Animated.View style={rowStyle} className="flex-row items-center">
        <Animated.View style={pillStyle} className="flex-1 flex-row items-center rounded-full bg-tab-bar p-4">
          <Animated.View style={indicatorStyle} className="absolute bg-primary" />

          {ITEMS.map((item, index) => (
            <TabSlot
              key={item.key}
              item={item}
              index={index}
              isActive={index === activeIndex}
              collapsed={collapsed}
              slideIndex={slideIndex}
              onLayout={(event) => handleSlotLayout(index, event)}
              onPress={() => handlePress(item)}
            />
          ))}
        </Animated.View>

        {/* TODO: no action wired up yet. Marked disabled so a screen reader does
            not announce an action that does nothing. */}
        <Animated.View style={actionStyle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create"
            accessibilityState={{ disabled: true }}
            disabled
            className="h-full w-full items-center justify-center rounded-full bg-primary"
          >
            <PlusIcon size={ICON_SIZE} />
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

interface TabSlotProps {
  item: TabItem;
  index: number;
  isActive: boolean;
  collapsed: SharedValue<number>;
  slideIndex: SharedValue<number>;
  onLayout: (event: LayoutChangeEvent) => void;
  onPress: () => void;
}

function TabSlot({
  item,
  index,
  isActive,
  collapsed,
  slideIndex,
  onLayout,
  onPress,
}: TabSlotProps) {
  // Shrinking the glyph by transform, not by its `size` prop: a prop would
  // re-render the SVG on every frame of the collapse.
  const glyphStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          collapsed.value,
          [0, 1],
          [1, PILL_NAV.collapsedCircleSize / PILL_NAV.expandedCircleSize],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  // The white glyph fades up as the pill arrives underneath it, so neither icon
  // is left invisible while the pill is in transit.
  const onDarkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(slideIndex.value - index),
      [0, 0.5],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Pressable
      accessibilityRole={item.route ? "tab" : "button"}
      accessibilityState={item.route ? { selected: isActive } : undefined}
      accessibilityLabel={item.label}
      onLayout={onLayout}
      onPress={onPress}
      // Above the indicator, which is absolutely positioned in the same parent
      // and would otherwise swallow the press.
      style={{ zIndex: 1 }}
      className="h-full flex-1 items-center justify-center active:opacity-70"
    >
      <Animated.View style={glyphStyle}>
        <item.Icon size={ICON_SIZE} />
        <Animated.View
          style={[StyleSheet.absoluteFill, onDarkStyle]}
          className="items-center justify-center"
        >
          <item.Icon size={ICON_SIZE} color={COLORS["on-primary"]} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
