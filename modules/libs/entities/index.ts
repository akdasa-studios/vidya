import { Organization } from './organization';
import { School } from './school';
import { Course, LearningType } from './course';
import { Group, GroupStatus } from './group';
import { Lesson } from './lesson';
import { User } from './user';
import { Role } from './role';
import { UserRole } from './userRole';

export {
  Course,
  Group,
  GroupStatus,
  LearningType,
  Lesson,
  Organization,
  School,
  User,
  Role,
  UserRole,
};

export const Entities = [
  Course,
  Group,
  Lesson,
  Organization,
  School,
  User,
  Role,
  UserRole
];
