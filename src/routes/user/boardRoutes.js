"use strict";

const router = require("express").Router();
const boardController = require("../../controllers/user/boardController");
const { authorization } = require("../../middlewares/authMiddlewares");

router.get("/getBoards", authorization(), boardController.getAllBoard);

module.exports = router;
