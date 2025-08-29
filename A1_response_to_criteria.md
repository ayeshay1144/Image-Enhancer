Assignment 1 - REST API Project - Response to Criteria
================================================

Overview
------------------------------------------------

- **Name:** Ayesha Yasin
- **Student number:** n11841486
- **Application name:** Cab432 Image Enhancer
- **Two line description:** This REST API fetches images from Unsplash and applies a custom CPU-intensive image enhancement algorithm. It supports login with JWT, containerisation, and deployment on AWS.

Core criteria
------------------------------------------------

### Containerise the app

- **ECR Repository name:** n11841486-assignment1
- **Video timestamp:** 00:28-00:42
- **Relevant files:**
    - `Dockerfile`
    - `docker-compose.yml`

### Deploy the container

- **EC2 instance ID:** i-07853b1020e4ca01e
- **Video timestamp:** 00:50-1:00
- **Relevant files:**
    - `docker-compose.yml`

### User login

- **One line description:** Basic username/password login returns JWT; includes role distinction between admin and normal users.
- **Video timestamp:** 1:00-1:29
- **Relevant files:**
    - `src/controllers/userController.js`
    - `src/middleware/auth.js`

### REST API

- **One line description:** REST API with endpoints for login, fetching images, enhancing images, and viewing results.
- **Video timestamp:** 1:30-2:00
- **Relevant files:**
    - `src/routes/`
    - `src/controllers/imageController.js`

### Data types

- **One line description:** Application stores image metadata and processed image files.
- **Video timestamp:** 2:00-2:30

#### First kind

- **One line description:** Metadata (URLs, author, dimensions) retrieved from Unsplash.
- **Type:** JSON records in database
- **Rationale:** Needed to store source details and enable filtering.
- **Video timestamp:** 2:35
- **Relevant files:**
    - `src/database.js`

#### Second kind

- **One line description:** Enhanced image files stored in uploads folder.
- **Type:** Binary image files
- **Rationale:** Distinct storage from metadata; required for serving processed images.
- **Video timestamp:** 2:40
- **Relevant files:**
    - `uploads/`

### CPU intensive task

- **One line description:** Custom pixel-level image enhancement algorithm performing brightness and sharpness adjustments.
- **Video timestamp:** 2:35-2:45
- **Relevant files:**
    - `src/services/imageProcessor.js`

### CPU load testing

- **One line description:** Load-testing script generates >80% CPU load for 5 minutes with parallel requests.
- **Video timestamp:** 2:46-3:20
- **Relevant files:**
    - `loadtest.sh`

Additional criteria
------------------------------------------------

### External API

- **One line description:** The application integrates with the Unsplash API to fetch raw images, which are then enhanced rather than just proxied.
- **Video timestamp:** 03:23-3:50
- **Relevant files:**
    - `src/routes/imageRoutes.js`

### Custom processing

- **One line description:** A custom pixel-wise algorithm was implemented to enhance images, making the CPU-intensive step domain-specific.
- **Video timestamp:** 03:51-4:12
- **Relevant files:**
    - `src/services/imageProcessor.js`

    ### Web Client

- **One line description:** User session tokens stored separately from image metadata and files.
- **Video timestamp:** 04:12-04:34
- **Relevant files:**
    - `src/database.js`

### Infrastructure as Code

- **One line description:** Docker Compose is used to launch and manage the full application stack with a single command.
- **Video timestamp:** 04:35-4:55
- **Relevant files:**
      - `docker-compose.yml`

