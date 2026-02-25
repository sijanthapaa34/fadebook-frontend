// src/components/StarRating.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import { theme } from '../theme/theme';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;

        // FIX: Explicitly type as string to allow different color literals
        let strokeColor: string = theme.colors.border;
        let fillColor: string = 'transparent';
        let opacity = 1;

        if (filled) {
          strokeColor = theme.colors.primary;
          fillColor = theme.colors.primary;
        } else if (half) {
          strokeColor = theme.colors.primary;
          fillColor = theme.colors.primary;
          opacity = 0.5;
        }

        return (
          <TouchableOpacity
            key={i}
            disabled={!interactive}
            onPress={() => interactive && onChange?.(i + 1)}
            style={styles.starBtn}
            activeOpacity={interactive ? 0.7 : 1}
          >
            <Star
              size={size}
              color={strokeColor}
              fill={fillColor}
              style={{ opacity }}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starBtn: {
    marginHorizontal: 1,
  },
});

export default StarRating;