import { Organization } from './organization';
import { School } from './school';
import { Course, LearningType } from './course';
import { Group, GroupStatus } from './group';
import { Lesson } from './lesson';

export {
  Course,
  Group,
  GroupStatus,
  LearningType,
  Lesson,
  Organization,
  School
};

export const Entities = [
  Course,
  Group,
  Lesson,
  Organization,
  School
];
