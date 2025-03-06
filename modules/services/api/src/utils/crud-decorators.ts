import { Delete, Get, Patch, Post } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function CrudDecorators(options: {
  entityName: string;
  getOneResponseDto?: any;
  getManyResponseDto?: any;
  updateOneResponseDto?: any;
  deleteOneResponseDto?: any;
  createOneResponseDto?: any;
}) {
  /* -------------------------------------------------------------------------- */
  /*                                   Get One                                  */
  /* -------------------------------------------------------------------------- */

  function GetOne(route: string) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      Get(route)(target, propertyKey, descriptor);
      ApiOperation({
        summary: `Get one ${options.entityName} by Id`,
        operationId: `${options.entityName}::getOne`,
      })(target, propertyKey, descriptor);
      ApiOkResponse({
        type: options.getOneResponseDto,
        description: `${options.entityName} details`,
      })(target, propertyKey, descriptor);
      ApiNotFoundResponse({
        description: `${options.entityName} not found`,
      })(target, propertyKey, descriptor);
      ApiUnauthorizedResponse({
        description: 'Unauthorized',
      })(target, propertyKey, descriptor);

      return descriptor;
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Get Many                                  */
  /* -------------------------------------------------------------------------- */

  function GetMany(route: string) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      Get(route)(target, propertyKey, descriptor);
      ApiOperation({
        summary: `Get many ${options.entityName}s`,
        operationId: `${options.entityName}::getMany`,
      })(target, propertyKey, descriptor);
      ApiOkResponse({
        type: options.getManyResponseDto,
        description: `List of ${options.entityName}s`,
      })(target, propertyKey, descriptor);
      ApiUnauthorizedResponse({
        description: 'Unauthorized',
      })(target, propertyKey, descriptor);

      return descriptor;
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Create One                                 */
  /* -------------------------------------------------------------------------- */

  function CreateOne(route: string) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      Post(route)(target, propertyKey, descriptor);
      ApiOperation({
        summary: `Create a new ${options.entityName}`,
        operationId: `${options.entityName}::create`,
      })(target, propertyKey, descriptor);
      ApiOkResponse({
        type: options.createOneResponseDto,
        description: `${options.entityName} created successfully`,
      })(target, propertyKey, descriptor);
      ApiUnauthorizedResponse({
        description: 'Unauthorized',
      })(target, propertyKey, descriptor);

      return descriptor;
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Update One                                 */
  /* -------------------------------------------------------------------------- */

  function UpdateOne(route: string) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      Patch(route)(target, propertyKey, descriptor);
      ApiOperation({
        summary: `Update a ${options.entityName}`,
        operationId: `${options.entityName}::update`,
      })(target, propertyKey, descriptor);
      ApiOkResponse({
        type: options.updateOneResponseDto,
        description: `${options.entityName} updated successfully`,
      })(target, propertyKey, descriptor);
      ApiNotFoundResponse({
        description: `${options.entityName} not found`,
      })(target, propertyKey, descriptor);
      ApiUnauthorizedResponse({
        description: 'Unauthorized',
      })(target, propertyKey, descriptor);

      return descriptor;
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Delete One                                 */
  /* -------------------------------------------------------------------------- */

  function DeleteOne(route: string) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      Delete(route)(target, propertyKey, descriptor);
      ApiOperation({
        summary: `Delete a ${options.entityName}`,
        operationId: `${options.entityName}::delete`,
      })(target, propertyKey, descriptor);
      ApiOkResponse({
        type: options.deleteOneResponseDto,
        description: `${options.entityName} deleted successfully`,
      })(target, propertyKey, descriptor);
      ApiNotFoundResponse({
        description: `${options.entityName} not found`,
      })(target, propertyKey, descriptor);
      ApiUnauthorizedResponse({
        description: 'Unauthorized',
      })(target, propertyKey, descriptor);

      return descriptor;
    };
  }

  return {
    GetOne,
    GetMany,
    CreateOne,
    UpdateOne,
    DeleteOne,
  };
}
