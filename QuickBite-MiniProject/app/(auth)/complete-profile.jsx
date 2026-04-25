/**
 * Complete Profile Screen
 * Matches Figma: Step 1/2 — profile details, dietary preferences
 */
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { updateProfile } from '../../lib/supabase';
import useStore from '../../lib/store';
import { colors } from '../../lib/theme';

const DIETARY_OPTIONS = ['Vegetarian', 'Non-Veg', 'Vegan', 'Halal', 'Gluten-Free'];
const DEPARTMENTS = ['Computer Science', 'Engineering', 'Business', 'Arts & Design', 'Science', 'Law'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'];

export default function CompleteProfileScreen() {
  const router = useRouter();
  const session = useStore((s) => s.session);
  const setProfile = useStore((s) => s.setProfile);

  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [dietaryPrefs, setDietaryPrefs] = useState([]);
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeptPicker, setShowDeptPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const toggleDietaryPref = (pref) => {
    setDietaryPrefs((prev) =>
      prev.includes(pref)
        ? prev.filter((p) => p !== pref)
        : [...prev, pref]
    );
  };

  const handleContinue = async () => {
    if (!department || !year) {
      Alert.alert('Error', 'Please select your department and year.');
      return;
    }

    setLoading(true);
    try {
      const updates = {
        department,
        year,
        dietary_prefs: dietaryPrefs,
        name: session?.user?.user_metadata?.name || 'Student',
      };

      const updatedProfile = await updateProfile(session.user.id, updates);
      if (updatedProfile) {
        setProfile(updatedProfile);
        // Root layout will handle redirect based on role
      } else {
        Alert.alert('Error', 'Failed to update profile.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-sm text-primary" style={{ fontFamily: 'Inter_600SemiBold' }}>
          Step 1 of 2
        </Text>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl text-text-primary mb-2" style={{ fontFamily: 'Inter_700Bold' }}>
          Complete Your Profile
        </Text>
        <Text className="text-sm text-text-secondary mb-6" style={{ fontFamily: 'Inter_400Regular' }}>
          Help us personalize your QuickBite experience.
        </Text>

        {/* Avatar */}
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-primary-light items-center justify-center border-2 border-primary">
            <Ionicons name="person" size={40} color={colors.primary} />
          </View>
          <TouchableOpacity className="mt-2">
            <Text className="text-sm text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
              Update Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* Department */}
        <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
          Department
        </Text>
        <TouchableOpacity
          className="border border-border rounded-md px-4 py-3 mb-4 bg-surface flex-row items-center justify-between"
          onPress={() => setShowDeptPicker(!showDeptPicker)}
        >
          <Text
            className={`text-base ${department ? 'text-text-primary' : 'text-text-tertiary'}`}
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {department || 'Select your department'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
        {showDeptPicker && (
          <View className="border border-border rounded-md mb-4 bg-white overflow-hidden">
            {DEPARTMENTS.map((dept) => (
              <TouchableOpacity
                key={dept}
                className={`px-4 py-3 border-b border-border-light ${
                  department === dept ? 'bg-primary-light' : ''
                }`}
                onPress={() => {
                  setDepartment(dept);
                  setShowDeptPicker(false);
                }}
              >
                <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_400Regular' }}>
                  {dept}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Year */}
        <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
          Year of Study
        </Text>
        <TouchableOpacity
          className="border border-border rounded-md px-4 py-3 mb-4 bg-surface flex-row items-center justify-between"
          onPress={() => setShowYearPicker(!showYearPicker)}
        >
          <Text
            className={`text-base ${year ? 'text-text-primary' : 'text-text-tertiary'}`}
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            {year || 'Select your year'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
        {showYearPicker && (
          <View className="border border-border rounded-md mb-4 bg-white overflow-hidden">
            {YEARS.map((y) => (
              <TouchableOpacity
                key={y}
                className={`px-4 py-3 border-b border-border-light ${
                  year === y ? 'bg-primary-light' : ''
                }`}
                onPress={() => {
                  setYear(y);
                  setShowYearPicker(false);
                }}
              >
                <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_400Regular' }}>
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Dietary Preferences */}
        <Text className="text-sm text-text-primary mb-3" style={{ fontFamily: 'Inter_500Medium' }}>
          Dietary Preferences
        </Text>
        <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
          {DIETARY_OPTIONS.map((pref) => {
            const selected = dietaryPrefs.includes(pref);
            return (
              <TouchableOpacity
                key={pref}
                className={`px-4 py-2 rounded-full border ${
                  selected
                    ? 'bg-primary border-primary'
                    : 'bg-surface border-border'
                }`}
                onPress={() => toggleDietaryPref(pref)}
              >
                <Text
                  className={`text-sm ${selected ? 'text-white' : 'text-text-secondary'}`}
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  {pref === 'Vegetarian' && '🟢 '}{pref === 'Non-Veg' && '🔴 '}{pref}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Allergies */}
        <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
          Allergies <Text className="text-text-tertiary">(Optional)</Text>
        </Text>
        <TextInput
          className="border border-border rounded-md px-4 py-3 mb-8 text-base text-text-primary bg-surface"
          style={{ fontFamily: 'Inter_400Regular' }}
          placeholder="e.g., Peanuts, Shellfish, Dairy"
          placeholderTextColor={colors.textTertiary}
          value={allergies}
          onChangeText={setAllergies}
        />

        {/* Continue Button */}
        <TouchableOpacity
          className="bg-primary rounded-md py-4 items-center flex-row justify-center mb-10"
          onPress={handleContinue}
          disabled={loading}
          activeOpacity={0.8}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text className="text-white text-base mr-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
                Continue
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
