const router = require("express").Router();
const {
  createLesson,
  getAllLessons,
  getLessonById,
  updateLesson,
  toggleActive,
} = require("../../controllers/admin/lessoncontrollers");
const { authorization } = require("../../middlewares/authMiddlewares");

router.post("/create", authorization(true), createLesson);
router.get("/alllesson", authorization(true), getAllLessons);
router.get("/getbyidlesson/:id", authorization(true), getLessonById);
router.put("/updatelesson/:id", authorization(true), updateLesson);
router.post("/togglelesson", authorization(true), toggleActive);

module.exports = router;
