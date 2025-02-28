const router = require("express").Router();
const { authorization } = require("../../middlewares/authMiddlewares");
const {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  toggleSubject,
  getSubjectByStandard,
} = require("../../controllers/admin/subjectcontroller");

router.post("/subjectcreate", authorization(true), createSubject);
router.get("/allsubjects", authorization(true), getAllSubjects);
router.get("/idsubject/:id", authorization(true), getSubjectById);
router.put("/updatesubject/:id", authorization(true), updateSubject);
router.post("/togglesubject", authorization(true), toggleSubject);

module.exports = router;
