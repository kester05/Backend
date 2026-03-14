# Inventory Request Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing inventory requests with role-based access (Admin and Staff).

## Features

### Staff Features
- Create item requests with quantity and reason
- View personal request history and status
- Cancel pending or approved requests
- View available inventory and stock status
- Request quantity validation against item limits

### Admin Features
- Approve or reject staff requests with comments
- Fulfill approved requests and update inventory
- Manage inventory (add, edit, delete items)
- View all requests with staff member details
- Track request history and status

### Security & Data Integrity
- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcryptjs
- Quantity constraints enforcement
- Data persistence with MongoDB

## Project Structure

```
inventory-management-system/
├── server/                          # Backend (Node.js/Express)
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── models/
│   │   ├── User.js                 # User model (Staff/Admin)
│   │   ├── Item.js                 # Inventory item model
│   │   └── Request.js              # Request model
│   ├── controllers/
│   │   ├── authController.js       # Auth logic
│   │   ├── itemController.js       # Item management logic
│   │   └── requestController.js    # Request management logic
│   ├── routes/
│   │   ├── authRoutes.js           # Auth endpoints
│   │   ├── itemRoutes.js           # Item endpoints
│   │   └── requestRoutes.js        # Request endpoints
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication & authorization
│   ├── server.js                   # Main server file
│   ├── package.json
│   └── .env.example                # Environment variables template
│
└── client/                          # Frontend (React)
    ├── public/
    │   └── index.html              # HTML template
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx          # Navigation bar
    │   │   ├── CreateRequest.jsx   # Create request form
    │   │   ├── MyRequests.jsx      # Staff request list
    │   │   ├── InventoryView.jsx   # Inventory viewer
    │   │   ├── AllRequests.jsx     # Admin request manager
    │   │   ├── ManageInventory.jsx # Admin inventory manager
    │   │   ├── Navbar.css
    │   │   └── ComponentStyles.css # Shared component styles
    │   ├── pages/
    │   │   ├── Login.jsx           # Login page
    │   │   ├── Register.jsx        # Registration page
    │   │   ├── StaffDashboard.jsx  # Staff dashboard
    │   │   ├── AdminDashboard.jsx  # Admin dashboard
    │   │   ├── Auth.css
    │   │   └── Dashboard.css
    │   ├── services/
    │   │   └── api.js              # API service layer
    │   ├── App.jsx                 # Main app component
    │   ├── App.css
    │   ├── index.js                # React entry point
    │   └── index.css               # Global styles
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Step 1: Clone/Download the Project
```bash
cd inventory-management-system
```

### Step 2: Setup Backend

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Edit `.env` and configure:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inventory_db
JWT_SECRET=your_secure_secret_key_here_change_in_production
NODE_ENV=development
```

**MongoDB Setup Options:**
- Local MongoDB: Keep `MONGODB_URI=mongodb://localhost:27017/inventory_db`
- MongoDB Atlas (Cloud):
  - Go to https://www.mongodb.com/cloud/atlas
  - Create a free account and cluster
  - Get connection string (replace `<password>` and update URI)
  - Example: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inventory_db`

5. Start the server:
```bash
npm run dev
```
The server will run on `http://localhost:5000`

### Step 3: Setup Frontend

1. In a new terminal, navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```
The app will open at `http://localhost:3000`

## Running the Application

### Option 1: Run Both Simultaneously (Recommended)

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm start
```

### Option 2: Production Build

**Build Frontend:**
```bash
cd client
npm run build
```

**Run Backend (serves built frontend):**
```bash
cd server
npm install
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Items (Inventory)
- `GET /api/items` - Get all items (authenticated)
- `GET /api/items/:id` - Get item by ID (authenticated)
- `POST /api/items` - Create item (admin only)
- `PUT /api/items/:id` - Update item (admin only)
- `DELETE /api/items/:id` - Delete item (admin only)

### Requests
- `POST /api/requests` - Create request (staff only)
- `GET /api/requests/my-requests` - Get user's requests (staff only)
- `GET /api/requests` - Get all requests (admin only)
- `PUT /api/requests/:id/approve` - Approve request (admin only)
- `PUT /api/requests/:id/reject` - Reject request (admin only)
- `PUT /api/requests/:id/fulfill` - Fulfill request (admin only)
- `PUT /api/requests/:id/cancel` - Cancel request (user or admin)

