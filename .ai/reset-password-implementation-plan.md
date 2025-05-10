# Reset Password Endpoint Implementation Plan

This plan outlines the implementation steps for the Supabase password reset endpoint to be used in our project. The endpoint will allow users to initiate a password reset process by submitting their email, and Supabase will handle sending the reset email.

## Prerequisites

- Ensure that the Supabase client is correctly set up with `@supabase/ssr` and proper cookie management (using only `getAll` and `setAll`).
- Environment variables (`SUPABASE_URL` and `SUPABASE_KEY`) are configured in `.env` and defined in `src/env.d.ts`.
- The existing authentication middleware (`src/middleware/index.ts`) includes `/api/auth/reset-password` as a public route.
- UI components for reset password are available: the reset password view (`src/pages/auth/reset-password.astro`) and the reset password form (`src/components/auth/ResetPasswordForm.tsx`).

## Implementation Steps

1. **Create Endpoint File**

   - Create a new file: `src/pages/api/auth/reset-password.ts`.

2. **Define POST Method Handler**

   - Export an asynchronous `POST` function conforming to Astro's `APIRoute` type.
   - The endpoint will support only POST requests.

3. **Parse and Validate Request**

   - Parse the JSON payload from the request body to extract the email address.
   - Validate that the email field is provided. If the email is missing, return a 400 response with a clear error message.

4. **Create Supabase Server Instance**

   - Use the existing function (e.g., `createSupabaseServerInstance` from `/src/db/supabase.client.ts`) to initialize the Supabase client.
   - Ensure that this function is used to preserve proper cookie management (using only `getAll` and `setAll`).

5. **Invoke the Supabase Password Reset Function**

   - Call the appropriate Supabase method (e.g., `supabase.auth.resetPasswordForEmail`) with the provided email.
   - Optionally include a `redirectTo` parameter if a post-reset redirect is desired.

6. **Handle API Response**

   - Check the response from Supabase. If an error occurs, return a JSON response with the error message and a 400 status code.
   - If the reset email was successfully sent, return a JSON response indicating success with a 200 status code.

7. **Error Handling and Logging**

   - Wrap the logic in a try/catch block to handle unexpected errors.
   - Log errors for debugging and monitoring purposes.

8. **Testing and Verification**

   - Test the endpoint using tools like Postman or via integration with the `ResetPasswordForm` component.
   - Verify that the endpoint responds correctly for both success and error cases.
   - Confirm that the endpoint is publicly accessible as defined in the middleware.

9. **Documentation and Code Comments**
   - Add inline comments in the code to explain key steps.

## Post-Implementation Steps

- **Frontend Integration**

  - Ensure that the `ResetPasswordForm` component submits the email to `/api/auth/reset-password`.

- **Update Tests**

  - Write unit and integration tests for the endpoint to cover both success and failure scenarios.

- **Review and Refactor**
  - Make sure the implementation adheres to our coding practices: early returns for errors, proper error handling, and minimal nesting of if-statements.

This implementation plan follows the Supabase Auth integration guidelines, our project structure, and the best practices for coding as defined in the project documentation.
