import { styles } from "@/styles/alerts/alerts.styles";
import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Dữ liệu giả lập cảnh báo
const ALERTS_DATA = [
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
    status: "Đã xác nhận",
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

      {/* DANH SÁCH CẢNH BÁO CHI TIẾT */}
      <ScrollView
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {ALERTS_DATA.map((item) => (
          <AlertCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Component Thẻ Cảnh báo
const AlertCard = ({ item }: any) => (
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
      <View style={[styles.tag, { backgroundColor: "#F1F5F9" }]}>
        <Ionicons name="time-outline" size={12} color="#64748B" />
        <Text style={styles.tagTextSecondary}>{item.status}</Text>
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

    {item.level === "Nguy hiểm" ? (
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.btnOutline}>
          <Text style={styles.btnTextOutline}>Xác nhận</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => {
            router.push({
              pathname: "/alertDetail/[id]", // Tên file vật lý của bạn
              params: { id: item.id }, // Truyền tham số id động vào đây
            });
          }}
        >
          <Text style={styles.btnTextPrimary}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    ) : item.level === "An toàn" ? (
      <TouchableOpacity style={styles.btnResolved}>
        <Ionicons
          name="checkmark-circle"
          size={18}
          color="#FFF"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.btnTextPrimary}>Đánh dấu đã giải quyết</Text>
      </TouchableOpacity>
    ) : null}
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
