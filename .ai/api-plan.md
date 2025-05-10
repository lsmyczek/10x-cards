# REST API Plan

## 1. Resources

- **Users**: Corresponds to the `users` table. Manages user accounts, authentication details, and profiles. (Note: Authentication is handled via Supabase Auth.)
- **Flashcards**: Corresponds to the `flashcards` table. Represents individual flashcards with a front (question) and back (answer). Includes metadata such as creation/update timestamps and an optional relation to a generation.
- **Generations**: Corresponds to the `generations` table. Stores information regarding AI-based flashcard generation operations including model used, counts of generated and accepted flashcards, source text length, and duration.
- **GenerationErrorLogs**: Logs errors that occur during AI flashcard generation. (Corresponds to the `generations_error_logs` table.)

## 2. Endpoints

### Authentication Endpoints

Authentication will be handled directly by Supabase Auth API on the client side.

### Flashcards

#### GET /api/flashcards

- **Description**: Retrieve a list of user's flashcards
- **Query Parameters**:
  - `page` (integer): Page number for pagination
  - `limit` (integer): Number of items per page (default: 20, max: 100)
  - `sort` (string): Field to sort by (options: created_at, updated_at)
  - `order` (string): Sort order (asc, desc)
  - `source` (string): Filter by source (ai-full, ai-edited, manual)
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "number",
        "front": "string",
        "back": "string",
        "source": "string",
        "created_at": "string (ISO date)",
        "updated_at": "string (ISO date)",
        "generation_id": "number | null"
      }
    ],
    "meta": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    }
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized: User is not authenticated
  - 500 Internal Server Error

#### GET /api/flashcards/:id

- **Description**: Retrieve a specific flashcard by ID
- **Response**:
  ```json
  {
    "id": "number",
    "front": "string",
    "back": "string",
    "source": "string",
    "created_at": "string (ISO date)",
    "updated_at": "string (ISO date)",
    "generation_id": "number | null"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized: User is not authenticated
  - 403 Forbidden: User does not own this flashcard
  - 404 Not Found: Flashcard does not exist
  - 500 Internal Server Error

#### POST /api/flashcards

- **Description**: Create one or more flashcards (manually or from AI generation)
- **Request**:
  ```json
  {
    "flashcards": [
      {
        "front": "string (max 200 chars)",
        "back": "string (max 500 chars)",
        "source": "string (manual, ai-full, or ai-edited)",
        "generation_id": "number (optional, required for ai-full and ai-edited)"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "number",
        "front": "string",
        "back": "string",
        "source": "string",
        "created_at": "string (ISO date)",
        "updated_at": "string (ISO date)",
        "generation_id": "number | null"
      }
    ],
    "meta": {
      "created_count": "number"
    }
  }
  ```
- **Success**: 201 Created
- **Errors**:
  - 400 Bad Request: Invalid input data
  - 401 Unauthorized: User is not authenticated
  - 403 Forbidden: Generation ID does not belong to user
  - 404 Not Found: Generation ID does not exist
  - 500 Internal Server Error

#### PATCH /api/flashcards/:id

- **Description**: Update an existing flashcard
- **Request**:
  ```json
  {
    "front": "string (max 200 chars) (optional)",
    "back": "string (max 500 chars) (optional)"
  }
  ```
- **Response**:
  ```json
  {
    "id": "number",
    "front": "string",
    "back": "string",
    "source": "string",
    "created_at": "string (ISO date)",
    "updated_at": "string (ISO date)",
    "generation_id": "number | null"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 400 Bad Request: Invalid input data
  - 401 Unauthorized: User is not authenticated
  - 403 Forbidden: User does not own this flashcard
  - 404 Not Found: Flashcard does not exist
  - 500 Internal Server Error

#### DELETE /api/flashcards/:id

- **Description**: Delete a flashcard
- **Response**: No content
- **Success**: 204 No Content
- **Errors**:
  - 401 Unauthorized: User is not authenticated
  - 403 Forbidden: User does not own this flashcard
  - 404 Not Found: Flashcard does not exist
  - 500 Internal Server Error

### Generations

#### POST /api/generations

- **Description**: Generate flashcards proposals from source text using AI
- **Request**:
  ```json
  {
    "source_text": "string (1000-10000 chars)"
  }
  ```
- **Response**:
  ```json
  {
    "id": "number",
    "model": "string",
    "generated_count": "number",
    "source_text_length": "number",
    "generation_duration": "number",
    "created_at": "string (ISO date)",
    "status": "string (processing, completed, error)",
    "flashcards_proposals": [
      {
        "id": "number",
        "front": "string",
        "back": "string",
        "source": "ai-full"
      }
    ]
  }
  ```
- **Success**: 201 Created
- **Errors**:
  - 400 Bad Request: Invalid input data or text length out of range
  - 401 Unauthorized: User is not authenticated
  - 500 Internal Server Error
  - 503 Service Unavailable: AI service temporarily unavailable - AI Service Error (logs recorder in `generation_error_logs`)

#### GET /api/generations

- **Description**: Retrieve a list of user's generation attempts
- **Query Parameters**:
  - `page` (integer): Page number for pagination
  - `limit` (integer): Number of items per page (default: 10, max: 50)
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "number",
        "model": "string",
        "generated_count": "number",
        "accepted_unedited_count": "number | null",
        "accepted_edited_count": "number | null",
        "source_text_length": "number",
        "generation_duration": "number",
        "created_at": "string (ISO date)",
        "updated_at": "string (ISO date)"
      }
    ],
    "meta": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    }
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized: User is not authenticated
  - 500 Internal Server Error

