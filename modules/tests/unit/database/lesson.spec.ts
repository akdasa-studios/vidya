import { Organization, School, Course, Lesson } from "@vidya/entities";
import { QueryFailedError } from "typeorm";
import { dataSource } from "./helpers/dataSource";

describe('Lesson', () => {
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

  test('should create a lesson', async () => {
    // Arrange
    const lesson = new Lesson();
    lesson.course = course;
    lesson.lessonNumber = 1;
    lesson.title = 'test lesson';
    lesson.content = { key: 'value' };

    // Act
    const result = await dataSource.manager.save(lesson);

    // Assert
    expect(result.id).toBeDefined();
    expect(result.courseId).toBe(course.id);
    expect(result.course.name).toBe(course.name);
  });

  test('should raise error if no course specified', async () => {
    // Arrange
    const lesson = new Lesson();
    lesson.lessonNumber = 1;
    lesson.title = 'test lesson';
    lesson.content = { key: 'value' };

    // Act
    const save = async () => await dataSource.manager.save(lesson);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });

  test('should raise error for duplicate lessonNumber', async () => {
    // Arrange
    const lesson1 = new Lesson();
    lesson1.course = course;
    lesson1.lessonNumber = 1;
    lesson1.title = 'test lesson 1';
    lesson1.content = { key: 'value' };
    await dataSource.manager.save(lesson1);

    const lesson2 = new Lesson();
    lesson2.course = course;
    lesson2.lessonNumber = 1;
    lesson2.title = 'test lesson 2';
    lesson2.content = { key: 'value' };

    // Act
    const save = async () => await dataSource.manager.save(lesson2);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });

  test('should raise error for duplicate title', async () => {
    // Arrange
    const lesson1 = new Lesson();
    lesson1.course = course;
    lesson1.lessonNumber = 1;
    lesson1.title = 'test lesson';
    lesson1.content = { key: 'value' };
    await dataSource.manager.save(lesson1);

    const lesson2 = new Lesson();
    lesson2.course = course;
    lesson2.lessonNumber = 2;
    lesson2.title = 'test lesson';
    lesson2.content = { key: 'value' };

    // Act
    const save = async () => await dataSource.manager.save(lesson2);

    // Assert
    await expect(save).rejects.toThrow(QueryFailedError);
  });
});
