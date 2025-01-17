import { Organization, School, Course, LearningType } from "@vidya/entities";
import { QueryFailedError } from "typeorm";
import { dataSource } from "./helpers/dataSource";

describe('Course', () => {
  let org: Organization;
  let school: School;

  beforeEach(async () => {
    org = new Organization();
    org.name = 'organization';
    await dataSource.manager.save(org);

    school = new School();
    school.name = 'school';
    school.organization = org;
    await dataSource.manager.save(school);
  });

  test('should create a course', async () => {
    // Arrange
    const course = new Course();
    course.name = 'test course';
    course.school = school;

    // Act
    const result = await dataSource.manager.save(course);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.schoolId).toBe(school.id);
    expect(result.school.name).toBe(school.name);
  });

  test('should default learningType to individual', async () => {
    // Arrange
    const course = new Course();
    course.name = 'test course';
    course.school = school;

    // Act
    const result = await dataSource.manager.save(course);

    // Assert
    expect(result.learningType).toBe(LearningType.Individual);
  });

  it.each(
    Object.values(LearningType),
  )('should set learningType to "%s"', async (value: LearningType) => {
    // Arrange
    const course = new Course();
    course.name = 'test course';
    course.school = school;
    course.learningType = value;

    // Act
    const result = await dataSource.manager.save(course);

    // Assert
    expect(result.learningType).toBe(value);
  });

  test('should raise error for invalid learningType', async () => {
    // Arrange
    const course = new Course();
    course.name = 'test course';
    course.school = school;
    course.learningType = 'invalidType' as LearningType;

    // Act
    const save = async () => await dataSource.manager.save(course);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });

  test('should raise error if no school specified', async () => {
    // Arrange
    const course = new Course();
    course.name = 'test course';

    // Act
    const save = async () => await dataSource.manager.save(course);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });
});
