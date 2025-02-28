const router = require("express").Router();
const { authorization } = require("../../middlewares/authMiddlewares");
const {
  createMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
  toggleActive,
} = require("../../controllers/admin/materialcontroller");

router.post("/create", authorization(true), createMaterial);
router.get("/allmaterial", authorization(true), getAllMaterials);
router.get("/idmaterial/:id", authorization(true), getMaterialById);
router.post("/updatematerial", authorization(true), updateMaterial);
router.post("/togglematerial", authorization(true), toggleActive);

module.exports = router;
