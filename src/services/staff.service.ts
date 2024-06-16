import { BaseService } from './base.service';
import { EmailAlreadyExistError } from '../errors/emailAlreadyExistError';
import { encryptedPassword } from '../utils/jwt';
import { IStaff } from '../interfaces/staff.interface';
import { managerService } from './manager.service';
import { NotFoundError } from '../errors/notFound';
import { branchService } from './branch.service';
import staffModel from '../models/staff.model';
import { userService } from './user.service';

class StaffService extends BaseService<IStaff> {
  constructor() {
    super(staffModel);
  }

  async createStaff(staffDTO: IStaff) {
    const emailUserExist = await userService.search({ email: staffDTO.email });
    if (emailUserExist.length > 0) throw new EmailAlreadyExistError();

    const manager = await managerService.getById(staffDTO.manager);
    if (!manager) throw new NotFoundError('Manager not found');

    const branch = await branchService.getById(staffDTO.branch);
    if (!branch) throw new NotFoundError('Branch not found');

    staffDTO.password = await encryptedPassword(staffDTO.password);
    const savedStaff = await this.model.create(staffDTO);
    return savedStaff;
  }
}

export const staffService = new StaffService();