import { styles } from "@/styles/alerts/alerts.styles";
import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

// Dữ liệu giả lập ban đầu
const INITIAL_ALERTS_DATA = [
  {
    id: "1",
    type: "NH3",
    title: "Mức NH3 vượt ngưỡng nguy hiểm",
    desc: "Nồng độ amoniac cao có thể gây sốc cho cá",
    value: "0.35 mg/L",
    limit: "0.30 mg/L",
    level: "Nguy hiểm",
    status: "Đang xảy ra",
    tank: "Bể A-01",
    time: "2 phút trước",
    color: theme.colors.danger,
  },
  {
    id: "2",
    type: "Pump",
    title: "Máy bơm #2 rung động bất thường",
    desc: "Phát hiện mức rung vượt ngưỡng an toàn",
    value: "4.8 mm/s",
    limit: "3.5 mm/s",
    level: "Nguy hiểm",
    status: "Đang xảy ra",
    tank: "Bể A-02",
    time: "5 phút trước",
    color: theme.colors.danger,
  },
  {
    id: "3",
    type: "DO",
    title: "Oxy hòa tan thấp",
    desc: "DO giảm xuống dưới mức khuyến nghị",
    value: "4.2 mg/L",
    limit: "5.0 mg/L",
    level: "Cảnh báo",
    status: "Đang xảy ra",
    tank: "Bể B-03",
    time: "15 phút trước",
    color: theme.colors.warning,
  },
  {
    id: "4",
    type: "Temp",
    title: "Nhiệt độ ổn định trở lại",
    desc: "Nhiệt độ đã về mức tối ưu",
    value: "28.5°C",
    limit: "26-30°C",
    level: "An toàn",
    status: "Đã giải quyết",
    tank: "Bể C-01",
    time: "1 giờ trước",
    color: theme.colors.success,
  },
];

