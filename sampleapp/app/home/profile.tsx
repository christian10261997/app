import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { genderOptions } from "@/constants/Gender";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../../contexts/AuthContext";
import { ProfileUpdateData, useProfile } from "../../hooks/useProfile";

type ProfileFields = "firstName" | "middleName" | "lastName" | "birthday" | "gender" | "email";

export default function ProfileScreen() {
  const { user, userProfile, loading: authLoading } = useAuthContext();
  const { updateUserProfile, validateProfileData, loading: profileLoading } = useProfile();

  // Helper function to ensure birthday is a valid Date
  const getSafeBirthdayDate = (birthday: Date | undefined | null): Date => {
    if (!birthday || !(birthday instanceof Date) || isNaN(birthday.getTime())) {
      return new Date(); // Default to current date if invalid
    }
    return birthday;
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState<Record<ProfileFields, string>>({
    firstName: "",
    middleName: "",
    lastName: "",
    birthday: "",
    gender: "",
    email: "",
  });
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const textColor = "#000000";
  const saveButtonColor = "#28a745";

  // Load user profile data when component mounts or userProfile changes
  useEffect(() => {
    if (userProfile) {
      const birthdayDate = getSafeBirthdayDate(userProfile.birthday);

      setProfileData({
        firstName: userProfile.firstName,
        middleName: userProfile.middleName || "",
        lastName: userProfile.lastName,
        birthday: birthdayDate.toLocaleDateString(),
        gender: userProfile.gender,
        email: userProfile.email,
      });
      setBirthday(birthdayDate);
    }
  }, [userProfile]);

  const handleInputChange = (field: ProfileFields, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user || !userProfile) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    const updateData: ProfileUpdateData = {
      firstName: profileData.firstName,
      middleName: profileData?.middleName || "",
      lastName: profileData.lastName,
      birthday: birthday,
      gender: profileData.gender,
      email: profileData.email,
    };

    const validation = validateProfileData(updateData);
    if (!validation.isValid) {
      Alert.alert("Validation Error", validation.errors.join("\n"));
      return;
    }

    try {
      const result = await updateUserProfile(user.uid, updateData);
      if (result.success) {
        Alert.alert("Success", "Profile updated successfully!");
        setIsEditMode(false);
        // Note: The auth context will automatically reload the profile data
      } else {
        Alert.alert("Error", result.error || "Failed to update profile");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      const birthdayDate = getSafeBirthdayDate(userProfile.birthday);

      // Reset to original data
      setProfileData({
        firstName: userProfile.firstName,
        middleName: userProfile.middleName || "",
        lastName: userProfile.lastName,
        birthday: birthdayDate.toLocaleDateString(),
        gender: userProfile.gender,
        email: userProfile.email,
      });
      setBirthday(birthdayDate);
    }
    setIsEditMode(false);
  };

  const inputFields: { label: string; field: ProfileFields; placeholder: string; keyboard: "default" | "email-address" }[] = [
    { label: "First Name *", field: "firstName", placeholder: "Enter first name", keyboard: "default" },
    { label: "Middle Name", field: "middleName", placeholder: "Enter middle name", keyboard: "default" },
    { label: "Last Name *", field: "lastName", placeholder: "Enter last name", keyboard: "default" },
    { label: "Email *", field: "email", placeholder: "Enter email address", keyboard: "email-address" },
  ];

  // Show loading spinner while data loads
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={saveButtonColor} />
        <ThemedText style={{ marginTop: 16, color: textColor }}>Loading profile...</ThemedText>
      </View>
    );
  }

  // Handle case where user is not authenticated
  if (!user || !userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="person-circle" size={80} color="#ccc" />
        <ThemedText style={{ marginTop: 16, color: textColor }}>Not authenticated</ThemedText>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header with title and Edit button */}
          <View style={styles.profileHeader}>
            <View style={styles.titleContainer}>
              <ThemedText style={[styles.profileSubtitle, { color: textColor + "CC" }]}>Manage your personal information and account details</ThemedText>
            </View>
          </View>

          {/* Account Information Section */}

          {/* Form Fields */}
          <View style={[styles.backgroundBox, styles.formContainer]}>
            {inputFields.map((item, idx) => (
              <View key={idx} style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold" style={[styles.label, { color: textColor }]}>
                  {item.label}
                </ThemedText>
                {isEditMode ? (
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor: textColor }]}
                    value={profileData[item.field]}
                    onChangeText={(text) => handleInputChange(item.field, text)}
                    placeholder={item.placeholder}
                    placeholderTextColor={textColor + "80"}
                    keyboardType={item.keyboard}
                    autoCapitalize={item.field === "email" ? "none" : "sentences"}
                  />
                ) : (
                  <View style={[styles.viewField, { borderColor: "#e0e0e0" }]}>
                    <ThemedText style={[styles.viewText, { color: textColor }]}>{profileData[item.field] || "Not provided"}</ThemedText>
                  </View>
                )}
              </View>
            ))}

            {/* Birthday */}
            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={[styles.label, { color: textColor }]}>
                Birthday *
              </ThemedText>
              {isEditMode ? (
                <TouchableOpacity style={[styles.input, { borderColor: textColor, justifyContent: "center" }]} onPress={() => setShowDatePicker(true)}>
                  <ThemedText style={[styles.datePickerText, { color: textColor }]}>{getSafeBirthdayDate(birthday).toLocaleDateString()}</ThemedText>
                </TouchableOpacity>
              ) : (
                <View style={[styles.viewField, { borderColor: "#e0e0e0" }]}>
                  <ThemedText style={[styles.viewText, { color: textColor }]}>
                    {(() => {
                      const safeBirthday = getSafeBirthdayDate(birthday);
                      const age = new Date().getFullYear() - safeBirthday.getFullYear();
                      return `${safeBirthday.toLocaleDateString()} (${age} years old)`;
                    })()}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={[styles.label, { color: textColor }]}>
                Gender *
              </ThemedText>
              {isEditMode ? (
                <TouchableOpacity style={[styles.input, { borderColor: textColor, justifyContent: "center" }]} onPress={() => setShowGenderPicker(true)}>
                  <ThemedText style={{ color: profileData.gender ? textColor : textColor + "80" }}>
                    {profileData.gender ? genderOptions.find((option) => option.value === profileData.gender)?.label : "Select gender"}
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <View style={[styles.viewField, { borderColor: "#e0e0e0" }]}>
                  <ThemedText style={[styles.viewText, { color: textColor }]}>
                    {profileData.gender ? genderOptions.find((option) => option.value === profileData.gender)?.label : "Not provided"}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons - Only show in edit mode */}
          {isEditMode && (
            <View style={styles.buttonContainer}>
              <ThemedButton variant="success" onPress={handleCancel} style={styles.cancelButton}>
                Cancel
              </ThemedButton>
              <ThemedButton variant="secondary" onPress={handleSave} style={styles.saveButton} disabled={profileLoading} loading={profileLoading}>
                Save
              </ThemedButton>
            </View>
          )}

          {!isEditMode && (
            <View style={[styles.backgroundBox, styles.accountInfoSection]}>
              <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
                Account Information
              </ThemedText>
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: textColor }]}>Member since:</ThemedText>
                <ThemedText style={[styles.infoValue, { color: textColor }]}>{userProfile.createdAt.toLocaleDateString()}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: textColor }]}>Last updated:</ThemedText>
                <ThemedText style={[styles.infoValue, { color: textColor }]}>{userProfile.updatedAt.toLocaleDateString()}</ThemedText>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker */}
      {showDatePicker && Platform.OS === "ios" && (
        <Modal transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <ThemedText style={styles.modalButton}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <ThemedText style={styles.modalButton}>Done</ThemedText>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={birthday}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setBirthday(selectedDate);
                  }
                }}
              />
            </View>
          </View>
        </Modal>
      )}

      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={birthday}
          mode="date"
          display="default"
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setBirthday(selectedDate);
            }
          }}
        />
      )}

      {/* Gender Picker Modal */}
      <Modal visible={showGenderPicker} transparent={true} animationType="slide" onRequestClose={() => setShowGenderPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: "#FFFFFF" }]}>
            <ThemedText type="subtitle" style={[styles.modalTitle, { color: textColor }]}>
              Select Gender
            </ThemedText>
            <FlatList
              data={genderOptions}
              keyExtractor={(item, index) => item.value || `gender-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    handleInputChange("gender", item.value);
                    setShowGenderPicker(false);
                  }}>
                  <ThemedText style={{ color: textColor }}>{item.label}</ThemedText>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowGenderPicker(false)}>
              <ThemedText style={{ color: textColor }}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  keyboardAvoidingView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" },
  scrollContainer: { paddingTop: 0, paddingRight: 20, paddingLeft: 20, paddingBottom: 40 },
  headerContainer: { flexDirection: "row", justifyContent: "flex-start", alignItems: "center", marginBottom: 20 },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  profileTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  editModeInfo: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#007AFF",
  },
  editModeText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  header: { fontSize: 28, fontWeight: "bold" },
  editButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 4 },
  editButtonText: { color: "white", fontSize: 14, fontWeight: "600" },
  backgroundBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  accountInfoSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  infoLabel: { fontSize: 14, fontWeight: "500" },
  infoValue: { fontSize: 14 },
  imageSection: { alignItems: "center" },
  imageContainer: { position: "relative", marginBottom: 15 },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    opacity: 0.6,
    backgroundColor: "#FFFFFF",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0a7ea4",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: { marginBottom: 10 },
  inputGroup: { marginBottom: 20 },
  label: { marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  viewField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#f9f9f9",
  },
  viewText: { fontSize: 16 },
  datePickerText: { fontSize: 16 },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", gap: 15 },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  cancelButtonText: { fontSize: 16, fontWeight: "600" },
  saveButton: { flex: 1, paddingVertical: 15, borderRadius: 8, alignItems: "center" },
  saveButtonText: { fontSize: 16, fontWeight: "600" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "80%", maxHeight: "60%", borderRadius: 12, padding: 20, backgroundColor: "#FFFFFF" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalButton: { fontSize: 16, color: "#007AFF", fontWeight: "600" },
  modalTitle: { textAlign: "center", marginBottom: 20 },
  modalItem: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" },
  modalCancelButton: { marginTop: 20, paddingVertical: 15, alignItems: "center", borderTopWidth: 1, borderTopColor: "#e0e0e0" },
});
