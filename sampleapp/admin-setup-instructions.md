# Admin User Setup Instructions

## The Problem

Your admin dashboard is not showing content because your user account is not properly set as an admin in the database.

## Debug Information

The admin dashboard now shows debug information at the top to help you see:

- Your User ID
- Your current User Type
- Loading status
- Current stats

## How to Set Up Admin User

### Method 1: Firebase Console (Recommended)

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**
3. **Navigate to Firestore Database**
4. **Find the 'users' collection**
5. **Locate your user document** (use your email or the User ID from debug info)
6. **Edit the document**:
   - Find the `userType` field
   - Change its value to `"admin"` (with quotes)
   - If the field doesn't exist, add it as a new field with type "string" and value "admin"
7. **Save the changes**
8. **Refresh your app**

### Method 2: Firestore Web Console

If you're using the Firestore web interface:

1. Open your Firestore database
2. Navigate to users collection
3. Find your user document
4. Click the pencil/edit icon
5. Set `userType: "admin"`
6. Save

### Method 3: Quick Admin Test User

If you want to create a test admin user:

1. Sign up with a new email (e.g., admin@test.com)
2. Go to Firestore and set that user's `userType` to "admin"
3. Login with that account

## Expected User Document Structure

```json
{
  "id": "your-user-id",
  "firstName": "Your Name",
  "lastName": "Last Name",
  "email": "your@email.com",
  "userType": "admin", // ← This is the key field!
  "birthday": "2023-01-01T00:00:00Z",
  "gender": "male",
  "usageStats": {
    "recipeGenerationsCount": 0,
    "monthlyGenerations": 0
  },
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

## Troubleshooting

### If you see "User Type: free" in debug info:

- Your userType field is missing or not set to "admin"
- Follow Method 1 above to fix it

### If you see "User Type: undefined":

- Your user document might be missing entirely
- Check if you can find your user in the Firestore users collection
- Try logging out and logging back in

### If debug info shows "Loading: true" for too long:

- There might be a connection issue with Firestore
- Check your internet connection
- Check if Firestore rules are correctly set up

## After Setting Admin

Once you set your userType to "admin":

1. **Refresh the app** or **logout and login again**
2. The debug info should show "User Type: admin"
3. The admin dashboard should display:
   - User statistics cards
   - Message statistics
   - Quick action buttons
   - Recent unread messages (if any)
   - Recent pending subscription requests (if any)

## Clean Up

After confirming everything works, you can remove the debug information by editing the admin dashboard file.
