import { theme } from "@/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

/* ============================
   DỮ LIỆU GIẢ LẬP 
=============================== */

const TANKS_DATA = [
  {
    id: "A-01",
    crop: "Vụ Tôm Thẻ 01",
    lastFed: "10kg",
    lastTime: "08:00",
    status: "fed",
    deadToday: 5,
  },
  {
    id: "A-02",
    crop: "Vụ Tôm Thẻ 01",
    lastFed: "-",
    lastTime: "-",
    status: "unfed",
    deadToday: 0,
  },
  {
    id: "B-01",
    crop: "Vụ Cá Chẽm 02",
    lastFed: "5kg",
    lastTime: "07:30",
    status: "fed",
    deadToday: 12,
  },
];

const FEED_LIST = [
  { label: "Cargill 7414 (Viên nổi)", value: "Cargill_7414" },
  { label: "De Heus 6002 (Viên chìm)", value: "DeHeus_6002" },
];

const TANK_LIST = [
  { label: "Bể A-01", value: "A-01" },
  { label: "Bể A-02", value: "A-02" },
  { label: "Bể B-01", value: "B-01" },
];

const FEED_HISTORY = [
  {
    id: "h1",
    time: "10:30 - Hôm nay",
    tank: "Bể A-01",
    feed: "Cargill 7414",
    amount: "10kg",
    user: "Nguyễn Văn A",
  },
  {
    id: "h2",
    time: "08:00 - Hôm nay",
    tank: "Bể B-01",
    feed: "De Heus 6002",
    amount: "5kg",
    user: "Nguyễn Văn A",
  },
];

const MORTALITY_HISTORY = [
  {
    id: "m1",
    time: "09:15 - Hôm nay",
    tank: "Bể A-01",
    count: "5 con",
    note: "Cá nổi đầu",
    user: "Trần Văn B",
  },
  {
    id: "m2",
    time: "18:00 - Hôm qua",
    tank: "Bể B-01",
    count: "12 con",
    note: "Trầy xước thân",
    user: "Nguyễn Văn A",
  },
];

/* ============================
   COMPONENT CHÍNH
=============================== */

