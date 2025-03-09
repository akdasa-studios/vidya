# Api Service Configurations

## Environment Variables

#### `VIDYA_AUTH_SAVE_PERMISSIONS_IN_JWT_TOKEN`.
Saves user permissions in the JWT token. This will allow to keep the permissions in the token itself and avoid querying the database for each request. 

#### `VIDYA_AUTH_USER_PERMISSIONS_CACHE_TTL`. 
Time to live for the user permissions cache in seconds. Set to 0 to disable caching for development purposes for example. 

- If `VIDYA_AUTH_SAVE_PERMISSIONS_IN_JWT_TOKEN` is set to `false`, then user permissions will be fetched from the database for each request and stored in cache for the specified time.
- If `VIDYA_AUTH_SAVE_PERMISSIONS_IN_JWT_TOKEN` is set to `true`, this will be ignored and user permissions will be stored in the JWT token itself.