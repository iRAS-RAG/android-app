import { styles } from "@/styles/tankDetail/tankDetail.styles";
import { theme } from "@/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import Svg, { Line as SvgLine, Text as SvgText, Rect } from "react-native-svg";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { tankDetailService } from "@/services/tankDetailService";
import { tankDetailApi } from "@/api/tankDetailApi";
import { toast } from "@/utils/toast";

const { width: screenWidth } = Dimensions.get("window");

// ─── Sensor carousel ──────────────────────────────────────────────────────────
const SENSOR_CARD_W = screenWidth - 40 - 76; // section pad(40) + 2 arrows(76)

// ─── Chart geometry (calibrated to chart-kit v6.12 internals) ────────────────
// chart-kit defaults: style.paddingRight=64 (left pad), style.paddingTop=16
// Y data area height = CHART_H * 0.75 (verticalLabelsHeightPercentage)
const CHART_H = 230;
const CHART_Y_AXIS_W = 40;   // Y-axis panel width: ~25px for label text + 15px gap to data
const CHART_LEFT_PAD = 16;   // extra left space so first dot/label isn't clipped
const CHART_LABEL_X = CHART_Y_AXIS_W - 12; // kept for reference; labels now use textAnchor="start" at x=0
const CHART_TOP_PAD = 16;    // chart-kit's paddingTop default
const CHART_INNER_H = CHART_H * 0.75; // 172.5 — matches chart-kit's (height*3/4) exactly
const CHART_BOT_PAD = CHART_H - CHART_TOP_PAD - CHART_INNER_H; // 42
const POINTS_PER_SCREEN = 7;
const POINT_SLOT_W = (screenWidth - 40) / POINTS_PER_SCREEN;

// ─── Filter config ────────────────────────────────────────────────────────────
type ChartFilter = "1m" | "1h" | "1d" | "1w";

const FILTER_OPTIONS: { value: ChartFilter; label: string; seconds: number }[] =
  [
    { value: "1m",  label: "1 phút", seconds: 60 },
    { value: "1h",  label: "1 giờ",  seconds: 3600 },
    { value: "1d",  label: "1 ngày", seconds: 86400 },
    { value: "1w",  label: "1 tuần", seconds: 604800 },
  ];

const FILTER_CONFIG: Record<
  ChartFilter,
  {
    lookbackMs: number;
    intervalMin: number;
    pollMs: number;
    labelFmt: (d: Date) => string;
  }