export default function AlertsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("Tất cả");
  // Quản lý danh sách cảnh báo bằng State để cập nhật trạng thái động
  const [alerts, setAlerts] = useState(INITIAL_ALERTS_DATA);
  const [searchQuery, setSearchQuery] = useState("");

  // Xử lý khi nhấn nút Xác nhận
  const handleConfirm = (id: string) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === id ? { ...alert, status: "Đang xử lý" } : alert,
      ),
    );
    Alert.alert("Thông báo", "Đã xác nhận sự cố. Trạng thái: Đang xử lý.");
  };
  // 2. Logic Lọc dữ liệu kết hợp cả Tìm kiếm và Tab bộ lọc
  const filteredAlerts = alerts.filter((item) => {
    // Lọc theo từ khóa tìm kiếm (Tên sự cố hoặc Mã bể)
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tank.toLowerCase().includes(searchQuery.toLowerCase());

    // Lọc theo Tab (Nguy hiểm, Cảnh báo, Đang xử lý)
    const matchesTab =
      filter === "Tất cả" ||
      (filter === "Nguy hiểm" && item.level === "Nguy hiểm") ||
      (filter === "Cảnh báo" && item.level === "Cảnh báo") ||
      (filter === "Đang xử lý" && item.status === "Đang xử lý");

    return matchesSearch && matchesTab;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* HEADER: BỘ LỌC & TÌM KIẾM */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Cảnh báo</Text>
            <Text style={styles.headerSubTitle}>8 thông báo mới</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons
              name="filter-outline"
              size={22}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
          <TextInput
            placeholder="Tìm kiếm cảnh báo, bể..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)} // Cập nhật state khi nhập chữ
            clearButtonMode="while-editing" // Hiện nút X xóa nhanh trên iOS
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterGroup}
        >
          <FilterTab
            label="Tổng"
            count={8}
            active={filter === "Tất cả"}
            onPress={() => setFilter("Tất cả")}
            color="#F1F5F9"
            textColor="#64748B"
          />
          <FilterTab
            label="Nguy hiểm"
            count={3}
            active={filter === "Nguy hiểm"}
            onPress={() => setFilter("Nguy hiểm")}
            color="#FEE2E2"
            textColor={theme.colors.danger}
          />
          <FilterTab
            label="Cảnh báo"
            count={1}
            active={filter === "Cảnh báo"}
            onPress={() => setFilter("Cảnh báo")}
            color="#FEF3C7"
            textColor={theme.colors.warning}
          />
          <FilterTab
            label="Đang xử lý"
            count={4}
            active={filter === "Đang xử lý"}
            onPress={() => setFilter("Đang xử lý")}
            color="#DBEAFE"
            textColor={theme.colors.primary}
          />
        </ScrollView>
      </View>

      {/* 4. Hiển thị danh sách đã được lọc */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((item) => (
            <AlertCard
              key={item.id}
              item={item}
              router={router}
              onConfirm={() => handleConfirm(item.id)}
            />
          ))
        ) : (
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Ionicons name="search-outline" size={60} color="#CBD5E1" />
            <Text style={{ color: "#64748B", marginTop: 10 }}>
              Không tìm thấy cảnh báo phù hợp
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Component Thẻ Cảnh báo
const AlertCard = ({ item, router, onConfirm }: any) => (
  <View
    style={[styles.card, { borderTopColor: item.color, borderTopWidth: 4 }]}
  >
    <View style={styles.cardHeader}>
      <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
        <MaterialCommunityIcons
          name={
            item.type === "Pump" ? "engine-outline" : "alert-circle-outline"
          }
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
        <Text style={styles.compLabel}>
          Giá trị: <Text style={{ color: item.color }}>{item.value}</Text>
        </Text>
      </View>
      <View style={styles.compItem}>
        <Text style={styles.compLabel}>Ngưỡng: {item.limit}</Text>
      </View>
    </View>

    <View style={styles.tagRow}>
      <View style={[styles.tag, { backgroundColor: `${item.color}15` }]}>
        <View style={[styles.dot, { backgroundColor: item.color }]} />
        <Text style={[styles.tagText, { color: item.color }]}>
          {item.level}
        </Text>
      </View>
      {/* Hiển thị màu sắc trạng thái dựa trên tiến độ xử lý */}
      <View
        style={[
          styles.tag,
          {
            backgroundColor:
              item.status === "Đang xử lý" ? "#DBEAFE" : "#F1F5F9",
          },
        ]}
      >
        <Ionicons
          name="time-outline"
          size={12}
          color={
            item.status === "Đang xử lý" ? theme.colors.primary : "#64748B"
          }
        />
        <Text
          style={[
            styles.tagTextSecondary,
            item.status === "Đang xử lý" && { color: theme.colors.primary },
          ]}
        >
          {item.status}
        </Text>
      </View>
      <View style={[styles.tag, { backgroundColor: "#E0F2FE" }]}>
        <Ionicons
          name="business-outline"
          size={12}
          color={theme.colors.primary}
        />
        <Text
          style={[styles.tagTextSecondary, { color: theme.colors.primary }]}
        >
          {item.tank}
        </Text>
      </View>
    </View>

    <Text style={styles.timeText}>{item.time}</Text>

    {item.level === "An toàn" ? (
      <TouchableOpacity
        style={styles.btnResolved}
        onPress={() => Alert.alert("Thành công", "Đã đóng sự cố này.")}
      >
        <Ionicons
          name="checkmark-circle"
          size={18}
          color="#FFF"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.btnTextPrimary}>Đánh dấu đã giải quyết</Text>
      </TouchableOpacity>
    ) : (
      <View style={styles.actionRow}>
        {/* Nút Xác nhận thay đổi nội dung khi nhấn */}
        <TouchableOpacity
          style={[
            styles.btnOutline,
            item.status === "Đang xử lý" && {
              borderColor: theme.colors.primary,
              backgroundColor: "#EFF6FF",
            },
          ]}
          onPress={onConfirm}
          disabled={item.status === "Đang xử lý"}
        >
          <Text
            style={[
              styles.btnTextOutline,
              item.status === "Đang xử lý" && { color: theme.colors.primary },
            ]}
          >
            {item.status === "Đang xử lý" ? "Đang xử lý" : "Xác nhận"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => {
            router.push({
              pathname: "/alertDetail/[id]",
              params: { id: item.id },
            });
          }}
        >
          <Text style={styles.btnTextPrimary}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const FilterTab = ({
  label,
  count,
  active,
  onPress,
  color,
  textColor,
}: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.filterTab, { backgroundColor: active ? textColor : color }]}
  >
    <Text
      style={[styles.filterTabText, { color: active ? "#FFF" : textColor }]}
    >
      {label}
    </Text>
    <View
      style={[
        styles.countBadge,
        { backgroundColor: active ? "rgba(255,255,255,0.2)" : "#FFF" },
      ]}
    >
      <Text style={[styles.countText, { color: active ? "#FFF" : textColor }]}>
        {count}
      </Text>
    </View>
  </TouchableOpacity>
);
