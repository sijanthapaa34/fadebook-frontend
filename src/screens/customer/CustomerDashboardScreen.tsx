import React, { useState, useEffect, useMemo, memo, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, PermissionsAndroid, Platform, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Search, MapPin, Star, Clock, Navigation } from 'lucide-react-native';
import MapView, { Marker, UrlTile, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

import { theme } from '../../theme/theme';
import { fetchShops } from '../../api/barbershopService';
import { BarbershopDTO } from '../../models/models';
import type { RootStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_LATITUDE = 28.2096; // Pokhara
const DEFAULT_LONGITUDE = 83.9856; // Pokhara
const DEFAULT_DELTA = 0.05;

// --- ListHeader Component ---
interface ListHeaderProps {
  userCoords: { latitude: number; longitude: number } | null;
  search: string;
  setSearch: (text: string) => void;
  isLoading: boolean;
  listTitle: string;
  shops: BarbershopDTO[];
  mapRef: React.RefObject<MapView | null>;
}

const ListHeader = memo(({ userCoords, search, setSearch, isLoading, listTitle, shops, mapRef }: ListHeaderProps) => (
  <>
    <View style={styles.headerSection}>
      <Text style={styles.title}>Find Barbershops</Text>
      <Text style={styles.subtitle}>
        {userCoords ? 'Discover top-rated shops near you' : 'Acquiring your location...'}
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

    {/* MAP VIEW */}
    <View style={styles.mapContainer}>
      {userCoords ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: userCoords.latitude,
              longitude: userCoords.longitude,
              latitudeDelta: DEFAULT_DELTA,
              longitudeDelta: DEFAULT_DELTA,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {Platform.OS === 'android' && (
              <UrlTile
                urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
                flipY={false}
              />
            )}

            {shops.map((shop) => (
              shop.latitude && shop.longitude && (
                <Marker
                  key={shop.id}
                  coordinate={{
                    latitude: parseFloat(shop.latitude.toString()),
                    longitude: parseFloat(shop.longitude.toString()),
                  }}
                  title={shop.name}
                  description={shop.address}
                  pinColor={theme.colors.primary}
                />
              )
            ))}
          </MapView>

          {/* RE-CENTER BUTTON */}
          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => {
              mapRef.current?.animateToRegion({
                latitude: userCoords.latitude,
                longitude: userCoords.longitude,
                latitudeDelta: DEFAULT_DELTA,
                longitudeDelta: DEFAULT_DELTA,
              }, 1000);
            }}
          >
            <Navigation size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.mapTitle}>Loading Map...</Text>
        </View>
      )}
    </View>

    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{listTitle}</Text>
    </View>

    {isLoading && <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />}
  </>
));


const CustomerDashboard = () => {
  const navigation = useNavigation<NavigationProp>();

  const mapRef = useRef<MapView>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ✅ Default is now Pokhara instead of null
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
  });

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Animate map when coordinates update
  useEffect(() => {
    if (userCoords && mapRef.current) {
      const region: Region = {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        latitudeDelta: DEFAULT_DELTA,
        longitudeDelta: DEFAULT_DELTA,
      };
      mapRef.current.animateToRegion(region, 1500);
    }
  }, [userCoords]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Barber App Location Permission",
            message: "We need your location to show nearby shops.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          console.log("Location permission denied, using Pokhara default");
          // stays on Pokhara default, no alert needed
        }
      } catch (err) {
        console.warn(err);
        // stays on Pokhara default
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    console.log("Requesting current position...");

    Geolocation.getCurrentPosition(
      (position) => {
        console.log("Position received:", position.coords);
        setUserCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log("Location error:", error.code, error.message);
        // ✅ No alert, silently falls back to Pokhara default
        console.log("Falling back to Pokhara default location");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  // Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // --- Data Fetching ---
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['shops', debouncedSearch, userCoords],
    queryFn: ({ pageParam = 0 }) =>
      fetchShops({
        page: pageParam,
        size: 10,
        search: debouncedSearch,
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
      }),
    getNextPageParam: (lastPage) => lastPage.last ? undefined : lastPage.page + 1,
    initialPageParam: 0,
    // ✅ Always enabled since we always have coords (Pokhara default)
    enabled: true,
  });

  const shops = useMemo(() => data?.pages.flatMap((page) => page.content) ?? [], [data]);

  const listTitle = useMemo(() => {
    if (debouncedSearch.length > 1) return `Results for "${debouncedSearch}"`;
    return "Shops Nearby";
  }, [debouncedSearch]);

  const renderItem = ({ item }: { item: BarbershopDTO }) => (
    <TouchableOpacity
      style={styles.shopCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ShopDetail', { shopId: item.id })}
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
          <Text style={styles.ratingText}>
            {item.rating != null ? Number(item.rating).toFixed(1) : '0.0'}
          </Text>
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
        ListHeaderComponent={
          <ListHeader
            userCoords={userCoords}
            search={search}
            setSearch={setSearch}
            isLoading={isLoading}
            listTitle={listTitle}
            shops={shops}
            mapRef={mapRef}
          />
        }
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

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: 'rgba(39, 39, 42, 0.3)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md
  },
  searchIcon: { marginRight: theme.spacing.sm },
  searchInput: { flex: 1, height: 44, fontSize: 14, fontFamily: theme.fonts.sans, color: theme.colors.text },

  mapContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    height: 200,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  map: { ...StyleSheet.absoluteFillObject },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: 'rgba(24, 24, 27, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTitle: { fontSize: 14, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: theme.spacing.sm },

  centerButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: theme.colors.card,
    padding: 10,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

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