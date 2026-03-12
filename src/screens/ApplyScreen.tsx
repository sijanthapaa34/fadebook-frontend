import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Scissors, Store, CheckCircle, Upload, ArrowLeft, X, Plus, User, FileText, MapPin, Navigation, Search } from 'lucide-react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { theme } from '../theme/theme';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { submitApplication } from '../api/applicationService';
import { fetchShops } from '../api/barbershopService'; // Import Shop Service
import type { BarbershopDTO } from '../models/models'; // Import Type
import api from '../api/api'; 

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// --- TYPES ---
type ImageData = {
  uri: string;
  width: number;
  height: number;
  fileName?: string;
  type?: string;
};

// --- COMPONENTS OUTSIDE ---

const Field = ({ label, value, onChange, error, required, ...props }: any) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChange}
      placeholderTextColor={theme.colors.placeholder}
      autoCapitalize="sentences"
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const TextAreaField = ({ label, value, onChange, error, placeholder, required }: any) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
    <TextInput
      style={[styles.input, styles.textArea, error && styles.inputError]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.placeholder}
      multiline
      numberOfLines={3}
      textAlignVertical="top"
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const ProfilePhotoUpload = ({ value, onUpload }: { value: ImageData | null; onUpload: () => void }) => (
  <View style={styles.profilePhotoContainer}>
    <TouchableOpacity onPress={onUpload} style={styles.profileAvatarWrapper}>
      {value ? (
        <Image source={{ uri: value.uri }} style={styles.profileAvatarImage} />
      ) : (
        <View style={styles.profileAvatarPlaceholder}>
          <User size={32} color={theme.colors.muted} />
        </View>
      )}
      <View style={styles.profilePlusButton}>
        <Text style={styles.profilePlusText}>+</Text>
      </View>
    </TouchableOpacity>
    <TouchableOpacity onPress={onUpload}>
      <Text style={styles.uploadText}>Upload Profile Photo</Text>
    </TouchableOpacity>
  </View>
);

