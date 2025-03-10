import { Module } from '@nestjs/common';
import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { registedEntities } from './entities';
import { sharedServices } from './share.services';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [],
  exports: [],
})
export class SystemModule {
  static forRoot(global: boolean = false) {
    return {
      global,
      module: SystemModule,
      imports: [ConfigModule, TypeOrmModule.forFeature([...registedEntities])],
      providers: [...sharedServices],
      exports: [...sharedServices],
    } as DynamicModule;
  }
}
