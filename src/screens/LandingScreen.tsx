// Landing.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MapPin, Calendar, Star, Shield, Clock, Scissors } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { theme } from '../theme/theme';

type RootStackParamList = {
  Landing: undefined;
  Register: undefined;
  About: undefined;
  Contact: undefined;
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const features = [
  { Icon: MapPin, title: 'Find Nearby Shops', desc: 'Discover top-rated barbershops in your area with real-time availability.' },
  { Icon: Calendar, title: 'Book Instantly', desc: 'Choose your barber, service, and time slot — all in under 30 seconds.' },
  { Icon: Star, title: 'Verified Reviews', desc: 'Make informed decisions with authentic ratings and reviews.' },
  { Icon: Shield, title: 'Secure Payments', desc: 'Pay with confidence. Transparent refund policies on every booking.' },
  { Icon: Clock, title: 'No More Waiting', desc: 'Skip the queue. Your chair is reserved when you arrive.' },
  { Icon: Scissors, title: 'For Barbers Too', desc: 'Manage appointments, track earnings, and grow your clientele.' },
];

const stats = [
  { value: '12,000+', label: 'Active Users' },
  { value: '150+', label: 'Partner Shops' },
  { value: '45,000+', label: 'Bookings Made' },
  { value: '4.8★', label: 'Average Rating' },
];

const Landing = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image
          source={require('../assets/hero-barbershop.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(14,16,21,1)', 'rgba(14,16,21,0.85)', 'rgba(14,16,21,0.4)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.heroOverlay}
        />

        <View style={styles.heroContent}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>The future of barber reservations</Text>
          </View>

          <Text style={styles.heroTitle}>Your Perfect{'\n'}</Text>
          <MaskedView maskElement={<Text style={styles.heroTitleGold}>Fade Awaits</Text>}>
              <LinearGradient colors={[theme.colors.primary, '#E5C88A']}>
                <Text style={[styles.heroTitleGold, { opacity: 0 }]}>Fade Awaits</Text>
              </LinearGradient>
            </MaskedView>

          <Text style={styles.heroDescription}>
            Book premium barbershop appointments in seconds. Find the best barbers near you, choose your style, and skip the wait.
          </Text>
          <View style={styles.heroButtons}>
            {/* Book Now (Primary Solid Button) */}
            <TouchableOpacity
              style={styles.primaryButtonSolid}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonTextSolid}>Book Now</Text>
            </TouchableOpacity>

            {/* Learn More (Outline Button) */}
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => navigation.navigate('About')}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineButtonText}>Learn More</Text>
            </TouchableOpacity>
          </View>

        
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <MaskedView maskElement={<Text style={styles.statValue}>{stat.value}</Text>}>
                <LinearGradient colors={[theme.colors.primary, '#E5C88A']}>
                  <Text style={[styles.statValue, { opacity: 0 }]}>{stat.value}</Text>
                </LinearGradient>
              </MaskedView>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <View style={styles.featureHeader}>
          <View style={styles.featureTitleContainer}>
            <Text style={styles.featureTitle}>Everything You </Text>
            <MaskedView maskElement={<Text style={styles.featureTitleGold}>Need</Text>}>
              <LinearGradient colors={[theme.colors.primary, '#E5C88A']}>
                <Text style={[styles.featureTitleGold, { opacity: 0 }]}>Need</Text>
              </LinearGradient>
            </MaskedView>
          </View>
          <Text style={styles.featureSubtitle}>A complete platform for customers, barbers, and shop owners.</Text>
        </View>

        <View style={styles.featuresGrid}>
          {features.map((feature) => {
            const Icon = feature.Icon;
            return (
              <View key={feature.title} style={styles.featureCard}>
                <View style={styles.iconContainer}>
                  <Icon size={24} color="#C9A961" strokeWidth={2} />
                </View>
                <Text style={styles.featureCardTitle}>{feature.title}</Text>
                <Text style={styles.featureCardDesc}>{feature.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <View style={styles.ctaTitleContainer}>
          <Text style={styles.ctaTitle}>Ready to Get </Text>
          <MaskedView maskElement={<Text style={styles.ctaTitleGold}>Started</Text>}>
            <LinearGradient colors={[theme.colors.primary, '#E5C88A']}>
              <Text style={[styles.ctaTitleGold, { opacity: 0 }]}>Started</Text>
            </LinearGradient>
          </MaskedView>
          <Text style={styles.ctaTitle}>?</Text>
        </View>
        <TouchableOpacity
          style={styles.ctaButtonSolid}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonTextSolid}>Create Free Account</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerCopyright}>© 2026 FadeBook. All rights reserved.</Text>
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('About')}><Text style={styles.footerLink}>About</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Contact')}><Text style={styles.footerLink}>Contact</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.footerLink}>Privacy</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.footerLink}>Terms</Text></TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  // Hero
  heroSection: { minHeight: 650, position: 'relative' },
  heroImage: { position: 'absolute', width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', width: '100%', height: '100%' },
  heroContent: { paddingHorizontal: theme.spacing.lg, paddingVertical: 96, zIndex: 1 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}33`,
    backgroundColor: `${theme.colors.primary}0D`,
    marginBottom: theme.spacing.xxl,
  },
  badgeText: { fontSize: 14, color: theme.colors.primary, fontFamily: theme.fonts.sans, fontWeight: '500' },
  heroTitle: { fontSize: 40, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text, lineHeight: 44 },
  heroTitleGold: { fontSize: 38, fontFamily: theme.fonts.serif, fontWeight: '700', lineHeight: 44, marginBottom: 0 },
  heroDescription: { fontSize: 16, fontFamily: theme.fonts.sans, color: theme.colors.muted, lineHeight: 28, marginBottom: theme.spacing.xxl, maxWidth: 500 },
  heroButtons: { flexDirection: 'row', gap: theme.spacing.md, flexWrap: 'wrap' },
  primaryButton: { paddingHorizontal: theme.spacing.xxl, paddingVertical: theme.spacing.md, borderRadius: theme.radius.md, minWidth: 160 , alignItems: 'center',justifyContent: 'center',},primaryButtonText: {
  color: theme.colors.primaryText,
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
},
  outlineButton: { borderWidth: 1.5, borderColor: theme.colors.primary, paddingHorizontal: theme.spacing.xxl, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.md, backgroundColor: 'transparent' },
  outlineButtonText: { color: theme.colors.primary, fontSize: theme.typography.button.fontSize, fontWeight: theme.typography.button.fontWeight, fontFamily: theme.fonts.sans,  textAlign: 'center', },

  // Stats
  statsSection: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border, backgroundColor: 'rgba(22,24,29,0.5)', paddingVertical: 48, paddingHorizontal: theme.spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', width: '45%', marginBottom: 32 },
  statValue: { fontSize: 30, fontFamily: theme.fonts.serif, fontWeight: '700', color: '#000000' },
  statLabel: { fontSize: 14, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: 4 },

  // Features
  featuresSection: { paddingVertical: 96, paddingHorizontal: theme.spacing.lg },
  featureHeader: { alignItems: 'center', marginBottom: 64 },
  featureTitleContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' },
  featureTitle: { fontSize: 35, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  featureTitleGold: { fontSize: 35, fontFamily: theme.fonts.serif, fontWeight: '700', color: '#000000', textAlign: 'center' },
  featureSubtitle: { fontSize: 16, fontFamily: theme.fonts.sans, color: theme.colors.muted, textAlign: 'center', maxWidth: 400, marginTop: theme.spacing.sm },
  featuresGrid: { gap: theme.spacing.xl },
  featureCard: { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: 'rgba(40,41,46,0.5)', borderRadius: theme.radius.lg, padding: theme.spacing.xxl, marginBottom: theme.spacing.xxl },
  iconContainer: { width: 48, height: 48, borderRadius: theme.radius.md, backgroundColor: 'rgba(201,169,97,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.md },
  featureCardTitle: { fontSize: 18, fontFamily: theme.fonts.sans, fontWeight: '600', color: theme.colors.text, marginBottom: theme.spacing.sm },
  featureCardDesc: { fontSize: 14, fontFamily: theme.fonts.sans, color: theme.colors.muted, lineHeight: 22 },

  // CTA
  ctaSection: { borderTopWidth: 1, borderColor: theme.colors.border, paddingVertical: 96, paddingHorizontal: theme.spacing.lg, alignItems: 'center' },
  ctaTitleContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' },
  ctaTitle: { fontSize: 38, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  ctaTitleGold: { fontSize: 38, fontFamily: theme.fonts.serif, fontWeight: '700', color: '#000000', textAlign: 'center' },
  ctaDescription: { fontSize: 16, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginTop: theme.spacing.sm, marginBottom: theme.spacing.xxl, textAlign: 'center', maxWidth: 400 },
  ctaButton: {
  paddingHorizontal: theme.spacing.xxl,
  paddingVertical: theme.spacing.md,
  borderRadius: theme.radius.md,
  minWidth: 220,           // wider than hero button
  alignItems: 'center',
  justifyContent: 'center',
},

ctaButtonText: {
  color: theme.colors.primaryText,
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
},
// Hero Primary Solid Button
primaryButtonSolid: {
  backgroundColor: '#D4AF37',
  paddingVertical: 14,
  paddingHorizontal: 24,
  borderRadius: theme.radius.md,
  minWidth: 160,
  alignItems: 'center',
  justifyContent: 'center',
},

primaryButtonTextSolid: {
  color: '#000000',
  fontFamily: theme.fonts.sans,
  fontSize: theme.typography.button.fontSize,
  fontWeight: theme.typography.button.fontWeight,
  textAlign: 'center',
},

// CTA Solid Button
ctaButtonSolid: {
  backgroundColor: '#D4AF37',
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: theme.radius.md,
  minWidth: 220,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: theme.spacing.md,
},

ctaButtonTextSolid: {
  color: '#000000',
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
},

  // Footer
  footer: { borderTopWidth: 1, borderColor: theme.colors.border, backgroundColor: 'rgba(22,24,29,0.3)', paddingVertical: 48, paddingHorizontal: theme.spacing.lg, alignItems: 'center' },
  footerCopyright: { fontSize: 14, fontFamily: theme.fonts.sans, color: theme.colors.muted, marginBottom: 24 },
  footerLinks: { flexDirection: 'row', gap: theme.spacing.xl, flexWrap: 'wrap', justifyContent: 'center' },
  footerLink: { fontSize: 14, fontFamily: theme.fonts.sans, color: theme.colors.muted },
});


export default Landing;
