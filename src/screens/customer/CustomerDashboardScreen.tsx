// src/screens/customer/CustomerDashboardScreen.tsx
import React, { useState, useMemo, memo } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Search, MapPin, Star, Clock, Navigation } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { fetchShops } from '../../api/barbershopService';
import { Barbershop } from '../../models/models';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// --- ListHeader Component ---
interface ListHeaderProps {
  userCoords: { latitude: number; longitude: number } | null;
  search: string;
  setSearch: (text: string) => void;
  isLoading: boolean;
  listTitle: string;
}

const ListHeader = memo(({ userCoords, search, setSearch, isLoading, listTitle }: ListHeaderProps) => (
  <>
    <View style={styles.headerSection}>
      <Text style={styles.title}>Find Barbershops</Text>
      <Text style={styles.subtitle}>
        {userCoords ? 'Discover top-rated shops near you' : 'Discover the best shops'}
      </Text>
    </View>

    <View style={styles.searchContainer}>
      <Search size={18} color={theme.colors.muted} style={styles.searchIcon} />
      <TextInput
        placeholder="Search by name or city..."
        placeholderTextColor={theme.colors.muted}
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />
    </View>

    <View style={styles.mapPlaceholder}>
      <Navigation size={32} color={theme.colors.primary} />
      <Text style={styles.mapTitle}>Map View</Text>
      <Text style={styles.mapSubtitle}>
          {userCoords ? 'Location Acquired' : 'Using Default List'}
      </Text>
    </View>

    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{listTitle}</Text>
    </View>

    {isLoading && <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />}
  </>
));


const CustomerDashboard = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>({
    latitude: 27.7154,
    longitude: 85.3073
  });

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['shops', debouncedSearch, userCoords],
    queryFn: ({ pageParam = 0 }) => 
      fetchShops({
        page: pageParam, size: 10, search: debouncedSearch,
        latitude: userCoords?.latitude, longitude: userCoords?.longitude,
      }),
    getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.page + 1,
    initialPageParam: 0,
  });

  const shops = useMemo(() => data?.pages.flatMap((page) => page.content) ?? [], [data]);

  const listTitle = useMemo(() => {
    if (debouncedSearch.length > 1) return `Results for "${debouncedSearch}"`;
    if (userCoords) return "Shops Nearby";
    return "Top Rated Shops";
  }, [debouncedSearch, userCoords]);

  const renderItem = ({ item }: { item: Barbershop }) => (
    <TouchableOpacity 
      style={styles.shopCard} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('BookAppointment', { 
        shopId: item.id.toString(), // FIX: Ensure ID is string
        shopName: item.name 
      })}
    >
      <View style={styles.shopHeader}>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{item.name}</Text>
          <View style={styles.addressRow}>
            <MapPin size={12} color={theme.colors.muted} />
            <Text style={styles.addressText}>{item.address}, {item.city}</Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          <Star size={14} color={theme.colors.primary} fill={theme.colors.primary} />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.shopFooter}>
        <View style={styles.hoursRow}>
          <Clock size={12} color={theme.colors.muted} />
          <Text style={styles.hoursText}>{item.operatingHours || 'Hours not available'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={shops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<ListHeader userCoords={userCoords} search={search} setSearch={setSearch} isLoading={isLoading} listTitle={listTitle} />}
        onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  listContent: { paddingBottom: 30 },
  headerSection: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xl, paddingBottom: theme.spacing.lg },
  title: { fontSize: 28, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.xs },
  subtitle: { fontSize: 14, fontFamily: theme.fonts.sans, color: theme.colors.muted },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg, backgroundColor: 'rgba(39, 39, 42, 0.3)', borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md },
  searchIcon: { marginRight: theme.spacing.sm },
  searchInput: { flex: 1, height: 44, fontSize: 14, fontFamily: theme.fonts.sans, color: theme.colors.text },
  mapPlaceholder: { marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.xl, height: 180, backgroundColor: 'rgba(24, 24, 27, 0.4)', borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  mapTitle: { fontSize: 14, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: theme.spacing.sm },
  mapSubtitle: { fontSize: 12, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: theme.spacing.xs },
  sectionHeader: { paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md },
  sectionTitle: { fontSize: 18, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.text },
  shopCard: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg, marginHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md },
  shopHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
  shopInfo: { flex: 1, marginRight: theme.spacing.md },
  shopName: { fontSize: 16, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.xs },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  addressText: { fontSize: 12, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginLeft: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.primary, marginLeft: 4 },
  shopFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hoursRow: { flexDirection: 'row', alignItems: 'center' },
  hoursText: { fontSize: 12, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginLeft: 4 },
});

export default CustomerDashboard;