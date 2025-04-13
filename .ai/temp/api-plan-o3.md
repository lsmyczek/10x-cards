# REST API Plan

## 1. Resources

- **Users**: Represents application users. (Corresponds to the `users` table in the database.)
- **Flashcards**: Stores flashcards information. (Corresponds to the `flashcards` table.)
- **Generations**: Records AI generation requests and associated flashcards. (Corresponds to the `generations` table.)
- **GenerationErrorLogs**: Logs errors that occur during AI flashcard generation. (Corresponds to the `generations_error_logs` table.)

## 2. Endpoints

### 2.1 Users Endpoints

#### 2.1.1 Register User
- **Method**: POST
- **URL**: /users/register
- **Description**: Registers a new user account.
- **Request Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "userPassword"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "timestamp"
  }
  ```
- **Success Code**: 201 Created
- **Error Codes**: 400 Bad Request (invalid input), 409 Conflict (if email already exists)

#### 2.1.2 User Login
- **Method**: POST
- **URL**: /users/login
- **Description**: Authenticates a user and returns a JWT token.
- **Request Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "userPassword"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized (invalid credentials)

#### 2.1.3 Delete User
- **Method**: DELETE
- **URL**: /users/:id
- **Description**: Deletes a user account, cascading deletion to associated flashcards.
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized, 404 Not Found

### 2.2 Flashcards Endpoints

#### 2.2.1 List Flashcards
- **Method**: GET
- **URL**: /flashcards
- **Description**: Retrieves a paginated list of flashcards for the authenticated user.
- **Query Parameters**:
  - page (integer, optional)
  - limit (integer, optional)
  - sort (e.g., created_at desc, optional)
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "number",
        "front": "string",
        "back": "string",
        "source": "ai-full | ai-edited | manual",
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
  ```
- **Success Code**: 200 OK

#### 2.2.2 Create Flashcard (Manual)
- **Method**: POST
- **URL**: /flashcards
- **Description**: Creates a new flashcard manually.
- **Request Payload**:
  ```json
  {
    "front": "Question text",
    "back": "Answer text",
    "source": "manual"
  }
  ```
- **Response**:
  ```json
  {
    "id": "number",
    "front": "Question text",
    "back": "Answer text",
    "source": "manual",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- **Success Code**: 201 Created
- **Error Codes**: 400 Bad Request

#### 2.2.3 Retrieve Flashcard
- **Method**: GET
- **URL**: /flashcards/:id
- **Description**: Retrieves details of a specific flashcard.
- **Success Code**: 200 OK
- **Error Codes**: 404 Not Found

#### 2.2.4 Update Flashcard
- **Method**: PUT or PATCH
- **URL**: /flashcards/:id
- **Description**: Updates an existing flashcard (supports both manual edits and acceptance/editing of AI-generated flashcards).
- **Request Payload**:
  ```json
  {
    "front": "Updated question text",
    "back": "Updated answer text",
    "source": "ai-edited"  // if editing an AI-generated flashcard
  }
  ```
- **Response**:
  ```json
  {
    "id": "number",
    "front": "Updated question text",
    "back": "Updated answer text",
    "source": "ai-edited",
    "updated_at": "timestamp"
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 400 Bad Request, 404 Not Found

#### 2.2.5 Delete Flashcard
- **Method**: DELETE
- **URL**: /flashcards/:id
- **Description**: Deletes a flashcard.
- **Success Code**: 200 OK
- **Error Codes**: 404 Not Found

### 2.3 AI Generation Endpoints

#### 2.3.1 Initiate AI Generation
- **Method**: POST
- **URL**: /generations
- **Description**: Initiates an AI generation request using provided text to generate flashcard suggestions. The text must be between 1000 and 10000 characters.
- **Request Payload**:
  ```json
  {
    "text": "Text between 1000 and 10000 characters..."
  }
  ```
- **Response**:
  ```json
  {
    "generationId": "number",
    "flashcards": [
      {
        "front": "Generated question",
        "back": "Generated answer",
        "source": "ai-full"
      }
    ],
    "model": "modelName",
    "generated_count": 5,
    "created_at": "timestamp"
  }
  ```
- **Success Code**: 200 OK
- **Error Codes**: 400 Bad Request (if text length is invalid), 500 Internal Server Error (API failure)

#### 2.3.2 List Generation History
- **Method**: GET
- **URL**: /generations
- **Description**: Retrieves a list of AI generation history records for the authenticated user.
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "number",
        "model": "modelName",
        "generated_count": 5,
        "created_at": "timestamp"
      }
    ]
  }
  ```
- **Success Code**: 200 OK

#### 2.3.3 Retrieve Generation Details
- **Method**: GET
- **URL**: /generations/:id
- **Description**: Retrieves detailed information about a specific AI generation record.
- **Success Code**: 200 OK
- **Error Codes**: 404 Not Found

### 2.4 Generation Error Logs Endpoints
*(Typically restricted to admin or for debugging purposes)*

- **Method**: GET
- **URL**: /generations/error-logs
- **Description**: Retrieves a list of error logs related to AI generation operations.
- **Query Parameters**: Optional filters (e.g., date range)
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized (if access is restricted)



## 3. Authentication and Authorization

- The API uses JWT-based authentication. Endpoints such as /users/register and /users/login are public, while all others require the client to include a valid JWT in the Authorization header (e.g., `Authorization: Bearer <token>`).
- Middleware enforces that users can only access and manipulate resources where the `user_id` matches the ID from the JWT (in line with the database RLS policies).
- Rate limiting is recommended, particularly on the AI generation endpoint, to prevent abuse and manage API costs.

## 4. Validation and Business Logic

- **Input Validation**: 
  - Validate email formats, password strength, and required fields for user endpoints.
  - Ensure text provided for AI generation is between 1000 and 10000 characters (as per the database CHECK constraint).
  - Validate that the `source` field for flashcards is one of `ai-full`, `ai-edited`, or `manual`.

- **Business Logic**:
  - Automatic updates of timestamps (handled by database triggers for flashcards and generations).
  - Cascade deletion: When a user is deleted, their flashcards and generation records are also removed.
  - For flashcards generated by AI, allow endpoints to update them (e.g., accepting or editing generated flashcards by switching the `source` from `ai-full` to `ai-edited`).
  - Error handling and logging are integrated into the AI generation process, with failures recorded in the GenerationErrorLogs.
  - Implement pagination, sorting, and filtering for list endpoints to efficiently manage potentially large datasets. 