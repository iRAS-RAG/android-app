import { styles } from "@/styles/ai/aiAdvisor.styles";
import { theme } from "@/theme";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AIAdvisorScreen() {
  const [message, setMessage] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* 1. KHU VỰC DANH TÍNH AI */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="#334155" />
        </TouchableOpacity>
        <View style={styles.aiIdentity}>
          <View style={styles.botAvatar}>
            <MaterialCommunityIcons name="robot" size={24} color="#FFF" />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.aiName}>AI Advisor</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>Đang hoạt động</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* 2. KHU VỰC HỘI THOẠI CHÍNH */}
      <ScrollView
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Lời chào từ AI */}
        <View style={styles.botMsgContainer}>
          <View style={styles.msgBubbleBot}>
            <Text style={styles.msgTextBot}>
              Xin chào! Tôi là AI Advisor của hệ thống iRAS-RAG. Tôi có thể giúp
              gì cho bạn hôm nay?
            </Text>
          </View>
          <Text style={styles.msgTime}>08:54</Text>
        </View>

        {/* Truy vấn từ Kỹ thuật viên */}
        <View style={styles.userMsgContainer}>
          <View style={styles.msgBubbleUser}>
            <Text style={styles.msgTextUser}>
              Máy bơm #2 ở bể A-01 đang rung bất thường, tôi nên làm gì?
            </Text>
          </View>
          <Text style={styles.msgTimeUser}>08:55</Text>
        </View>

        {/* Phân tích thông minh từ AI */}
        <View style={styles.botMsgContainer}>
          <View style={styles.msgBubbleBot}>
            <Text style={styles.msgTextBot}>
              Tôi hiểu vấn đề của bạn. Máy bơm #2 đang có mức rung 4.8 mm/s, cao
              hơn ngưỡng an toàn (3.5 mm/s). Đây là hướng dẫn xử lý từng bước:
            </Text>

            {/* Hướng dẫn xử lý SOP */}
            <View style={styles.sopSection}>
              <View style={styles.sopHeader}>
                <Feather
                  name="activity"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={styles.sopTitle}>Hướng dẫn từng bước</Text>
              </View>
              <View style={styles.sopCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.colors.success}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.stepTitle}>
                    Bước 1: Kiểm tra nguồn điện
                  </Text>
                  <Text style={styles.stepDesc}>
                    Tắt nguồn điện và đảm bảo an toàn trước khi kiểm tra.
                  </Text>
                </View>
                <Text style={styles.stepTime}>5 phút</Text>
              </View>
            </View>

            {/* Linh kiện gợi ý (Kho tích hợp) */}
            <View style={styles.sparePartSection}>
              <View style={styles.sopHeader}>
                <Ionicons
                  name="cube-outline"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={styles.sopTitle}>Linh kiện gợi ý</Text>
              </View>

              <SparePartCard
                name="Bearing 6308"
                code="BRG-6308-SKF"
                qty="2"
                price="450.000đ"
                status="Có sẵn"
              />
              <SparePartCard
                name="Impeller Pump P200"
                code="IMP-P200-SS"
                qty="1"
                price="1.200.000đ"
                status="Hết hàng"
                isOut
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 4. CÔNG CỤ HỖ TRỢ & NHẬP LIỆU */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inputArea}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionRow}
          >
            <SuggestionTag label="Làm sao để giảm NH3?" />
            <SuggestionTag label="Kiểm tra độ pH như thế nào?" />
          </ScrollView>

          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="mic" size={20} color="#64748B" />
            </TouchableOpacity>
            <View style={styles.textInputWrapper}>
              <TextInput
                placeholder="Nhập câu hỏi..."
                style={styles.textInput}
                value={message}
                onChangeText={setMessage}
              />
              <TouchableOpacity>
                <Ionicons name="attach" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.sendBtn}>
              <Ionicons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Components con hỗ trợ
const SparePartCard = ({ name, code, qty, price, status, isOut }: any) => (
  <View style={styles.partCard}>
    <View style={styles.partIcon}>
      <MaterialCommunityIcons name="wrench-outline" size={20} color="#64748B" />
    </View>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <View style={styles.partHeaderRow}>
        <Text style={styles.partName}>{name}</Text>
        <Text
          style={[
            styles.partStatus,
            { color: isOut ? theme.colors.danger : theme.colors.success },
          ]}
        >
          {status}
        </Text>
      </View>
      <Text style={styles.partSub}>Mã: {code}</Text>
      <View style={styles.partFooter}>
        <Text style={styles.partQty}>SL: {qty}</Text>
        <Text style={styles.partPrice}>{price}</Text>
      </View>
      <TouchableOpacity style={styles.requestBtn} disabled={isOut}>
        <Text style={styles.requestBtnText}>Yêu cầu xuất kho</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const SuggestionTag = ({ label }: { label: string }) => (
  <TouchableOpacity style={styles.suggestionTag}>
    <Text style={styles.suggestionText}>{label}</Text>
  </TouchableOpacity>
);
