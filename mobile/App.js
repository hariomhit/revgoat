import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  StatusBar,
  Platform
} from 'react-native';

// Business presets with industry-specific SEO keywords
const PRESETS = [
  {
    id: 'electrician',
    name: 'Sharma Electricals & AC Care',
    city: 'South Extension, New Delhi',
    services: 'AC Repair, Copper Piping, Inverter Wiring, Fan Installation',
    reviewUrl: 'https://g.page/r/sample-electrician/review'
  },
  {
    id: 'clinic',
    name: 'Apex Dental Care & Implant Center',
    city: 'Indirapuram, Ghaziabad',
    services: 'Painless RCT, Teeth Whitening, Ceramic Crowns',
    reviewUrl: 'https://g.page/r/sample-dental/review'
  },
  {
    id: 'cafe',
    name: 'Roast & Brew Artisan Cafe',
    city: 'Hauz Khas Village, New Delhi',
    services: 'Artisan Pour-Over, Sourdough Pizzas, Cold Brew',
    reviewUrl: 'https://g.page/r/sample-cafe/review'
  },
  {
    id: 'auto',
    name: 'Speedy Auto Garage & Detailing',
    city: 'Noida Sector 62',
    services: 'Brake Servicing, Engine Oil Change, Ceramic Coating',
    reviewUrl: 'https://g.page/r/sample-auto/review'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'reviews' | 'history'
  
  // Business State
  const [businessName, setBusinessName] = useState(PRESETS[0].name);
  const [city, setCity] = useState(PRESETS[0].city);
  const [customerName, setCustomerName] = useState('');
  const [services, setServices] = useState(PRESETS[0].services);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(PRESETS[0].reviewUrl);

  // History State
  const [savedReviews, setSavedReviews] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Apply Preset
  const handleSelectPreset = (preset) => {
    setBusinessName(preset.name);
    setCity(preset.city);
    setServices(preset.services);
    setGoogleReviewUrl(preset.reviewUrl);
    Alert.alert('Preset Applied', `Loaded details for ${preset.name}`);
  };

  // Generate dynamic SEO reviews
  const generatedReviews = [
    {
      title: 'ðŸŒŸ Top Quality & Professional Service',
      text: `Had a fantastic experience with ${businessName || 'this team'} in ${city || 'the area'}. They handled ${services || 'the work'} with complete professionalism, fair pricing, and zero delays. Highly recommended!`,
      keywords: ['Professional', 'Fast Turnaround', 'Affordable Price']
    },
    {
      title: 'âš¡ Fast, Honest & Skilled Experts',
      text: `I called ${businessName || 'them'} for ${services || 'their service'}. The team was punctual, extremely polite, and diagnosed the issue immediately. Best service provider in ${city || 'our locality'} by far!`,
      keywords: ['Punctual', 'Honest Advice', 'Best in Town']
    },
    {
      title: 'ðŸ† 5-Star Experience All Around',
      text: `Outstanding job done by ${businessName || 'the experts'}! Their attention to detail on ${services || 'the service'} was top notch. If you are in ${city || 'this area'}, look no further!`,
      keywords: ['5-Star Quality', 'Super Polite', 'Highly Recommended']
    }
  ];

  // Copy review to device & log into history
  const handleCopyReview = (review, index) => {
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);

    // Save to history
    const newEntry = {
      id: Date.now().toString(),
      businessName,
      customerName: customerName.trim() || 'Valued Customer',
      reviewText: review.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    };
    setSavedReviews([newEntry, ...savedReviews]);

    Alert.alert(
      'Review Copied! ðŸ“‹',
      'The SEO review has been copied. Now tap "Open Google Review" to paste it!',
      [
        {
          text: 'Open Google Review',
          onPress: handleOpenGoogleReview
        },
        { text: 'Done', style: 'cancel' }
      ]
    );
  };

  // Launch Google Review link on the phone
  const handleOpenGoogleReview = async () => {
    if (!googleReviewUrl || !googleReviewUrl.trim()) {
      Alert.alert('Missing Link', 'Please enter your Google Review Link in Business Details first.');
      return;
    }
    const cleanUrl = googleReviewUrl.trim().startsWith('http')
      ? googleReviewUrl.trim()
      : `https://${googleReviewUrl.trim()}`;

    try {
      const supported = await Linking.canOpenURL(cleanUrl);
      if (supported) {
        await Linking.openURL(cleanUrl);
      } else {
        await Linking.openURL(cleanUrl);
      }
    } catch (e) {
      Alert.alert('Opening Browser', `Launching Google Review link...`);
      Linking.openURL(cleanUrl);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0d14" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>ðŸ</Text>
          <View>
            <Text style={styles.logoText}>Rev<Text style={styles.logoHighlight}>GOAT</Text></Text>
            <Text style={styles.tagline}>AI SEO Review Engine â€¢ Mobile Edition</Text>
          </View>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'details' && styles.tabButtonActive]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
            1. Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'reviews' && styles.tabButtonActive]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
            2. SEO Reviews
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History ({savedReviews.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* ================= TAB 1: BUSINESS DETAILS ================= */}
        {activeTab === 'details' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>ðŸ¢ Business Profile</Text>
            <Text style={styles.sectionSubtitle}>
              Select a quick industry preset or enter your custom business details:
            </Text>

            {/* Presets Horizontal Scroll */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.presetChip, businessName === p.name && styles.presetChipActive]}
                  onPress={() => handleSelectPreset(p)}
                >
                  <Text style={[styles.presetChipText, businessName === p.name && styles.presetChipTextActive]}>
                    {p.name.split(' ')[0]} {p.name.split(' ')[1]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Input: Business Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Name</Text>
              <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="e.g. Apex Electricals"
                placeholderTextColor="#666"
              />
            </View>

            {/* Input: City / Area */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City & Area (Crucial for Local Google SEO)</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Connaught Place, New Delhi"
                placeholderTextColor="#666"
              />
            </View>

            {/* Input: Customer Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Customer Name (Optional)</Text>
              <TextInput
                style={styles.input}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor="#666"
              />
            </View>

            {/* Input: Services */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Key Services / Products</Text>
              <TextInput
                style={styles.input}
                value={services}
                onChangeText={setServices}
                placeholder="e.g. AC Repair, Fan Installation"
                placeholderTextColor="#666"
              />
            </View>

            {/* Input: Google Review Link */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Google Review Link (g.page/...)</Text>
              <TextInput
                style={styles.input}
                value={googleReviewUrl}
                onChangeText={setGoogleReviewUrl}
                placeholder="https://g.page/r/your-id/review"
                placeholderTextColor="#666"
                autoCapitalize="none"
              />
            </View>

            {/* Action Button: Next Step */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setActiveTab('reviews')}
            >
              <Text style={styles.primaryButtonText}>âš¡ Generate SEO Reviews âž”</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= TAB 2: SEO REVIEWS ================= */}
        {activeTab === 'reviews' && (
          <View style={styles.sectionContainer}>
            <View style={styles.bizBanner}>
              <Text style={styles.bizBannerName}>{businessName || 'Your Business'}</Text>
              <Text style={styles.bizBannerCity}>ðŸ“ {city || 'Your Area'}</Text>
            </View>

            {/* Direct Google Review Open Button */}
            <TouchableOpacity
              style={styles.googleLaunchBtn}
              onPress={handleOpenGoogleReview}
            >
              <Text style={styles.googleLaunchBtnText}>âš¡ Open Google Review Link on Phone</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>âœ¨ 3 Ready-to-Copy 5-Star Reviews</Text>
            <Text style={styles.sectionSubtitle}>
              Tap "Copy Review" â€” it copies to clipboard and saves in your review history!
            </Text>

            {generatedReviews.map((rev, idx) => (
              <View key={idx} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewStars}>â˜…â˜…â˜…â˜…â˜…</Text>
                  <Text style={styles.reviewCardTitle}>{rev.title}</Text>
                </View>

                <Text style={styles.reviewText}>{rev.text}</Text>

                {/* SEO Keywords Badges */}
                <View style={styles.keywordsRow}>
                  {rev.keywords.map((kw, kIdx) => (
                    <View key={kIdx} style={styles.keywordBadge}>
                      <Text style={styles.keywordBadgeText}>#{kw}</Text>
                    </View>
                  ))}
                </View>

                {/* Copy Button */}
                <TouchableOpacity
                  style={[styles.copyBtn, copiedIndex === idx && styles.copyBtnSuccess]}
                  onPress={() => handleCopyReview(rev, idx)}
                >
                  <Text style={styles.copyBtnText}>
                    {copiedIndex === idx ? 'âœ“ Copied to Clipboard!' : 'ðŸ“‹ Copy This Review'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setActiveTab('details')}
            >
              <Text style={styles.secondaryButtonText}>â† Edit Business Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= TAB 3: HISTORY ================= */}
        {activeTab === 'history' && (
          <View style={styles.sectionContainer}>
            <View style={styles.historyHeaderRow}>
              <Text style={styles.sectionTitle}>ðŸ“œ Customer Review History</Text>
              {savedReviews.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Clear History', 'Are you sure you want to clear saved history?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Clear', style: 'destructive', onPress: () => setSavedReviews([]) }
                    ]);
                  }}
                >
                  <Text style={styles.clearBtnText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {savedReviews.length === 0 ? (
              <View style={styles.emptyHistoryBox}>
                <Text style={styles.emptyHistoryIcon}>ðŸ“</Text>
                <Text style={styles.emptyHistoryTitle}>No Reviews Recorded Yet</Text>
                <Text style={styles.emptyHistorySubtitle}>
                  Whenever a customer copies a review, their submission record will appear here live with timestamp!
                </Text>
                <TouchableOpacity
                  style={[styles.primaryButton, { marginTop: 16 }]}
                  onPress={() => setActiveTab('reviews')}
                >
                  <Text style={styles.primaryButtonText}>View & Copy Reviews Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              savedReviews.map((item) => (
                <View key={item.id} style={styles.historyCard}>
                  <View style={styles.historyCardHeader}>
                    <Text style={styles.historyCustomer}>{item.customerName}</Text>
                    <Text style={styles.historyTime}>{item.timestamp}</Text>
                  </View>
                  <Text style={styles.historyStars}>â˜…â˜…â˜…â˜…â˜…</Text>
                  <Text style={styles.historyText} numberOfLines={3}>{item.reviewText}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0d14'
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2433',
    backgroundColor: '#0f131d'
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoIcon: {
    fontSize: 28,
    marginRight: 10
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  logoHighlight: {
    color: '#ff6b00'
  },
  tagline: {
    fontSize: 11,
    color: '#8e9bb0',
    marginTop: 2
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#121722',
    borderBottomWidth: 1,
    borderBottomColor: '#1e2433',
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#ff6b00'
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#717e94'
  },
  tabTextActive: {
    color: '#ff6b00',
    fontWeight: '700'
  },
  scrollArea: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  sectionContainer: {
    flex: 1
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#8e9bb0',
    marginBottom: 14,
    lineHeight: 18
  },
  presetsScroll: {
    marginBottom: 16
  },
  presetChip: {
    backgroundColor: '#161c28',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222b3d',
    marginRight: 8
  },
  presetChipActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    borderColor: '#ff6b00'
  },
  presetChipText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600'
  },
  presetChipTextActive: {
    color: '#ff6b00',
    fontWeight: '700'
  },
  inputGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c4cfde',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#131824',
    borderWidth: 1,
    borderColor: '#242d40',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#ffffff'
  },
  primaryButton: {
    backgroundColor: '#ff6b00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#ff6b00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  secondaryButton: {
    backgroundColor: '#161c28',
    borderWidth: 1,
    borderColor: '#2b364c',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14
  },
  secondaryButtonText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600'
  },
  bizBanner: {
    backgroundColor: '#131824',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b00',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  bizBannerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff'
  },
  bizBannerCity: {
    fontSize: 12,
    color: '#8e9bb0',
    marginTop: 2
  },
  googleLaunchBtn: {
    backgroundColor: '#1e3a8a',
    borderWidth: 1,
    borderColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 18
  },
  googleLaunchBtnText: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '700'
  },
  reviewCard: {
    backgroundColor: '#121722',
    borderWidth: 1,
    borderColor: '#1e2638',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  reviewStars: {
    color: '#f59e0b',
    fontSize: 14,
    marginRight: 6
  },
  reviewCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e2e8f0',
    flex: 1
  },
  reviewText: {
    fontSize: 13,
    color: '#cbd5e1',
    lineHeight: 19,
    marginBottom: 12
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12
  },
  keywordBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4
  },
  keywordBadgeText: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '600'
  },
  copyBtn: {
    backgroundColor: '#1c2436',
    borderWidth: 1,
    borderColor: '#ff6b00',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  copyBtnSuccess: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981'
  },
  copyBtnText: {
    color: '#ff6b00',
    fontSize: 13,
    fontWeight: '700'
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  clearBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600'
  },
  emptyHistoryBox: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#121722',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1c2436'
  },
  emptyHistoryIcon: {
    fontSize: 36,
    marginBottom: 10
  },
  emptyHistoryTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4
  },
  emptyHistorySubtitle: {
    color: '#8e9bb0',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18
  },
  historyCard: {
    backgroundColor: '#121722',
    borderWidth: 1,
    borderColor: '#1e2638',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  historyCustomer: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  historyTime: {
    color: '#64748b',
    fontSize: 11
  },
  historyStars: {
    color: '#f59e0b',
    fontSize: 12,
    marginBottom: 4
  },
  historyText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 17
  }
});
