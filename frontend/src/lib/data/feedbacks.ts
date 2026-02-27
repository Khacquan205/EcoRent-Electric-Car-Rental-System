export interface FeedbackData {
  name: string;
  location: string;
  rating: number;
  image: string;
  review: string;
}

export const feedbacks: FeedbackData[] = [
  {
    name: "Nguyễn Minh Khoa",
    location: "Hồ Chí Minh",
    rating: 5.0,
    image: "/feedback/Rectangle 8.png",
    review:
      "Tìm được VinFast VF 8 ưng ý chỉ trong vài phút. Chủ xe phản hồi rất nhanh, trao đổi điều khoản rõ ràng và minh bạch. Sẽ tiếp tục dùng EcoRent cho những chuyến tiếp theo.",
  },
  {
    name: "Trần Thị Lan",
    location: "Hà Nội",
    rating: 5.0,
    image: "/feedback/Rectangle 8_1.png",
    review:
      "Tôi đăng tin cho thuê xe Tesla Model 3 trên EcoRent và kết nối được với người thuê uy tín chỉ trong ngày đầu tiên. Nền tảng rất dễ dùng, hỗ trợ liên lạc trực tiếp thuận tiện.",
  },
  {
    name: "Lê Hoàng Phúc",
    location: "Đà Nẵng",
    rating: 5.0,
    image: "/feedback/Rectangle 8_2.png",
    review:
      "Tôi thích cách EcoRent hoạt động — không cần đặt lịch cứng nhắc, chỉ cần nhắn tin với chủ xe, thoả thuận ngày giờ linh hoạt. Thuê được Hyundai Ioniq 5 với giá hợp lý, rất hài lòng.",
  },
  {
    name: "Phạm Thu Hà",
    location: "Cần Thơ",
    rating: 4.9,
    image: "/feedback/Rectangle 8.png",
    review:
      "Lần đầu dùng nền tảng P2P thuê xe điện, tôi khá lo lắng nhưng EcoRent đã giúp tôi yên tâm với hệ thống xác thực chủ xe và đánh giá rõ ràng. Trải nghiệm thực sự khác biệt.",
  },
  {
    name: "Vũ Đăng Khoa",
    location: "Hải Phòng",
    rating: 5.0,
    image: "/feedback/Rectangle 8_1.png",
    review:
      "Đăng tin cho thuê xe BYD Atto 3 của mình và nhận được hàng chục yêu cầu trong tuần đầu. EcoRent giúp tôi quản lý thông tin và kết nối với người thuê một cách chuyên nghiệp.",
  },
  {
    name: "Đỗ Thị Mai",
    location: "Nha Trang",
    rating: 5.0,
    image: "/feedback/Rectangle 8_2.png",
    review:
      "Giao diện đẹp, dễ tìm kiếm. Hệ thống chat trực tiếp với chủ xe rất tiện — không cần qua trung gian, thỏa thuận nhanh, mọi thứ rõ ràng và đáng tin cậy.",
  },
];
