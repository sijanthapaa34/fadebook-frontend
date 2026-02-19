import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

export default function About() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>About FadeBook</Text>

          {/* Mission Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Our Mission</Text>
            <Text style={styles.cardText}>
              BarberBook connects customers with the best barbers in their area,
              making it easy to discover, book, and manage appointments. We're
              dedicated to modernizing the barbershop experience while preserving
              its timeless tradition.
            </Text>
          </View>

          {/* What We Offer Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What We Offer</Text>
            <View style={styles.list}>
              <Text style={styles.listItem}>
                • Real-time booking with instant confirmation
              </Text>
              <Text style={styles.listItem}>
                • Location-based shop discovery
              </Text>
              <Text style={styles.listItem}>• Loyalty rewards program</Text>
              <Text style={styles.listItem}>• Verified reviews and ratings</Text>
              <Text style={styles.listItem}>
                • Direct communication with barbers
              </Text>
            </View>
          </View>

          {/* Contact Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contact Us</Text>
            <Text style={styles.cardText}>
              Have questions? Reach out to us at support@barberbook.com
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 16,
    color: '#A0A0A0',
    lineHeight: 24,
  },
  list: {
    gap: 12,
  },
  listItem: {
    fontSize: 16,
    color: '#A0A0A0',
    lineHeight: 24,
  },
});