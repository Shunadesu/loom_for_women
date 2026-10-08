// Mock data cho tính năng Hỏi Chuyên Gia
// Dùng để demo UI mà không cần backend

export const MOCK_QUESTIONS = [
  {
    id: 'qa-1',
    category: 'Lừa đảo trực tuyến',
    priority: 'urgent', // urgent | high | normal
    title: 'Nghi ngờ đường link giả mạo Ngân hàng yêu cầu xác thực cước phí Zalo',
    content: 'Hôm qua em nhận được tin nhắn Zalo xưng là Cán bộ Ngân hàng, báo tài khoản của em bị tạm khóa và yêu cầu bấm vào đường link để xác thực mã OTP. Em chưa bấm nhưng rất lo lắng, đây có phải lừa đảo không ạ?',
    status: 'answered',
    createdAt: '2026-10-08T08:00:00',
    updatedAt: '2026-10-08T08:20:00',
    messages: [
      {
        id: 'm1-1',
        sender: 'user',
        senderName: 'Chị Mai Hường',
        content: 'Chuyên gia ơi, số điện thoại +84 988 xxx xxy nhắn tin Zalo bảo tài khoản lương của em bị lỗi, cần nhập OTP ở link http://nganhang-xacthuc.vip. Em lo quá vì sắp đến ngày trả tiền phòng trọ.',
        timestamp: '08:15',
      },
      {
        id: 'm1-2',
        sender: 'expert',
        senderName: 'TS. Trần Văn Hùng',
        role: 'Chuyên gia An ninh mạng',
        content: 'Chào bạn Hường, đây 100% là đường link giả mạo chứa mã độc ăn cắp tài khoản! Bạn hãy làm ngay 2 bước: 1. Bấm nút Báo xấu tài khoản Zalo đó lập tức. 2. Không nhập bất kỳ mã OTP nào.',
        timestamp: '08:18',
      },
      {
        id: 'm1-3',
        sender: 'user',
        senderName: 'Chị Mai Hường',
        content: 'Dạ em cảm ơn chuyên gia nhiều lắm ạ, may quá em chưa bấm vào!',
        timestamp: '08:20',
      },
    ],
  },
  {
    id: 'qa-2',
    category: 'Tài chính gia đình',
    priority: 'normal',
    title: 'Cách chia lương 8 triệu cho gia đình 3 người tại KCN Tân Bình',
    content: 'Em làm công nhân tại KCN Tân Bình, lương 8 triệu/tháng. Gia đình 3 người (vợ chồng + 1 con 5 tuổi). Em muốn xin tư vấn cách chia lương hợp lý để vừa đủ sống vừa có tiết kiệm ạ.',
    status: 'answered',
    createdAt: '2026-10-07T14:30:00',
    updatedAt: '2026-10-07T15:10:00',
    messages: [
      {
        id: 'm2-1',
        sender: 'user',
        senderName: 'Anh Minh Tuấn',
        content: 'Chuyên gia ơi, hiện tại em chi tiêu như sau: tiền nhà 2tr5, ăn uống 3tr, điện nước 500k, còn lại chi tiêu linh tinh hết luôn. Em không biết cắt giảm chỗ nào.',
        timestamp: '14:35',
      },
      {
        id: 'm2-2',
        sender: 'expert',
        senderName: 'ThS. Nguyễn Thanh Hoa',
        role: 'Chuyên gia Tài chính gia đình',
        content: 'Chào anh Tuấn, với mức lương 8 triệu, anh nên áp dụng công thức 50-30-20: 50% (4tr) chi phí thiết yếu, 30% (2tr4) chi tiêu linh hoạt, 20% (1tr6) tiết kiệm. Riêng phần ăn uống 3tr là hơi cao, anh thử giảm xuống 2tr5 bằng cách nấu ăn nhiều hơn.',
        timestamp: '14:50',
      },
      {
        id: 'm2-3',
        sender: 'user',
        senderName: 'Anh Minh Tuấn',
        content: 'Cảm ơn chuyên gia, em sẽ thử áp dụng ạ!',
        timestamp: '15:10',
      },
    ],
  },
  {
    id: 'qa-3',
    category: 'Kỹ năng thủ công',
    priority: 'high',
    title: 'Xin tư vấn chọn loại len Cotton Milk không bị phai màu khi giặt',
    content: 'Em đang học móc túi len theo khóa học trên Loom. Em thấy nhiều loại len Cotton Milk nhưng không biết loại nào không bị phai màu khi giặt. Nhờ chuyên gia tư vấn giúp em ạ.',
    status: 'pending',
    createdAt: '2026-10-08T17:20:00',
    updatedAt: '2026-10-08T17:20:00',
    messages: [
      {
        id: 'm3-1',
        sender: 'user',
        senderName: 'Chị Thu Hà',
        content: 'Em đang muốn móc túi xách cho con gái đi học. Em thấy len Cotton Milk của các hãng Kartopu, YarnArt, Alize giá từ 25-40k/cuộn. Không biết loại nào bền màu và mềm tay ạ?',
        timestamp: '17:20',
      },
    ],
  },
  {
    id: 'qa-4',
    category: 'Sức khỏe lao động',
    priority: 'normal',
    title: 'Đau lưng do ngồi may liên tục 8 tiếng, cần làm gì?',
    content: 'Em làm may công nghiệp, mỗi ngày ngồi liên tục 8 tiếng. Tuần này em bị đau lưng nhiều, không biết có cách nào giảm đau không ạ?',
    status: 'answered',
    createdAt: '2026-10-06T09:00:00',
    updatedAt: '2026-10-06T10:30:00',
    messages: [
      {
        id: 'm4-1',
        sender: 'user',
        senderName: 'Chị Lan Anh',
        content: 'Chuyên gia ơi, em đau vùng thắt lưng, có lúc tê cả chân. Em có nên nghỉ làm không ạ?',
        timestamp: '09:05',
      },
      {
        id: 'm4-2',
        sender: 'expert',
        senderName: 'BS. Lê Văn Nam',
        role: 'Bác sĩ Y học Lao động',
        content: 'Chị Lan Anh nên đi khám ngay để loại trừ thoát vị đĩa đệm. Trong lúc chờ khám, chị nên: 1) Ngồi đúng tư thế, lưng tựa thẳng. 2) Nghỉ giải lao 5 phút/giờ, đứng dậy duỗi người. 3) Tránh mang vác nặng. Nếu tê chân kéo dài, cần đi khám gấp.',
        timestamp: '09:30',
      },
      {
        id: 'm4-3',
        sender: 'user',
        senderName: 'Chị Lan Anh',
        content: 'Dạ em cảm ơn bác sĩ, mai em sẽ xin phép đi khám ạ.',
        timestamp: '10:30',
      },
    ],
  },
  {
    id: 'qa-5',
    category: 'Quyền lợi lao động',
    priority: 'urgent',
    title: 'Công ty không trả lương đúng hạn 2 tháng liên tiếp',
    content: 'Công ty em bị chậm trả lương 2 tháng liên tiếp. Họ nói đang khó khăn về tài chính. Em phải làm gì để bảo vệ quyền lợi của mình ạ?',
    status: 'answered',
    createdAt: '2026-10-05T16:00:00',
    updatedAt: '2026-10-05T17:45:00',
    messages: [
      {
        id: 'm5-1',
        sender: 'user',
        senderName: 'Anh Quốc Hưng',
        content: 'Chuyên gia ơi, em đang rất cần tiền để trả nợ nhưng công ty cứ hẹn hoài. Em có quyền đơn phương chấm dứt hợp đồng không ạ?',
        timestamp: '16:10',
      },
      {
        id: 'm5-2',
        sender: 'expert',
        senderName: 'Luật sư Phạm Minh Tuấn',
        role: 'Luật sư Lao động',
        content: 'Theo Bộ luật Lao động 2019 điều 35.2, nếu người sử dụng lao động không trả lương đầy đủ, đúng hạn từ 15 ngày trở lên, anh có quyền đơn phương chấm dứt hợp đồng. Anh nên: 1) Làm đơn yêu cầu trả lương gửi công ty (có xác nhận). 2) Nếu không giải quyết, báo cáo Thanh tra Lao động địa phương. 3) Sau đó có thể đơn phương chấm dứt hợp đồng và yêu cầu bồi thường.',
        timestamp: '16:45',
      },
      {
        id: 'm5-3',
        sender: 'user',
        senderName: 'Anh Quốc Hưng',
        content: 'Cảm ơn luật sư rất nhiều, em sẽ làm theo hướng dẫn ạ!',
        timestamp: '17:45',
      },
    ],
  },
];

// Helper để lấy badge config theo priority
export function getPriorityBadge(priority) {
  const badges = {
    urgent: {
      label: 'Khẩn cấp',
      className: 'bg-red-100 text-red-700 border-red-200',
      icon: 'ShieldAlertIcon',
    },
    high: {
      label: 'Gấp',
      className: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: 'TriangleAlertIcon',
    },
    normal: {
      label: 'Bình thường',
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: 'ClockIcon',
    },
  };
  return badges[priority] || badges.normal;
}

// Helper để format thời gian tương đối
export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else if (diffDays === 1) {
    return 'Hôm qua, ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
