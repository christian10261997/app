# Admin Dashboard Implementation Documentation

## Overview

This document tracks the implementation of the admin dashboard system for KitchenPal's subscription management. The admin dashboard allows authorized users to manage subscription requests, view user statistics, and perform administrative tasks.

## ✅ Completed Components

### 1. Enhanced User Profile Types

**File**: `types/user.ts`

- Added `userType` field: "free" | "subscribed" | "admin"
- Added `SubscriptionInfo` interface for subscription data
- Added `UsageStats` interface for tracking recipe generations
- Added `SubscriptionRequest` interface for admin approval workflow

### 2. Updated Authentication System

**File**: `hooks/useAuth.ts`

- Enhanced `loadUserProfile()` to load new subscription and usage fields
- Updated signup process to initialize users as "free" with empty usage stats
- Added proper TypeScript interfaces for all new fields

### 3. Admin Layout System

**File**: `app/admin/_layout.tsx`

- Created admin-only layout with access control
- Auto-redirects non-admin users to home
- Header with admin user info and logout functionality
- Consistent styling across admin pages

### 4. Admin Dashboard

**File**: `app/admin/index.tsx`

**Features**:

- **User Statistics Cards**: Total users, subscribed, free, pending requests
- **Quick Action Buttons**: Navigate to subscription requests and user management
- **Recent Pending Requests**: Shows latest 5 subscription requests
- **Pull-to-refresh** functionality
- **Real-time data** loading from Firestore

### 5. Subscription Request Management

**File**: `app/admin/subscription-requests.tsx`

**Features**:

- **Filter System**: View pending, approved, rejected, or all requests
- **Request Cards**: Display user info, plan type, reference number, status
- **Detailed Modal**: Full request details with reference image viewer
- **Image Verification**: Full-screen image modal for payment reference
- **Approve/Reject Actions**: One-click approval with automatic user upgrade
- **Status Tracking**: Visual status indicators and timestamps

### 6. User Management System

**File**: `app/admin/user-management.tsx`

**Features**:

- **User Filtering**: Filter by user type (free, subscribed, admin)
- **User Type Changes**: Promote/demote users between roles
- **Usage Reset**: Reset user recipe generation counts
- **Subscription Details**: View current subscription info
- **Bulk Actions**: Multiple user management operations
- **Safety Features**: Prevent admins from demoting themselves

### 7. Admin Hooks

**File**: `hooks/useAdmin.ts`

**Functions**:

- `getDashboardStats()`: Aggregate user and subscription statistics
- `getSubscriptionRequests()`: Load and filter subscription requests
- `approveSubscriptionRequest()`: Approve subscription with expiry calculation
- `rejectSubscriptionRequest()`: Reject subscription with admin notes
- `getUsers()`: Load users with filtering options
- `updateUserType()`: Change user roles with data cleanup
- `resetUserUsage()`: Reset usage statistics

### 8. Authentication Routing

**File**: `components/AuthRouter.tsx`

- Automatic routing based on user type after login
- Admin users → `/admin` dashboard
- Regular users → `/home/(tabs)`
- Unauthenticated users → `/login`

## 🔧 Technical Implementation Details

### Database Structure

#### Enhanced Users Collection

```javascript
{
  // ... existing fields
  userType: "free" | "subscribed" | "admin",
  subscription: {
    status: "pending" | "active" | "expired" | "rejected",
    planType: "monthly" | "yearly",
    submittedAt: timestamp,
    approvedAt: timestamp,
    expiresAt: timestamp,
    referenceImageUrl: string,
    referenceNumber: string,
    adminNotes: string
  },
  usageStats: {
    recipeGenerationsCount: number,
    lastGenerationAt: timestamp,
    monthlyGenerations: number,
    currentMonthStart: timestamp
  }
}
```

#### Subscription Requests Collection

```javascript
{
  id: string,
  userId: string,
  userEmail: string,
  userName: string,
  planType: "monthly" | "yearly",
  referenceNumber: string,
  referenceImageUrl: string,
  status: "pending" | "approved" | "rejected",
  submittedAt: timestamp,
  reviewedAt: timestamp,
  reviewedBy: string, // Admin user ID
  adminNotes: string
}
```

