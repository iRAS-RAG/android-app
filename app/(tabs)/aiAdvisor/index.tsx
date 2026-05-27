import { styles } from "@/styles/ai/aiAdvisor.styles";
import { theme } from "@/theme";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { advisoryApi } from "@/api/advisoryApi";
import { toast } from "@/utils/toast";

interface Exchange {
  question: string;
  answer: string;
  isOffTopic: boolean;
  citations: string[];
  error: boolean;
}

// Loại bỏ cú pháp Markdown phổ biến trong câu trả lời của AI để hiển thị
// dạng văn bản thuần (tránh hiện thừa các ký tự **, *, #, `, ...)
const stripMarkdown = (s: string): string => {
  if (!s) return s;
  return s
    .replace(/\*\*([\s\S]+?)\*\*/g, "$1") // **bold**
    .replace(/__([\s\S]+?)__/g, "$1") // __bold__
    .replace(/^#{1,6}\s+/gm, "") // headers # / ##
    .replace(/^\s*[*+\-]\s+/gm, "• ") // bullets: *, -, +
    .replace(/`([^`]+)`/g, "$1"); // `code`
};

export default function AIAdvisorScreen() {
  const router = useRouter();
  // Nhận params từ trang alertDetail (khi bấm "Tham vấn AI Advisor")
  const { prefillPrompt, tankId, tankName } = useLocalSearchParams<{
    prefillPrompt?: string;
    tankId?: string;
    tankName?: string;
  }>();

  const [message, setMessage] = useState("");
  const [tanks, setTanks] = useState<any[]>([]);
  const [loadingTanks, setLoadingTanks] = useState(true);
  const [selectedTank, setSelectedTank] = useState<any | null>(null);
  const [sending, setSending] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  // Dùng ref để chỉ apply prefill 1 lần mỗi lần navigate đến trang này
  const prefillApplied = useRef(false);

  // Tải danh sách bể nuôi để người dùng chọn trước khi chat
  useEffect(() => {
    const loadTanks = async () => {
      try {
        const res = await advisoryApi.getTanks();
        setTanks(res.data?.data || []);
      } catch (error) {
        console.error("Lỗi tải danh sách bể nuôi:", error);
      } finally {
        setLoadingTanks(false);
      }
    };
    loadTanks();
  }, []);

  // Khi có params từ alertDetail: auto-select bể và pre-fill prompt
  useFocusEffect(
    useCallback(() => {
      // Reset cờ mỗi lần focus để xử lý navigate mới
      prefillApplied.current = false;
    }, [tankId, prefillPrompt]),
  );

  useEffect(() => {
    if (
      !prefillApplied.current &&
      !loadingTanks &&
      tankId &&
      prefillPrompt &&
      tanks.length > 0
    ) {
      prefillApplied.current = true;
      // Tìm bể trong danh sách đã tải
      const matchedTank = tanks.find((t: any) => t.id === tankId);
      if (matchedTank) {
        setSelectedTank(matchedTank);
      } else if (tankName) {
        // Fallback: tạo object tạm nếu không tìm thấy trong list
        setSelectedTank({ id: tankId, name: tankName });
      }
      setExchanges([]);
      setMessage(prefillPrompt);
    }
  }, [loadingTanks, tanks, tankId, prefillPrompt, tankName]);

  const handleSelectTank = (tank: any) => {
    setSelectedTank(tank);
    setExchanges([]);
    setMessage("");
  };

  const handleChangeTank = () => {
    setSelectedTank(null);
    setExchanges([]);
    setMessage("");
  };

  // Gửi câu hỏi tới AdvisoryController: POST /api/advisory/chat
  const handleSend = async () => {
    const question = message.trim();
    if (!selectedTank || !question || sending) return;

    setMessage("");
    setSending(true);

    // Thêm lượt hỏi mới vào cuối lịch sử hội thoại (chưa có câu trả lời)
    setExchanges((prev) => [
      ...prev,
      {
        question,
        answer: "",
        isOffTopic: false,
        citations: [],
        error: false,
      },
    ]);

    try {
      const res = await advisoryApi.chat(selectedTank.id, question);
      const data = res.data || {};
      // Cập nhật câu trả lời vào lượt cuối cùng
      setExchanges((prev) => {
        const next = [...prev];
        const last = next.length - 1;
        next[last] = {
          ...next[last],
          answer:
            (data.answer || "").trim() ||
            "Hệ thống chưa trả về câu trả lời. Vui lòng thử lại.",
          isOffTopic: !!data.isOffTopic,
          citations: Array.isArray(data.citations) ? data.citations : [],
          error: false,
        };
        return next;
      });
    } catch (err: any) {
      console.error("Lỗi gọi advisory chat:", err);
      const status = err?.response?.status;
      const apiMsg = err?.response?.data?.message;
      let reason: string;
      if (status === 403) {
        reason =
          (apiMsg || "Bạn không có quyền truy cập bể nuôi này.") +
          " Vui lòng chọn bể khác hoặc liên hệ quản trị viên để được cấp quyền.";
      } else if (status === 401) {
        reason = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      } else {
        reason =
          apiMsg || "Không thể kết nối tới trợ lý AI. Vui lòng thử lại.";
      }
      toast.error(reason);
      setExchanges((prev) => {
        const next = [...prev];
        const last = next.length - 1;
        next[last] = {
          ...next[last],
          answer: reason,
          error: true,
        };
        return next;
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* 1. KHU VỰC DANH TÍNH AI */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
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
        {selectedTank ? (
          <TouchableOpacity
            style={styles.changeTankBtn}
            onPress={handleChangeTank}
            disabled={sending}
          >
            <Feather
              name="refresh-ccw"
              size={13}
              color={theme.colors.primary}
            />
            <Text style={styles.changeTankText}>Đổi bể</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {/* 2. KHU VỰC HỘI THOẠI CHÍNH */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {/* Lời chào từ AI + chọn bể nuôi */}
        <View style={styles.botMsgContainer}>
          <View style={styles.msgBubbleBot}>
            <Text style={styles.msgTextBot}>
              Xin chào, chúc bạn một ngày tốt lành! Vui lòng chọn một bể nuôi
              bên dưới để tôi bắt đầu phân tích trạng thái và tư vấn cho bạn.
            </Text>
          </View>

          {/* Danh sách bể để chọn (ẩn sau khi đã chọn) */}
          {!selectedTank && (
            <View style={styles.tankChoiceWrap}>
              {loadingTanks ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ marginTop: 12 }}
                />
              ) : tanks.length === 0 ? (
                <Text style={styles.emptyTankText}>
                  Không tải được danh sách bể nuôi. Vui lòng thử lại.
                </Text>
              ) : (
                tanks.map((tank) => {
                  const hasAlert = tank.hasOpenAlert;
                  return (
                    <TouchableOpacity
                      key={tank.id}
                      activeOpacity={0.8}
                      onPress={() => handleSelectTank(tank)}
                      style={[
                        styles.tankChip,
                        hasAlert && styles.tankChipAlert,
                      ]}
                    >
                      <Ionicons
                        name="water"
                        size={15}
                        color={
                          hasAlert
                            ? theme.colors.danger
                            : theme.colors.primary
                        }
                      />
                      <Text
                        style={[
                          styles.tankChipText,
                          hasAlert && { color: theme.colors.danger },
                        ]}
                      >
                        {tank.name}
                      </Text>
                      {hasAlert && (
                        <Ionicons
                          name="warning"
                          size={14}
                          color={theme.colors.danger}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        </View>

        {/* Bong bóng sẵn sàng (đã chọn bể nhưng chưa hỏi) */}
        {selectedTank && exchanges.length === 0 && (
          <View style={styles.botMsgContainer}>
            <View style={styles.msgBubbleBot}>
              <Text style={styles.msgTextBot}>
                Tôi đã sẵn sàng phân tích cho{" "}
                <Text
                  style={{ fontWeight: "800", color: theme.colors.primary }}
                >
                  {selectedTank.name}
                </Text>
                . Bạn hãy nhập câu hỏi hoặc mô tả vấn đề bên dưới để tôi tư vấn
                hướng xử lý.
              </Text>
            </View>
          </View>
        )}

        {/* Lịch sử hội thoại: hiển thị toàn bộ các lượt hỏi - đáp */}
        {exchanges.map((ex, index) => {
          const isLast = index === exchanges.length - 1;
          const isWaiting = isLast && sending;

          return (
            <React.Fragment key={index}>
              {/* Câu hỏi của người dùng */}
              <View style={styles.userMsgContainer}>
                <View style={styles.msgBubbleUser}>
                  <Text style={styles.msgTextUser}>{ex.question}</Text>
                </View>
              </View>

              {/* Câu trả lời của AI */}
              <View style={styles.botMsgContainer}>
                <View style={styles.msgBubbleBot}>
                  {isWaiting ? (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.primary}
                      />
                      <Text
                        style={[
                          styles.msgTextBot,
                          { marginLeft: 8, opacity: 0.7 },
                        ]}
                      >
                        Đang phân tích...
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.msgTextBot,
                          ex.error && { color: theme.colors.danger },
                        ]}
                      >
                        {stripMarkdown(ex.answer)}
                      </Text>

                      {ex.isOffTopic && !ex.error && (
                        <Text
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            fontWeight: "600",
                            color: theme.colors.warning,
                          }}
                        >
                          ⚠ Câu hỏi nằm ngoài phạm vi tư vấn.
                        </Text>
                      )}

                      {ex.citations.length > 0 && (
                        <View style={{ marginTop: 10 }}>
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "700",
                              color: theme.colors.textSecondary,
                            }}
                          >
                            Nguồn tham khảo:
                          </Text>
                          {ex.citations.map((c, i) => (
                            <Text
                              key={i}
                              style={{
                                fontSize: 11,
                                color: theme.colors.textSecondary,
                                marginTop: 2,
                              }}
                            >
                              • {c}
                            </Text>
                          ))}
                        </View>
                      )}
                    </>
                  )}
                </View>
              </View>
            </React.Fragment>
          );
        })}
      </ScrollView>

      {/* 3. KHU VỰC NHẬP LIỆU */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inputArea}>
          {!selectedTank && (
            <Text style={styles.inputHint}>
              Vui lòng chọn một bể nuôi ở trên để bắt đầu trò chuyện.
            </Text>
          )}
          <View
            style={[
              styles.inputRow,
              (!selectedTank || sending) && { opacity: 0.5 },
            ]}
          >
            <View style={styles.textInputWrapper}>
              <TextInput
                placeholder={
                  selectedTank
                    ? `Nhập câu hỏi cho ${selectedTank.name}...`
                    : "Chọn bể nuôi trước khi nhập..."
                }
                placeholderTextColor="#94A3B8"
                style={styles.textInput}
                value={message}
                onChangeText={setMessage}
                editable={!!selectedTank && !sending}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
            </View>
            <TouchableOpacity
              style={styles.sendBtn}
              disabled={!selectedTank || sending || !message.trim()}
              onPress={handleSend}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
