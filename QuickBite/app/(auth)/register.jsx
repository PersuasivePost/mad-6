/**
 * Registration Screen
 * Role toggle: Student vs Canteen Staff
 * Staff: campus selector, canteen selector, staff role (Employee/Manager)
 * Student: student ID field
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { colors } from '../../lib/theme';

/** Campus options */
const CAMPUSES = [
  { label: 'KJSCE, Mumbai', value: 'kjsce' },
];

/** Canteen options per campus */
const CANTEENS_BY_CAMPUS = {
  kjsce: [
    {
      label: 'KJSCE Engineering Canteen',
      value: 'aaaaaaaa-0000-0000-0000-000000000001',
    },
  ],
};

/** Staff role options */
const STAFF_ROLES = [
  { label: 'Employee', value: 'employee' },
  { label: 'Manager', value: 'manager' },
];

export default function RegisterScreen() {
  const router = useRouter();

  // Common fields
  const [roleToggle, setRoleToggle] = useState('student'); // 'student' | 'staff'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Student-only fields
  const [studentId, setStudentId] = useState('');

  // Staff-only fields
  const [selectedCampus, setSelectedCampus] = useState('');
  const [selectedCanteen, setSelectedCanteen] = useState('');
  const [staffRole, setStaffRole] = useState('employee');
  const [showCampusPicker, setShowCampusPicker] = useState(false);
  const [showCanteenPicker, setShowCanteenPicker] = useState(false);
  const [showStaffRolePicker, setShowStaffRolePicker] = useState(false);

  const isStaff = roleToggle === 'staff';

  const getPasswordStrength = () => {
    if (!password) return { label: '', color: colors.textTertiary, width: '0%' };
    if (password.length < 6) return { label: 'Weak', color: colors.error, width: '33%' };
    if (password.length < 10) return { label: 'Medium', color: colors.warning, width: '66%' };
    return { label: 'Strong', color: colors.success, width: '100%' };
  };

  const getCampusLabel = () => {
    const campus = CAMPUSES.find((c) => c.value === selectedCampus);
    return campus ? campus.label : '';
  };

  const getCanteenLabel = () => {
    const canteens = CANTEENS_BY_CAMPUS[selectedCampus] || [];
    const canteen = canteens.find((c) => c.value === selectedCanteen);
    return canteen ? canteen.label : '';
  };

  const getStaffRoleLabel = () => {
    const r = STAFF_ROLES.find((sr) => sr.value === staffRole);
    return r ? r.label : 'Employee';
  };

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to the Terms of Service.');
      return;
    }
    if (isStaff && (!selectedCampus || !selectedCanteen)) {
      Alert.alert('Error', 'Please select a campus and canteen.');
      return;
    }

    setLoading(true);
    try {
      // Determine the actual role to save
      const actualRole = isStaff ? staffRole : 'student';

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: fullName.trim(),
            role: actualRole,
            phone: phone.trim(),
            ...(isStaff
              ? {
                  vendor_id: selectedCanteen,
                  campus: selectedCampus,
                }
              : {
                  college_id: studentId.trim(),
                }),
          },
        },
      });

      if (error) {
        Alert.alert('Sign Up Failed', error.message);
        return;
      }

      // If sign-up succeeded and we have a user, also update the profiles table directly
      if (data?.user?.id) {
        const profileUpdate = {
          id: data.user.id,
          name: fullName.trim(),
          role: actualRole,
          phone: phone.trim(),
          ...(isStaff
            ? {
                vendor_id: selectedCanteen,
                campus: selectedCampus,
              }
            : {
                college_id: studentId.trim(),
              }),
        };

        await supabase.from('profiles').upsert(profileUpdate);
      }

      Alert.alert(
        'Account Created!',
        'Please check your email to verify your account, then log in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 pt-14 pb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View className="px-6">
          {/* Avatar Upload */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-surface items-center justify-center border-2 border-border">
              <Ionicons name="person-outline" size={32} color={colors.textTertiary} />
            </View>
            <TouchableOpacity className="mt-2">
              <Text
                className="text-sm text-primary"
                style={{ fontFamily: 'Inter_500Medium' }}
              >
                Upload Profile Photo
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            className="text-2xl text-text-primary text-center mb-2"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            Create Account
          </Text>

          {/* Role Toggle */}
          <View className="flex-row bg-surface rounded-md p-1 mb-6">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-md items-center ${
                roleToggle === 'student' ? 'bg-primary' : ''
              }`}
              onPress={() => setRoleToggle('student')}
            >
              <Text
                className={`text-sm ${
                  roleToggle === 'student' ? 'text-white' : 'text-text-secondary'
                }`}
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-md items-center ${
                roleToggle === 'staff' ? 'bg-primary' : ''
              }`}
              onPress={() => setRoleToggle('staff')}
            >
              <Text
                className={`text-sm ${
                  roleToggle === 'staff' ? 'text-white' : 'text-text-secondary'
                }`}
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                Canteen Staff
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name */}
          <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
            Full Name
          </Text>
          <TextInput
            className="border border-border rounded-md px-4 py-3 mb-4 text-base text-text-primary bg-surface"
            style={{ fontFamily: 'Inter_400Regular' }}
            placeholder="John Doe"
            placeholderTextColor={colors.textTertiary}
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Email */}
          <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
            Email Address
          </Text>
          <TextInput
            className="border border-border rounded-md px-4 py-3 mb-4 text-base text-text-primary bg-surface"
            style={{ fontFamily: 'Inter_400Regular' }}
            placeholder="john@university.edu"
            placeholderTextColor={colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Phone */}
          <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
            Phone Number
          </Text>
          <View className="flex-row mb-4">
            <View className="border border-border rounded-md px-3 py-3 mr-2 bg-surface justify-center">
              <Text className="text-base text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
                +91
              </Text>
            </View>
            <TextInput
              className="flex-1 border border-border rounded-md px-4 py-3 text-base text-text-primary bg-surface"
              style={{ fontFamily: 'Inter_400Regular' }}
              placeholder="9876543210"
              placeholderTextColor={colors.textTertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* ===================== STUDENT FIELDS ===================== */}
          {!isStaff && (
            <>
              {/* Student ID */}
              <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                Student ID
              </Text>
              <TextInput
                className="border border-border rounded-md px-4 py-3 mb-4 text-base text-text-primary bg-surface"
                style={{ fontFamily: 'Inter_400Regular' }}
                placeholder="2024-KJSCE-001"
                placeholderTextColor={colors.textTertiary}
                value={studentId}
                onChangeText={setStudentId}
              />
            </>
          )}

          {/* ===================== STAFF FIELDS ===================== */}
          {isStaff && (
            <>
              {/* Campus Selector */}
              <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                Select Campus
              </Text>
              <TouchableOpacity
                className="border border-border rounded-md px-4 py-3 mb-1 bg-surface flex-row items-center justify-between"
                onPress={() => setShowCampusPicker(!showCampusPicker)}
              >
                <Text
                  className={`text-base ${selectedCampus ? 'text-text-primary' : 'text-text-tertiary'}`}
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {getCampusLabel() || 'Choose your campus'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
              {showCampusPicker && (
                <View className="border border-border rounded-md mb-3 bg-white overflow-hidden">
                  {CAMPUSES.map((campus) => (
                    <TouchableOpacity
                      key={campus.value}
                      className={`px-4 py-3 border-b border-border-light ${
                        selectedCampus === campus.value ? 'bg-primary-light' : ''
                      }`}
                      onPress={() => {
                        setSelectedCampus(campus.value);
                        setSelectedCanteen(''); // reset canteen on campus change
                        setShowCampusPicker(false);
                      }}
                    >
                      <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_400Regular' }}>
                        {campus.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {!showCampusPicker && <View className="mb-3" />}

              {/* Canteen Selector */}
              {selectedCampus ? (
                <>
                  <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                    Select Canteen
                  </Text>
                  <TouchableOpacity
                    className="border border-border rounded-md px-4 py-3 mb-1 bg-surface flex-row items-center justify-between"
                    onPress={() => setShowCanteenPicker(!showCanteenPicker)}
                  >
                    <Text
                      className={`text-base ${selectedCanteen ? 'text-text-primary' : 'text-text-tertiary'}`}
                      style={{ fontFamily: 'Inter_400Regular' }}
                    >
                      {getCanteenLabel() || 'Choose your canteen'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                  {showCanteenPicker && (
                    <View className="border border-border rounded-md mb-3 bg-white overflow-hidden">
                      {(CANTEENS_BY_CAMPUS[selectedCampus] || []).map((canteen) => (
                        <TouchableOpacity
                          key={canteen.value}
                          className={`px-4 py-3 border-b border-border-light ${
                            selectedCanteen === canteen.value ? 'bg-primary-light' : ''
                          }`}
                          onPress={() => {
                            setSelectedCanteen(canteen.value);
                            setShowCanteenPicker(false);
                          }}
                        >
                          <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_400Regular' }}>
                            {canteen.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {!showCanteenPicker && <View className="mb-3" />}
                </>
              ) : null}

              {/* Staff Role Selector */}
              <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                Staff Role
              </Text>
              <TouchableOpacity
                className="border border-border rounded-md px-4 py-3 mb-1 bg-surface flex-row items-center justify-between"
                onPress={() => setShowStaffRolePicker(!showStaffRolePicker)}
              >
                <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_400Regular' }}>
                  {getStaffRoleLabel()}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
              {showStaffRolePicker && (
                <View className="border border-border rounded-md mb-3 bg-white overflow-hidden">
                  {STAFF_ROLES.map((sr) => (
                    <TouchableOpacity
                      key={sr.value}
                      className={`px-4 py-3 border-b border-border-light ${
                        staffRole === sr.value ? 'bg-primary-light' : ''
                      }`}
                      onPress={() => {
                        setStaffRole(sr.value);
                        setShowStaffRolePicker(false);
                      }}
                    >
                      <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_400Regular' }}>
                        {sr.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {!showStaffRolePicker && <View className="mb-3" />}
            </>
          )}

          {/* Password */}
          <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
            Password
          </Text>
          <View className="flex-row items-center border border-border rounded-md px-4 py-3 mb-2 bg-surface">
            <TextInput
              className="flex-1 text-base text-text-primary"
              style={{ fontFamily: 'Inter_400Regular' }}
              placeholder="••••••••"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
          {/* Password Strength */}
          {password.length > 0 && (
            <View className="mb-4">
              <View className="h-1 bg-border-light rounded-full overflow-hidden mb-1">
                <View
                  style={{
                    height: '100%',
                    width: strength.width,
                    backgroundColor: strength.color,
                    borderRadius: 999,
                  }}
                />
              </View>
              <Text className="text-xs" style={{ color: strength.color, fontFamily: 'Inter_400Regular' }}>
                Password strength: {strength.label}
              </Text>
            </View>
          )}

          {/* Confirm Password */}
          <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
            Confirm Password
          </Text>
          <TextInput
            className="border border-border rounded-md px-4 py-3 mb-4 text-base text-text-primary bg-surface"
            style={{ fontFamily: 'Inter_400Regular' }}
            placeholder="••••••••"
            placeholderTextColor={colors.textTertiary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Terms */}
          <TouchableOpacity
            className="flex-row items-start mb-6"
            onPress={() => setAgreedToTerms(!agreedToTerms)}
          >
            <View
              className={`w-5 h-5 rounded border mr-3 mt-0.5 items-center justify-center ${
                agreedToTerms ? 'bg-primary border-primary' : 'border-border'
              }`}
            >
              {agreedToTerms && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
            <Text className="flex-1 text-xs text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
              I agree to the{' '}
              <Text className="text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text className="text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
                Privacy Policy
              </Text>
              .
            </Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            className="bg-primary rounded-md py-4 items-center mb-6"
            style={{ opacity: loading ? 0.7 : 1 }}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Sign Up as {isStaff ? getStaffRoleLabel() : 'Student'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center">
            <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-sm text-primary" style={{ fontFamily: 'Inter_600SemiBold' }}>
                  Log In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
