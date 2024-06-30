import { BaseService } from './base.service';
import packageCourtModel from '../models/packageCourt.model';
import { IPackageCourt } from '../interfaces/packageCourt.interface';
import { IBuyPackage } from '../interfaces/buyPackage.interface';
import { NotFoundError } from '../errors/notFound';
import { managerService } from './manager.service';
import packagePurchaseModel from '../models/packagePurchase.model';
import {
  PackageCourtTypeEnum,
  PackagePurchaseStatusEnum,
  PaymentMethodEnum,
  TransactionTypeEnum
} from '../utils/enums';
import { BadRequestError } from '../errors/badRequestError';
import transactionModel from '../models/transaction.model';
import adminModel from '../models/admin.model';
import moment from 'moment';

class PackageCourtService extends BaseService<IPackageCourt> {
  constructor() {
    super(packageCourtModel);
  }

  async createPackage(packageCourtDTO: IPackageCourt) {
    if (packageCourtDTO.type == PackageCourtTypeEnum.STANDARD) {
      await packageCourtModel.create({
        name: packageCourtDTO.name,
        totalPrice: packageCourtDTO.totalPrice,
        maxCourt: packageCourtDTO.maxCourt,
        duration: packageCourtDTO.duration,
        description: packageCourtDTO.description,
        type: packageCourtDTO.type
      });
    }
    await packageCourtModel.create({
      name: packageCourtDTO.name,
      priceEachCourt: packageCourtDTO.priceEachCourt,
      duration: packageCourtDTO.duration,
      description: packageCourtDTO.description,
      type: packageCourtDTO.type
    });
  }

  async beforeCreate(data: IPackageCourt): Promise<void> {
    if (data.type == PackageCourtTypeEnum.CUSTOM) {
      if (data.duration)
        throw new BadRequestError('Custom package can not have Duration info');
      if (data.maxCourt)
        throw new BadRequestError('Custom package can not have Max Court info');
      if (data.totalPrice)
        throw new BadRequestError(
          'Custom package can not have Total Price info'
        );
    }
  }

  async buyPackageFull(buyPackageDTO: Partial<IBuyPackage>) {
    const packageCourt: IPackageCourt = await packageCourtService.getById(
      buyPackageDTO.packageId
    );
    if (!packageCourt) throw new NotFoundError('Package not found');
    const manager = await managerService.getById(buyPackageDTO.managerId);

    const currentDate = new Date();
    if (manager.expiredDate && manager.expiredDate > currentDate) {
      throw new BadRequestError(
        'You cannot purchase a new court package as your current package is still active'
      );
    }

    const duration = packageCourt.duration;
    const totalCourt = packageCourt.maxCourt || buyPackageDTO.totalCourt;
    const totalPrice =
      packageCourt.totalPrice ||
      packageCourt.priceEachCourt * buyPackageDTO.totalCourt;

    const startDateOfPackagePurchase = new Date(
      manager.expiredDate || new Date()
    );
    startDateOfPackagePurchase.setDate(
      startDateOfPackagePurchase.getDate() + 1
    );
    const endDateOfPackagePurchase = new Date(startDateOfPackagePurchase);
    endDateOfPackagePurchase.setMonth(
      endDateOfPackagePurchase.getMonth() + duration
    );

    const createdPackagePurchase = {
      totalPrice,
      totalCourt,
      duration,
      priceEachCourt: packageCourt.priceEachCourt,
      startDate: startDateOfPackagePurchase,
      endDate: endDateOfPackagePurchase,
      manager: buyPackageDTO.managerId,
      packageCourt: buyPackageDTO.packageId,
      status: PackagePurchaseStatusEnum.ACTIVE
    };
    await packagePurchaseModel.create(createdPackagePurchase);

    managerService.update(manager._id, {
      expiredDate: endDateOfPackagePurchase,
      maxCourt: createdPackagePurchase.totalCourt
    });

    transactionModel.create({
      amount: totalPrice,
      from: buyPackageDTO.managerId,
      to: await adminModel.findOne({}),
      content: `Manager ${manager.firstName} orders package purchase on ${moment(new Date()).format('YYYY-MM-DD')}`,
      type: TransactionTypeEnum.PACKAGE,
      paymentMethod: PaymentMethodEnum.LINKED_ACCOUNT,
      payment: buyPackageDTO.paymentId
    });
  }

  async buyPackageCourt(buyPackageDTO: IBuyPackage) {
    const packageCourt: IPackageCourt = await packageCourtService.getById(
      buyPackageDTO.packageId
    );
    if (!packageCourt) throw new NotFoundError('Package not found');
    const manager = await managerService.getById(buyPackageDTO.managerId);
    if (!manager) throw new NotFoundError('Manager not found');

    if (packageCourt.type == PackageCourtTypeEnum.CUSTOM) {
      if (packageCourt.maxCourt > 20)
        throw new BadRequestError(
          'Custom package can only be bought for maximum 20 courts'
        );
    }

    const currentDate = new Date();
    if (manager.expiredDate && manager.expiredDate > currentDate) {
      throw new BadRequestError(
        'You cannot purchase a new court package as your current package is still active'
      );
    }

    const duration = packageCourt.duration || 1;
    const totalCourt = packageCourt.maxCourt || buyPackageDTO.totalCourt;
    const totalPrice =
      packageCourt.totalPrice ||
      packageCourt.priceEachCourt * buyPackageDTO.totalCourt;

    const startDateOfPackagePurchase = new Date(
      manager.expiredDate || new Date()
    );
    startDateOfPackagePurchase.setDate(
      startDateOfPackagePurchase.getDate() + 1
    );
    const endDateOfPackagePurchase = new Date(startDateOfPackagePurchase);
    endDateOfPackagePurchase.setMonth(
      endDateOfPackagePurchase.getMonth() + duration
    );

    const createdPackagePurchase = {
      totalPrice,
      totalCourt,
      duration,
      priceEachCourt: packageCourt.priceEachCourt,
      startDate: startDateOfPackagePurchase,
      endDate: endDateOfPackagePurchase,
      manager: buyPackageDTO.managerId,
      packageCourt: buyPackageDTO.packageId
    };
    await packagePurchaseModel.create(createdPackagePurchase);

    managerService.update(manager._id, {
      expiredDate: endDateOfPackagePurchase,
      maxCourt: createdPackagePurchase.totalCourt
    });
  }
}

export const packageCourtService = new PackageCourtService();
