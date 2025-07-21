# E-commerce Final Project

A responsive e-commerce web application built with React, TypeScript, Redux Toolkit, and Firebase.  
It supports user registration/login, product browsing, cart management, checkout, order history, and admin-level product control.

- Authentication via Firebase (Email/Password)
- Cart, orders, and reviews stored in Firestore
- Real-time updates and secure access
- CI/CD pipeline using GitHub Actions + Vercel

[View the live site](https://final-project-one-rose.vercel.app/)

## Testing Overview
This project uses **Jest** and **React Testing Library** to test pages and components, including unit and integration tests.
### Test File Summary
`src/pages/__tests__/Cart.test.tsx` | Unit tests for the `Cart` page — verifies rendering, quantity changes, and order logic. 
`src/components/__tests__/ProductCard.test.tsx` | Tests the `ProductCard` UI — checks rendering, "add to cart" behavior, and responsiveness. 
`src/components/__tests__/CartItemCard.test.tsx` | Validates individual cart item controls like quantity adjustment and remove functionality. 
`src/components/__tests__/CartIntegration.test.tsx` | Integration test that simulates full cart behavior with multiple components working together. 
### Tools & Libraries
**Jest** – Testing framework
**React Testing Library** – For testing components as the user would interact
**@testing-library/jest-dom** – Custom matchers like `toBeInTheDocument()`
**Mock Firebase/Auth0** – (if applicable) to isolate test environment from real services
### Running Tests
You can run all tests using:
npm test
Or run an individual test file:
npx jest src/pages/__tests__/Cart.test.tsx
npx jest src/components/__tests__/ProductCard.test.tsx
npx jest src/components/__tests__/CartItemCard.test.tsx
npx jest src/components/__tests__/CartIntegration.test.tsx

## .github/workflows/ci.yml
### CI Build and Test Workflow
This GitHub Actions workflow automatically checks your project for correctness on every push to the `main` branch. It installs dependencies, runs all tests, and builds the project for production.

## Mocks Setup 
This project uses mocks to isolate tests from real external services:
**Firebase mocks** (in `src/__mocks__/firebase.ts` and `src/__mocks__/env.ts`) provide fake environment values and mock implementations of Firebase Auth and Firestore methods to avoid network calls during testing.
**UI component mocks** (e.g., star rating icons in `src/__mocks__/stars.tsx`) provide simple test-friendly components for unit testing UI elements.
These mocks ensure tests run quickly and reliably without requiring real Firebase setup.

## renderWithMinimalStore.tsx
### Redux Store and Test Utils
This file defines the Redux store setup, slices, typed hooks, and a helper function for rendering React components with the Redux store in tests. It uses Redux Toolkit and React-Redux with TypeScript for type safety and maintainability.

## E-commerce Final Project
This project is automatically deployed to [Vercel](https://vercel.com) using GitHub Actions for continuous integration and deployment (CI/CD).

### Deployment Workflow
On every push to the `main` branch, the following steps occur:
Run tests and build the project.
If tests and build succeed, deploy the latest build to Vercel using the Vercel CLI.

### Deployment Details
This project uses **two separate GitHub Actions workflows** for CI/CD:

 `ci-pipeline.yml`  
Runs on **pushes and pull requests** to the `main` branch.  
It installs dependencies and runs all tests to ensure code quality.

`vercel-deploy.yml`  
Runs on **pushes to the `main` or `master` branch**.  
It builds the project and deploys it to Vercel for production hosting.

### GitHub Secrets Required
To enable the deployment workflows, the following secrets must be added securely in your GitHub repository settings:
`VERCEL_TOKEN` — Your personal Vercel access token.
`VERCEL_ORG_ID` — Your Vercel organization ID.
`VERCEL_PROJECT_ID` — Your Vercel project ID.

These secrets are used by GitHub Actions to authenticate and interact with your Vercel project during deployment.

## Installation & Setup

### Clone the Repository
```bash
git clone https://github.com/chuks2274/ecommerce_final.git
cd ecommerce_final
npm install

### Run the Development Server
```bash
npm run dev