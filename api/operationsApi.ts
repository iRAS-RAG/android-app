import axiosClient from "./axiosClient";

export const operationsApi = {
  // - Trả về mảng feed types trực tiếp từ Backend
  //   getFeedTypes: () => {
  //     return axiosClient.get("/feed-types");
  //   },
  getFeedTypes: () => {
    return axiosClient.get("/feed-types", {
      params: {
        page: 1,
        pageSize: 100, // Đảm bảo lấy đủ danh sách cho Dropdown
      },
    });
  },

  // - Lấy nhật ký cho ăn thành công
  getFeedingLogs: () => {
    return axiosClient.get("/feeding-logs");
  },

  // Endpoint này đã hiển thị thành công trong các hội thoại trước
  getAllTanks: () => {
    return axiosClient.get("/tanks");
  },
  postFeeding: (data: any) => {
    return axiosClient.post("/feeding-logs", data);
  },
  // --- API CÁ CHẾT ---
  getMortalityLogs: () => {
    return axiosClient.get("/mortality-logs", {
      params: { page: 1, pageSize: 100 },
    });
  },
  postMortalityLog: (data: any) => {
    return axiosClient.post("/mortality-logs", data);
  },
  putMortalityLog: (id: string, data: any) => {
    return axiosClient.put(`/mortality-logs/${id}`, data);
  },
};
