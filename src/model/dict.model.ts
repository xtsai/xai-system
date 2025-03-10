import { ApiProperty } from '@nestjs/swagger';
import { QueryOptionsDto } from '@xtsai/core';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class QueryDictItemModel extends QueryOptionsDto {
  @ApiProperty({ name: 'dictId' })
  @IsNotEmpty()
  dictId: number;
}

export class SysDictBaseModel {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty({ message: '字典名称不能为空' })
  name: string;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty({ message: '字典编码不能为空' })
  code: string;

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  tag: string;

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  icon: string;

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  remark: string;
}

export class SysDictModel extends SysDictBaseModel {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  id: number;
}

export class SysDictItemBaseModel {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  dictId: number;

  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  label: string;
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  icon: string;

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  remark: string;

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  extra?: Record<string, any>;
}

export class SysDictItemModel extends SysDictItemBaseModel {
  @ApiProperty({
    nullable: false,
  })
  @IsNotEmpty()
  id: number;
}

export class DictItemDefaultActivedModel {
  id: number;
  dictId: number;
}
