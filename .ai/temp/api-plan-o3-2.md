# REST API Plan

## 1. Resources

- **Users**: Corresponds to the `users` table. Manages user accounts, authentication details, and profiles. (Note: Authentication is handled via Supabase Auth.)
- **Flashcards**: Corresponds to the `flashcards` table. Represents individual flashcards with a front (question) and back (answer). Includes metadata such as creation/update timestamps and an optional relation to a generation.
- **Generations**: Corresponds to the `generations` table. Stores information regarding AI-based flashcard generation operations including model used, counts of generated and accepted flashcards, source text length, and duration.
- **Study Session**: Not a direct table but represents endpoints implementing spaced repetition logic for flashcard review sessions.

## 2. Endpoints

### Authentication Endpoints

- **Note**: Authentication is primarily handled by Supabase Auth. The client obtains a JWT token on login which must be included in the `Authorization` header of all API requests.

### Flashcards

#### GET /api/flashcards
- **Description**: Retrieve a paginated list of flashcards for the authenticated user.
- **Query Parameters**:
  - `page` (integer): Page number for pagination (default: 1).
  - `limit` (integer): Number of flashcards per page (default: 20, max: 100).
  - `sort` (string): Field to sort by (e.g., `created_at`, `updated_at`).
  - `order` (string): Sort order (`asc` or `desc`).
  - `source` (string): Filter flashcards by source (`ai-full`, `ai-edited`, `manual`).
