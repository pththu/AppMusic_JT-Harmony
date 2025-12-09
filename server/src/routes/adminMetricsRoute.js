const express = require('express');
const router = express.Router();
const adminMetricsController = require('../controllers/adminMetricsController');

// /api/v1/admin/metrics
router.get('/summary', adminMetricsController.getSummary); // lấy summary
router.get('/timeseries/:kind', adminMetricsController.getTimeseries); // kind: posts|comments|likes|messages|conversations, lấy chuỗi thời gian (timeseries) cho 1 loại dữ liệu
router.get('/reports/status-breakdown', adminMetricsController.getReportsStatusBreakdown); // lấy số lượng báo cáo theo trạng thái
router.get('/posts/cover-breakdown', adminMetricsController.getPostsCoverBreakdown); // lấy số lượng bài đăng có cover và không cover
router.get('/top/posts', adminMetricsController.getTopPosts); // lấy top 5 bài đăng có lượt thích cao nhất
router.get('/top/users', adminMetricsController.getTopUsers); // lấy top 5 người dùng có bài đăng cao nhất

router.get('/behavior/search', adminMetricsController.analyzeBehaviorSearch); // phân tích hành vi tìm kiếm

module.exports = router;