export default function OperationsScreen() {
  /* TAB CHÍNH */
  const [activeTab, setActiveTab] = useState<
    "feeding" | "mortality" | "history"
  >("feeding");

  /* SUBTAB LỊCH SỬ */
  const [historySubTab, setHistorySubTab] = useState<"feed_hist" | "dead_hist">(
    "feed_hist",
  );

  /* MODAL CHO ĂN */
  const [modalFeedingVisible, setModalFeedingVisible] = useState(false);
  const [selectedTank, setSelectedTank] = useState("");
  const [selectedFeed, setSelectedFeed] = useState("");
  const [feedAmount, setFeedAmount] = useState("");
  const [feedNote, setFeedNote] = useState("");
  const [isFocus, setIsFocus] = useState(false);

  /* MODAL CÁ CHẾT */
  const [modalMortalityVisible, setModalMortalityVisible] = useState(false);
  const [deadAmount, setDeadAmount] = useState("");
  const [deadNote, setDeadNote] = useState("");

  /* MỞ MODAL */
  const handleOpenModal = (tankId: string) => {
    if (activeTab === "feeding") {
      setSelectedTank(tankId);
      setModalFeedingVisible(true);
    } else {
      setSelectedTank(tankId);
      setModalMortalityVisible(true);
    }
  };

  /* LƯU CHO ĂN */
  const handleSaveFeeding = () => {
    Alert.alert("Thành công", "Đã ghi nhận cho ăn.");
    setModalFeedingVisible(false);
  };

  /* LƯU CÁ CHẾT */
  const handleSaveMortality = () => {
    Alert.alert("Thành công", "Đã ghi nhận số lượng cá chết.");
    setModalMortalityVisible(false);
  };

  /* COMPONENT FILTER TAB */
  const FilterTab = ({
    icon,
    label,
    active,
    onPress,
    color,
    textColor,
  }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterTab,
        { backgroundColor: active ? textColor : color },
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={active ? "#FFF" : textColor}
        style={{ marginRight: 6 }}
      />
      <Text
        style={[styles.filterTabText, { color: active ? "#FFF" : textColor }]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Vận hành</Text>
            <Text style={styles.headerSubTitle}>Quản lý hoạt động hồ nuôi</Text>
          </View>
        </View>

        {/* FILTER TABS */}
        <View style={styles.filterGroupCentered}>
          <FilterTab
            icon="restaurant-outline"
            label="Cho ăn"
            active={activeTab === "feeding"}
            onPress={() => setActiveTab("feeding")}
            color="#DBEAFE"
            textColor={theme.colors.primary}
          />

          <FilterTab
            icon="fish-outline"
            label="Cá chết"
            active={activeTab === "mortality"}
            onPress={() => setActiveTab("mortality")}
            color="#FEE2E2"
            textColor={theme.colors.danger}
          />

          <FilterTab
            icon="time-outline"
            label="Lịch sử"
            active={activeTab === "history"}
            onPress={() => setActiveTab("history")}
            color="#F1F5F9"
            textColor="#64748B"
          />
        </View>
      </View>

      {/* SUB TAB LỊCH SỬ */}
      {activeTab === "history" && (
        <View style={styles.subTabContainer}>
          <TouchableOpacity
            onPress={() => setHistorySubTab("feed_hist")}
            style={[
              styles.subTabItem,
              historySubTab === "feed_hist" && styles.subTabActive,
            ]}
          >
            <Text
              style={[
                styles.subTabText,
                historySubTab === "feed_hist" && styles.subTabTextActive,
              ]}
            >
              Lịch sử cho ăn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setHistorySubTab("dead_hist")}
            style={[
              styles.subTabItem,
              historySubTab === "dead_hist" && styles.subTabActive,
            ]}
          >
            <Text
              style={[
                styles.subTabText,
                historySubTab === "dead_hist" && styles.subTabTextActive,
              ]}
            >
              Lịch sử cá chết
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* NỘI DUNG */}
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 10 }}>
        {activeTab !== "history" ? (
          /* ======================
             TAB CHO ĂN / CÁ CHẾT 
          ========================= */
          <FlatList
            data={TANKS_DATA}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor:
                          activeTab === "feeding" ? "#DBEAFE" : "#FEE2E2",
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        activeTab === "feeding"
                          ? "fishbowl-outline"
                          : "skull-outline"
                      }
                      size={24}
                      color={
                        activeTab === "feeding"
                          ? theme.colors.primary
                          : theme.colors.danger
                      }
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.cardTitle}>Bể {item.id}</Text>
                    <Text style={{ fontSize: 12, color: "#64748B" }}>
                      {item.crop}
                    </Text>
                  </View>

                  {activeTab === "feeding" && (
                    <View
                      style={[
                        styles.statusTag,
                        {
                          backgroundColor:
                            item.status === "fed" ? "#DCFCE7" : "#FEF9C3",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "700",
                          color: item.status === "fed" ? "#166534" : "#854D0E",
                        }}
                      >
                        {item.status === "fed" ? "ĐÃ CHO ĂN" : "CHƯA CHO ĂN"}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.infoRow}>
                  {activeTab === "feeding" ? (
                    <Text style={styles.infoText}>
                      Lần cuối:{" "}
                      <Text style={{ fontWeight: "700" }}>{item.lastFed}</Text>{" "}
                      ({item.lastTime})
                    </Text>
                  ) : (
                    <Text style={styles.infoText}>
                      Chết hôm nay:{" "}
                      <Text
                        style={{
                          fontWeight: "700",
                          color: theme.colors.danger,
                        }}
                      >
                        {item.deadToday} con
                      </Text>
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    activeTab === "mortality" && {
                      backgroundColor: theme.colors.danger,
                    },
                  ]}
                  onPress={() => handleOpenModal(item.id)}
                >
                  <Text style={styles.actionBtnText}>
                    {activeTab === "feeding" ? "Cho Ăn Ngay" : "Nhập Số Lượng"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : historySubTab === "feed_hist" ? (
          /* ======================
             LỊCH SỬ CHO ĂN
          ========================= */
          <FlatList
            data={FEED_HISTORY}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.historyCard,
                  { borderLeftColor: theme.colors.primary },
                ]}
              >
                <View style={styles.historyRow}>
                  <Text style={styles.historyTime}>{item.time}</Text>
                  <Text style={styles.historyTank}>{item.tank}</Text>
                </View>

                <Text
                  style={styles.historyContent}
                >{`${item.feed}: ${item.amount}`}</Text>

                <Text style={styles.historyUser}>KTV: {item.user}</Text>
              </View>
            )}
          />
        ) : (
          /* ======================
             LỊCH SỬ CÁ CHẾT
          ========================= */
          <FlatList
            data={MORTALITY_HISTORY}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.historyCard,
                  { borderLeftColor: theme.colors.danger },
                ]}
              >
                <View style={styles.historyRow}>
                  <Text style={styles.historyTime}>{item.time}</Text>
                  <Text style={styles.historyTank}>{item.tank}</Text>
                </View>

                <Text
                  style={styles.historyContent}
                >{`Số lượng: ${item.count}`}</Text>

                {item.note && (
                  <Text style={styles.historyNote}>{`"${item.note}"`}</Text>
                )}

                <Text style={styles.historyUser}>KTV: {item.user}</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* =========================================
         MODAL GHI NHẬN CHO ĂN
      ============================================ */}
      <Modal visible={modalFeedingVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ghi nhận Cho Ăn</Text>
              <TouchableOpacity onPress={() => setModalFeedingVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Tank */}
              <Text style={styles.label}>
                Chọn Hồ nuôi <Text style={{ color: "red" }}>*</Text>
              </Text>
              <Dropdown
                style={[
                  styles.dropdown,
                  isFocus && { borderColor: theme.colors.primary },
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={TANK_LIST}
                labelField="label"
                valueField="value"
                placeholder="Chọn bể..."
                value={selectedTank}
                onChange={(item) => setSelectedTank(item.value)}
                onFocus={() => setIsFocus(true)}
                onBlur={() => setIsFocus(false)}
              />

              {/* Feed */}
              <Text style={styles.label}>
                Chọn loại cám <Text style={{ color: "red" }}>*</Text>
              </Text>
              <Dropdown
                style={[
                  styles.dropdown,
                  isFocus && { borderColor: theme.colors.primary },
                ]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                data={FEED_LIST}
                labelField="label"
                valueField="value"
                placeholder="Chọn loại cám..."
                value={selectedFeed}
                onChange={(item) => setSelectedFeed(item.value)}
              />

              {/* Amount */}
              <Text style={styles.label}>
                Lượng cám (kg) <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập khối lượng..."
                keyboardType="numeric"
                value={feedAmount}
                onChangeText={setFeedAmount}
              />

              {/* Note */}
              <Text style={styles.label}>Ghi chú</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Ghi chú thêm..."
                value={feedNote}
                onChangeText={setFeedNote}
                multiline
              />
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalFeedingVisible(false)}
              >
                <Text style={styles.btnTextCancel}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSave}
                onPress={handleSaveFeeding}
              >
                <Text style={styles.btnTextSave}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* =========================================
         MODAL GHI NHẬN CÁ CHẾT
      ============================================ */}
      <Modal visible={modalMortalityVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ghi nhận Cá Chết</Text>
              <TouchableOpacity onPress={() => setModalMortalityVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Amount */}
              <Text style={styles.label}>
                Số lượng cá chết <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số lượng..."
                keyboardType="numeric"
                value={deadAmount}
                onChangeText={setDeadAmount}
              />

              {/* Note */}
              <Text style={styles.label}>Ghi chú</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Ghi chú thêm..."
                value={deadNote}
                onChangeText={setDeadNote}
                multiline
              />
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.btnCancel}
                onPress={() => setModalMortalityVisible(false)}
              >
                <Text style={styles.btnTextCancel}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSave}
                onPress={handleSaveMortality}
              >
                <Text style={styles.btnTextSave}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ============================
   STYLE