- **Response Structure**:
  ```json
  {
    "data": [
      {
        "id": number,
        "front": "string",
        "back": "string",
        "source": "string",
        "created_at": "ISODate string",
        "updated_at": "ISODate string",
        "generation_id": number | null
      }
    ],
    "meta": {
      "total": number,
      "page": number,
      "limit": number,
      "pages": number
    }
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized (if not authenticated)
  - 500 Internal Server Error

#### GET /api/flashcards/:id
- **Description**: Retrieve a specific flashcard by its ID (accessible only if owned by the authenticated user).
- **Response Structure**:
  ```json
  {
    "id": number,
    "front": "string",
    "back": "string",
    "source": "string",
    "created_at": "ISODate string",
    "updated_at": "ISODate string",
    "generation_id": number | null
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized
  - 403 Forbidden (if flashcard does not belong to the user)
  - 404 Not Found

#### POST /api/flashcards
- **Description**: Create a new flashcard manually.
- **Request Payload**:
  ```json
  {
    "front": "string (max 200 characters)",
    "back": "string (max 500 characters)",
    "source": "manual"
  }
  ```
- **Response Structure**:
  ```json
  {
    "id": number,
    "front": "string",
    "back": "string",
    "source": "manual",
    "created_at": "ISODate string",
    "updated_at": "ISODate string",
    "generation_id": null
  }
  ```
- **Success**: 201 Created
- **Errors**:
  - 400 Bad Request (if inputs are invalid)
  - 401 Unauthorized

#### PATCH /api/flashcards/:id
- **Description**: Update an existing flashcard. Allows partial updates of the `front` and/or `back` fields.
- **Request Payload**:
  ```json
  {
    "front": "string (optional, max 200 characters)",
    "back": "string (optional, max 500 characters)"
  }
  ```
- **Response Structure**:
  ```json
  {
    "id": number,
    "front": "string",
    "back": "string",
    "source": "string",
    "created_at": "ISODate string",
    "updated_at": "ISODate string",
    "generation_id": number | null
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 400 Bad Request
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found

#### DELETE /api/flashcards/:id
- **Description**: Delete a flashcard.
- **Response**: No content
- **Success**: 204 No Content
- **Errors**:
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found

### Generations

#### POST /api/generations
- **Description**: Submit a request to generate flashcards from provided source text using AI.
- **Request Payload**:
  ```json
  {
    "source_text": "string (1000-10000 characters)",
    "model": "string (optional)"
  }
  ```
- **Response Structure**:
  ```json
  {
    "id": number,
    "model": "string",
    "generated_count": number,
    "source_text_length": number,
    "generation_duration": number,
    "created_at": "ISODate string",
    "status": "processing | completed | error",
    "flashcards": [
      {
        "id": number,
        "front": "string",
        "back": "string",
        "source": "ai-full"
      }
    ]
  }
  ```
- **Success**: 201 Created
- **Errors**:
  - 400 Bad Request (invalid inputs/text length)
  - 401 Unauthorized
  - 503 Service Unavailable (if AI service is down)

#### GET /api/generations
- **Description**: Retrieve a paginated list of flashcard generation operations for the authenticated user.
- **Query Parameters**:
  - `page` (integer, default: 1)
  - `limit` (integer, default: 10, max: 50)
- **Response Structure**:
  ```json
  {
    "data": [
      {
        "id": number,
        "model": "string",
        "generated_count": number,
        "accepted_unedited_count": number | null,
        "accepted_edited_count": number | null,
        "source_text_length": number,
        "generation_duration": number,
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ],
    "meta": {
      "total": number,
      "page": number,
      "limit": number,
      "pages": number
    }
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized

#### GET /api/generations/:id
- **Description**: Get detailed information for a specific generation operation.
- **Response Structure**:
  ```json
  {
    "id": number,
    "model": "string",
    "generated_count": number,
    "accepted_unedited_count": number | null,
    "accepted_edited_count": number | null,
    "source_text_length": number,
    "generation_duration": number,
    "created_at": "ISODate string",
    "updated_at": "ISODate string"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found

#### GET /api/generations/:id/flashcards
- **Description**: Retrieve flashcards associated with a specific generation.
- **Response Structure**:
  ```json
  {
    "data": [
      {
        "id": number,
        "front": "string",
        "back": "string",
        "source": "string",
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ]
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found

#### POST /api/generations/:id/approve
- **Description**: Approve and optionally edit generated flashcards from a generation operation. This registers the flashcards as either unedited (`ai-full`) or edited (`ai-edited`).
- **Request Payload**:
  ```json
  {
    "flashcards": [
      {
        "id": number,
        "front": "string (optional)",
        "back": "string (optional)"
      }
    ]
  }
  ```
- **Response Structure**:
  ```json
  {
    "approved_count": number,
    "generation": {
      "id": number,
      "accepted_unedited_count": number,
      "accepted_edited_count": number,
      "updated_at": "ISODate string"
    }
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 400 Bad Request
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found


## 3. Authentication and Authorization

- **Mechanism**: The API uses Supabase Auth for authentication. Clients obtain a JWT token upon successful login. Every protected endpoint must include the JWT token in the `Authorization` header.
- **Row Level Security (RLS)**: The database is secured with RLS policies (e.g., `CREATE POLICY user_isolation ON flashcards FOR ALL USING (user_id = auth.uid());`) ensuring that users access only their data.
- **Endpoint Checks**: Each endpoint validates that the authenticated user owns the requested resource (flashcards, generations, etc.).

## 4. Validation and Business Logic

### Validation Rules

- **Flashcards**:
  - `front`: Required, up to 200 characters.
  - `back`: Required, up to 500 characters.
  - `source`: Must be one of `ai-full`, `ai-edited`, or `manual`.

- **Generation Request**:
  - `source_text`: Required, length between 1000 and 10000 characters.
  - `model`: Optional, but if provided, must match recognized model names.

- **Study Feedback**:
  - `quality`: Required, integer in the range of 0 to 5.
  - `duration_ms`: Optional, must be a positive number if provided.

### Business Logic Implementation

1. **AI Flashcard Generation**:
   - Validate the length of `source_text` before processing.
   - Forward the validated source text to an AI model via Openrouter.ai.
   - Store the generated flashcards in the database with `source` set to `ai-full`.
   - Record generation metadata such as duration, counts, and model used.
   - Implement error logging and response codes for AI failures.

2. **Flashcard Approval Process**:
   - Present generated flashcards to the user for review.
   - Allow users to approve as-is or edit flashcards before finalizing.
   - Update flashcard records accordingly (using `ai-full` or `ai-edited`) and track acceptance metrics.

3. **Spaced Repetition Algorithm**:
   - The study endpoints apply a spaced repetition algorithm based on past review performance.
   - Use feedback from `/api/study/feedback` to schedule the next review date.

4. **Security, Rate Limiting and Performance**:
   - Enforce RLS at the database level, ensuring data isolation between users.
   - Apply rate limiting on endpoints to mitigate abuse (to be implemented at the middleware or API gateway level).
   - Validate all incoming data and handle errors as early as possible. 