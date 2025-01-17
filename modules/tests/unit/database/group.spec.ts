import { Organization, School, Course, Group, GroupStatus } from "@vidya/entities";
import { QueryFailedError } from "typeorm";
import { dataSource } from "./helpers/dataSource";

describe('Group', () => {
  let org: Organization;
  let school: School;
  let course: Course;

  beforeEach(async () => {
    org = new Organization();
    org.name = 'organization';
    await dataSource.manager.save(org);

    school = new School();
    school.name = 'school';
    school.organization = org;
    await dataSource.manager.save(school);

    course = new Course();
    course.name = 'course';
    course.school = school;
    await dataSource.manager.save(course);
  });

  test('should create a group', async () => {
    // Arrange
    const group = new Group();
    group.name = 'test group';
    group.course = course;

    // Act
    const result = await dataSource.manager.save(group);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.courseId).toBe(course.id);
    expect(result.course.name).toBe(course.name);
  });

  test('should default status to pending', async () => {
    // Arrange
    const group = new Group();
    group.name = 'test group';
    group.course = course;

    // Act
    const result = await dataSource.manager.save(group);

    // Assert
    expect(result.status).toBe(GroupStatus.Pending);
  });

  it.each([
    GroupStatus.Pending,
    GroupStatus.Active,
    GroupStatus.Inactive
  ])('should set status to "%s"', async (value: GroupStatus) => {
    // Arrange
    const group = new Group();
    group.name = 'test group';
    group.course = course;
    group.status = value;

    // Act
    const result = await dataSource.manager.save(group);

    // Assert
    expect(result.status).toBe(value);
  });

  test('should raise error for invalid status', async () => {
    // Arrange
    const group = new Group();
    group.name = 'test group';
    group.course = course;
    group.status = 'invalidStatus' as GroupStatus;

    // Act
    const save = async () => await dataSource.manager.save(group);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });

  test('should raise error if no course specified', async () => {
    // Arrange
    const group = new Group();
    group.name = 'test group';

    // Act
    const save = async () => await dataSource.manager.save(group);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });
});
