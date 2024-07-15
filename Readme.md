# Project Introduction
### Project Name: Chithi
Chithi is a social media application designed to provide a smooth and engaging user experience using modern technologies. It includes features for authentication, chat, user profiles, posts, comments, reactions, notifications, and follower/block management.


| **Feature**           | **Sub-feature**                              | **Feature**           | **Sub-feature**                              |
| --------------------- | -------------------------------------------- | --------------------- | -------------------------------------------- |
| **Authentication**    | 1. Sign Up                                   | **Post**              | 1. Create Post (also With Image)             |
|                       | 2. Sign In                                   |                       | 2. Get All Post (Based on following, public) |
|                       | 3. Log Out                                   |                       | 3. Update Post                               |
|                       | 4. Password Reset                            |                       | 4. Edit Post                                 |
| **Chat**              | 1. Private messages                          | **Comments**          | 1. Add Comment                               |
|                       | 2. Add Message Reaction                      |                       | 2. Delete Comment                            |
|                       | 3. Send Image in Message                     | **Reactions**         | 1. Add Post Reaction                         |
|                       | 4. Mark Message as Read                      |                       | 2. Show All Post Reaction                    |
|                       | 5. Delete Message self / both                |                       | 3. Remove Self Reaction                      |
|                       | 6. Search User for chat                      | **Notification**      | 1. Notification Setting                      |
| **User**              | 1. Get Single User Profile                   |                       | 2. Send Notification on Action               |
|                       | 2. Get Multiple User with infinite scrolling |                       | 3. Mark read as notification                 |
|                       | 3. Get Random Suggested Users                |                       | 4. Display All Notifications                 |
|                       | 4. Edit Profile                              | **Followers & Block** | 1. Follow User                               |
|                       | 5. Add Cover Page                            |                       | 2. UnFollow User                             |
|                       |                                              |                       | 3. Show all Follower and Following List      |
|                       |                                              |                       | 4. Block User                                |
|                       |                                              |                       | 5. Unblock User                              |

## Technology Stack
|||||
|:-:|:-:|:-:|:-:|
| ![Typescript](./tech-logo/ts.png) |  ![React](./tech-logo/react.png) | ![Sass](./tech-logo/sass.png)| ![axios](./tech-logo/axios.png)|
| ![Vitest](./tech-logo/vitest.png)|![React Testing Libray](./tech-logo/rtl.png) | ![Redux Toolkit](./tech-logo/redux.jpg) | ![MSW](./tech-logo/msw.jpeg) |
| ![Socket.io](./tech-logo/socket-io.png)
1. Typescript
2. React 18
3. Node.js
4. Express.js
5. Mongoose
6. Redux Toolkit
7. Jest
8. Vitest
9. React Testing Library
10. Redis
11. Socket IO
12. MSW (API Mock)
13. BullMQ (Implementing Message Queue )
14. PM2
15. Cloudinary
16. MongoDB
17. Nodemailer
18. BREVO(SMTP)

## Requirements

1. **Node.js**
   - Install Node.js from [nodejs.org](https://nodejs.org/).

2. **Giphy API Key**
   - Sign up on [Giphy Developers](https://developers.giphy.com/) to get an API key.

3. **Cloudinary**
   - Use the same Cloudinary cloud name as the backend for storage. Sign up at [Cloudinary](https://cloudinary.com/) if needed.

4. **Environment Variables**
   - Copy all environment variables from `.env.example` and update the `.env` file with your credentials.

## Installation

1. **Clone the Repository and Install Dependencies**
   ```bash
   git clone <this_url> && cd <repo_name>
   npm i
   ```

2. **Create and Configure the `.env` File**
   - Create a `.env` file in the root directory.
   - Add the following environment variables and update them with your credentials:
     ```env
     VITE_BASE_ENDPOINT=<Your Backend URL>
     VITE_ENVIRONMENT=<development | production | test>
     VITE_CLOUD_NAME=<Your Cloudinary Cloud Name>
     VITE_GIPHY_API_KEY=<Your Giphy API Key>
     ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

## Running Unit Tests

To ensure the reliability and correctness of the application, you can run the unit tests using the following command:

```bash
npm run test
```

## Challenges Faced

While working on Chithi, we encountered several challenges, particularly in real-time communication, state management, and user experience:

1. **Using Socket.IO**
   - Ensuring real-time updates for chat messages and reactions.
   - Avoiding multiple event listener registrations and memory leaks.

2. **Managing State**
   - Keeping state consistent across components with asynchronous updates.
   - Optimizing state updates to prevent unnecessary re-renders.

3. **User Authentication**
   - Implementing secure sign-up, sign-in, and password reset.
   - Managing user sessions across different devices.

4. **User Experience**
   - Implementing real-time notifications for new messages and reactions.
   - Providing efficient user search functionality.

5. **Testing and Debugging**
   - Setting up automated tests with Jest, Vitest, and React Testing Library.
   - Debugging issues in a real-time environment.