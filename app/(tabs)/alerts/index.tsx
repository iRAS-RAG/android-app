import { styles } from "@/styles/alerts/alerts.styles";
import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { alertService } from "@/services/alertService";
import { maintenanceService } from "@/services/maintenanceService";
import { toast } from "@/utils/toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_SORT: Record<string, number> = {
  "Mới": 0,
  "Đang xử lý": 1,
  "Đã giải quyết": 2,
  "Đã bỏ qua": 3,
};

/** Kept for backward-compat if needed elsewhere */
const parseViDate = (str: string): Date | null => {
  if (!str || str.length < 8) return null;
  const parts = str.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y || y < 2000) return null;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
};

const formatDateVi = (d: Date): string => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
};


const STATUS_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Chờ xử lý", value: "Mới" },
  { label: "Đang xử lý", value: "Đang xử lý" },
  { label: "Đã đóng sự cố", value: "Đã giải quyết" },
  { label: "Đã bỏ qua", value: "Đã bỏ qua" },
];

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AlertsScreen() {
  const router = useRouter();

  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [tankFilter, setTankFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showTankPicker, setShowTankPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  // Date picker state (replaces text inputs)
  const [dateFromObj, setDateFromObj] = useState<Date | null>(null);
  const [dateToObj, setDateToObj] = useState<Date | null>(null);
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);

  // Backward-compat string representations derived from Date objects
  const dateFrom = dateFromObj ? formatDateVi(dateFromObj) : "";
  const dateTo = dateToObj ? formatDateVi(dateToObj) : "";

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertService.getAlerts(1, 100);
      setAlerts(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Không thể tải dữ liệu cảnh báo.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload every time the screen gets focus (including returning from log screen)
  useFocusEffect(
    useCallback(() => {
      fetchAlerts();
    }, [fetchAlerts]),
  );

  // Unique tank names for filter dropdown
  const uniqueTanks = useMemo(
    () => Array.from(new Set(alerts.map((a) => a.tank).filter(Boolean))),
    [alerts]
  );

  // Filtered + sorted alerts (client-side: search, tank, date; status already filtered server-side)
  const sortedFilteredAlerts = useMemo(() => {
    const fromDate = dateFromObj;
    const toDate = dateToObj ? new Date(dateToObj) : null;
    if (toDate) toDate.setHours(23, 59, 59, 999);

    const filtered = alerts.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tank?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTank = !tankFilter || item.tank === tankFilter;
      const matchStatus = !statusFilter || item.status === statusFilter;

      let matchDate = true;
      if ((fromDate || toDate) && item.rawDate) {
        const d = new Date(item.rawDate);
        if (fromDate && d < fromDate) matchDate = false;
        if (toDate && d > toDate) matchDate = false;
      }

      return matchSearch && matchTank && matchStatus && matchDate;
    });

    return [...filtered].sort((a, b) => {
      const sa = STATUS_SORT[a.status] ?? 3;
      const sb = STATUS_SORT[b.status] ?? 3;
      if (sa !== sb) return sa - sb;
      // Same status: newest first
      const da = a.rawDate ? new Date(a.rawDate).getTime() : 0;
      const db = b.rawDate ? new Date(b.rawDate).getTime() : 0;
      return db - da;
    });
  }, [alerts, searchQuery, dateFromObj, dateToObj, tankFilter, statusFilter]);

  const handleConfirm = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Đang xử lý" } : a))
    );
    try {
      await alertService.updateStatus(id, "processing");
      toast.info("Đã xác nhận sự cố. Đang chuyển sang trạng thái theo dõi.");
    } catch {
      fetchAlerts(statusFilter);
    }
  };

  const handleResolve = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Đã giải quyết" } : a))
    );
    await alertService.updateStatus(id, "resolved");
    toast.success("Đã đóng sự cố.");
  };

  const handleGotoLog = async (alertId: string, alertTitle: string) => {
    try {
      const logInfo = await maintenanceService.getLogByAlertId(alertId);
      if (logInfo) {
        router.push({
          pathname: "/maintenance/log",
          params: { id: alertId, logId: logInfo.id, mode: "view", alertTitle },
        });
      } else {
        router.push({
          pathname: "/maintenance/log",
          params: { id: alertId, alertTitle },
        });
      }
    } catch {
      router.push({
        pathname: "/maintenance/log",
        params: { id: alertId, alertTitle },
      });
    }
  };

  const tankFilterLabel = tankFilter || "Tất cả bể";
  const statusFilterLabel =
    STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label || "Tất cả";
  const hasDateFilter = dateFromObj || dateToObj;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        {/* Title only */}
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Quản lý cảnh báo</Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
          <TextInput
            placeholder="Tìm kiếm cảnh báo, bể..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Date range filter – touchable buttons opening DateTimePicker */}
        <View style={styles.dateRangeRow}>
          {/* From date */}
          <TouchableOpacity
            style={styles.dateInputBox}
            onPress={() => setShowDateFromPicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={theme.colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.dateInput,
                { color: dateFromObj ? "#1E293B" : theme.colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {dateFromObj ? formatDateVi(dateFromObj) : "Từ ngày"}
            </Text>
            {dateFromObj && (
              <TouchableOpacity
                onPress={() => setDateFromObj(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={14} color={theme.colors.danger} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginHorizontal: 4 }}>—</Text>

          {/* To date */}
          <TouchableOpacity
            style={styles.dateInputBox}
            onPress={() => setShowDateToPicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={theme.colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.dateInput,
                { color: dateToObj ? "#1E293B" : theme.colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {dateToObj ? formatDateVi(dateToObj) : "Đến ngày"}
            </Text>
            {dateToObj && (
              <TouchableOpacity
                onPress={() => setDateToObj(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={14} color={theme.colors.danger} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* Clear both dates */}
          {hasDateFilter && (
            <TouchableOpacity
              onPress={() => { setDateFromObj(null); setDateToObj(null); }}
              style={{ marginLeft: 6 }}
            >
              <Ionicons name="close-circle" size={18} color={theme.colors.danger} />
            </TouchableOpacity>
          )}
        </View>

        {/* DateTimePicker — Android shows native dialog, iOS uses Modal+spinner */}
        {Platform.OS !== "ios" && showDateFromPicker && (
          <DateTimePicker
            value={dateFromObj ?? new Date()}
            mode="date"
            display="default"
            onChange={(_event, selected) => {
              setShowDateFromPicker(false);
              if (selected) setDateFromObj(selected);
            }}
          />
        )}
        {Platform.OS !== "ios" && showDateToPicker && (
          <DateTimePicker
            value={dateToObj ?? new Date()}
            mode="date"
            display="default"
            onChange={(_event, selected) => {
              setShowDateToPicker(false);
              if (selected) setDateToObj(selected);
            }}
          />
        )}

        {/* Tank + Status filters */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterDropBtn} onPress={() => setShowTankPicker(true)}>
            <Ionicons name="water-outline" size={13} color={theme.colors.primary} />
            <Text style={styles.filterDropText} numberOfLines={1}>{tankFilterLabel}</Text>
            <Ionicons name="chevron-down" size={13} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterDropBtn} onPress={() => setShowStatusPicker(true)}>
            <Ionicons name="funnel-outline" size={13} color={theme.colors.primary} />
            <Text style={styles.filterDropText} numberOfLines={1}>{statusFilterLabel}</Text>
            <Ionicons name="chevron-down" size={13} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* iOS date picker Modal */}
      {Platform.OS === "ios" && (showDateFromPicker || showDateToPicker) && (
        <Modal transparent animationType="slide">
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" }}
            activeOpacity={1}
            onPress={() => { setShowDateFromPicker(false); setShowDateToPicker(false); }}
          >
            <View style={{ backgroundColor: "#FFF", borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 32 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
                <TouchableOpacity onPress={() => { setShowDateFromPicker(false); setShowDateToPicker(false); }}>
                  <Text style={{ fontSize: 15, color: "#64748B" }}>Hủy</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B" }}>
                  {showDateFromPicker ? "Từ ngày" : "Đến ngày"}
                </Text>
                <TouchableOpacity onPress={() => { setShowDateFromPicker(false); setShowDateToPicker(false); }}>
                  <Text style={{ fontSize: 15, fontWeight: "700", color: theme.colors.primary }}>Xong</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={showDateFromPicker ? (dateFromObj ?? new Date()) : (dateToObj ?? new Date())}
                mode="date"
                display="spinner"
                style={{ width: "100%" }}
                onChange={(_event, selected) => {
                  if (selected) {
                    if (showDateFromPicker) setDateFromObj(selected);
                    else setDateToObj(selected);
                  }
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* ── LIST ── */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 10, color: "#64748B" }}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchAlerts(statusFilter); }}
              colors={[theme.colors.primary]}
            />
          }
        >
          {sortedFilteredAlerts.length > 0 ? (
            sortedFilteredAlerts.map((item) => (
              <AlertCard
                key={item.id}
                item={item}
                router={router}
                onConfirm={() => handleConfirm(item.id)}
                onResolve={() => handleResolve(item.id)}
                onGotoLog={() => handleGotoLog(item.id, item.title)}
              />
            ))
          ) : (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Ionicons name="search-outline" size={60} color="#CBD5E1" />
              <Text style={{ color: "#64748B", marginTop: 10 }}>Không tìm thấy cảnh báo phù hợp</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── TANK PICKER MODAL ── */}
      <Modal visible={showTankPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowTankPicker(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Chọn bể nuôi</Text>
            {[{ label: "Tất cả bể", value: "" }, ...uniqueTanks.map((t) => ({ label: t, value: t }))].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.pickerItem}
                onPress={() => { setTankFilter(opt.value); setShowTankPicker(false); }}
              >
                <Text style={[styles.pickerItemText, tankFilter === opt.value && styles.pickerItemTextActive]}>
                  {opt.label}
                </Text>
                {tankFilter === opt.value && <Ionicons name="checkmark" size={16} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── STATUS PICKER MODAL ── */}
      <Modal visible={showStatusPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowStatusPicker(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Trạng thái cảnh báo</Text>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.pickerItem}
                onPress={() => { setStatusFilter(opt.value); setShowStatusPicker(false); }}
              >
                <Text style={[styles.pickerItemText, statusFilter === opt.value && styles.pickerItemTextActive]}>
                  {opt.label}
                </Text>
                {statusFilter === opt.value && <Ionicons name="checkmark" size={16} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Alert Card ───────────────────────────────────────────────────────────────

const AlertCard = ({ item, router, onConfirm, onResolve, onGotoLog }: any) => {
  const isProcessing = item.status === "Đang xử lý";
  const isResolved = item.status === "Đã giải quyết";
  const isDismissed = item.status === "Đã bỏ qua";
  const isOpen = item.status === "Mới";

  const navigateToDetail = () =>
    router.push({
      pathname: "/alertDetail/[id]",
      params: {
        id: item.id,
        fallbackLimit: item.limit || "",
        fallbackValue: item.value || "",
        fallbackUnit: item.unit || "",
        fallbackSensorName: item.sensorTypeName || item.title?.replace?.("Cảnh báo ", "") || "",
        fallbackTankId: item.fishTankId || "",
      },
    });

  const renderActions = () => {
    // Cảnh báo đã đóng hoặc đã bỏ qua: chỉ hiển thị nút Xem chi tiết
    if (isResolved || isDismissed) {
      return (
        <TouchableOpacity
          style={[styles.btnPrimary, { flexDirection: "row", alignItems: "center", justifyContent: "center" }]}
          onPress={navigateToDetail}
        >
          <Ionicons name="eye-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.btnTextPrimary}>Xem chi tiết</Text>
        </TouchableOpacity>
      );
    }

    // Cảnh báo an toàn chưa giải quyết
    if (item.level === "An toàn") {
      return (
        <TouchableOpacity style={styles.btnResolved} onPress={onResolve}>
          <Ionicons name="checkmark-circle" size={18} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.btnTextPrimary}>Đánh dấu đã giải quyết</Text>
        </TouchableOpacity>
      );
    }

    // Cảnh báo đang hoạt động (Mới / Đang xử lý)
    return (
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.btnOutline, isProcessing && { borderColor: theme.colors.primary, backgroundColor: "#EFF6FF" }]}
          onPress={isProcessing ? onGotoLog : onConfirm}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={isProcessing ? "document-text-outline" : "checkmark-outline"}
              size={16}
              color={isProcessing ? theme.colors.primary : "#475569"}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.btnTextOutline, isProcessing && { color: theme.colors.primary, fontWeight: "700" }]}>
              {isProcessing ? "Đã xử lý" : "Xác nhận"}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={navigateToDetail}>
          <Text style={styles.btnTextPrimary}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.card, { borderTopColor: item.color, borderTopWidth: 4 }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
          <MaterialCommunityIcons
            name={item.type === "Pump" ? "engine-outline" : "alert-circle-outline"}
            size={24}
            color={item.color}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.desc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
      </View>

      <View style={styles.comparisonRow}>
        <View style={styles.compItem}>
          <Text style={styles.compLabel}>Giá trị: <Text style={{ color: item.color }}>{item.value}</Text></Text>
        </View>
        <View style={styles.compItem}>
          <Text style={styles.compLabel}>Ngưỡng: {item.limit}</Text>
        </View>
      </View>

      <View style={styles.tagRow}>
        {/* Tag mức độ: chỉ hiển thị khi status là OPEN (Mới) */}
        {isOpen && (
          <View style={[styles.tag, { backgroundColor: `${item.color}15` }]}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={[styles.tagText, { color: item.color }]}>{item.level}</Text>
          </View>
        )}
        <View style={[styles.tag, { backgroundColor: isProcessing ? "#DBEAFE" : "#F1F5F9" }]}>
          <Ionicons
            name={isProcessing ? "sync-outline" : "time-outline"}
            size={12}
            color={isProcessing ? theme.colors.primary : "#64748B"}
          />
          <Text style={[styles.tagTextSecondary, isProcessing && { color: theme.colors.primary, fontWeight: "700" }]}>
            {item.status}
          </Text>
        </View>
        <View style={[styles.tag, { backgroundColor: "#E0F2FE" }]}>
          <Ionicons name="business-outline" size={12} color={theme.colors.primary} />
          <Text style={[styles.tagTextSecondary, { color: theme.colors.primary }]}>{item.tank}</Text>
        </View>
      </View>

      <Text style={styles.timeText}>{item.time}</Text>

      {renderActions()}
    </View>
  );
};
