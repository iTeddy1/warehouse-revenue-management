/**
 * Vietnamese Localization Messages
 * All API responses (success, errors, validation) in Vietnamese
 */

export const MSG = {
  SUCCESS: {
    CREATED: "Tạo mới thành công",
    UPDATED: "Cập nhật thành công",
    DELETED: "Xóa thành công",
    LOGIN: "Đăng nhập thành công",
    LOGOUT: "Đăng xuất thành công",
    FETCHED: "Lấy dữ liệu thành công",
    REGISTERED: "Đăng ký thành công",
  },

  ERROR: {
    NOT_FOUND: "Không tìm thấy dữ liệu",
    EXISTS: "Dữ liệu đã tồn tại",
    INVALID_CREDENTIALS: "Email hoặc mật khẩu không chính xác",
    UNAUTHORIZED: "Bạn không có quyền truy cập",
    FORBIDDEN: "Bạn không có quyền thực hiện thao tác này",
    INTERNAL_SERVER: "Lỗi hệ thống, vui lòng thử lại sau",
    BAD_REQUEST: "Yêu cầu không hợp lệ",
    INVALID_TOKEN: "Token không hợp lệ hoặc đã hết hạn",
    TOKEN_EXPIRED: "Phiên đăng nhập đã hết hạn",
    DUPLICATE_EMAIL: "Email đã được sử dụng",
    INVALID_ID: "ID không hợp lệ",
  },

  VALIDATION: {
    REQUIRED: "Trường này là bắt buộc",
    INVALID_EMAIL: "Email không hợp lệ",
    INVALID_FORMAT: "Định dạng không hợp lệ",
    MIN_LENGTH: "Độ dài tối thiểu là {min} ký tự",
    MAX_LENGTH: "Độ dài tối đa là {max} ký tự",
    PASSWORD_MIN: "Mật khẩu phải có ít nhất 6 ký tự",
    INVALID_UUID: "UUID không hợp lệ",
    INVALID_DATE: "Ngày tháng không hợp lệ",
    INVALID_NUMBER: "Số không hợp lệ",
    POSITIVE_NUMBER: "Số phải lớn hơn 0",
  },

  PRODUCT: {
    NOT_FOUND: "Không tìm thấy sản phẩm",
    CREATED: "Tạo sản phẩm thành công",
    UPDATED: "Cập nhật sản phẩm thành công",
    DELETED: "Xóa sản phẩm thành công",
    CODE_EXISTS: "Mã sản phẩm đã tồn tại",
    HAS_TRANSACTIONS: "Không thể xóa sản phẩm vì đã có lịch sử giao dịch (nhập kho hoặc bán hàng)",
  },

  IMPORT: {
    NOT_FOUND: "Không tìm thấy phiếu nhập kho",
    CREATED: "Tạo phiếu nhập kho thành công",
  },

  SALE: {
    NOT_FOUND: "Không tìm thấy hóa đơn bán hàng",
    CREATED: "Tạo hóa đơn bán hàng thành công",
    INSUFFICIENT_STOCK: "Số lượng tồn kho không đủ để bán sản phẩm",
  },

  REPORT: {
    INVALID_DATE_RANGE: "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc",
  },
} as const;

// Helper type for message keys
export type MessageKey = keyof typeof MSG;
export type SuccessMessageKey = keyof typeof MSG.SUCCESS;
export type ErrorMessageKey = keyof typeof MSG.ERROR;
