import { StatusEnum } from '@tsailab/core-types';
import { OrganizationEntity } from '../entities';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationTreeNode {
  id: number;
  pid?: number;
  name: string;
  orgno: string;
  code?: string;
  sortno?: number;
  status?: StatusEnum;
  shortName?: string;
  locking?: boolean;
  icon?: string;
  level?: number;
  description?: string;
  expand?: boolean;
  children?: OrganizationTreeNode[] | null;
}

export class AddOrganizationModel {
  @ApiProperty({ required: true, description: '组织父级ID' })
  @IsNotEmpty({ message: 'PID 为必选参数' })
  @IsNumber()
  pid: number;

  @ApiProperty({ required: true, description: '组织名称' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: true, description: '组织编码' })
  code?: string;

  @ApiProperty({ required: true, description: '组织简称' })
  shortName?: string;

  @ApiProperty({ required: true, description: '组织图标' })
  icon?: string;

  @ApiProperty({ required: true, description: '组织描述' })
  description?: string;
}

export class UpdateOrganizationModel
  implements
    Pick<
      OrganizationEntity,
      | 'id'
      | 'pid'
      | 'name'
      | 'shortName'
      | 'icon'
      | 'contact'
      | 'email'
      | 'phone'
      | 'status'
      | 'description'
    >
{
  id: number;
  pid?: number;
  contact?: string;
  email?: string;
  phone?: string;
  status: StatusEnum;
  name: string;
  code?: string;
  shortName?: string;
  icon?: string;
  description?: string;
}

export class UpdateOrganizationLevel {
  id: number;
  pid: number;
  level: number;
}
