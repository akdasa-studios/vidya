import { Delete, Get, Patch, Post } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function CrudDecorators(
  entityName: string,
  getOneResponseDto: any,
  getManyResponseDto: any,
  updateOneResponseDto: any,
  deleteOneResponseDto: any,
  createDto: any,
) {
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
        summary: `Get one ${entityName} by Id`,
        operationId: `${entityName}::getOne`,
      })(target, propertyKey, descriptor);
      ApiOkResponse({
        type: getOneResponseDto,
        description: `${entityName} details`,
      })(target, propertyKey, descriptor);
      ApiNotFoundResponse({
        description: `${entityName} not found`,
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
        summary: `Get many ${entityName}s`,
        operationId: `${entityName}::getMany`,
      })(target, propertyKey, descriptor);
      ApiOkResponse({
        type: getManyResponseDto,
        description: `List of ${entityName}s`,
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
        summary: `Create a new ${entityName}`,
        operationId: `${entityName}::create`,
      })(target, propertyKey, descriptor);
      ApiOkResponse({
        type: createDto,
        description: `${entityName} created successfully`,
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
        summary: `Update a ${entityName}`,
        operationId: `${entityName}::update`,
      })(target, propertyKey, descriptor);
      ApiOkResponse({
        type: updateOneResponseDto,
        description: `${entityName} updated successfully`,
      })(target, propertyKey, descriptor);
      ApiNotFoundResponse({
        description: `${entityName} not found`,
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
        summary: `Delete a ${entityName}`,
        operationId: `${entityName}::delete`,
      })(target, propertyKey, descriptor);
      ApiOkResponse({
        type: deleteOneResponseDto,
        description: `${entityName} deleted successfully`,
      })(target, propertyKey, descriptor);
      ApiNotFoundResponse({
        description: `${entityName} not found`,
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
