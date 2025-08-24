import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  FlatList,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

type ProfileFields = 'firstName' | 'middleName' | 'lastName' | 'age' | 'gender' | 'username' | 'email';

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<Record<ProfileFields, string>>({
    firstName: '',
    middleName: '',
    lastName: '',
    age: '',
    gender: '',
    username: '',
    email: '',
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const textColor = '#000000'; // Black text
  const saveButtonColor = '#28a745'; //  green

  const genderOptions = [
    { label: 'Select gender', value: '' },
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ];

  const handleInputChange = (field: ProfileFields, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      Alert.alert('Error', 'Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }
    Alert.alert('Success', 'Profile saved successfully!');
    console.log('Profile data:', profileData);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel? All changes will be lost.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () =>
            setProfileData({
              firstName: '',
              middleName: '',
              lastName: '',
              age: '',
              gender: '',
              username: '',
              email: '',
            }),
        },
      ]
    );
  };

  const selectImage = () => {
    Alert.alert('Image Picker', 'Image picker functionality would be implemented here');
  };

  const inputFields: { label: string; field: ProfileFields; placeholder: string; keyboard: 'default' | 'numeric' | 'email-address' }[] = [
    { label: 'First Name *', field: 'firstName', placeholder: 'Enter first name', keyboard: 'default' },
    { label: 'Middle Name', field: 'middleName', placeholder: 'Enter middle name', keyboard: 'default' },
    { label: 'Last Name *', field: 'lastName', placeholder: 'Enter last name', keyboard: 'default' },
    { label: 'Age', field: 'age', placeholder: 'Enter age', keyboard: 'numeric' },
    { label: 'Username', field: 'username', placeholder: 'Enter username', keyboard: 'default' },
    { label: 'Email *', field: 'email', placeholder: 'Enter email address', keyboard: 'email-address' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <ThemedText type="title" style={[styles.header, { color: textColor }]}>
          Profile
        </ThemedText>

        {/* Profile Image Section */}
        <View style={[styles.backgroundBox, styles.imageSection]}>
          <TouchableOpacity onPress={selectImage} style={styles.imageContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={60} color={textColor} />
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={20} color={'#FFFFFF'} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={selectImage} style={styles.changePhotoButton}>
            <ThemedText type="link" style={{ color: textColor }}>Change Photo</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={[styles.backgroundBox, styles.formContainer]}>
          {inputFields.map((item, idx) => (
            <View key={idx} style={styles.inputGroup}>
              <ThemedText type="defaultSemiBold" style={[styles.label, { color: textColor }]}>
                {item.label}
              </ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: textColor }]}
                value={profileData[item.field]}
                onChangeText={(text) => handleInputChange(item.field, text)}
                placeholder={item.placeholder}
                placeholderTextColor={textColor + '80'}
                keyboardType={item.keyboard}
                autoCapitalize={item.field === 'email' || item.field === 'username' ? 'none' : 'sentences'}
              />
            </View>
          ))}

          {/* Gender */}
          <View style={styles.inputGroup}>
            <ThemedText type="defaultSemiBold" style={[styles.label, { color: textColor }]}>
              Gender
            </ThemedText>
            <TouchableOpacity
              style={[styles.input, { borderColor: textColor }]}
              onPress={() => setShowGenderPicker(true)}
            >
              <ThemedText style={{ color: profileData.gender ? textColor : textColor + '80' }}>
                {profileData.gender
                  ? genderOptions.find(option => option.value === profileData.gender)?.label
                  : 'Select gender'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <ThemedText style={[styles.cancelButtonText, { color: textColor }]}>Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: saveButtonColor }]}>
            <ThemedText style={[styles.saveButtonText, { color: '#FFFFFF' }]}>Save</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: '#FFFFFF' }]}>
            <ThemedText type="subtitle" style={[styles.modalTitle, { color: textColor }]}>
              Select Gender
            </ThemedText>
            <FlatList
              data={genderOptions}
              keyExtractor={(item, index) => (item.value || `gender-${index}`)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    handleInputChange('gender', item.value);
                    setShowGenderPicker(false);
                  }}
                >
                  <ThemedText style={{ color: textColor }}>
                    {item.label}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowGenderPicker(false)}
            >
              <ThemedText style={{ color: textColor }}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  header: { textAlign: 'center', marginBottom: 30 },
  backgroundBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  imageSection: { alignItems: 'center' },
  imageContainer: { position: 'relative', marginBottom: 15 },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.6,
    backgroundColor: '#FFFFFF',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0a7ea4',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: { paddingVertical: 8 },
  formContainer: { marginBottom: 10 },
  inputGroup: { marginBottom: 20 },
  label: { marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#687076',
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 16, fontWeight: '600' },
  saveButton: { flex: 1, paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', maxHeight: '60%', borderRadius: 12, padding: 20 },
  modalTitle: { textAlign: 'center', marginBottom: 20 },
  modalItem: { paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  modalCancelButton: { marginTop: 20, paddingVertical: 15, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
});
