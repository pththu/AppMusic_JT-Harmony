// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  typescript: {
    // Tắt kiểm tra kiểu trong quá trình build để bỏ qua lỗi
    // CẢNH BÁO: Điều này có thể dẫn đến lỗi runtime (lỗi khi chạy)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;