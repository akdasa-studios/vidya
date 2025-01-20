# Entity Relationship Diagram

Here are the entity relationship diagrams for the Viraha project. The diagrams are created using the [Mermaid](https://mermaid-js.github.io/mermaid/#/) library.

## Organization and Permission Management

*Organization* is the top-level entity that represents a company. Each organization can have multiple schools. For example "Bhaktilata" and "Archana" can be two schools under the same organization "Prabhupada School".

*School* is a sub-entity of Organization. School belongs to one organization. Each school can have multiple *Courses** *Groups* and so on.

*Role* is a set of permissions that can be assigned to a user. Each role can have multiple permissions, for example: "create coures", "create groups", "edit lessons" etc. Roles can be defined at the organization level or at the school level. Roles can be assigned to users. A user can have multiple roles. For example, a user can have a "teacher" role in one school and a "student" role in another school.

*User* is a person who can log in to the system. A user can be assigned to one or more roles. A user can be a member of one or more schools. A user can have different roles in different schools.

```mermaid
erDiagram
    Organization {
        uuid id PK
        string name
    }

    School {
        uuid id PK
        string name
        string organizationId FK
    }

    Role {
        uuid id PK
        string name
        string description
        string organizationId
        opt[string] schoolId
        string[] permissions
    }

    User {
        uuid id PK
        string(99) email UK
        string name
        enum status
        string avatarUrl
    }


    UserRole {
        uuid id PK
        string userId FK
        string roleId FK
    }

    Organization ||--o{ School : ""
    Organization ||--o{ Role : ""
    School ||--o{ Role : ""
    User }o--o{ UserRole : ""
    Role }o--o{ UserRole : ""

```

## School Management

*Course* is a set of lessons that are grouped together. For example, "Bhagavad Gita" can be a course. Courses can be for individual study or group study.

*Group* is a set of students who are studying the same course. Each *Course* can have multiple *Groups*.

*Lession* is a part of a course. Each course can have multiple lessons. For example, "Chapter 1", "Chapter 2" etc can be lessons in the "Bhagavad Gita" course. Each lesson can have a title and content.

*Enrollment* is a record that links a user to a group and a rele. Each enrollment can have a status like "active", "inactive", "graduated" etc. Each enrollment can have a number of lessons opened.

```mermaid
erDiagram
    Course {
        uuid id PK
        string name UK
        string description
        string schoolId FK
        enum learningType "individual/group"
    }

    Group {
        uuid id PK
        string name UK "Group name"
        string description "Group description"
        string courseId FK "Course ID"
        date startsAt "Group start date"
        enum status "pending?/active/inactive"
    }

    Enrollment {
        uuid id PK
        string userId FK "User ID"
        string roleId FK "Role ID"
        opt[string] groupId FK "Group ID"
        opt[string] courseId FK "Course ID"
        enum status "pending/active/inactive/graduated"
        int lessonsOpened "Number of lessons opened"
    }

    Lesson {
        uuid id PK
        string courseId FK "Course ID"
        int lessonNumber UK "Lesson order"
        string title UK "Lesson title"
        json content "Lesson content"
    }

    Lesson }o--|| Course : ""
    Group }o--|| Course : ""
    Enrollment }o--|| User : ""
    Enrollment }|--o| Group : ""
    Enrollment }|--o| Course : ""
    Enrollment }|--|| Role : ""
```