const DocumentUpload = ({ label, value, onUpload, onRemove }: { label: string; value: ImageData | null; onUpload: () => void; onRemove?: () => void }) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={[styles.docUploadBox, value && styles.docUploadBoxFilled]} 
        onPress={onUpload}
      >
        {value ? (
          <View style={styles.docCard}>
            <View style={styles.docThumbContainer}>
               {value.uri ? (
                 <Image source={{ uri: value.uri }} style={styles.docThumb} />
               ) : (
                 <FileText size={20} color={theme.colors.muted} />
               )}
            </View>
            <View style={styles.docInfo}>
               <Text style={styles.docFileName} numberOfLines={1}>{value.fileName || 'Selected File'}</Text>
               <Text style={styles.docMeta}>Tap to change</Text>
            </View>
            {onRemove && (
              <TouchableOpacity style={styles.docRemoveBtn} onPress={(e) => { e.stopPropagation(); onRemove(); }}>
                <X size={16} color={theme.colors.muted} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.docPlaceholder}>
            <Upload size={18} color={theme.colors.primary} />
            <Text style={styles.docPlaceholderText}>Tap to select file</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// --- MAIN COMPONENT ---

const Apply = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Apply'>>();
  const insets = useSafeAreaInsets();
  
  const [formType, setFormType] = useState<'barber' | 'shop'>(route.params?.type || 'barber');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Submitting...');
  const [locLoading, setLocLoading] = useState(false);

  // Common
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Barber Specific
  const [bCity, setBCity] = useState('');
  const [bExp, setBExp] = useState('');
  const [bSkills, setBSkills] = useState(''); 
  const [bBio, setBBio] = useState('');
  const [bProfilePic, setBProfilePic] = useState<ImageData | null>(null);
  const [bLicense, setBLicense] = useState<ImageData | null>(null);
  
  // Barber Shop Selection State
  const [shopSearch, setShopSearch] = useState('');
  const [selectedShop, setSelectedShop] = useState<BarbershopDTO | null>(null);
  const [shopResults, setShopResults] = useState<BarbershopDTO[]>([]);
  const [isSearchingShops, setIsSearchingShops] = useState(false);

  // Shop Specific
  const [sShopName, setSShopName] = useState('');
  const [sAddress, setSAddress] = useState('');
  const [sCity, setSCity] = useState('');
  const [sState, setSState] = useState('');
  const [sPostal, setSPostal] = useState('');
  const [sLat, setSLat] = useState('');
  const [sLong, setSLong] = useState('');
  const [sWebsite, setSWebsite] = useState('');
  const [sHours, setSHours] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [sDoc, setSDoc] = useState<ImageData | null>(null);
  const [sShopImages, setSShopImages] = useState<ImageData[]>([]); 

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (route.params?.type) {
      setFormType(route.params.type);
    }
  }, [route.params?.type]);

  // --- SHOP SEARCH LOGIC ---
  useEffect(() => {
    if (formType !== 'barber') return;
    
    // Debounce search
    const timer = setTimeout(async () => {
      if (shopSearch.length > 1) {
        setIsSearchingShops(true);
        try {
          const res = await fetchShops({ page: 0, size: 10, search: shopSearch });
          setShopResults(res.content);
        } catch (e) {
          console.error("Shop search failed", e);
        } finally {
          setIsSearchingShops(false);
        }
      } else {
        setShopResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [shopSearch, formType]);

  // --- Image Selection Logic ---
  const handleImagePick = async (setType: 'profile' | 'license' | 'doc' | 'shop_image') => {
    const result: ImagePickerResponse = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
    });

    if (result.didCancel || result.errorCode) return;

    const asset = result.assets?.[0];
    if (!asset?.uri || !asset.width || !asset.height) return;

    const imageData: ImageData = {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      fileName: asset.fileName,
      type: asset.type
    };

    if (setType === 'profile') setBProfilePic(imageData);
    else if (setType === 'license') setBLicense(imageData);
    else if (setType === 'doc') setSDoc(imageData);
    else if (setType === 'shop_image') setSShopImages(prev => [...prev, imageData]);
  };

  const handleRemoveShopImage = (index: number) => {
    setSShopImages(prev => prev.filter((_, i) => i !== index));
  };

  // --- Location Logic ---
  const handleGetLocation = () => {
    setLocLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSLat(latitude.toFixed(6));
        setSLong(longitude.toFixed(6));
        setLocLoading(false);
        Alert.alert("Location", "Coordinates updated successfully");
      },
      (error) => {
        setLocLoading(false);
        Alert.alert("Location Error", error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // --- Upload Helper ---
  const uploadSingleFile = async (file: ImageData, type: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || `upload_${Date.now()}.jpg`,
    });
    formData.append('type', type);
    formData.append('email', email); 

    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  // --- Validation ---
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Valid email required';
    if (!password.trim() || password.length < 6) errs.password = 'Min 6 characters required';
    if (!phone.trim()) errs.phone = 'Phone required';

    if (formType === 'barber') {
      if (!bCity.trim()) errs.bCity = 'City required';
      if (!bExp.trim()) errs.bExp = 'Experience required';
      if (!bBio.trim()) errs.bBio = 'Bio required';
      if (!selectedShop) errs.shop = 'Please select a barbershop';
    } else {
      if (!sShopName.trim()) errs.sShopName = 'Shop name required';
      if (!sAddress.trim()) errs.sAddress = 'Address required';
      if (!sCity.trim()) errs.sCity = 'City required';
      if (!sLat.trim() || !sLong.trim()) errs.location = 'Coordinates required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- Submit Logic ---
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setLoadingText('Preparing...');

    try {
      const commonData = { name, email, password, phone };

      // --- BARBER SUBMISSION ---
      if (formType === 'barber') {
        let profileUrl: string | undefined = undefined;
        let licenseUrl: string | undefined = undefined;

        if (bProfilePic) {
          setLoadingText('Uploading profile picture...');
          profileUrl = await uploadSingleFile(bProfilePic, 'profile');
        }
        if (bLicense) {
          setLoadingText('Uploading license...');
          licenseUrl = await uploadSingleFile(bLicense, 'doc');
        }

        setLoadingText('Submitting application...');
        const skillsArray = bSkills ? bSkills.split(',').map(s => s.trim()).filter(s => s) : [];
        
        await submitApplication({
          ...commonData,
          type: 'BARBER',
          city: bCity,
          experienceYears: parseInt(bExp) || 0,
          skills: skillsArray,
          bio: bBio,
          profilePictureUrl: profileUrl,
          licenseUrl: licenseUrl,
          // ADD SHOP DATA
          barbershopId: selectedShop!.id,
          barbershopName: selectedShop!.name,
        });
      } 
      
      // --- SHOP SUBMISSION ---
      else {
        let docUrl: string | undefined = undefined;
        let shopImageUrls: string[] = [];

        if (sDoc) {
          setLoadingText('Uploading business document...');
          docUrl = await uploadSingleFile(sDoc, 'doc');
        }
        if (sShopImages.length > 0) {
          for (let i = 0; i < sShopImages.length; i++) {
            setLoadingText(`Uploading shop photo ${i + 1}/${sShopImages.length}...`);
            const url = await uploadSingleFile(sShopImages[i], 'shop_image');
            shopImageUrls.push(url);
          }
        }

        const lat = parseFloat(sLat);
        const long = parseFloat(sLong);

        if (isNaN(lat) || isNaN(long)) {
          throw new Error('Invalid coordinates');
        }

        setLoadingText('Submitting application...');

        await submitApplication({
          ...commonData,
          type: 'BARBER_SHOP',
          shopName: sShopName,
          address: sAddress,
          city: sCity,
          state: sState,
          postalCode: sPostal,
          latitude: lat,
          longitude: long,
          website: sWebsite,
          operatingHours: sHours,
          description: sDesc,
          documentUrl: docUrl,
          shopImages: shopImageUrls.length > 0 ? shopImageUrls : undefined,
        });
      }
      
      setSubmitted(true);

    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to submit. Check inputs and try again.';
      Alert.alert('Submission Failed', msg);
    } finally {
      setLoading(false);
      setLoadingText('Submitting...');
    }
  };

  if (submitted) {
    return (
      <View style={[styles.centeredContainer, { paddingTop: insets.top }]}>
        <View style={styles.glassCard}>
          <CheckCircle size={48} color={theme.colors.primary} />
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successText}>
            Thank you for applying. Our team will review your application and get back to you within 24–48 hours.
          </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Status: Pending Review</Text>
          </View>
          <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Landing')}>
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.logoText}>FadeBook</Text>
          <Text style={styles.title}>Join <Text style={styles.goldText}>FadeBook</Text></Text>
          <Text style={styles.subtitle}>Apply as a barber or register your barbershop</Text>
        </View>

        {/* Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => { setFormType('barber'); setErrors({}); }}
            style={[styles.toggleBtn, formType === 'barber' && styles.toggleBtnActive]}
          >
            <Scissors size={18} color={formType === 'barber' ? theme.colors.primary : theme.colors.muted} />
            <Text style={[styles.toggleText, formType === 'barber' && styles.toggleTextActive]}>Barber</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => { setFormType('shop'); setErrors({}); }}
            style={[styles.toggleBtn, formType === 'shop' && styles.toggleBtnActive]}
          >
            <Store size={18} color={formType === 'shop' ? theme.colors.primary : theme.colors.muted} />
            <Text style={[styles.toggleText, formType === 'shop' && styles.toggleTextActive]}>Shop</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formCard}>
          
          <Text style={styles.formTitle}>Account Details</Text>
          <Field label="Full Name" value={name} onChange={setName} error={errors.name} required />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field label="Email" value={email} onChange={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" required />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Password" value={password} onChange={setPassword} error={errors.password} secureTextEntry required />
            </View>
          </View>
          <Field label="Phone" value={phone} onChange={setPhone} error={errors.phone} keyboardType="phone-pad" required />

          {formType === 'barber' ? (
            <>
              <Text style={styles.formTitle}>Barber Info</Text>
              
              <ProfilePhotoUpload value={bProfilePic} onUpload={() => handleImagePick('profile')} />

              {/* --- SHOP SELECTION UI --- */}
              <Text style={styles.label}>Select Barbershop *</Text>
              {selectedShop ? (
                <View style={styles.selectedShopContainer}>
                  <View style={{flex: 1}}>
                    <Text style={styles.selectedShopName}>{selectedShop.name}</Text>
                    <Text style={styles.selectedShopCity}>{selectedShop.city}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedShop(null)}>
                    <X size={18} color={theme.colors.muted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.searchInputContainer}>
                    <Search size={16} color={theme.colors.muted} style={{marginRight: 8}} />
                    <TextInput
                      style={{flex: 1, color: theme.colors.text, height: 40}}
                      placeholder="Search shops by name..."
                      placeholderTextColor={theme.colors.muted}
                      value={shopSearch}
                      onChangeText={setShopSearch}
                    />
                    {isSearchingShops && <ActivityIndicator size="small" color={theme.colors.primary} />}
                  </View>
                  
                  {errors.shop && <Text style={styles.errorText}>{errors.shop}</Text>}

                  {/* Results List */}
                  {shopResults.length > 0 && (
                    <View style={styles.searchResultsContainer}>
                      <FlatList
                        data={shopResults}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                        renderItem={({item}) => (
                          <TouchableOpacity 
                            style={styles.searchResultItem} 
                            onPress={() => {
                              setSelectedShop(item);
                              setShopSearch('');
                              setShopResults([]);
                            }}
                          >
                            <Text style={{color: theme.colors.text, fontWeight: '500'}}>{item.name}</Text>
                            <Text style={{color: theme.colors.muted, fontSize: 12}}>{item.address}, {item.city}</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  )}
                </View>
              )}
              {/* --- END SHOP SELECTION UI --- */}

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Field label="Years Exp." value={bExp} onChange={setBExp} error={errors.bExp} keyboardType="number-pad" required />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="City" value={bCity} onChange={setBCity} error={errors.bCity} required />
                </View>
              </View>

              <Field label="Skills (comma separated)" value={bSkills} onChange={setBSkills} placeholder="Fades, Beard Trim" />
              <TextAreaField label="Bio" value={bBio} onChange={setBBio} error={errors.bBio} required />
              
              <DocumentUpload label="License / Certification" value={bLicense} onUpload={() => handleImagePick('license')} onRemove={() => setBLicense(null)} />
            </>
          ) : (
            <>
              <Text style={styles.formTitle}>Shop Info</Text>
              
              <Field label="Shop Name" value={sShopName} onChange={setSShopName} error={errors.sShopName} required />
              <TextAreaField label="Address" value={sAddress} onChange={setSAddress} error={errors.sAddress} required />
              
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Field label="City" value={sCity} onChange={setSCity} error={errors.sCity} required />
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Field label="State" value={sState} onChange={setSState} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Postal Code" value={sPostal} onChange={setSPostal} />
                </View>
              </View>

              <TouchableOpacity style={styles.locationBtn} onPress={handleGetLocation} disabled={locLoading}>
                {locLoading ? (
                  <ActivityIndicator color={theme.colors.primary} />
                ) : (
                  <>
                    <Navigation size={16} color={theme.colors.primary} />
                    <Text style={styles.locationBtnText}>Use Current Location</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Field label="Latitude" value={sLat} onChange={setSLat} error={errors.location} keyboardType="decimal-pad" required />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Longitude" value={sLong} onChange={setSLong} error={errors.location} keyboardType="decimal-pad" required />
                </View>
              </View>

              <Field label="Website" value={sWebsite} onChange={setSWebsite} autoCapitalize="none" />
              <Field label="Operating Hours" value={sHours} onChange={setSHours} placeholder="Mon-Sat: 9AM-6PM" />
              <TextAreaField label="Description" value={sDesc} onChange={setSDesc} />
              
              <DocumentUpload label="Business Document" value={sDoc} onUpload={() => handleImagePick('doc')} onRemove={() => setSDoc(null)} />
              
              <Text style={styles.label}>Shop Photos</Text>
              <View style={styles.multiImageContainer}>
                {sShopImages.map((img, index) => (
                  <View key={index} style={styles.smallImageContainer}>
                    <Image source={{ uri: img.uri }} style={styles.smallImage} />
                    <TouchableOpacity style={styles.smallRemoveBtn} onPress={() => handleRemoveShopImage(index)}>
                       <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                
                <TouchableOpacity style={styles.addSmallImageBtn} onPress={() => handleImagePick('shop_image')}>
                   <Plus size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <ActivityIndicator color="#000" style={{marginRight: 10}} />
                <Text style={styles.submitBtnText}>{loadingText}</Text>
              </View>
            ) : (
              <Text style={styles.submitBtnText}>Submit Application</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Styles
const styles = StyleSheet.create({
  // ... (Previous styles remain the same) ...
  // Add these new styles for Search:

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.3)',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  searchResultsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: 200,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedShopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 16,
  },
  selectedShopName: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  selectedShopCity: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 2,
  },

  // Existing Styles
  profilePhotoContainer: { alignItems: 'center', marginBottom: theme.spacing.lg },
  profileAvatarWrapper: { position: 'relative', marginBottom: theme.spacing.sm },
  profileAvatarPlaceholder: { width: 100, height: 100, borderRadius: 40, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  profileAvatarImage: { width: 100, height: 100, borderRadius: 40, backgroundColor: theme.colors.surface },
  profilePlusButton: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.colors.card },
  profilePlusText: { color: '#000', fontWeight: '700', fontSize: 16, lineHeight: 18 },
  uploadText: { color: theme.colors.primary, fontWeight: '500', fontSize: 13 },
  locationBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, marginBottom: theme.spacing.md, gap: 8, backgroundColor: 'rgba(39, 39, 42, 0.2)' },
  locationBtnText: { color: theme.colors.primary, fontWeight: '500', fontSize: 13 },
  docUploadBox: { borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed', borderRadius: theme.radius.md, overflow: 'hidden', backgroundColor: 'rgba(39, 39, 42, 0.2)', minHeight: 60, justifyContent: 'center' },
  docUploadBoxFilled: { borderStyle: 'solid', backgroundColor: theme.colors.surface },
  docPlaceholder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  docPlaceholderText: { color: theme.colors.primary, fontSize: 12 },
  docCard: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  docThumbContainer: { width: 40, height: 40, borderRadius: theme.radius.sm, backgroundColor: theme.colors.muted, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  docThumb: { width: '100%', height: '100%' },
  docInfo: { flex: 1, marginLeft: 12 },
  docFileName: { color: theme.colors.text, fontSize: 13, fontWeight: '500' },
  docMeta: { color: theme.colors.muted, fontSize: 11, marginTop: 2 },
  docRemoveBtn: { padding: 8, marginRight: 4 },
  multiImageContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: theme.spacing.md },
  smallImageContainer: { width: 70, height: 70, borderRadius: theme.radius.sm, overflow: 'hidden', position: 'relative' },
  smallImage: { width: '100%', height: '100%' },
  smallRemoveBtn: { position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.6)', padding: 2, borderRadius: 10 },
  addSmallImageBtn: { width: 70, height: 70, borderRadius: theme.radius.sm, borderWidth: 1, borderColor: theme.colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  removeBtn: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  centeredContainer: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  scrollContent: { padding: theme.spacing.lg, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: theme.spacing.xl },
  backBtn: { position: 'absolute', left: 0, top: 0, padding: 8 },
  logoText: { fontSize: 24, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.primary, marginBottom: theme.spacing.md },
  title: { fontSize: 28, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text },
  goldText: { color: theme.colors.primary },
  subtitle: { fontSize: 14, color: theme.colors.muted, marginTop: theme.spacing.sm, textAlign: 'center' },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.xl },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border },
  toggleBtnActive: { backgroundColor: 'rgba(212, 175, 55, 0.1)', borderColor: theme.colors.primary },
  toggleText: { color: theme.colors.muted, fontWeight: '500' },
  toggleTextActive: { color: theme.colors.primary },
  formCard: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.xl, marginBottom: theme.spacing.xl },
  formTitle: { fontSize: 18, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text, marginTop: 16, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  fieldContainer: { marginBottom: theme.spacing.md },
  label: { fontSize: 12, color: theme.colors.muted, marginBottom: 6, fontWeight: '500' },
  required: { color: theme.colors.error },
  input: { backgroundColor: 'rgba(39, 39, 42, 0.3)', borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md, color: theme.colors.text, fontSize: 14 },
  inputError: { borderColor: theme.colors.error },
  textArea: { minHeight: 80, paddingTop: theme.spacing.md },
  submitBtn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.radius.md, alignItems: 'center', marginTop: theme.spacing.lg },
  submitBtnText: { color: '#000', fontWeight: '700', fontSize: 16 },
  errorText: { color: theme.colors.error, fontSize: 11, marginTop: 4 },
  glassCard: { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.xl, width: '100%', maxWidth: 400, alignItems: 'center' },
  successTitle: { fontSize: 22, fontFamily: theme.fonts.serif, fontWeight: '700', color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm },
  successText: { color: theme.colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: theme.spacing.md },
  statusBadge: { backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: theme.colors.primary, fontWeight: '600', fontSize: 12 },
  homeButton: { marginTop: theme.spacing.xl, borderWidth: 1, borderColor: theme.colors.border, paddingVertical: 12, paddingHorizontal: 24, borderRadius: theme.radius.md },
  homeButtonText: { color: theme.colors.text, fontWeight: '600' },
});

export default Apply;