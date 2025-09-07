# KitchenPal Setup Guide

## Prerequisites

- Node.js (v18+)
- Expo CLI
- Firebase Project
- React Native development environment
- Hugging Face API account (optional, for AI recipe generation)

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Update `config/firebase.ts` with your Firebase config

### 3. AI Recipe Generation Setup (Optional)

For enhanced AI-powered recipe generation:

1. Create a free Hugging Face account at [huggingface.co](https://huggingface.co)
2. Generate an API token at [Settings → Access Tokens](https://huggingface.co/settings/tokens)
3. Create a `.env` file in your project root:
   ```bash
   EXPO_PUBLIC_HUGGINGFACE_API_KEY=your_huggingface_token_here
   ```

**Note**: The app works perfectly without the API key, using a local Filipino recipe database as fallback.

### 4. Required Firebase Rules

#### Firestore Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Recipes collection - users can manage their own recipes
    match /recipes/{recipeId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }

    // Example: If you have shared data that all users can read:
    // match /public/{document} {
    //   allow read: if request.auth != null;
    //   allow write: if false; // Only admins through server-side
    // }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

```

## Development

### Start Development Server

```bash
npm start
```

### Run on Device

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Testing Features

### Registration

1. Launch the app
2. Navigate to Sign Up screen
3. Fill out the registration form:
   - First Name, Last Name (required)
   - Birthday (date picker, must be 13+ years old)
   - Gender (required)
   - Email (valid email format)
   - Password (6+ characters)
4. Submit registration
5. Check Firestore console for user profile data

### AI Recipe Generation

1. Log in to the app
2. Navigate to Home tab
3. Add ingredients (e.g., "chicken", "garlic", "soy sauce")
4. Click "Generate Recipe"
5. With Hugging Face API: Get AI-generated Filipino-biased recipes
6. Without API: Get matched recipes from local database
7. Save generated recipes to your collection

## Troubleshooting

### Common Issues

**Build Errors:**

- Ensure all dependencies are installed: `npm install`
- Clear cache: `expo start --clear`

**Firebase Connection:**

- Verify Firebase config in `config/firebase.ts`
- Check Firebase project settings
- Ensure Firestore and Auth are enabled

**Date Picker Issues:**

- iOS: Uses modal presentation
- Android: Uses native picker
- Verify `@react-native-community/datetimepicker` is installed

**AI Recipe Generation Issues:**

- Check Hugging Face API key in `.env` file
- Restart development server after adding environment variables
- App will fallback to local database if API is unavailable
- Check console logs for AI generation status

## File Structure

```
/app/
  ├── login.tsx              # Login screen
  ├── signup.tsx             # Registration screen
  ├── forgotPassword.tsx     # Password reset
  └── home/                  # Protected routes
    ├── (tabs)/
    │   ├── index.tsx        # Home tab with recipe generator
    │   ├── recipe.tsx       # Recipe dashboard
    │   └── profile.tsx      # User profile
/components/
  ├── recipe/                # Recipe-related components
  │   ├── RecipeGenerator.tsx
  │   ├── RecipeCard.tsx
  │   └── RecipeDetailsModal.tsx
  └── AuthDebug.tsx          # Testing component
/contexts/
  └── AuthContext.tsx        # Auth state management
/hooks/
  ├── useAuth.ts             # Authentication logic
  ├── useFirestore.ts        # Database operations
  └── useRecipeGenerator.ts  # AI recipe generation
/services/
  ├── huggingface.ts         # AI API integration
  ├── recipeGenerator.ts     # Recipe generation logic
  └── apiClient.ts           # Generic API client
/types/
  ├── user.ts                # User interfaces
  ├── recipe.ts              # Recipe interfaces
  └── api.ts                 # API interfaces
/config/
  ├── firebase.ts            # Firebase configuration
  └── apiConfig.ts           # API configuration
/data/
  └── filipino-recipes.json  # Local recipe database
```
