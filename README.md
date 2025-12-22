# PanelPro - Admin Panel SaaS Platform

A modern, full-featured admin panel SaaS platform built with Next.js, React, and TypeScript. Perfect for small businesses, repair shops, retail stores, and service providers who need a professional management system.

## 🚀 Features

### Core Features
- **User Authentication** - Secure login and registration system
- **Subscription Management** - Flexible 3, 6, and 12-month subscription plans
- **Dashboard** - Comprehensive admin dashboard with real-time statistics
- **Product Management** - Add, edit, delete, and search products
- **Customer Management** - Complete customer database with contact information
- **Order Management** - Create and track orders with status updates
- **Analytics** - Detailed analytics and insights
- **Reports** - Export data to CSV format
- **Search & Filter** - Advanced search and filtering capabilities
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### Technical Features
- **Next.js 16** - Latest Next.js with App Router
- **TypeScript** - Full type safety
- **Tailwind CSS** - Modern, responsive styling
- **Radix UI** - Accessible component library
- **Local Storage** - Client-side data persistence (ready for backend integration)
- **Toast Notifications** - User-friendly notifications
- **Protected Routes** - Middleware for route protection

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.x or higher
- **npm**, **yarn**, or **pnpm** package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd saa-s-admin-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables** (optional for development)
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your configuration values.

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/
│   ├── api/              # API routes (ready for backend integration)
│   ├── checkout/         # Checkout and success pages
│   ├── contact/          # Contact page
│   ├── dashboard/        # Main dashboard
│   ├── login/            # Login page
│   ├── pricing/          # Pricing page
│   ├── register/         # Registration page
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # Reusable UI components
│   ├── footer.tsx        # Footer component
│   ├── navbar.tsx        # Navigation bar
│   └── theme-provider.tsx # Theme provider
├── hooks/
│   ├── use-auth.tsx      # Authentication hook
│   └── use-toast.ts      # Toast notifications
├── lib/
│   ├── constants.ts      # App constants and types
│   ├── export-utils.ts   # CSV export utilities
│   └── utils.ts           # Utility functions
├── middleware.ts         # Route protection middleware
└── public/               # Static assets
```

## 🎯 Usage

### Getting Started

1. **Register an Account**
   - Navigate to `/register`
   - Fill in your details including shop/company name
   - Create your account

2. **Subscribe to a Plan**
   - Go to `/pricing`
   - Choose a subscription plan (3, 6, or 12 months)
   - Complete the subscription process

3. **Access Your Dashboard**
   - Log in at `/login`
   - Access your personalized admin panel at `/dashboard`

### Managing Your Business

#### Products
- **Add Products**: Click "Add Product" and fill in details
- **Edit Products**: Click the edit icon on any product card
- **Delete Products**: Click the delete icon (trash can)
- **Search Products**: Use the search bar to find products quickly

#### Customers
- **Add Customers**: Click "Add Customer" and enter customer information
- **Edit Customers**: Click the edit icon on any customer card
- **Delete Customers**: Click the delete icon
- **Search Customers**: Use the search bar to filter customers

#### Orders
- **Create Orders**: Click "Create Order", select a customer and add products
- **Update Order Status**: Use the status dropdown on each order
- **Delete Orders**: Click the delete icon (stock will be restored)
- **Filter Orders**: Use search and status filter

#### Analytics
- View comprehensive statistics and insights
- See order status distribution
- View top-selling products
- Check recent orders

#### Reports
- Export orders, customers, and products to CSV
- Download reports for external analysis

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PanelPro

# Database (for future use)
# DATABASE_URL=your_database_connection_string

# Authentication (for future use)
# JWT_SECRET=your_jwt_secret_key

# Payment Processing (for future Stripe integration)
# STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
# STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Subscription Plans

Plans are configured in `lib/constants.ts`:

- **Starter** (3 months): €70
- **Professional** (6 months): €130
- **Enterprise** (12 months): €210

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🔐 Security Notes

**Current Implementation:**
- Data is stored in browser localStorage (for demo purposes)
- Passwords are stored in plain text (NOT for production)

**For Production:**
- Implement a proper backend with database
- Hash passwords using bcrypt or similar
- Use JWT tokens for authentication
- Implement proper API authentication
- Add rate limiting
- Use HTTPS
- Implement CSRF protection

## 🛣️ Roadmap

### Planned Features
- [ ] Backend API with database integration
- [ ] Real payment processing (Stripe/PayPal)
- [ ] Email notifications
- [ ] Advanced analytics with charts
- [ ] Multi-user support with roles
- [ ] Inventory alerts
- [ ] Customer communication tools
- [ ] Mobile app
- [ ] API for third-party integrations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@panelpro.com or create an issue in the repository.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ for small businesses

"# bonus-repair-desk" 
