/* =========================================================
   ROUTES — Blood Requests
   Base: /api/requests
========================================================= */

const express             = require("express");
const router              = express.Router();
const requestController   = require("../controllers/requestController");
const protect             = require("../middleware/protect");

// POST  /api/requests             — Create a request + get matches (protected)
router.post("/",          protect, requestController.createRequest);

// GET   /api/requests             — Get all requests (protected)
router.get("/",           protect, requestController.getRequests);

// GET   /api/requests/:id         — Get single request + matches (protected)
router.get("/:id",        protect, requestController.getRequestById);

// PATCH /api/requests/:id/status  — Update request status (protected)
router.patch("/:id/status", protect, requestController.updateRequestStatus);

module.exports = router;
