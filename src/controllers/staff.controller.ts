import { NextFunction, Request, Response } from 'express';
import { RoleEnum, UserStatusEnum } from '../utils/enums';
import { staffService } from '../services/staff.service';
import { IStaff } from '../interfaces/staff.interface';

export default class StaffController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(200).json({
        message: 'Get all staff success',
        data: await staffService.getAll()
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;
    try {
      return res.status(200).json({
        message: 'Get staff by id success',
        data: await staffService.getById(id)
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    const {
      username,
      email,
      password,
      gender,
      firstName,
      lastName,
      phone,
      dob,
      branch,
      manager
    } = req.body;
    const staffDTO: IStaff = {
      username,
      email,
      password,
      gender,
      firstName,
      lastName,
      phone,
      dob,
      role: RoleEnum.STAFF,
      status: UserStatusEnum.ACTIVE,
      branch,
      manager
    };

    try {
      await staffService.createStaff(staffDTO);
      return res.status(201).json({
        message: 'Create staff Successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;
    const { gender, firstName, lastName, phone, dob } = req.body;
    const managerDTO: Partial<IStaff> = {
      gender,
      firstName,
      lastName,
      phone,
      dob
    };
    try {
      await staffService.update(id, managerDTO);
      return res.status(200).json({
        message: 'Update staff success'
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    const id: string = req.params.id;
    try {
      await staffService.delete(id);
      return res.status(200).json({
        message: 'Delete staff success'
      });
    } catch (error) {
      next(error);
    }
  }
}