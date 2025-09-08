# Profile Screen Enhancement Plan

## Current State Analysis

### ✅ **What Already Exists:**

- **Profile Screen Location**: `app/home/profile.tsx`
- **Navigation**: Accessible via drawer menu (right-side drawer)
- **UI Components**: Complete profile form with image placeholder
- **Form Fields**: firstName, middleName, lastName, age, gender, username, email
- **Features**: Gender picker modal, profile image placeholder, save/cancel buttons

### ❌ **Critical Issues Found:**

1. **No Data Connection**: Profile screen uses local state, doesn't load from Firestore
2. **Data Structure Mismatch**: Uses `age` field instead of `birthday` (inconsistent with registration)
3. **No AuthContext Integration**: Doesn't use `useAuthContext` to load user data
4. **Mock Save Functionality**: Save button only shows alert, doesn't update Firestore
5. **Static Data**: All fields start empty, no real user data displayed

## Enhancement Plan

### **Phase A: Data Integration & Viewing (Priority 1)**

#### 1. **Connect to AuthContext**

```typescript
// Current (broken):
const [profileData, setProfileData] = useState<Record<ProfileFields, string>>({
  firstName: "",
  middleName: "",
  lastName: "",
  age: "",
  gender: "",
  username: "",
  email: "",
});

// Enhanced (working):
const { user, userProfile, loading } = useAuthContext();
```

#### 2. **Fix Data Structure Alignment**

```typescript
// Update ProfileFields type to match UserProfile:
type ProfileFields = "firstName" | "middleName" | "lastName" | "birthday" | "gender" | "email";

// Remove: 'age', 'username' (not in current UserProfile)
// Add: 'birthday' (matches registration system)
```

#### 3. **Implement Real Data Loading**

```typescript
// Load user data on component mount:
useEffect(() => {
  if (userProfile) {
    setProfileData({
      firstName: userProfile.firstName,
      middleName: userProfile.middleName || "",
      lastName: userProfile.lastName,
      birthday: userProfile.birthday.toLocaleDateString(),
      gender: userProfile.gender,
      email: userProfile.email,
    });
  }
}, [userProfile]);
```

#### 4. **Add Loading States**

```typescript
// Show loading spinner while data loads
if (loading) {
  return <LoadingSpinner />;
}

// Handle case where user is not authenticated
if (!user) {
  return <NotAuthenticatedView />;
}
```

### **Phase B: Profile Data Display Enhancement**

#### 1. **Read-Only Information Section**

```typescript
// Add account information section:
- Account Created: userProfile.createdAt.toLocaleDateString()
- Last Updated: userProfile.updatedAt.toLocaleDateString()
- User ID: user.uid (masked for security)
- Email Verified: user.emailVerified
```

#### 2. **Better Data Presentation**

```typescript
// Enhanced field display:
- Birthday: Show as formatted date with age calculation
- Gender: Show with proper capitalization
- Email: Show with verification status indicator
- Names: Show full name combination preview
```

#### 3. **Profile Summary Card**

```typescript
// Add summary card at top:
- Profile completion percentage
- Join date
- Quick stats (recipes saved, etc.)
```

### **Phase C: Edit Functionality Implementation**

#### 1. **Two-Mode Interface**

```typescript
// View Mode (default):
- Display data as read-only cards
- "Edit Profile" button to switch to edit mode

// Edit Mode:
- Form fields become editable
- Save/Cancel buttons appear
- Validation and error handling
```

#### 2. **Real Firestore Updates**

```typescript
// Implement actual save functionality:
const handleSave = async () => {
  try {
    await updateUserProfile(profileData);
    setEditMode(false);
    showSuccessMessage();
  } catch (error) {
    showErrorMessage(error.message);
  }
};
```

#### 3. **Input Validation**

```typescript
// Add proper validation:
- Email format validation
- Name length requirements
- Birthday date validation
- Prevent invalid data submission
```

### **Phase D: Advanced Features**

#### 1. **Profile Image Upload**

```typescript
// Replace placeholder with real image upload:
- Image picker integration (expo-image-picker)
- Firebase Storage upload
- Image compression and optimization
- Profile picture display and update
```

#### 2. **Account Management**

```typescript
// Add account management features:
- Change password functionality
- Email verification resend
- Account deletion option
- Data export functionality
```

#### 3. **Privacy Settings**

```typescript
// Add privacy controls:
- Profile visibility settings
- Data sharing preferences
- Recipe sharing permissions
```

## Implementation Strategy

### **Step 1: Quick Fixes (30 minutes)**

- [ ] Import and use `useAuthContext`
- [ ] Update `ProfileFields` type to match `UserProfile`
- [ ] Remove unused fields (age, username)
- [ ] Add birthday field with proper date handling

### **Step 2: Data Loading (45 minutes)**

- [ ] Implement profile data loading from AuthContext
- [ ] Add loading states and error handling
- [ ] Test data display with real user data
- [ ] Fix any TypeScript errors

### **Step 3: Enhanced Display (60 minutes)**

- [ ] Create read-only view mode
- [ ] Add profile summary section
- [ ] Implement account information display
- [ ] Style improvements for data presentation

### **Step 4: Edit Functionality (90 minutes)**

- [ ] Implement edit/view mode toggle
- [ ] Create profile update hook
- [ ] Add Firestore update functionality
- [ ] Implement proper validation and error handling

### **Step 5: Advanced Features (Future)**

- [ ] Profile image upload
- [ ] Account management features
- [ ] Privacy settings
- [ ] Profile completion tracking

## User Experience Flow

### **Current Flow (Broken):**

```
User opens profile → Empty form → User fills data → Save button → Alert only → No persistence
```

### **Enhanced Flow (Working):**

```
User opens profile → Loading → Display real data → Edit button → Form mode → Save → Update Firestore → Success feedback
```

## Technical Requirements

### **Dependencies Needed:**

- ✅ `useAuthContext` - Already available
- ✅ `useFirestore` - Already implemented
- 🔄 Profile update hook - Need to create
- 🔄 Image picker - Future enhancement

### **Database Operations:**

- ✅ Read user profile - Already working in AuthContext
- ❌ Update user profile - Need to implement
- 🔄 Profile image storage - Future enhancement

### **Type Safety:**

- ✅ `UserProfile` interface - Already defined
- ❌ Profile update types - Need to create
- ❌ Form validation types - Need to create

## Expected Benefits

### **For Users:**

- ✅ See their actual profile data
- ✅ Edit and update their information
- ✅ Better visual presentation of data
- ✅ Account information transparency

### **For Development:**

- ✅ Consistent data structure across app
- ✅ Proper integration with authentication system
- ✅ Foundation for future profile features
- ✅ Better user experience and engagement

## Risk Assessment

### **Low Risk:**

- Data loading and display implementation
- UI/UX improvements
- Form validation

### **Medium Risk:**

- Firestore update operations
- Data synchronization between AuthContext and Profile screen
- Image upload functionality (future)

### **High Risk:**

- Data migration if structure changes
- User data loss during updates
- Security concerns with profile data exposure

## Success Metrics

1. **Functionality**: User can view and edit their profile data
2. **Data Consistency**: Profile matches registration data structure
3. **User Experience**: Smooth loading and saving process
4. **Performance**: Fast data loading and updates
5. **Reliability**: No data loss or corruption during updates

---

**Ready for implementation?** The profile screen enhancement will provide a much better user experience and proper integration with the existing authentication system.