### Key Features

#### 1. Role-Based Access Control

- Admin layout checks user type on mount
- Automatic redirection for unauthorized access
- Context-aware navigation based on user roles

#### 2. Subscription Approval Workflow

- Admin reviews payment reference image
- One-click approve/reject with automatic user upgrade
- Expiry date calculation (30 days monthly, 365 days yearly)
- Admin notes and tracking

#### 3. User Management

- Role changes with automatic data cleanup
- Usage statistics reset functionality
- Subscription management integration
- Safety features to prevent admin lockout

#### 4. Real-Time Dashboard

- Live statistics from Firestore
- Pull-to-refresh functionality
- Automatic data updates
- Visual status indicators

## 🎨 UI/UX Features

### Design Principles

- **Clean and Professional**: Admin-focused interface with clear information hierarchy
- **Mobile-First**: Responsive design optimized for mobile admin usage
- **Status Indicators**: Color-coded badges for user types and subscription status
- **Quick Actions**: Easy-to-access primary functions
- **Safety Confirmations**: Alert dialogs for destructive actions

### Color Coding

- **Free Users**: Orange (#FF9500)
- **Subscribed Users**: Green (#34C759)
- **Admin Users**: Blue (#007AFF)
- **Pending Requests**: Orange (#FF9500)
- **Approved**: Green (#34C759)
- **Rejected**: Red (#FF3B30)

### Navigation Flow

```
Login → Auto-detect Admin → Admin Dashboard
  ├── Subscription Requests
  │   ├── Filter by Status
  │   ├── View Details
  │   ├── Review Reference Image
  │   └── Approve/Reject
  └── User Management
      ├── Filter by User Type
      ├── Change User Roles
      └── Reset Usage Stats
```

## 🔄 Workflows

### Subscription Approval Workflow

1. User submits subscription request with reference image
2. Request appears in admin dashboard as "pending"
3. Admin reviews request details and payment reference
4. Admin approves/rejects with optional notes
5. System automatically updates user profile and subscription status
6. User gains access to unlimited features (if approved)

### User Management Workflow

1. Admin views all users with filtering options
2. Admin can change user types (free ↔ subscribed ↔ admin)
3. System automatically handles data cleanup for role changes
4. Usage statistics can be reset independently
5. All changes are tracked with timestamps

## 🧪 Testing Completed

### Manual Testing Scenarios

- ✅ Admin login and dashboard access
- ✅ Non-admin user access denial
- ✅ Subscription request viewing and filtering
- ✅ Image reference viewing (full screen)
- ✅ Subscription approval workflow
- ✅ User type changes and data cleanup
- ✅ Usage statistics reset
- ✅ Real-time data updates
- ✅ Pull-to-refresh functionality

## 🚀 Deployment Notes

### Admin Account Setup

1. Create admin user through Firebase Console
2. Manually set `userType: "admin"` in Firestore users collection
3. Admin can then access dashboard and manage other users

### Required Permissions

- Firestore read/write access for admin users
- Firebase Storage read access for viewing reference images
- Proper security rules implementation (TODO)

## 📝 Next Steps

### Phase 1: Usage Tracking & Paywall (Pending)

- Implement recipe generation limits for free users
- Create paywall modal when limit reached
- Add usage tracking to recipe generation flow

### Phase 2: Subscription Flow (Pending)

- Build subscription page for users
- Implement Firebase Storage image upload
- Create subscription request submission flow

### Security Rules (TODO)

- Implement Firestore security rules for admin access
- Add Firebase Storage rules for reference images
- Test security rule enforcement

## 🐛 Known Issues

- None currently identified

## 📊 Metrics to Track

- Admin response time to subscription requests
- User upgrade conversion rate
- Dashboard usage patterns
- Error rates in admin operations

---

**Implementation Status**: ✅ Admin Dashboard Core Complete
**Next Phase**: Usage Tracking & Paywall Implementation
