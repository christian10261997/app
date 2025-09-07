import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { db } from "../config/firebase";

export interface ProfileUpdateData {
  firstName: string;
  middleName: string;
  lastName: string;
  birthday: Date;
  gender: string;
  email: string;
}

export function useProfile() {
  const [loading, setLoading] = useState(false);

  const updateUserProfile = async (userId: string, profileData: ProfileUpdateData) => {
    setLoading(true);
    try {
      const userRef = doc(db, "users", userId);
      const updateData = {
        firstName: profileData.firstName.trim(),
        middleName: profileData.middleName?.trim() || "",
        lastName: profileData.lastName.trim(),
        birthday: profileData.birthday,
        gender: profileData.gender.trim(),
        email: profileData.email.trim(),
        updatedAt: new Date(),
      };

      await updateDoc(userRef, updateData);
      return { success: true };
    } catch (error: any) {
      console.error("Error updating profile:", error);
      return { success: false, error: error.message || "Failed to update profile" };
    } finally {
      setLoading(false);
    }
  };

  const validateProfileData = (data: ProfileUpdateData) => {
    const errors: string[] = [];

    if (!data.firstName.trim()) {
      errors.push("First name is required");
    }

    if (!data.lastName.trim()) {
      errors.push("Last name is required");
    }

    if (!data.email.trim()) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push("Please enter a valid email address");
      }
    }

    if (!data.gender.trim()) {
      errors.push("Gender is required");
    }

    if (!data.birthday) {
      errors.push("Birthday is required");
    } else {
      // Check if user is at least 13 years old
      const today = new Date();
      const age = today.getFullYear() - data.birthday.getFullYear();
      const monthDiff = today.getMonth() - data.birthday.getMonth();
      const dayDiff = today.getDate() - data.birthday.getDate();
      const calculatedAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      if (calculatedAge < 13) {
        errors.push("You must be at least 13 years old");
      }

      if (calculatedAge > 120) {
        errors.push("Please enter a valid birth date");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  return {
    updateUserProfile,
    validateProfileData,
    loading,
  };
}
