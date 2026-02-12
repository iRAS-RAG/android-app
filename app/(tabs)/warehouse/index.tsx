import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { styles } from "@/styles/warehouse/warehouse.styles";
import { theme } from "@/theme";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

// --- MOCK DATA ---
const MOCK_FEEDS = [
  {
    id: "1",
    brand: "Cargill 7414",
    protein: "40%",
    type: "Viên nổi 2mm",
    stage: "Giai đoạn giống",
  },
  {
    id: "2",
    brand: "De Heus 6002",
    protein: "35%",
    type: "Viên nổi 4mm",
    stage: "Giai đoạn tăng trưởng",
  },
  {
    id: "3",
    brand: "Grobest Gold",
    protein: "42%",
    type: "Viên chìm",
    stage: "Giai đoạn vỗ béo",
  },
  {
    id: "4",
    brand: "CP 999",
    protein: "30%",
    type: "Bột mịn",
    stage: "Giai đoạn ương",
  },
];

const MOCK_LOGS = [
  {
    id: "1",
    time: "14:30 - Hôm nay",
    tank: "Bể A-01",
    feed: "Cargill 7414",
    amount: "5.0 kg",
    user: "Nguyễn Văn A",
    note: "Cá ăn mạnh",
  },
  {
    id: "2",
    time: "08:00 - Hôm nay",
    tank: "Bể B-02",
    feed: "De Heus 6002",
    amount: "12.5 kg",
    user: "Nguyễn Văn A",
    note: "",
  },
  {
    id: "3",
    time: "18:00 - Hôm qua",
    tank: "Bể A-01",
    feed: "Cargill 7414",
    amount: "4.8 kg",
    user: "Trần Văn B",
    note: "Giảm lượng ăn do trời mưa",
  },
];

export default function WarehouseScreen() {
  const [activeTab, setActiveTab] = useState<"catalog" | "logs">("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // State cho Form Modal
  const [selectedTank, setSelectedTank] = useState("");
  const [selectedFeed, setSelectedFeed] = useState("");
  const [feedAmount, setFeedAmount] = useState("");
  const [note, setNote] = useState("");

  const handleSaveLog = () => {
    if (!feedAmount || !selectedTank || !selectedFeed) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng chọn bể, loại cám và nhập khối lượng.",
      );
      return;
    }
    // Logic lưu API ở đây
    setModalVisible(false);
    Alert.alert("Thành công", "Đã ghi nhận lịch sử cho ăn.");
    // Reset form
    setFeedAmount("");
    setNote("");
  };

  // --- RENDER ITEMS ---
  const renderFeedItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBoxPrimary}>
          <MaterialCommunityIcons
            name="sack"
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>{item.brand}</Text>
          <Text style={styles.cardSubtitle}>{item.type}</Text>
        </View>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{item.protein} đạm</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.cardFooter}>
        <Text style={styles.footerLabel}>Áp dụng:</Text>
        <Text style={styles.footerValue}>{item.stage}</Text>
      </View>
    </View>
  );

  const renderLogItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={[styles.cardHeader, { alignItems: "flex-start" }]}>
        <View style={{ flex: 1 }}>
          <View style={styles.rowCenter}>
            <Ionicons
              name="time-outline"
              size={14}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <Text style={styles.logTankName}>{item.tank}</Text>
          <Text style={styles.logFeedName}>{item.feed}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.amountText}>{item.amount}</Text>
          <Text style={styles.userText}>KTV: {item.user}</Text>
        </View>
      </View>
      {item.note ? (
        <View style={styles.noteBox}>
          <Text style={styles.noteText}>{`"${item.note}"`}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HEADER: Search & Filter */}
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>Quản lý Thức ăn</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.textSecondary}
            />
            <TextInput
              placeholder="Tìm theo tên cám, độ đạm..."
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="filter" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* TAB SWITCHER */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "catalog" && styles.activeTabBtn,
            ]}
            onPress={() => setActiveTab("catalog")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "catalog" && styles.activeTabText,
              ]}
            >
              Danh mục Cám
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "logs" && styles.activeTabBtn]}
            onPress={() => setActiveTab("logs")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "logs" && styles.activeTabText,
              ]}
            >
              Lịch sử Cho Ăn
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. BODY CONTENT */}
      <View style={styles.bodyContainer}>
        {activeTab === "catalog" ? (
          <FlatList
            data={MOCK_FEEDS}
            renderItem={renderFeedItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.listHeaderLabel}>
                Danh sách loại cám hiện có
              </Text>
            }
          />
        ) : (
          <FlatList
            data={MOCK_LOGS}
            renderItem={renderLogItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <Text style={styles.listHeaderLabel}>Ghi nhận gần đây</Text>
            }
          />
        )}
      </View>

      {/* 3. FLOATING ACTION BUTTON (FAB) */}
      {/* <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#FFF" /> */}
      {/* <Text style={styles.fabText}>Ghi nhận</Text> */}
      {/* </TouchableOpacity> */}

      {/* 4. MODAL GHI NHẬN CHO ĂN */}
      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      > */}
      {/* <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ghi nhận cho ăn</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View> */}

      {/* <ScrollView> */}
      {/* Giả lập Dropdown chọn Bể */}
      {/* <Text style={styles.label}>
                Chọn Hồ nuôi <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.fakeDropdown}
                onPress={() => {
                  setSelectedTank("Bể A-01"); // Giả lập chọn
                  Alert.alert("Demo", "Đã chọn Bể A-01");
                }}
              >
                <Text
                  style={
                    selectedTank ? styles.inputText : styles.placeholderText
                  }
                >
                  {selectedTank || "Chọn bể..."}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity> */}

      {/* Giả lập Dropdown chọn Cám */}
      {/* <Text style={styles.label}>
                Chọn Loại Cám <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.fakeDropdown}
                onPress={() => {
                  setSelectedFeed("Cargill 7414"); // Giả lập chọn
                  Alert.alert("Demo", "Đã chọn Cargill 7414");
                }}
              >
                <Text
                  style={
                    selectedFeed ? styles.inputText : styles.placeholderText
                  }
                >
                  {selectedFeed || "Chọn loại cám..."}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity> */}

      {/* Nhập khối lượng */}
      {/* <Text style={styles.label}>
                Khối lượng (kg) <Text style={{ color: "red" }}>*</Text>
              </Text>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="0.0"
                  keyboardType="numeric"
                  value={feedAmount}
                  onChangeText={setFeedAmount}
                />
                <Text style={styles.unitText}>kg</Text>
              </View> */}

      {/* Thời gian (Mặc định) */}
      {/* <Text style={styles.label}>Thời gian</Text>
              <View
                style={[styles.fakeDropdown, { backgroundColor: "#F1F5F9" }]}
              >
                <Text style={{ color: theme.colors.textSecondary }}>
                  Hiện tại (Tự động)
                </Text>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View> */}

      {/* Ghi chú */}
      {/* <Text style={styles.label}>Ghi chú (Tùy chọn)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                placeholder="Nhập ghi chú..."
                multiline
                value={note}
                onChangeText={setNote}
              />
            </ScrollView> */}

      {/* <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSaveLog}>
                <Text style={styles.btnSaveText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal> */}
    </SafeAreaView>
  );
}
