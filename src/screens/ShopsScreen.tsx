import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Search, MapPin, Star, DollarSign, ArrowLeft } from 'lucide-react-native';
import { mockShops } from '../data/mockData';
import { RootStackParamList } from '../navigation/NavigationService';
import { Shop } from '../models/models';

export default function Shops() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShops = mockShops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderShopCard = ({ item: shop }: { item: Shop }) => (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() => navigation.navigate('ShopDetail', { shopId: shop.id })}
    >
      {/* Shop Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: shop.image }} style={styles.shopImage} />
      </View>

      {/* Shop Info */}
      <Text style={styles.shopName}>{shop.name}</Text>

      <View style={styles.addressRow}>
        <MapPin size={16} color="#A0A0A0" />
        <Text style={styles.addressText}>{shop.address}</Text>
      </View>

      <View style={styles.ratingRow}>
        <View style={styles.ratingContainer}>
          <Star size={16} color="#D4AF37" fill="#D4AF37" />
          <Text style={styles.ratingText}>{shop.rating}</Text>
          <Text style={styles.reviewCount}>({shop.reviewCount})</Text>
        </View>

        <View style={styles.priceContainer}>
          {Array.from({ length: 3 }).map((_, i) => (
            <DollarSign
              key={i}
              size={16}
              color={i < (shop.priceCategory ?? 0) ? '#D4AF37' : '#666'}
            />
          ))}
        </View>
      </View>

      {/* Services */}
      <View style={styles.servicesContainer}>
        {(shop.services ?? []).slice(0, 3).map((service: string) => (
          <View key={service} style={styles.serviceTag}>
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Landing')}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
          <Text style={styles.backText}>Back to Home</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Find Barber Shops</Text>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search
              size={20}
              color="#A0A0A0"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or location..."
              placeholderTextColor="#666"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          <TouchableOpacity style={styles.nearMeButton}>
            <MapPin size={20} color="#D4AF37" />
            <Text style={styles.nearMeText}>Near Me</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Shop List */}
      <FlatList
        data={filteredShops}
        renderItem={renderShopCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  backText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  searchContainer: {
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  nearMeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  nearMeText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    gap: 20,
  },
  shopCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  shopImage: {
    width: '100%',
    height: '100%',
  },
  shopName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#A0A0A0',
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  reviewCount: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  serviceText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
});