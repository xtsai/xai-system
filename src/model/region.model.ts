import { ApiProperty } from '@nestjs/swagger';
import { StatusEnum } from '@tsailab/core-types';
import { QueryOptionsDto } from '@xtsai/core';
import { IsNotEmpty } from 'class-validator';

export class QuerySubRegionOptionModel extends QueryOptionsDto {
  @ApiProperty({ name: 'pid', description: '上级行政区划ID' })
  @IsNotEmpty()
  pid: number;
}

export type RegionModelType = {
  id: number;
  pid: number;
  name: string;
  code: string;
  value: string;
  tag: string;
  remark: string;
  extra?: Record<string, any>;
  createdBy?: number;
  createdAt?: Date;
  updatedBy?: number;
  updatedAt?: Date;
  sortno?: number;
  status?: StatusEnum;
};
