import express from 'express';
import auth from '../middlewares/auth';
import PackagePurchaseController from '../controllers/packagePurchase.controller';

const router = express.Router();
// router.use(auth);
router.get('/', PackagePurchaseController.getAll);
router.get('/:id', PackagePurchaseController.getById);
router.post('/buy-package', PackagePurchaseController.buyPackageCourt);
router.get(
  '/get-purchases/:managerId',
  PackagePurchaseController.getPurchasesOfManager
);

export default router;