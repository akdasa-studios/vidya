import { faker } from '@faker-js/faker';
import { Role, School, User } from '@vidya/entities'
import { MainDataSource } from '@vidya/database'

MainDataSource.initialize().then(async (connection) => {
  const schools = connection.getRepository(School);
  const roles = connection.getRepository(Role);
  const users = connection.getRepository(User);

  /* -------------------------------------------------------------------------- */
  /*                               Clear All Data                               */
  /* -------------------------------------------------------------------------- */

  await users.query(`TRUNCATE TABLE "userRoles", "users", "roles", "schools" CASCADE`);

  const seeds = [
    { ownerEmail: 'example@example.com' },
    { ownerEmail: faker.internet.email() },
    { ownerEmail: faker.internet.email() }
  ]

  for (const seed of seeds) {
    /* -------------------------------------------------------------------------- */
    /*                                   Schools                                  */
    /* -------------------------------------------------------------------------- */

    const school = await schools.save({
      name: faker.company.name()
    })

    /* -------------------------------------------------------------------------- */
    /*                                    Roles                                   */
    /* -------------------------------------------------------------------------- */

    const roleOwner = await roles.save({
      name: 'Owner',
      description: 'Owner of the school',
      permissions: ['*'],
      schoolId: school.id
    })

    const roleStudent = await roles.save({
      name: 'Student',
      description: 'Student of the school',
      permissions: ['roles:read', 'schools:read', 'users:read'],
      schoolId: school.id
    })

    /* -------------------------------------------------------------------------- */
    /*                                    Users                                   */
    /* -------------------------------------------------------------------------- */

    await users.save({
      email: seed.ownerEmail,
      name: faker.person.fullName(),
      phone: faker.phone.number({ style: 'international' }),
      roles: [roleOwner]
    })

    for (let i = 0; i < 10; i++) {
      await users.save({
        email: faker.internet.email(),
        name: faker.person.fullName(),
        phone: faker.phone.number({ style: 'international' }),
        roles: [roleStudent]
      })
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                    Done                                    */
  /* -------------------------------------------------------------------------- */

  await connection.destroy()
})
