import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Scissors } from 'lucide-react-native';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 18, text: 18 },
  md: { icon: 22, text: 20 },
  lg: { icon: 28, text: 30 },
};

const Logo = ({ size = 'md' }: LogoProps) => {
  const s = sizes[size];
  
  return (
    <View style={styles.container}>
      <Scissors color="#D4AF37" size={s.icon} />
      <Text style={[styles.text, { fontSize: s.text }]}>
        <Text style={styles.fade}>Fade</Text>
        <Text style={styles.book}>Book</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  fade: {
    color: '#D4AF37',
  },
  book: {
    color: '#FFFFFF',
  },
});

export default Logo;