## Default Test Credentials

Create these accounts via the Registration page:

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`
- Role: Admin

**Staff Account:**
- Email: `staff@example.com`
- Password: `staff123`
- Role: Staff

## Features Workflow

### Staff Workflow
1. Register/Login as Staff
2. View available inventory
3. Create a request for needed items
4. Track request status in "My Requests"
5. Cancel pending/approved requests if needed

### Admin Workflow
1. Register/Login as Admin
2. Add items to inventory or update quantities
3. Review pending requests
4. Approve requests (with quantity adjustment)
5. Reject requests (with comments)
6. Fulfill approved requests (auto-deducts from inventory)

## Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/staff),
  createdAt: Date
}
```

### Item Model
```javascript
{
  name: String,
  description: String,
  quantity: Number,
  maxQuantity: Number,
  unit: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Request Model
```javascript
{
  staffId: ObjectId (ref: User),
  itemId: ObjectId (ref: Item),
  requestedQuantity: Number,
  approvedQuantity: Number,
  status: String (pending/approved/rejected/fulfilled),
  reason: String,
  adminComment: String,
  approvedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally: `mongod`
- Or update `MONGODB_URI` in `.env` with valid connection string
- Check username/password for Atlas

### Port Already in Use
- Change `PORT` in `.env` (default: 5000)
- Or kill existing process: `lsof -ti:5000 | xargs kill -9`

### CORS Errors
- Ensure backend is running on `http://localhost:5000`
- Check `proxy` in `client/package.json` matches backend URL

### Dependencies Installation Issues
- Delete `node_modules` and lock files, then reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## Technologies Used

**Backend:**
- Node.js & Express.js - Server framework
- MongoDB & Mongoose - Database & ODM
- JWT - Authentication
- bcryptjs - Password hashing
- CORS - Cross-origin requests

**Frontend:**
- React.js - UI framework
- React Router - Navigation
- Axios - HTTP client
- CSS3 - Styling

## Live Deployment Links

Currently, this project is set up for local development. To deploy the application, follow these deployment guides:

**Recommended Deployment Platforms:**

1. **Full Stack Deployment (Frontend + Backend):**
   - **Heroku** (Free tier available with limitations)
     - Backend: Deploy Node.js/Express to Heroku
     - Frontend: Build and deploy to Heroku or Vercel
   - **Railway.app** (Free credits for students)
     - Simple Git push deployment
     - Automatic MongoDB integration
   - **Render.com** (Free tier available)
     - Full stack deployment support

2. **Backend Only Deployment:**
   - **Heroku**: `git push heroku main`
   - **Railway.app**: Connect GitHub repo
   - **AWS EC2**: Manual Node.js setup
   - **DigitalOcean**: App Platform or Droplets

3. **Frontend Only Deployment:**
   - **Vercel**: Automatic React deployment from GitHub
   - **Netlify**: Drag-and-drop or GitHub integration
   - **AWS S3 + CloudFront**: Static site hosting
   - **GitHub Pages**: Free static hosting

4. **Database Deployment:**
   - **MongoDB Atlas**: Cloud MongoDB (Free tier available)
   - **AWS RDS**: Managed MongoDB service
   - **DigitalOcean**: Managed databases

**Example Deployment Steps (Heroku):**

```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app for backend
heroku create your-app-name-server

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_secure_secret

# Deploy backend
git push heroku main

# Frontend deployment (Vercel)
npm install -g vercel
cd client
vercel
```

**Note:** Once deployed, update your frontend API URL in the environment variables to point to your live backend.

## Future Enhancements

- Email notifications for request status
- Request approval workflow with multiple levels
- Inventory analytics and reports
- Bulk import/export functionality
- Real-time notifications using WebSockets
- Advanced search and filtering
- Audit logs and history tracking

## License

MIT License - Feel free to use this project for learning and development.

## Support

For issues or questions, review the code comments and API documentation above. The system is designed with clear separation of concerns and follows REST API best practices.
