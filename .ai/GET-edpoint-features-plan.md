# Plan for Expanding GET /api/flashcards Endpoint with Pagination, Sorting, and Filtering

This document outlines the plan for enhancing the `GET /api/flashcards` endpoint by adding features for pagination, sorting, and filtering.

## 1. Expand and Confirm the Query Schema

- Ensure the query schema supports the following parameters:
  - `page` (integer): Page number for pagination.
  - `limit` (integer): Number of items per page (default: 20, max: 100).
  - `sort` (string): Field to sort by (allowed values: `created_at`, `updated_at`).
  - `order` (string): Sort order (`asc` or `desc`).
  - `source` (string): Filter by source (allowed values: `manual`, `ai-full`, `ai-edited`).
- Validate that the data types and constraints (e.g., positive integers, maximum limits) are enforced.

## 2. Update the FlashcardsService.getFlashcards Method

- **Pagination:**
  - Compute the `offset` using the formula:
    \[
    offset = (page - 1) \times limit
    \]
  - Use SQL `LIMIT` and `OFFSET` to fetch the appropriate slice of flashcards.

- **Sorting:**
  - Construct an `ORDER BY` clause using the provided `sort` and `order` parameters.
  - Validate that only allowed fields are used for sorting to prevent SQL injection.

- **Filtering:**
  - If a `source` parameter is provided, include a `WHERE` clause to filter flashcards by that source.
  - Plan for additional filtering options in the future if needed.

- **Total Count and Meta Information:**
  - Execute a separate query to determine the total number of records matching the criteria.
  - Calculate the number of pages as:
    \[
    pages = \lceil total / limit \rceil
    \]

## 3. Adjust the GET Endpoint Response

- Modify the response structure to include a metadata object with the following properties:
  - `total`: Total number of flashcards matching the criteria.
  - `page`: Current page number.
  - `limit`: Number of items per page.
  - `pages`: Total number of pages.

Example response structure:
```json
{
  "data": [ /* flashcards array */ ],
  "meta": {
    "total": 120,
    "page": 2,
    "limit": 20,
    "pages": 6
  }
}
```

- Maintain error handling and appropriate status codes (e.g., 400 for bad requests, 500 for internal server errors).


## 4. Database Considerations

- Ensure there are appropriate indexes on the columns used for sorting and filtering (`created_at`, `updated_at`, `source`) to optimize query performance.


## Conclusion

Implementing these enhancements will improve the robustness and usability of the flashcards endpoint, enabling clients to efficiently paginate, sort, and filter flashcard data. 