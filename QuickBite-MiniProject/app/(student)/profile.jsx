/**
 * Profile & Settings Screen
 * Real data: editable profile modal, real Supabase updates
 */
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase, updateProfile } from '../../lib/supabase';
import useStore from '../../lib/store';
import { colors } from '../../lib/theme';

const DIETARY_OPTIONS = ['Vegetarian', 'Non-Veg', 'Vegan', 'Halal', 'Gluten-Free'];
const DEPARTMENTS = ['Computer Science', 'Engineering', 'Business', 'Arts & Design', 'Science', 'Law'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'PG 1st Year', 'PG 2nd Year'];

const MENU_SECTIONS = [
  {
    title: 'ACCOUNT SETTINGS',
    items: [
      { icon: 'person-outline', label: 'Edit Profile', action: 'edit_profile' },
      { icon: 'leaf-outline', label: 'Dietary Preferences', action: 'edit_profile' },
    ],
  },
  {
    title: 'PREFERENCES',
    items: [
      { icon: 'notifications-outline', label: 'Notifications', route: null },
      { icon: 'color-palette-outline', label: 'Theme', route: null },
    ],
  },
  {
    title: 'APP INFO',
    items: [
      { icon: 'receipt-outline', label: 'Order History', route: '/(student)/order-history' },
      { icon: 'trophy-outline', label: 'Rewards', route: null },
    ],
  },
  {
    title: 'SUPPORT',
    items: [
      { icon: 'help-circle-outline', label: 'Help Center', route: null },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const session = useStore((s) => s.session);
  const clearAuth = useStore((s) => s.clearAuth);
  const setProfile = useStore((s) => s.setProfile);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editDept, setEditDept] = useState(profile?.department || '');
  const [editYear, setEditYear] = useState(profile?.year || '');
  const [editDietary, setEditDietary] = useState(profile?.dietary_prefs || []);
  const [saving, setSaving] = useState(false);
  const [showDeptPicker, setShowDeptPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          clearAuth();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const openEditModal = () => {
    setEditName(profile?.name || '');
    setEditDept(profile?.department || '');
    setEditYear(profile?.year || '');
    setEditDietary(profile?.dietary_prefs || []);
    setShowEditModal(true);
  };

  const toggleDietaryPref = (pref) => {
    setEditDietary((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile(session.user.id, {
        name: editName.trim(),
        department: editDept,
        year: editYear,
        dietary_prefs: editDietary,
      });
      if (updated) {
        setProfile(updated);
        setShowEditModal(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update profile.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleMenuPress = (item) => {
    if (item.action === 'edit_profile') {
      openEditModal();
    } else if (item.route) {
      router.push(item.route);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="text-lg text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
          Profile
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="items-center py-6 mx-5 mb-4 bg-surface rounded-xl">
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-3">
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <Text className="text-white text-2xl" style={{ fontFamily: 'Inter_700Bold' }}>
                {profile?.name?.[0]?.toUpperCase() || 'S'}
              </Text>
            )}
          </View>
          <Text className="text-lg text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
            {profile?.name || 'Student'}
          </Text>
          <Text className="text-sm text-text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
            Student ID: {profile?.college_id || '--'}
          </Text>
          <Text className="text-xs text-text-tertiary mt-1" style={{ fontFamily: 'Inter_400Regular' }}>
            {profile?.department || 'Not set'}
          </Text>
          <TouchableOpacity
            className="mt-3 px-4 py-2 bg-primary rounded-md"
            onPress={openEditModal}
          >
            <Text className="text-white text-xs" style={{ fontFamily: 'Inter_600SemiBold' }}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sIdx) => (
          <View key={sIdx} className="mb-2">
            <Text className="text-xs text-text-tertiary px-5 py-2" style={{ fontFamily: 'Inter_600SemiBold' }}>
              {section.title}
            </Text>
            {section.items.map((item, iIdx) => (
              <TouchableOpacity
                key={iIdx}
                className="flex-row items-center px-5 py-4 border-b border-border-light"
                onPress={() => handleMenuPress(item)}
                activeOpacity={0.6}
              >
                <Ionicons name={item.icon} size={22} color={colors.textSecondary} />
                <Text className="flex-1 ml-4 text-base text-text-primary" style={{ fontFamily: 'Inter_500Medium' }}>
                  {item.label}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity
          className="flex-row items-center px-5 py-4 mx-5 mt-4 mb-10 border border-error rounded-lg"
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text className="flex-1 ml-4 text-base text-error" style={{ fontFamily: 'Inter_600SemiBold' }}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl max-h-[85%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-border-light">
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text className="text-base text-text-secondary" style={{ fontFamily: 'Inter_500Medium' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text className="text-lg text-text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
                Edit Profile
              </Text>
              <TouchableOpacity onPress={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text className="text-base text-primary" style={{ fontFamily: 'Inter_600SemiBold' }}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false}>
              {/* Name */}
              <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                Full Name
              </Text>
              <TextInput
                className="border border-border rounded-md px-4 py-3 mb-4 text-base text-text-primary bg-surface"
                style={{ fontFamily: 'Inter_400Regular' }}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor={colors.textTertiary}
              />

              {/* Department */}
              <Text className="text-sm text-text-primary mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                Department
              </Text>
              <TouchableOpacity
                className="border border-border rounded-md px-4 py-3 mb-4 bg-surface flex-row items-center justify-between"
                onPress={() => setShowDeptPicker(!showDeptPicker)}
              >
                <Text
                  className={`text-base ${editDept ? 'text-text-primary' : 'text-text-tertiary'}`}
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {editDept || 'Select department'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
              {showDeptPicker && (
                <View className="border border-border rounded-md mb-4 bg-white overflow-hidden">
                  {DEPARTMENTS.map((dept) => (
                    <TouchableOpacity
                      key={dept}
                      className={`px-4 py-3 border-b border-border-light ${editDept === dept ? 'bg-primary-light' : ''}`}
                      onPress={() => { setEditDept(dept); setShowDeptPicker(false); }}
                    >
                      <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_400Regular' }}>{dept}</Text>
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
                  className={`text-base ${editYear ? 'text-text-primary' : 'text-text-tertiary'}`}
                  style={{ fontFamily: 'Inter_400Regular' }}
                >
                  {editYear || 'Select year'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
              {showYearPicker && (
                <View className="border border-border rounded-md mb-4 bg-white overflow-hidden">
                  {YEARS.map((y) => (
                    <TouchableOpacity
                      key={y}
                      className={`px-4 py-3 border-b border-border-light ${editYear === y ? 'bg-primary-light' : ''}`}
                      onPress={() => { setEditYear(y); setShowYearPicker(false); }}
                    >
                      <Text className="text-base text-text-primary" style={{ fontFamily: 'Inter_400Regular' }}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Dietary Preferences */}
              <Text className="text-sm text-text-primary mb-3" style={{ fontFamily: 'Inter_500Medium' }}>
                Dietary Preferences
              </Text>
              <View className="flex-row flex-wrap mb-6" style={{ gap: 8 }}>
                {DIETARY_OPTIONS.map((pref) => {
                  const selected = editDietary.includes(pref);
                  return (
                    <TouchableOpacity
                      key={pref}
                      className={`px-4 py-2 rounded-full border ${
                        selected ? 'bg-primary border-primary' : 'bg-surface border-border'
                      }`}
                      onPress={() => toggleDietaryPref(pref)}
                    >
                      <Text
                        className={`text-sm ${selected ? 'text-white' : 'text-text-secondary'}`}
                        style={{ fontFamily: 'Inter_500Medium' }}
                      >
                        {pref}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Spacer for bottom */}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
