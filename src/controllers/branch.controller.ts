import { NextFunction, Request, Response } from 'express';
import { IBranch } from '../interfaces/branch.interface';
import { branchService } from '../services/branch.service';
import { BranchStatusEnum } from '../utils/enums';

export default class BranchController {
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const key: Partial<IBranch> = req.body;
      const branchs = await branchService.search(key);
      return res.status(200).json({
        message: 'Search success',
        data: branchs
      });
    } catch (err) {
      next(err);
    }
  }
  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    const { branchId, status } = req.body;
    try {
      await branchService.updateStatus(branchId, status);
      return res.status(200).json({
        message: 'Update status success'
      });
    } catch (err) {
      next(err);
    }
  }
  static async handleRequest(req: Request, res: Response, next: NextFunction) {
    const { approve, branchId } = req.body;
    try {
      await branchService.handleRequest(branchId, approve);
      return res.status(200).json({
        message: approve ? 'Approve request success' : 'Deny request success'
      });
    } catch (err) {
      next(err);
    }
  }
  static async getPendingBranches(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      return res.status(200).json({
        message: 'Get pending branches success',
        data: await branchService.search({ status: BranchStatusEnum.PENDING })
      });
    } catch (error) {
      next(error);
    }
  }
  static async requestCreateBranch(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const {
      name,
      phone,
      address,
      license,
      images,
      description,
      managerId,
      courts,
      availableTime,
      slots
    } = req.body;
    const branchDTO: IBranch = {
      name,
      phone,
      address,
      license,
      images,
      availableTime,
      description,
      manager: managerId,
      status: BranchStatusEnum.PENDING,
      courts,
      slots
    };
    try {
      await branchService.requestCreateBranch(branchDTO);
      return res.status(200).json({
        message: 'Send create branch request success'
      });
    } catch (error) {
      next(error);
    }
  }
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({
        message: 'Get all branches success',
        data: await branchService.getAll()
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllBranchesOfManager(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const managerId = req.params.id;
    try {
      return res.status(200).json({
        message: 'Get branches success',
        data: await branchService.getAllBranchesOfManager(managerId)
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;
    try {
      return res.status(200).json({
        message: 'Get branch success',
        data: await branchService.getById(id)
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;
    const { name, phone, address, license, description, availableTime } =
      req.body;
    const branchDTO: Partial<IBranch> = {
      name,
      phone,
      address,
      license,
      description,
      availableTime
    };
    try {
      await branchService.update(id, branchDTO);
      return res.status(200).json({
        message: 'Update branch success'
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;
    try {
      await branchService.update(id, { status: BranchStatusEnum.INACTIVE });
      return res.status(200).json({
        message: 'Delete branch success'
      });
    } catch (error) {
      next(error);
    }
  }
}
