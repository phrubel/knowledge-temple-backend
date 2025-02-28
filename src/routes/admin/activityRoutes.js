const router = require("express").Router();
const { authorization } = require("../../middlewares/authMiddlewares");
const {
  createActivity,
  getAllActivities,
  getActivityById,
  updateActivity,
  toggleActive,
} = require("../../controllers/admin/activitycontroller");

router.post("/createactivity", authorization(true), createActivity);
router.get("/allactivity", authorization(true), getAllActivities);
router.get("/idactivity/:id", authorization(true), getActivityById);
router.put("/updateactivity/:id", authorization(true), updateActivity);
router.post("/toggleactivity", authorization(true), toggleActive);

module.exports = router;
