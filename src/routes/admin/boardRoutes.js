const router = require("express").Router();
const { authorization } = require("../../middlewares/authMiddlewares");
const {
  createBoard,
  getAllBoards,
  getBoardById,
  updateBoard,
  toggleActive,
} = require("../../controllers/admin/boardcontroller");

router.post("/createboard", authorization(true), createBoard);
router.get("/allboard", authorization(true), getAllBoards);
router.get("/getbyidboard/:id", authorization(true), getBoardById);
router.put("/updateboard/:id", authorization(true), updateBoard);
router.post("/toggleboard", authorization(true), toggleActive);

module.exports = router;
