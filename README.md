# 10x-cards

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

10x-cards is a web application designed to facilitate the fast creation, management, and review of educational flashcards. It leverages large language models (LLMs) to automatically generate flashcard suggestions from user-provided text, streamlining the learning process. Users can review, edit, and manage flashcards manually, ensuring a personalized learning experience integrated with spaced repetition algorithms for effective study sessions.

## Tech Stack

- **Frontend**: Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, authentication, scalable data storage)
- **AI Integration**: Openrouter.ai (support for multiple LLM models including OpenAI, Anthropic, and Google)
- **CI/CD & Hosting**: GitHub Actions, DigitalOcean (Docker-based deployment)

## Getting Started Locally

1. **Clone the repository**:
   ```sh
   git clone https://github.com/lsmyczek/10x-cards.git
   cd 10x-cards
   ```

2. **Set the Node version** (as specified in `.nvmrc`). Current version **22.14.0**:
   ```sh
   nvm use
   ```

3. **Install dependencies**:
   ```sh
   npm install
   ```

4. **Start the development server**:
   ```sh
   npm run dev
   ```

5. **Access the app**:
   Open your browser and navigate to `http://localhost:3000` (or the default address provided by Astro).

## Available Scripts

- **npm run dev**: Starts the development server.
- **npm run build**: Builds the project for production.
- **npm run preview**: Serves the production build locally.
- **npm run astro**: Runs Astro CLI commands.
- **npm run lint**: Lints the codebase.
- **npm run lint:fix**: Automatically fixes linting issues.
- **npm run format**: Formats the code using Prettier.

## Project Scope

The project focuses on the following key areas:

- **Automated Flashcard Generation**: Users can input text to generate flashcard suggestions using LLMs.
- **Manual Flashcard Management**: Create, edit, and delete flashcards to suit personal study needs.
- **User Authentication**: Secure registration, login, and account management.
- **Spaced Repetition**: Integration with spaced repetition algorithms to optimize the learning process.
- **Statistics Tracking**: Monitoring the generation and approval rate of AI-generated flashcards.

## Project Status

This is an early-stage MVP of the 10x-cards project, currently under active development.

## License

This project is licensed under the MIT License. 