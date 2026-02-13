import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Service } from '../../models/models';
import { Check, Clock, DollarSign } from 'lucide-react-native';

interface ServiceSelectorProps {
  services: Service[];
  selectedServices: string[];
  onToggleService: (serviceId: string) => void;
}

export const ServiceSelector = ({ services, selectedServices, onToggleService }: ServiceSelectorProps) => {
  const totalDuration = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.duration, 0);

  const totalPrice = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Services</Text>
        {selectedServices.length > 0 && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Clock size={16} color="#6b7280" />
              <Text style={styles.summaryText}>{totalDuration} min</Text>
            </View>
            <View style={styles.summaryItem}>
              <DollarSign size={16} color="#3b82f6" />
              <Text style={styles.summaryPrice}>{totalPrice}</Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.servicesGrid}>
              {categoryServices.map((service) => {
                const isSelected = selectedServices.includes(service.id);

                return (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceCard,
                      isSelected && styles.serviceCardSelected,
                    ]}
                    onPress={() => onToggleService(service.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.serviceContent}>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <View style={styles.serviceDetails}>
                          <View style={styles.detailItem}>
                            <Clock size={12} color="#6b7280" />
                            <Text style={styles.detailText}>{service.duration} min</Text>
                          </View>
                          <View style={styles.detailItem}>
                            <DollarSign size={12} color="#000" />
                            <Text style={styles.priceText}>{service.price}</Text>
                          </View>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && <Check size={12} color="#fff" />}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {selectedServices.length === 0 && (
        <Text style={styles.emptyText}>
          Select at least one service to continue
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  scrollView: {
    width: '100%',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  servicesGrid: {
    gap: 8,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
});