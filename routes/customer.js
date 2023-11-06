import express from "express";
import { getCustomer, postCustomer, putCustomer, deleteCustomer } from "../controllers/customer.js";

const router = express.Router();

router.post("/", postCustomer);
router.get("/:id", getCustomer);
router.put("/:id", putCustomer);
router.delete("/:id", deleteCustomer);

export default router;
