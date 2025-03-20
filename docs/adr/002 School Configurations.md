# ADR: School Configurations

We need a method to store and manage school-specific configurations, such as student roles and default student role settings. The configuration should be easily retrievable and updatable through API endpoints while maintaining simplicity in the implementation given our current requirements.

## Decision
We will implement school configurations using the following approach:

1. **Configuration Structure**: 
   - Configurations will be stored as JSON objects
   - Example format: `{ studentRoles: [1,2,3], defaultStudentRole: 1 }`
   - This allows flexible key-value pairs to accommodate current needs (student roles) and potential future configuration parameters

2. **API Endpoints**:
   - `GET /edu/schools/:guid/config`: Retrieve the complete configuration for a specific school
   - `PATCH /edu/schools/:guid/config`: Update specific configuration values for a school
   - Using RESTful conventions with school GUID as the identifier

3. **Storage**:
   - Configurations will be stored in the existing `Schools` table as a JSON column
   - This leverages existing infrastructure and maintains data locality with school records

## Consequences
- **Positive**
  - Simple implementation using existing database infrastructure
  - Single table access for school data and configuration
  - Flexible JSON structure allows for future configuration additions
  - Standard RESTful API endpoints for easy integration
  - Atomic updates possible through PATCH operations
  - Payload of `PATCH /edu/schools/:guid/config` can be validated by NestJS framework

- **Negative**
  - Potential size limitations with JSON column in database
  - Less granular control compared to separate configuration tables
  - Schema validation must be handled in application layer

## Rejected Alternatives

1. **Separate SchoolConfig Table**
   - Description: Create a dedicated table for configurations with foreign key to Schools
   - Rejected because:
     - Adds unnecessary complexity for current simple configuration needs
     - Requires additional joins for data retrieval
     - More schema maintenance overhead

2. **External Storage (Redis)**
   - Description: Store configurations in a separate key-value store like Redis
   - Rejected because:
     - Introduces additional infrastructure component to maintain
     - Increases operational complexity
     - Overkill for current configuration volume and access patterns
     - Adds deployment and monitoring overhead
