/**
 * Wallet Dashboard Screen
 * Real data: balance from profiles, transactions from transactions table
 */
import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { fetchTransactions, fetchWalletBalance } from '../../lib/supabase';
import useStore from '../../lib/store';
import { colors } from '../../lib/theme';

const QUICK_AMOUNTS = [100, 200, 500, 1000];

export default function WalletScreen() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const session = useStore((s) => s.session);
  const setProfile = useStore((s) => s.setProfile);

  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  const loadWalletData = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }
    try {
      const [balance, txns] = await Promise.all([
        fetchWalletBalance(session.user.id),
        fetchTransactions(session.user.id),
      ]);
      setWalletBalance(balance);
      setTransactions(txns);
    } catch (err) {
      console.error('Error loading wallet data:', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const filteredTransactions =
    selectedTab === 'All'
      ? transactions
      : transactions.filter((t) => t.type === selectedTab.toLowerCase());

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;
    return `${date.toLocaleDateString()}, ${timeStr}`;
  };

  const renderTransaction = ({ item }) => (
    <View className="flex-row items-center py-3 px-5 border-b border-border-light">
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          item.type === 'credit' ? 'bg-success-light' : 'bg-error-light'
        }`}
      >
        <Ionicons
          name={item.type === 'credit' ? 'add-circle' : 'cart'}
          size={20}
          color={item.type === 'credit' ? colors.success : colors.error}
        />
      </View>
      <View className="flex-1">
        <Text className="text-sm text-text-primary" style={{ fontFamily: 'Inter_600SemiBold' }}>
          {item.description || (item.type === 'credit' ? 'Money Added' : 'Order Payment')}
        </Text>
        <Text className="text-xs text-text-tertiary" style={{ fontFamily: 'Inter_400Regular' }}>
          {formatDate(item.created_at)}
        </Text>
      </View>
      <Text
        className={`text-sm ${item.type === 'credit' ? 'text-success' : 'text-error'}`}
        style={{ fontFamily: 'Inter_700Bold' }}
      >
        {item.type === 'credit' ? '+' : '-'}₹{Number(item.amount).toFixed(2)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="flex-1 text-lg text-text-primary text-center mr-10" style={{ fontFamily: 'Inter_700Bold' }}>
          My Wallet
        </Text>
      </View>

      {/* Balance Card */}
      <View className="mx-5 bg-primary rounded-xl p-6 mb-6">
        <Text className="text-white/80 text-xs" style={{ fontFamily: 'Inter_500Medium' }}>
          Current Balance
        </Text>
        <Text className="text-white text-4xl mt-1" style={{ fontFamily: 'Inter_700Bold' }}>
          ₹{Number(walletBalance).toFixed(2)}
        </Text>

        {/* Quick Actions */}
        <View className="flex-row mt-6" style={{ gap: 16 }}>
          {[
            { icon: 'add-circle', label: 'AddMoney' },
            { icon: 'send', label: 'Send' },
            { icon: 'swap-horizontal', label: 'Transfer' },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              className="items-center"
              onPress={() => action.label === 'AddMoney' && setShowAddMoney(!showAddMoney)}
            >
              <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-1">
                <Ionicons name={action.icon} size={20} color="#fff" />
              </View>
              <Text className="text-white text-xs" style={{ fontFamily: 'Inter_500Medium' }}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Add Money Section */}
      {showAddMoney && (
        <View className="mx-5 mb-4 p-4 bg-surface rounded-xl">
          <View className="flex-row flex-wrap mb-3" style={{ gap: 8 }}>
            {QUICK_AMOUNTS.map((amt) => (
              <TouchableOpacity
                key={amt}
                className={`px-5 py-3 rounded-lg border ${
                  selectedAmount === amt ? 'bg-primary border-primary' : 'bg-white border-border'
                }`}
                onPress={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                }}
              >
                <Text
                  className={`text-sm ${selectedAmount === amt ? 'text-white' : 'text-text-primary'}`}
                  style={{ fontFamily: 'Inter_700Bold' }}
                >
                  ₹{amt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row items-center border border-border rounded-lg px-4 py-2 mb-3 bg-white">
            <Text className="text-text-tertiary text-base mr-2">₹</Text>
            <TextInput
              className="flex-1 text-base text-text-primary"
              style={{ fontFamily: 'Inter_400Regular' }}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              value={customAmount}
              onChangeText={(v) => {
                setCustomAmount(v);
                setSelectedAmount(null);
              }}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity className="bg-primary rounded-lg py-3 items-center" activeOpacity={0.8}>
            <Text className="text-white text-base" style={{ fontFamily: 'Inter_700Bold' }}>
              ADD MONEY
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Transaction History */}
      <View className="flex-row mx-5 bg-surface rounded-md p-1 mb-3">
        {['All', 'Credit', 'Debit'].map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-2 rounded-md items-center ${
              selectedTab === tab ? 'bg-primary' : ''
            }`}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              className={`text-xs ${selectedTab === tab ? 'text-white' : 'text-text-secondary'}`}
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text className="text-sm text-text-primary px-5 py-2" style={{ fontFamily: 'Inter_700Bold' }}>
            Transactions
          </Text>
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="wallet-outline" size={48} color={colors.textTertiary} />
            <Text className="text-text-tertiary mt-3" style={{ fontFamily: 'Inter_400Regular' }}>
              No transactions yet
            </Text>
          </View>
        }
      />
    </View>
  );
}