=============================== */

const styles = StyleSheet.create({
  /* HEADER */
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  headerTitleContainer: {},
  headerTitle: { ...theme.typography.h2, color: theme.colors.textPrimary },
  headerSubTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },

  /* FILTER TABS */
  filterGroupCentered: {
    flexDirection: "row",
    justifyContent: "space-between", // Dàn đều 3 tab sang 2 bên và giữa
    marginTop: 14,
    paddingHorizontal: 0, // Không cần padding nếu đã dàn đều
  },
  filterGroup: { marginTop: 14 },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Căn giữa nội dung trong tab
    paddingVertical: 10,
    borderRadius: 18, // Bo góc vuông vắn hơn một chút
    width: "32%", // Mỗi tab chiếm gần 1/3 chiều ngang để đều nhau
  },
  filterTabText: { fontWeight: "600", fontSize: 14 },

  /* SUBTAB */
  subTabContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    padding: 6,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 6,
  },
  subTabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  subTabActive: { backgroundColor: "#FFF" },
  subTabText: { color: "#64748B", fontWeight: "600", fontSize: 13 },
  subTabTextActive: { color: theme.colors.primary },

  /* CARD HỒ */
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  infoRow: { marginTop: 10 },
  infoText: { fontSize: 14, color: "#475569" },

  actionBtn: {
    marginTop: 10,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  actionBtnText: { color: "#FFF", fontWeight: "600" },

  /* HISTORY */
  listContainer: { paddingBottom: 50 },
  historyCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyTime: { fontSize: 13, color: "#475569", fontWeight: "600" },
  historyTank: { fontSize: 13, color: theme.colors.primary },
  historyContent: { fontSize: 14, marginTop: 6 },
  historyNote: {
    fontSize: 13,
    color: "#64748B",
    fontStyle: "italic",
    marginTop: 4,
  },
  historyUser: { marginTop: 6, fontSize: 12, color: "#475569" },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },

  label: {
    marginTop: 14,
    marginBottom: 6,
    fontWeight: "600",
    color: "#475569",
  },

  dropdown: {
    height: 48,
    borderColor: "#CBD5E1",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
  },
  placeholderStyle: { color: "#94A3B8" },
  selectedTextStyle: { color: "#0F172A" },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    color: "#0F172A",
  },

  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  btnCancel: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    alignItems: "center",
  },
  btnSave: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    alignItems: "center",
  },
  btnTextCancel: { color: "#475569", fontWeight: "600" },
  btnTextSave: { color: "#FFF", fontWeight: "600" },
});
