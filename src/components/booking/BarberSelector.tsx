import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Barber } from '../../models/models';
import { Star, Sparkles } from 'lucide-react-native';

interface BarberSelectorProps {
  barbers: Barber[];
  selectedBarberId: string | undefined;
  onSelectBarber: (barberId: string) => void;
  recommendedBarberId?: string;
}

export const BarberSelector = ({
  barbers,
  selectedBarberId,
  onSelectBarber,
  recommendedBarberId,
}: BarberSelectorProps) => {
  const activeBarbers = barbers.filter((b) => b.isActive);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Barber</Text>
      <ScrollView style={styles.scrollView}>
        {activeBarbers.map((barber) => {
          const isSelected = selectedBarberId === barber.id;
          const isRecommended = recommendedBarberId === barber.id;

          return (
            <TouchableOpacity
              key={barber.id}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                isRecommended && styles.cardRecommended,
              ]}
              onPress={() => onSelectBarber(barber.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={styles.avatarContainer}>
                  {barber.avatar ? (
                    <Image source={{ uri: barber.avatar }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarText}>{barber.name.charAt(0)}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.infoContainer}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{barber.name}</Text>
                    {isRecommended && (
                      <View style={styles.badge}>
                        <Sparkles size={12} color="#fff" />
                        <Text style={styles.badgeText}>Recommended</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.ratingRow}>
                    <Star size={16} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.rating}>{barber.rating}</Text>
                    <Text style={styles.reviewCount}>({barber.reviewCount})</Text>
                  </View>

                  <View style={styles.skillsRow}>
                    {barber.skills?.slice(0, 3).map((skill) => (
                      <View key={skill} style={styles.skillBadge}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {activeBarbers.length === 0 && (
        <Text style={styles.emptyText}>
          No barbers available for the selected shop
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  scrollView: {
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  cardRecommended: {
    borderColor: '#8b5cf6',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6b7280',
  },
  infoContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillBadge: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  skillText: {
    fontSize: 10,
    color: '#6b7280',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
});