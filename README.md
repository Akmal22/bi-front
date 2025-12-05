# BizNest Analyzer - Business Incubator Management Frontend

A modern, responsive web application for managing and analyzing business incubators. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Features

### 🔐 Authentication & Authorization
- Session-based authentication
- Role-based access control (Admin, Manager, User)
- Protected routes with automatic redirects

### 👨‍💼 Admin Panel
- **User Management**: Create, edit, and manage system users
- **Country Management**: Add and manage countries with currency information
- **Incubator Management**: View, edit, and manage all incubators in the system
- **Reports**: Generate comprehensive analytics reports

### 🏢 Manager Panel
- **My Incubators**: View and manage assigned incubators
- **Incubator CRUD**: Create, read, update incubator information
- **Reports**: Generate reports for managed incubators

### 👤 User Panel
- **Reports**: Generate and view analytics reports for incubators

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API
- **API Client**: Fetch API with custom wrapper

## Project Structure

```
bi-front/
├── app/
│   ├── (protected)/          # Protected routes
│   │   ├── admin/            # Admin-only pages
│   │   ├── manager/          # Manager pages
│   │   ├── reports/          # Reports page
│   │   └── dashboard/        # Dashboard
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout
│   └── page.tsx             # Home/redirect page
├── components/
│   ├── layout/              # Layout components (Sidebar, Header)
│   └── ui/                  # Reusable UI components
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   ├── api/                 # API client functions
│   └── types/               # TypeScript type definitions
└── middleware.ts            # Next.js middleware
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8080/bi`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

The API base URL is configured in `lib/api/client.ts`. Update it if your backend runs on a different port or domain.

## API Integration

The frontend integrates with the backend API documented at:
- Swagger UI: `http://localhost:8080/bi/v3/api-docs`

### Endpoints Used

- **Authentication**: `/auth`, `/auth/logout`
- **Users**: `/admin/users` (GET, POST, PUT)
- **Countries**: `/countries` (GET, POST)
- **Incubators**: `/incubators` (GET, POST, PUT)
- **Reports**: `/report/short/{uuid}`, `/report/full/{uuid}`

## Design Theme

The application features a modern design with:
- **Color Scheme**: Blue/Indigo gradients (representing growth and innovation)
- **Icons**: Emoji-based icons for visual appeal
- **Typography**: Clean, readable fonts
- **Components**: Card-based layouts with shadows and gradients
- **Responsive**: Mobile-friendly design

## Role-Based Access

### Admin
- Full access to all features
- User management
- Country management
- All incubator management
- Report generation

### Manager
- View and edit assigned incubators
- Create new incubators
- Generate reports for managed incubators

### User
- Generate and view reports
- Read-only access to incubator data

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Notes

- Authentication uses session-based cookies (handled by backend)
- All API requests include credentials for session management
- Protected routes are handled client-side in the layout component
- The application automatically redirects unauthenticated users to login

## License

Private project - All rights reserved