> = {
  "1m": {
    lookbackMs: 2 * 3600 * 1000,
    intervalMin: 1,
    pollMs: 60_000,
    labelFmt: (d) =>
      `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`,
  },
  "1h": {
    lookbackMs: 48 * 3600 * 1000,
    intervalMin: 60,
    pollMs: 3600_000,
    // Hour first, date second — separated by newline (handled via rotated labels)
    labelFmt: (d) => `${d.getHours()}h\n${d.getDate()}/${d.getMonth() + 1}`,
  },
  "1d": {
    lookbackMs: 24 * 3600 * 1000,
    intervalMin: 120,
    pollMs: 0,
    labelFmt: (d) => `${d.getHours()}h`,
  },
  "1w": {
    lookbackMs: 7 * 24 * 3600 * 1000,
    intervalMin: 1440,
    pollMs: 0,
    labelFmt: (d) => `${d.getDate()}/${d.getMonth() + 1}`,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeChartConfig = (lineColor: string) => ({
  backgroundGradientFrom: "#FFF",
  backgroundGradientTo: "#FFF",
  decimalPlaces: 2,
  color: (opacity = 1) => {
    const hex = parseInt(lineColor.replace("#", ""), 16);
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    return `rgba(${r},${g},${b},${opacity})`;
  },
  labelColor: (opacity = 1) => `rgba(100,116,139,${opacity})`,
  style: { borderRadius: 16 },
  // No fill area under the line
  fillShadowGradientOpacity: 0,
  fillShadowGradientFromOpacity: 0,
  fillShadowGradientToOpacity: 0,
  propsForDots: { r: "5", strokeWidth: "2", stroke: "#FFFFFF" },
  propsForBackgroundLines: { strokeDasharray: "5", stroke: "#E2E8F0" },
});

const formatCountdown = (s: number): string => {
  if (s < 60) return `${s}s`;
  if (s < 3600) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const getDefaultThreshold = (sensorTypeName: string): { min: number; max: number } => {
  const lower = sensorTypeName?.toLowerCase() || "";
  if (lower.includes("nhiệt độ") || lower.includes("temp")) return { min: 26, max: 30 };
  if (lower.includes("ph")) return { min: 6.5, max: 8.5 };
  if (lower.includes("oxy") || lower.includes("do")) return { min: 4, max: 8 };
  return { min: 0, max: 100 };
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TankDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tankData, setTankData] = useState<any>(null);

  // Carousel
  const [sensorIndex, setSensorIndex] = useState(0);
  const sensorListRef = useRef<FlatList>(null);

  // Chart
  const [selectedSensorId, setSelectedSensorId] = useState<string | null>(null);
  const [chartFilter, setChartFilter] = useState<ChartFilter>("1m");
  const [chartData, setChartData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const chartScrollRef = useRef<ScrollView>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const metricsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown
  const [countdown, setCountdown] = useState(60);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filter picker modal
  const [showFilterPicker, setShowFilterPicker] = useState(false);

  // Device toggle
  const [deviceToToggle, setDeviceToToggle] = useState<any>(null);
  const [isToggling, setIsToggling] = useState(false);

  // ─── Load chart data ──────────────────────────────────────────────────────

  const loadChartData = useCallback(
    async (sensorId: string, filter: ChartFilter, silent = false) => {
      if (!silent) setChartLoading(true);
      const cfg = FILTER_CONFIG[filter];
      try {
        const now = new Date();
        const from = new Date(now.getTime() - cfg.lookbackMs);
        const res = await tankDetailApi.getSensorHistory(
          sensorId,
          from.toISOString(),
          now.toISOString(),
          cfg.intervalMin,
        );
        const raw = res.data?.data?.items ?? res.data?.data ?? [];
        const items = Array.isArray(raw) ? raw : [];
        const valid = items.filter((i: any) => {
          const v = i.average ?? i.averageValue ?? i.value ?? i.avg ?? i.data;
          return v != null && !isNaN(Number(v));
        });
        const labels = valid.map((i: any) => {
          const ts = i.recordedAt ?? i.time ?? i.timestamp ?? i.periodStart ?? i.createdAt ?? "";
          const d = new Date(ts);
          return isNaN(d.getTime()) ? "--" : cfg.labelFmt(d);
        });
        const values = valid.map((i: any) =>
          Number(i.average ?? i.averageValue ?? i.value ?? i.avg ?? i.data),
        );

        if (values.length > 0) {
          setChartData({ labels, datasets: [{ data: values }] });
        } else {
          setChartData(null);
        }
      } catch {
        setChartData(null);
      } finally {
        if (!silent) setChartLoading(false);
      }
    },
    [],
  );

  // ─── Effect: sensor/filter change → reload chart + setup polling ──────────

  // Refresh latest sensor values (min/max/current) without touching chart or devices
  const refreshMetrics = useCallback(async () => {
    if (!id) return;
    try {
      const data = await tankDetailService.getTankFullDetails(id as string);
      setTankData((prev: any) => prev ? { ...prev, metrics: data.metrics } : prev);
    } catch {}
  }, [id]);

  useEffect(() => {
    if (!selectedSensorId) return;
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }

    // Reset chart before loading so stale data never shows during filter/sensor switch
    setChartData(null);
    loadChartData(selectedSensorId, chartFilter);

    const pollMs = FILTER_CONFIG[chartFilter].pollMs;
    if (pollMs > 0) {
      pollRef.current = setInterval(() => {
        loadChartData(selectedSensorId, chartFilter, true);
        refreshMetrics();
      }, pollMs);
    }
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [selectedSensorId, chartFilter, loadChartData, refreshMetrics]);

  // ─── Effect: countdown timer ───────────────────────────────────────────────

  useEffect(() => {
    const total = FILTER_OPTIONS.find((f) => f.value === chartFilter)?.seconds ?? 10;
    setCountdown(total);

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? total : prev - 1));
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [chartFilter, selectedSensorId]);

  // Auto-scroll chart to latest (right)
  useEffect(() => {
    const n = chartData?.datasets?.[0]?.data?.length ?? 0;
    if (n > POINTS_PER_SCREEN) {
      setTimeout(() => chartScrollRef.current?.scrollToEnd({ animated: true }), 200);
    }
  }, [chartData]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    },
    [],
  );

  // ─── Load full tank data ──────────────────────────────────────────────────

  const loadFullData = async () => {
    try {
      const data = await tankDetailService.getTankFullDetails(id as string);
      setTankData(data);
      if (data.metrics?.length > 0 && !selectedSensorId) {
        setSelectedSensorId(data.metrics[0].id);
      }
    } catch {
      console.error("Lỗi tải dữ liệu chi tiết bể");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFullData();
    if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    metricsIntervalRef.current = setInterval(refreshMetrics, 30_000);
    return () => {
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    };
  }, [id]);

  // ─── Carousel navigation ──────────────────────────────────────────────────

  const sensors: any[] = tankData?.metrics ?? [];

  const goPrev = () => {
    if (sensorIndex <= 0) return;
    const next = sensorIndex - 1;
    setSensorIndex(next);
    sensorListRef.current?.scrollToIndex({ index: next, animated: true });
    setSelectedSensorId(sensors[next].id);
  };

  const goNext = () => {
    if (sensorIndex >= sensors.length - 1) return;
    const next = sensorIndex + 1;
    setSensorIndex(next);
    sensorListRef.current?.scrollToIndex({ index: next, animated: true });
    setSelectedSensorId(sensors[next].id);
  };

  // ─── Device toggle ────────────────────────────────────────────────────────

  const handleConfirmToggle = async () => {
    if (!deviceToToggle) return;
    setIsToggling(true);
    try {
      await tankDetailApi.toggleControlDevice(deviceToToggle.id, !deviceToToggle.status);
      await loadFullData();
    } catch {
      toast.error("Không thể chuyển trạng thái thiết bị. Vui lòng thử lại.");
    } finally {
      setIsToggling(false);
      setDeviceToToggle(null);
    }
  };

  // ─── Chart computed values ────────────────────────────────────────────────

  const activeSensor = sensors[sensorIndex] ?? null;
  const chartColor = activeSensor?.color === "#EF4444" ? "#EF4444" : theme.colors.primary;
  const numPts = chartData?.datasets?.[0]?.data?.length ?? 0;
  const chartScrollable = numPts > POINTS_PER_SCREEN;
  const chartWidth = Math.max(screenWidth - 40, numPts * POINT_SLOT_W);

  // Threshold & stats from active sensor (fallback to sensor-type defaults like website)
  const latestMin: number | null = activeSensor?.latestMin ?? null;
  const latestMax: number | null = activeSensor?.latestMax ?? null;
  const sensorUnit: string = activeSensor?.unit ?? "";

  const defaultThr = activeSensor ? getDefaultThreshold(activeSensor.label) : { min: 0, max: 100 };
  const minThreshold: number = (activeSensor?.minThreshold ?? null) ?? defaultThr.min;
  const maxThreshold: number = (activeSensor?.maxThreshold ?? null) ?? defaultThr.max;

  const sensorTypeDomain: { min: number; max: number } | null = (() => {
    if (!activeSensor) return null;
    const min = activeSensor.minPossibleValue;
    const max = activeSensor.maxPossibleValue;
    if (min != null && max != null && max > min) return { min, max };
    return null;
  })();

  // Y domain: data + thresholds + 8% padding, clamped to sensor-type absolute range.
  // This ensures thresholds are never pinned exactly at domain min/max.
  const dataValues: number[] = chartData?.datasets?.[0]?.data ?? [];
  const allYValues = dataValues.length > 0
    ? [...dataValues, minThreshold, maxThreshold]
    : [];
  const rawMin = allYValues.length > 0 ? Math.min(...allYValues) : 0;
  const rawMax = allYValues.length > 0 ? Math.max(...allYValues) : 100;
  const rawRange = Math.max(rawMax - rawMin, 1);
  const pad = Math.ceil(rawRange * 0.08);
  const absMin = sensorTypeDomain ? sensorTypeDomain.min : rawMin - pad;
  const absMax = sensorTypeDomain ? sensorTypeDomain.max : rawMax + pad;
  const yDataMin = Math.max(absMin, Math.floor(rawMin - pad));
  const yDataMax = Math.min(absMax, Math.ceil(rawMax + pad));
  const yRange = Math.max(yDataMax - yDataMin, 0.001);

  // Phantom dataset anchors chart-kit's Y scale to [yDataMin, yDataMax] so that
  // chart-kit's internal formula  y = paddingTop + (1-(v-min)/(max-min)) * (h*0.75)
  // matches our valueToY exactly — dot positions align with our custom SVG labels.
  const chartDataForRender = chartData && dataValues.length > 0
    ? {
        ...chartData,
        datasets: [
          ...chartData.datasets,
          {
            data: [yDataMin, yDataMax],
            color: () => "transparent" as string,
            withDots: false,
          },
        ],
      }
    : chartData;

  const valueToY = (v: number): number =>
    CHART_TOP_PAD + (1 - (v - yDataMin) / yRange) * CHART_INNER_H;

  // Chart Y boundary constants (pixels)
  const chartYTop = CHART_TOP_PAD;
  const chartYBot = CHART_TOP_PAD + CHART_INNER_H;

  // Show threshold line when value is within the chart's visible Y range
  const minLineY = valueToY(minThreshold);
  const maxLineY = valueToY(maxThreshold);
  const inChartY = (y: number) => y >= chartYTop && y <= chartYBot;
  const showMinLine = dataValues.length > 0 && inChartY(minLineY);
  const showMaxLine = dataValues.length > 0 && inChartY(maxLineY);

  // Safe zone rect, clamped to chart boundaries
  const safeYTop = Math.max(chartYTop, Math.min(maxLineY, minLineY));
  const safeYBot = Math.min(chartYBot, Math.max(maxLineY, minLineY));
  const showSafeZone = dataValues.length > 0 && safeYBot > safeYTop;

  // Data area width (chart minus fixed Y-axis panel)
  const dataAreaWidth = chartWidth - CHART_Y_AXIS_W;

  const filterLabel =
    FILTER_OPTIONS.find((f) => f.value === chartFilter)?.label ?? "10s";

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: "#F8FAFC" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#334155" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Giám sát thông số</Text>
          <Text style={styles.headerSubTitle}>
            {tankData?.tankInfo?.name ?? "Bể nuôi"}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadFullData(); }}
          />
        }
      >
        {/* ══ 1. QUẢN LÝ CẢM BIẾN ══ */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { marginBottom: 4 }]}>Quản lý cảm biến</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 6 }}>
            <View style={{ paddingHorizontal: 8, paddingVertical: 2, backgroundColor: `${theme.colors.primary}15`, borderRadius: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: theme.colors.primary }}>
                {sensors.length} loại
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, fontStyle: "italic" }}>
              Hãy chọn để xem biểu đồ
            </Text>
          </View>

          {sensors.length > 0 ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity onPress={goPrev} disabled={sensorIndex === 0} style={{ padding: 4 }}>
                  <Ionicons name="chevron-back-circle" size={30} color={sensorIndex === 0 ? "#E2E8F0" : theme.colors.primary} />
                </TouchableOpacity>

                <FlatList
                  ref={sensorListRef}
                  data={sensors}
                  horizontal
                  pagingEnabled
                  snapToAlignment="start"
                  snapToInterval={SENSOR_CARD_W}
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  style={{ width: SENSOR_CARD_W }}
                  getItemLayout={(_, index) => ({ length: SENSOR_CARD_W, offset: SENSOR_CARD_W * index, index })}
                  onScrollToIndexFailed={() => {}}
                  onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / SENSOR_CARD_W);
                    const clamped = Math.min(Math.max(idx, 0), sensors.length - 1);
                    if (clamped !== sensorIndex) {
                      setSensorIndex(clamped);
                      setSelectedSensorId(sensors[clamped].id);
                    }
                  }}
                  renderItem={({ item, index }) => {
                    const isSelected = item.id === selectedSensorId;
                    const isWarning = item.color === "#EF4444";
                    return (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => { setSensorIndex(index); setSelectedSensorId(item.id); }}
                        style={[
                          localStyles.sensorCard,
                          { width: SENSOR_CARD_W, borderLeftColor: theme.colors.primary },
                          isSelected && { backgroundColor: `${theme.colors.primary}10`, borderColor: theme.colors.primary, borderWidth: 1.5 },
                        ]}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${theme.colors.primary}15`, justifyContent: "center", alignItems: "center", marginRight: 10 }}>
                            <Feather name={item.icon} size={18} color={theme.colors.primary} />
                          </View>
                          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B", flex: 1 }}>
                            {item.label}
                          </Text>
                          {isSelected && (
                            <View style={{ paddingHorizontal: 8, paddingVertical: 3, backgroundColor: theme.colors.primary, borderRadius: 6 }}>
                              <Text style={{ fontSize: 10, color: "#FFF", fontWeight: "700" }}>Đang xem</Text>
                            </View>
                          )}
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                          <Text style={{ fontSize: 38, fontWeight: "800", color: item.color, lineHeight: 44 }}>
                            {item.value}
                          </Text>
                          <Text style={{ fontSize: 16, fontWeight: "600", color: item.color, marginLeft: 5 }}>
                            {item.unit}
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 }}>
                          {isWarning ? (
                            <>
                              <Ionicons name="warning-outline" size={13} color="#EF4444" />
                              <Text style={{ fontSize: 11, color: "#EF4444", fontWeight: "600" }}>Vượt ngưỡng an toàn</Text>
                            </>
                          ) : (
                            <>
                              <Ionicons name="checkmark-circle-outline" size={13} color="#10B981" />
                              <Text style={{ fontSize: 11, color: "#10B981", fontWeight: "600" }}>An toàn</Text>
                            </>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />

                <TouchableOpacity onPress={goNext} disabled={sensorIndex >= sensors.length - 1} style={{ padding: 4 }}>
                  <Ionicons name="chevron-forward-circle" size={30} color={sensorIndex >= sensors.length - 1 ? "#E2E8F0" : theme.colors.primary} />
                </TouchableOpacity>
              </View>

              {sensors.length > 1 && (
                <View style={localStyles.dotsRow}>
                  {sensors.map((_, i) => (
                    <View key={i} style={[localStyles.dot, i === sensorIndex ? localStyles.dotActive : localStyles.dotInactive]} />
                  ))}
                </View>
              )}
            </>
          ) : (
            <Text style={styles.emptyDeviceText}>Bể này chưa có cảm biến nào.</Text>
          )}
        </View>

        {/* ══ 2. CHART ══ */}
        <View style={styles.chartCard}>
          {/* Header: title + filter dropdown — restore 15px from border (card has 4px, +11px inline) */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4, paddingHorizontal: 11 }}>
            <Text style={[styles.chartTitle, { flex: 1, marginRight: 8 }]} numberOfLines={1}>
              Xu hướng {activeSensor?.label ?? ""}
            </Text>
            {/* Filter dropdown button */}
            <TouchableOpacity
              onPress={() => setShowFilterPicker(true)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: `${theme.colors.primary}12`,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: `${theme.colors.primary}30`,
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: theme.colors.primary }}>
                {filterLabel}
              </Text>
              <Ionicons name="chevron-down" size={12} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Countdown */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 5, paddingHorizontal: 11 }}>
            <Ionicons name="refresh-outline" size={13} color="#94A3B8" />
            <Text style={{ fontSize: 12, color: "#94A3B8" }}>
              Cập nhật sau: <Text style={{ fontWeight: "700" }}>{formatCountdown(countdown)}</Text>
            </Text>
          </View>

          {/* Chart area */}
          {chartLoading ? (
            <View style={localStyles.chartPlaceholder}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={{ color: "#64748B", marginTop: 8, fontSize: 13 }}>Đang tải dữ liệu...</Text>
            </View>
          ) : chartData ? (
            <>
              {/* Unit label + scroll hint on the same row */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <View style={{ width: CHART_Y_AXIS_W }}>
                  {sensorUnit ? (
                    <Text style={{ fontSize: 10, fontWeight: "600", color: "#9CA3AF" }}>
                      {sensorUnit}
                    </Text>
                  ) : null}
                </View>
                {chartScrollable ? (
                  <Text style={{ fontSize: 11, color: "#94A3B8", fontStyle: "italic" }}>
                    ← Kéo để xem dữ liệu cũ hơn
                  </Text>
                ) : null}
              </View>

              {/* Fixed Y-axis + scrollable data area */}
              <View style={{ flexDirection: "row", height: CHART_H }}>
                {/* Fixed Y-axis panel — stays in place during horizontal scroll */}
                <View style={{ width: CHART_Y_AXIS_W, height: CHART_H, backgroundColor: "#FFF", zIndex: 2 }}>
                  <Svg width={CHART_Y_AXIS_W} height={CHART_H}>
                    {dataValues.length > 0 && (() => {
                      const regularTicks = [0, 1, 2, 3, 4].map(
                        (i) => Number((yDataMin + (yDataMax - yDataMin) * i / 4).toFixed(1))
                      );
                      const thrValues = [
                        Number(minThreshold.toFixed(1)),
                        Number(maxThreshold.toFixed(1)),
                      ];
                      const thrSet = new Set(thrValues);
                      const minValGap = yRange * 0.10;
                      const filteredRegular = regularTicks.filter(
                        (t) => thrValues.every((thr) => Math.abs(t - thr) >= minValGap)
                      );
                      const seen = new Set<string>();
                      const allTicks: { value: number; isThreshold: boolean }[] = [];
                      [...filteredRegular, ...thrValues].forEach((v) => {
                        const key = v.toFixed(1);
                        if (seen.has(key)) return;
                        seen.add(key);
                        allTicks.push({ value: v, isThreshold: thrSet.has(Number(v.toFixed(1))) });
                      });
                      allTicks.sort((a, b) => a.value - b.value);
                      return allTicks.map(({ value, isThreshold }, i) => {
                        const y = valueToY(value);
                        if (y < chartYTop - 4 || y > chartYBot + 8) return null;
                        return (
                          <SvgText
                            key={i}
                            x={0}
                            y={y + 4}
                            fontSize={12}
                            fontWeight={isThreshold ? "700" : "400"}
                            fill={isThreshold ? "#10B981" : "#64748B"}
                            textAnchor="start"
                          >
                            {value.toFixed(1)}
                          </SvgText>
                        );
                      });
                    })()}
                  </Svg>
                </View>

                {/* Scrollable data area — only the chart data region scrolls */}
                <ScrollView
                  ref={chartScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  scrollEnabled={chartScrollable}
                  style={{ flex: 1 }}
                >
                  {/*
                    Container is CHART_LEFT_PAD wider than the pure data area so the
                    first dot and its time label are not clipped at the left edge.
                    The chart is shifted left by (CHART_Y_AXIS_W - CHART_LEFT_PAD) so
                    that the Y-axis column is hidden but CHART_LEFT_PAD px of breathing
                    room remains for the first data point.
                  */}
                  <View style={{ width: dataAreaWidth + CHART_LEFT_PAD, height: CHART_H, overflow: "hidden" }}>
                    <View style={{ marginLeft: -(CHART_Y_AXIS_W - CHART_LEFT_PAD) }}>
                      <LineChart
                        data={chartDataForRender!}
                        width={chartWidth}
                        height={CHART_H}
                        chartConfig={makeChartConfig(chartColor)}
                        bezier={numPts > 2}
                        style={{ borderRadius: 12, marginTop: 0, paddingRight: CHART_Y_AXIS_W }}
                        withScrollableDot={false}
                        withShadow={false}
                        withHorizontalLabels={false}
                        horizontalLabelRotation={chartFilter === "1h" ? -40 : 0}
                        getDotColor={(value) =>
                          (value < minThreshold || value > maxThreshold) ? "#EF4444" : theme.colors.primary
                        }
                      />
                    </View>

                    {/* Data-only SVG overlay: safe zone + threshold lines (no Y labels) */}
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                      <Svg width={dataAreaWidth + CHART_LEFT_PAD} height={CHART_H}>
                        {showSafeZone && (
                          <Rect
                            x={0}
                            y={safeYTop}
                            width={dataAreaWidth + CHART_LEFT_PAD}
                            height={safeYBot - safeYTop}
                            fill="#10B981"
                            fillOpacity={0.1}
                          />
                        )}
                        {showMinLine && (
                          <SvgLine
                            x1={0}
                            y1={minLineY}
                            x2={dataAreaWidth + CHART_LEFT_PAD}
                            y2={minLineY}
                            stroke="#10B981"
                            strokeWidth={1.5}
                            strokeDasharray="5 3"
                            opacity={0.9}
                          />
                        )}
                        {showMaxLine && (
                          <SvgLine
                            x1={0}
                            y1={maxLineY}
                            x2={dataAreaWidth + CHART_LEFT_PAD}
                            y2={maxLineY}
                            stroke="#10B981"
                            strokeWidth={1.5}
                            strokeDasharray="5 3"
                            opacity={0.9}
                          />
                        )}
                      </Svg>
                    </View>
                  </View>
                </ScrollView>
              </View>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: "#F1F5F9", marginVertical: 14, marginHorizontal: 11 }} />

              {/* 3 thông tin bên dưới chart */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 11 }}>
                {/* Ngưỡng an toàn */}
                <View style={localStyles.statBox}>
                  <Text style={localStyles.statLabel}>NGƯỠNG AN TOÀN</Text>
                  <Text style={[localStyles.statValue, { color: "#10B981" }]}>
                    {activeSensor ? `${minThreshold}–${maxThreshold}` : "—"}
                  </Text>
                  {sensorUnit ? (
                    <Text style={localStyles.statUnit}>{sensorUnit}</Text>
                  ) : null}
                  <Text style={[localStyles.statHint, { color: "#10B981" }]}>Mức tối ưu</Text>
                </View>

                {/* Thấp nhất hôm nay */}
                <View style={[localStyles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#F1F5F9" }]}>
                  <Text style={localStyles.statLabel}>THẤP NHẤT</Text>
                  <Text style={[localStyles.statValue, { color: "#3B82F6" }]}>
                    {latestMin != null ? latestMin.toFixed(2) : "—"}
                  </Text>
                  {sensorUnit && latestMin != null ? (
                    <Text style={localStyles.statUnit}>{sensorUnit}</Text>
                  ) : null}
                  <Text style={localStyles.statHint}>Hôm nay</Text>
                </View>

                {/* Cao nhất hôm nay */}
                <View style={localStyles.statBox}>
                  <Text style={localStyles.statLabel}>CAO NHẤT</Text>
                  <Text style={[localStyles.statValue, { color: "#EF4444" }]}>
                    {latestMax != null ? latestMax.toFixed(2) : "—"}
                  </Text>
                  {sensorUnit && latestMax != null ? (
                    <Text style={localStyles.statUnit}>{sensorUnit}</Text>
                  ) : null}
                  <Text style={localStyles.statHint}>Hôm nay</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={localStyles.chartPlaceholder}>
              <MaterialCommunityIcons name="chart-line-variant" size={40} color="#CBD5E1" />
              <Text style={{ color: theme.colors.textSecondary, marginTop: 10 }}>
                Không có dữ liệu cho khoảng thời gian này
              </Text>
            </View>
          )}
        </View>

        {/* ══ 3. QUẢN LÝ THIẾT BỊ CHUYÊN DỤNG ══ */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Quản lý thiết bị chuyên dụng</Text>
          {tankData?.pumps?.length > 0 ? (
            tankData.pumps.map((device: any) => (
              <View key={device.id} style={styles.pumpContainer}>
                <View style={styles.pumpHeader}>
                  <MaterialCommunityIcons
                    name={device.status ? "engine" : "engine-off"}
                    size={24}
                    color={device.status ? theme.colors.success : theme.colors.danger}
                  />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.pumpTitle}>{device.controlDeviceTypeName}</Text>
                    <Text style={[styles.pumpStatus, { color: device.status ? theme.colors.success : theme.colors.danger }]}>
                      ● {device.status ? "Đang hoạt động" : "Đã tắt"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.toggleBtn, { backgroundColor: device.status ? "#FEF2F2" : theme.colors.primary }]}
                  activeOpacity={0.8}
                  onPress={() => setDeviceToToggle(device)}
                >
                  <MaterialCommunityIcons name="power" size={16} color={device.status ? theme.colors.danger : "#FFF"} />
                  <Text style={[styles.toggleBtnText, { color: device.status ? theme.colors.danger : "#FFF" }]}>
                    {device.status ? "Tắt thiết bị" : "Bật thiết bị"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyDeviceText}>Bể này chưa có thiết bị điều khiển nào.</Text>
          )}
        </View>
      </ScrollView>

      {/* ══ FILTER PICKER MODAL ══ */}
      <Modal visible={showFilterPicker} transparent animationType="fade">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={() => setShowFilterPicker(false)}
        >
          <View style={{ backgroundColor: "#FFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E293B", marginBottom: 14 }}>
              Khoảng thời gian
            </Text>
            {FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}
                onPress={() => { setChartFilter(opt.value); setShowFilterPicker(false); }}
              >
                <View>
                  <Text style={{ fontSize: 15, fontWeight: chartFilter === opt.value ? "700" : "400", color: chartFilter === opt.value ? theme.colors.primary : "#1E293B" }}>
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>
                    {opt.value === "1m"  ? "Dữ liệu 2 giờ gần nhất, interval 1 phút" :
                     opt.value === "1h"  ? "Dữ liệu 48 giờ gần nhất, interval 1 giờ" :
                     opt.value === "1d"  ? "Dữ liệu 24 giờ gần nhất, interval 2 giờ" :
                                           "Dữ liệu 7 ngày gần nhất, interval 1 ngày"}
                  </Text>
                </View>
                {chartFilter === opt.value && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
            <View style={{ height: 8 }} />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ══ POPUP XÁC NHẬN BẬT/TẮT ══ */}
      <Modal
        visible={!!deviceToToggle}
        transparent
        animationType="fade"
        onRequestClose={() => { if (!isToggling) setDeviceToToggle(null); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>
              Xác nhận {deviceToToggle?.status ? "tắt" : "bật"} thiết bị
            </Text>
            <Text style={styles.confirmDesc}>
              Bạn sắp{" "}
              <Text style={{ fontWeight: "800", color: deviceToToggle?.status ? theme.colors.danger : theme.colors.success }}>
                {deviceToToggle?.status ? "TẮT" : "BẬT"}
              </Text>{" "}
              thiết bị{" "}
              <Text style={{ fontWeight: "800", color: theme.colors.textPrimary }}>
                {deviceToToggle?.controlDeviceTypeName}
              </Text>
              .
            </Text>
            <View style={styles.warningBox}>
              <MaterialCommunityIcons name="alert-outline" size={20} color="#EA580C" />
              <Text style={styles.warningText}>
                Đây là thiết bị đang vận hành trực tiếp trong môi trường bể nuôi.
                Bật/tắt sai thời điểm có thể làm thay đổi đột ngột điều kiện nước
                và gây nguy hiểm cho vật nuôi. Vui lòng kiểm tra kỹ tình trạng bể
                trước khi xác nhận.
              </Text>
            </View>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.confirmBtn, styles.cancelBtn]}
                onPress={() => setDeviceToToggle(null)}
                disabled={isToggling}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: deviceToToggle?.status ? theme.colors.danger : theme.colors.primary }]}
                onPress={handleConfirmToggle}
                disabled={isToggling}
              >
                {isToggling ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>
                    {deviceToToggle?.status ? "Xác nhận tắt" : "Xác nhận bật"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Local styles ─────────────────────────────────────────────────────────────

const localStyles = StyleSheet.create({
  sensorCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 20, backgroundColor: theme.colors.primary },
  dotInactive: { width: 6, backgroundColor: "#CBD5E1" },
  chartPlaceholder: {
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  // 3 stat boxes below chart
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
    lineHeight: 24,
  },
  statUnit: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 1,
  },
  statHint: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 2,
  },
});