#### GET /api/generations/:id

- **Description**: Retrieve details of a specific generation
- **Response**:
  ```json
  {
    "id": "number",
    "model": "string",
    "generated_count": "number",
    "accepted_unedited_count": "number | null",
    "accepted_edited_count": "number | null",
    "source_text_length": "number",
    "generation_duration": "number",
    "created_at": "string (ISO date)",
    "updated_at": "string (ISO date)"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized: User is not authenticated
  - 403 Forbidden: User does not own this generation
  - 404 Not Found: Generation does not exist
  - 500 Internal Server Error

#### GET /api/generations-error-logs

_(Generation Error Logs Endpoint - Typically restricted to admin or for debugging purposes)_

- **Method**: GET
- **URL**: /generations-error-logs
- **Description**: Retrieves a list of error logs related to AI generation operations.
- **Query Parameters**: Optional filters (e.g., date range)
- **Success Code**: 200 OK
- **Error Codes**: 401 Unauthorized (if access is restricted)

## 3. Authentication and Authorization

Authentication will be handled by Supabase Auth, which provides:

1. **JWT Tokens**: After successful authentication, clients receive a JWT token that must be included in the Authorization header for all API requests.

2. **Authorization Flow**:

   - Frontend authenticates directly with Supabase Auth API
   - Supabase provides JWT token upon successful authentication
   - All subsequent API requests include the JWT token in the Authorization header
   - Backend validates the JWT token and identifies the user
     ```

     ```

3. **API Endpoint Authorization**:
   - Every API endpoint checks if the request is authenticated
   - For resource-specific endpoints (GET, PATCH, DELETE), the server verifies that the requested resource belongs to the authenticated user

## 4. Validation and Business Logic

### Validation Rules

#### Flashcards

- `front`: Required, up to 200 characters.
- `back`: Required, up to 500 characters.
- `source`: Must be one of `ai-edited`, or `manual`.

#### Generation Request

- `source_text`: Required, length between 1000 and 10000 characters.
- `model`: Optional, but if provided, must match recognized model names.

### Business Logic Implementation

1. **AI Flashcard Generation**:

   - The backend receives source text and validates length requirements
   - Text is sent to the AI model via Openrouter.ai
   - Generated flashcard proposals are stored in the database with source = 'ai-full'
   - Generation metadata is stored (time taken, model used, etc.) and flashcard proposals are return to the user.
   - Error handling captures and logs any failures in the AI processing (`generation_error_logs`)
   - For flashcards generated by AI, allow endpoints to update them (e.g., accepting or editing generated flashcards by switching the `source` from `ai-full` to `ai-edited`).

2. **Flashcard Approval Process**:

   - Frontend displays generated flashcards proposals for user review
   - User can approve flashcards proposals as-is or edit them before approval
   - Approved flashcards are marked as 'ai-full' (unedited) or 'ai-edited' (modified)
   - Metadata is updated to track acceptance rates for analytics
   - Automatic update of the `updated_at` field via database triggers when flashcard are modified.

3. **GenerationErrorLogs**
   - Error handling and logging are integrated into the AI generation process, with failures recorded in the `generation_error_logs`.
