import { IsNotEmpty, IsOptional } from 'class-validator';

export class BaseCategoryModel {
  @IsNotEmpty()
  title: string;
  @IsOptional()
  icon: string;
  @IsOptional()
  image: string;
  @IsOptional()
  group: string;
  @IsOptional()
  tag: string;
  @IsOptional()
  path: string;
  @IsOptional()
  url: string;
  @IsOptional()
  richcontent: string;
  @IsOptional()
  remark: string;
}

export class CreateCategoryModel extends BaseCategoryModel {
  @IsOptional()
  pid: number;
  @IsOptional()
  uuid: number;
}

export class UpdateCategoryModel extends BaseCategoryModel {
  @IsNotEmpty()
  id: number;
  @IsNotEmpty()
  pid: number;
  @IsOptional()
  uuid: number;
}
