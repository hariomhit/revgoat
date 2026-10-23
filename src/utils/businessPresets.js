// Pre-configured popular business profiles for instant 1-click testing & multi-client demonstration
export const BUSINESS_PRESETS = [
  {
    id: 'grey-gents',
    slug: 'grey-gents',
    client_id: 'grey-gents',
    name: 'Grey Gents clothing store',
    category: 'Clothing, Fashion & Boutique',
    subCategory: "Men's Premium Outfits & Formal Wear",
    city: '',
    services: ['Trendy Unique Outfits', 'Comfortable Premium Fabric', 'Perfect Fitting', 'Courteous Staff'],
    rating: 5.0,
    reviewCount: 428,
    tone: 'Trendy & Enthusiastic',
    customerName: '',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJyRyiLwCbXjkRY1eZ6K4ZF0M',
    icon: '👔'
  },
  {
    id: 'radhe-automobiles',
    slug: 'radhe-automobiles',
    client_id: 'radhe-automobiles',
    name: 'Radhe Automobiles',
    category: 'Automobile Repair & Service',
    subCategory: 'Periodic Car Service & Engine Diagnostics',
    city: '',
    services: ['Genuine Spare Parts', 'Transparent Billing', 'Skilled Mechanics', 'Prompt Delivery'],
    rating: 5.0,
    reviewCount: 312,
    tone: 'Professional & Grateful',
    customerName: '',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ0wK8wQebXjkR79t_sample',
    icon: '🚗'
  },
  {
    id: 'shambhu-cocktails',
    slug: 'shambhu-cocktails',
    client_id: 'shambhu-cocktails',
    name: 'Shambhu Mocktail Bar',
    category: 'Cafe & Restaurant',
    subCategory: 'Specialty Mocktails & Artisan Beverages',
    city: '',
    services: ['Refreshing Mocktails', 'Cozy Ambiance', 'Quick Service', 'Friendly Staff'],
    rating: 5.0,
    reviewCount: 245,
    tone: 'Trendy & Enthusiastic',
    customerName: '',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJ59x7xQebXjkR12z_sample',
    icon: '🍹'
  }
];

// Comprehensive Categorized Industries covering every business domain
export const CATEGORIES_GROUPED = {
  '🏥 Healthcare, Medical & Wellness': [
    'Healthcare & Dental',
    'Hospital & Multispeciality Clinic',
    'Pharmacy & Medical Store',
    'Diagnostic & Pathology Lab',
    'Physiotherapy & Rehabilitation',
    'Ayurveda, Homeopathy & Naturopathy',
    'Veterinary & Pet Care Clinic',
    'Eye Care & Optician Clinic'
  ],
  '🍽️ Food, Dining & Hospitality': [
    'Cafe & Restaurant',
    'Bakery, Cakes & Pastries',
    'Fast Food & Cloud Kitchen',
    'Sweet Shop & Mithai Store',
    'Bar, Pub & Lounge',
    'Catering & Event Food Service',
    'Hotel, Resort & Homestay'
  ],
  '✨ Beauty, Salon & Personal Care': [
    'Beauty, Salon & Spa',
    'Bridal Makeup Studio & Artist',
    'Hair Studio & Men Barber Shop',
    'Skin, Dermatology & Laser Clinic',
    'Tattoo & Piercing Studio'
  ],
  '💪 Fitness, Gym & Sports': [
    'Fitness & Gym',
    'Yoga & Meditation Studio',
    'Sports Academy & Turf',
    'Martial Arts & Boxing Club'
  ],
  '💻 IT, Software & Digital Media': [
    'IT & Digital Marketing',
    'Software & App Development',
    'Web Design & SEO Agency',
    'Graphic Design & Video Production',
    'Computer & Laptop Repair Service'
  ],
  '🚗 Automobile, Transport & Logistics': [
    'Automobile Repair & Service',
    'Car Detailing & Washing Center',
    'Tyres, Battery & Wheel Care',
    'Packers & Movers Logistics',
    'Car Rental, Taxi & Cab Service'
  ],
  '🏠 Real Estate, Construction & Interior': [
    'Real Estate & Property',
    'Home Decor & Interior Design',
    'Building Contractor & Construction',
    'Architecture & Civil Engineering',
    'Modular Kitchen & Furniture',
    'Sanitaryware, Tiles & Hardware'
  ],
  '⚖️ Legal, Finance & Corporate Services': [
    'Legal & Financial Services',
    'Advocate & Law Firm',
    'Chartered Accountant (CA) & Tax Filing',
    'Loans, Insurance & Investment Advisory',
    'HR & Placement Consultancy'
  ],
  '🎓 Education, Coaching & Training': [
    'Education & Coaching Institute',
    'Competitive Exams & IIT/NEET Academy',
    'School, College & University',
    'IELTS & Foreign Education Study',
    'Music, Dance & Fine Arts Classes',
    'Preschool & Daycare Nursery'
  ],
  '🛍️ Retail, Shopping & Showrooms': [
    'Retail Store & Supermarket',
    'Clothing, Fashion & Boutique',
    'Jewellery & Gold Showroom',
    'Mobile Phone & Electronics Store',
    'Grocery & Kirana General Store',
    'Footwear & Leather Store',
    'Optical & Eyewear Store',
    'Books, Stationery & Gift Shop'
  ],
  '🔧 Home Services & Appliance Repair': [
    'Electrician & Electrical Services',
    'Plumbing & Water Solution Services',
    'AC Repair & Appliance Service',
    'Deep Cleaning & Pest Control',
    'Painting & Waterproofing Services',
    'CCTV & Home Security Setup',
    'Solar Rooftop & Inverter Power'
  ],
  '📸 Events, Wedding & Entertainment': [
    'Wedding Planner & Event Management',
    'Photography & Video Shoot Studio',
    'Banquet Hall & Wedding Garden',
    'DJ & Sound System Setup',
    'Travel & Tour Packages Booking'
  ],
  '🔮 Specialized & Artisan Services': [
    'Astrology, Kundali & Vastu Shastra',
    'Dry Cleaners & Steam Laundry',
    'Tailoring, Boutique & Alterations',
    'Printing Press & Signage Advertising',
    'Manufacturing & Industrial Factory',
    'Other / Custom Business'
  ]
};

// Flat list for easy dropdowns, searches and fallback lookups
export const CATEGORIES_LIST = Object.values(CATEGORIES_GROUPED).flat();

// Industry-specific 5-star Google review keywords & highlights
export const POPULAR_HIGHLIGHTS = {
  'Healthcare & Dental': ['Painless Treatment', 'Friendly Doctors', 'Hygienic Clinic', 'Advanced Technology', 'Affordable Care', 'Prompt Appointment'],
  'Hospital & Multispeciality Clinic': ['24/7 Emergency Care', 'Experienced Doctors', 'Clean ICU & Rooms', 'Quick Admission', 'Caring Nursing Staff', 'Modern Equipment'],
  'Pharmacy & Medical Store': ['100% Genuine Medicines', 'Fast Home Delivery', 'Fair Discounts', 'Well Stocked', 'Polite Pharmacist', 'Emergency Availability'],
  'Diagnostic & Pathology Lab': ['Accurate Reports', 'NABL Certified', 'Painless Blood Sample', 'Same-day Online Reports', 'Hygienic Center', 'Home Collection'],
  'Physiotherapy & Rehabilitation': ['Quick Pain Relief', 'Personalized Exercises', 'Modern Therapy Tech', 'Patient Therapist', 'Comfortable Ambience', 'Long-lasting Recovery'],
  'Ayurveda, Homeopathy & Naturopathy': ['Natural Healing', 'No Side Effects', 'Deep Root Diagnosis', 'Authentic Herbs', 'Holistic Wellness', 'Experienced Vaidya'],
  'Veterinary & Pet Care Clinic': ['Gentle With Pets', 'Experienced Vet', 'Clean Clinic', 'Prompt Emergency Care', 'Pet Grooming', 'Compassionate Staff'],
  'Eye Care & Optician Clinic': ['Accurate Eye Testing', 'Stylish Frames', 'Advanced Lenses', 'Caring Doctor', 'Quick Delivery', 'Budget Friendly'],
  'Cafe & Restaurant': ['Delicious Food', 'Cozy Ambience', 'Quick Service', 'Friendly Staff', 'Great Coffee', 'Best Hangout Spot'],
  'Bakery, Cakes & Pastries': ['Freshly Baked', 'Custom Cake Design', 'Delicious Pastries', 'Hygienic Kitchen', 'On-time Delivery', 'Rich Taste'],
  'Fast Food & Cloud Kitchen': ['Super Fast Delivery', 'Hot & Crispy Food', 'Hygienic Packaging', 'Affordable Combos', 'Great Portions', 'Late Night Open'],
  'Sweet Shop & Mithai Store': ['Pure Desi Ghee', 'Fresh Daily Sweets', 'Authentic Taste', 'Hygienic Counter', 'Festive Packaging', 'Reasonable Price'],
  'Bar, Pub & Lounge': ['Awesome Music & DJ', 'Vibrant Vibe', 'Craft Cocktails', 'Delicious Finger Food', 'Courteous Staff', 'Great Weekend Spot'],
  'Catering & Event Food Service': ['Exquisite Food Taste', 'Grand Buffet Setup', 'Hygienic Live Counters', 'Polite Serving Staff', 'Prompt Service', 'Value for Money'],
  'Hotel, Resort & Homestay': ['Luxurious Rooms', 'Scenic Peaceful View', 'Delicious Breakfast', 'Hospitable Staff', 'Clean Swimming Pool', 'Smooth Check-in'],
  'Beauty, Salon & Spa': ['Relaxing Vibe', 'Expert Stylists', 'Premium Products', 'Clean & Hygienic', 'Reasonable Price', 'Punctual Service'],
  'Bridal Makeup Studio & Artist': ['Flawless HD Makeup', 'Long-lasting Look', 'Premium International Brands', 'Punctual Artist', 'Stress-free Makeover', 'Stunning Photos'],
  'Hair Studio & Men Barber Shop': ['Trendy Haircuts', 'Beard Grooming Perfection', 'Hygienic Tools', 'Skilled Barbers', 'Relaxing Head Massage', 'Quick Wait Time'],
  'Skin, Dermatology & Laser Clinic': ['Clear Glowing Skin', 'US-FDA Approved Lasers', 'Experienced Dermatologist', 'Personalized Skin Regimen', 'Painless Procedure', 'Safe Results'],
  'Tattoo & Piercing Studio': ['Sterilized Needles', 'Custom Creative Artwork', 'Painless Inking', 'Clean Hygiene Studio', 'Detailed Aftercare', 'Skilled Artist'],
  'Fitness & Gym': ['Great Equipment', 'Motivating Trainers', 'Clean Locker Rooms', 'Personalized Diet', 'Positive Atmosphere', 'Affordable Membership'],
  'Yoga & Meditation Studio': ['Peaceful Healing Atmosphere', 'Certified Yoga Masters', 'Beginner Friendly', 'Deep Breathing & Pranayam', 'Flexible Batches', 'Calm Mind'],
  'Sports Academy & Turf': ['Well Maintained Turf', 'Professional Floodlights', 'Great Coaching', 'Clean Changing Rooms', 'Easy Booking', 'Spacious Ground'],
  'Martial Arts & Boxing Club': ['Self Defense Mastery', 'Disciplined Coaching', 'Safe Training Mats', 'Confidence Building', 'High Energy Workouts', 'Great Community'],
  'IT & Digital Marketing': ['Fast Delivery', 'Top-tier ROI', 'Creative Designs', 'Professional Support', 'Clear Communication', 'Expert Team'],
  'Software & App Development': ['Clean Code Architecture', 'Bug-free Delivery', 'Modern UI/UX', 'Agile Communication', 'Post-launch Support', 'Scalable Tech'],
  'Web Design & SEO Agency': ['#1 Google Ranking', 'Blazing Fast Website', 'Mobile Responsive', 'High Conversion Rate', 'Clear Monthly Reports', 'Dedicated Project Manager'],
  'Graphic Design & Video Production': ['Stunning Visuals', 'Quick Revision Turnaround', 'High Resolution Outputs', 'Creative Storytelling', 'Brand Identity Boost', 'Professional Color Grading'],
  'Computer & Laptop Repair Service': ['Quick Same-day Repair', 'Genuine Spare Parts', 'Transparent Quotation', 'Data Security Assured', 'Experienced Technicians', 'Doorstep Pickup'],
  'Automobile Repair & Service': ['Genuine Parts', 'Transparent Billing', 'Skilled Mechanics', 'Prompt Delivery', 'Clean Waiting Lounge', 'Expert Diagnostics'],
  'Car Detailing & Washing Center': ['Mirror Glass Finish', '9H Ceramic Coating', 'Deep Interior Shampoo', 'Scratch Removal', 'Careful Hand Wash', 'Premium Foam Clean'],
  'Tyres, Battery & Wheel Care': ['Laser Wheel Alignment', 'Latest Tyre Stock', 'Quick Battery Replacement', 'Honest Advice', 'Fair Pricing', 'Nitrogen Air Service'],
  'Packers & Movers Logistics': ['Zero Damage Guarantee', 'Careful Multi-layer Packing', 'On-time Delivery', 'Polite Loading Staff', 'Real-time Tracking', 'Hassle-free Moving'],
  'Car Rental, Taxi & Cab Service': ['Clean Sanitized Cabs', 'Courteous Driver', 'Punctual Pickup', 'Transparent Fare', 'Safe Night Driving', 'Smooth AC Ride'],
  'Real Estate & Property': ['Verified Clear Titles', 'Prime Locations', 'Transparent Dealings', 'Prompt Paperwork', 'Great Investment Return', 'Patient Guidance'],
  'Home Decor & Interior Design': ['Breathtaking Aesthetics', 'Space Optimization', 'Quality Materials', 'On-time Handover', '3D Visual Walkthrough', 'Budget-friendly Solutions'],
  'Building Contractor & Construction': ['Strong Quality Foundation', 'Timely Project Completion', 'Strict Material Standards', 'Experienced Engineers', 'Transparent Milestones', 'Honest Billing'],
  'Architecture & Civil Engineering': ['Vastu Compliant Plans', 'Modern Elevation Designs', 'Efficient Floor Layouts', 'Clear Blueprints', 'Structural Stability', 'Innovative Concepts'],
  'Modular Kitchen & Furniture': ['Termite Resistant Wood', 'Smooth Soft-close Hinges', 'Premium Matte Finish', 'Custom Storage Solution', 'Quick Installation', 'Long Warranty'],
  'Sanitaryware, Tiles & Hardware': ['Vast Designer Collection', 'Top Brand Ceramics', 'Wholesale Rates', 'Knowledgeable Staff', 'Prompt Delivery', 'Durable Quality'],
  'Legal & Financial Services': ['Honest Guidance', 'Fast Resolution', 'Confidential Handling', 'Deep Knowledge', 'Clear Documentation', 'High Success Rate'],
  'Advocate & Law Firm': ['Expert Legal Advice', 'Court Case Success', 'Clear Consultation', 'Professional Handling', 'Prompt Documentation', 'Client Confidentiality'],
  'Chartered Accountant (CA) & Tax Filing': ['Timely Tax Filing', 'GST Compliance', 'Expert Financial Advice', 'Transparent Pricing', 'Prompt Audit Service', 'Highly Trustworthy'],
  'Loans, Insurance & Investment Advisory': ['Quick Loan Approval', 'Lowest Interest Rates', 'Minimal Documentation', 'Honest Policy Comparison', 'Zero Hidden Charges', 'Doorstep Assistance'],
  'HR & Placement Consultancy': ['Top Quality Candidates', 'Fast Hiring Turnaround', 'Thorough Pre-screening', 'Industry Specialization', 'Smooth Coordination', 'Reliable Partner'],
  'Education & Coaching Institute': ['Conceptual Clarity', 'Experienced Faculty', 'Comprehensive Notes', 'Personal Attention', 'Proven Results', 'Doubt Clearing Sessions'],
  'Competitive Exams & IIT/NEET Academy': ['Top Rank Selections', 'Rigorous Mock Tests', 'Dedicated Mentorship', 'Shortcut Problem Solving', 'Disciplined Environment', 'High Success Ratio'],
  'School, College & University': ['Holistic Development', 'Modern Smart Classrooms', 'Dedicated Teachers', 'Rich Sports Facilities', 'Safe Secure Campus', 'Strong Academic Focus'],
  'IELTS & Foreign Education Study': ['Band 8+ Scores', 'Personalized Speaking Practice', 'Smooth Visa Guidance', 'Mock Interviews', 'Updated Study Material', 'Friendly Trainers'],
  'Music, Dance & Fine Arts Classes': ['Creative Expression', 'Patient Gurus & Teachers', 'Stage Performance Prep', 'Flexible Timings', 'Fun Positive Vibe', 'Personal Feedback'],
  'Preschool & Daycare Nursery': ['Loving Caring Nannies', 'Safe Clean Play Area', 'Fun Activity Learning', 'CCTV Live Access', 'Nutritious Meals', 'Gentle Teachers'],
  'Retail Store & Supermarket': ['Wide Variety of Items', 'Best Discount Offers', 'Fresh Daily Stock', 'Quick Billing Counter', 'Helpful Staff', 'Clean Aisles'],
  'Clothing, Fashion & Boutique': ['Trendy Unique Outfits', 'Comfortable Premium Fabric', 'Perfect Fitting', 'Courteous Sales Staff', 'New Collections Weekly', 'Great Pricing'],
  'Jewellery & Gold Showroom': ['100% Hallmarked Gold', 'Certified Diamonds', 'Exquisite Designs', 'Fair Making Charges', 'Polite Staff', 'Trusted Heritage'],
  'Mobile Phone & Electronics Store': ['100% Original Products', 'Best Cash Discounts', 'Instant Exchange Offers', 'Zero Downpayment EMI', 'Knowledgeable Staff', 'After-sales Support'],
  'Grocery & Kirana General Store': ['Fresh Grocery Stock', 'Quick Free Home Delivery', 'Wholesale Prices', 'Friendly Shopkeeper', 'Accurate Billing', 'Clean Packaging'],
  'Footwear & Leather Store': ['Comfortable Daily Wear', 'Durable Leather Quality', 'All Major Brands', 'Latest Shoe Trends', 'Accurate Sizing', 'Affordable Prices'],
  'Optical & Eyewear Store': ['Computer Eye Testing', 'Featherlight Frames', 'Anti-glare Blue Cut Lenses', 'Same-day Glass Delivery', 'Fair Pricing', 'Stylish Sunglasses'],
  'Books, Stationery & Gift Shop': ['All School/College Books', 'Art & Craft Supplies', 'Creative Gift Wrapping', 'Customized Mugs & Gifts', 'Reasonable Rates', 'Prompt Service'],
  'Electrician & Electrical Services': ['Quick Emergency Service', 'Safe Wiring Standards', 'Skilled Electricians', 'Fair Honest Rates', 'Genuine Switch/Cables', 'Neat Work'],
  'Plumbing & Water Solution Services': ['Zero Leakage Guarantee', 'Modern Plumbing Tools', 'Prompt Arrival', 'Fair Labor Charges', 'Clean Finishing', 'Trustworthy Plumber'],
  'AC Repair & Appliance Service': ['Quick 30-min Service', 'Skilled Technicians', 'Genuine Spare Parts', 'Transparent Pricing', 'Cooling Guaranteed', 'Polite Behavior'],
  'Deep Cleaning & Pest Control': ['100% Odorless Pest Control', 'Spotless Sparkle Clean', 'Safe Child-friendly Chemicals', 'Punctual Team', 'Hard-to-reach Cleaning', 'Affordable Package'],
  'Painting & Waterproofing Services': ['Smooth Velvet Finish', 'Zero Water Seepage', 'Asian Paints Certified', 'Clean Furniture Masking', 'On-time Handover', 'Fair Estimates'],
  'CCTV & Home Security Setup': ['Crystal Clear Night Vision', 'Live Mobile App Access', 'Neat Concealed Wiring', 'Prompt After-sales Support', 'Reliable DVR Storage', 'Fair Package'],
  'Solar Rooftop & Inverter Power': ['Massive Bill Savings', 'Tier-1 High Efficiency Panels', 'Government Subsidy Support', 'Sturdy Mounting Structure', 'Fast Net Metering', 'Long Warranty'],
  'Wedding Planner & Event Management': ['Flawless Execution', 'Stunning Decor', 'Stress-free Coordination', 'Budget Friendly', 'Memorable Experience', 'Friendly Team'],
  'Photography & Video Shoot Studio': ['Cinematic 4K Visuals', 'Candid Natural Moments', 'Creative Angles', 'Quick Album Delivery', 'Polite Photographers', 'Stunning Drone Shots'],
  'Banquet Hall & Wedding Garden': ['Grand Spacious Hall', 'Delicious In-house Food', 'Ample Car Parking', 'Central AC Cooling', 'Royal Stage Decoration', 'Courteous Management'],
  'DJ & Sound System Setup': ['Thumping Bass & Clarity', 'Energetic Playlist', 'Stunning Moving Lights', 'Crowd-pumping DJ', 'Punctual Setup', 'Top Quality Equipment'],
  'Travel & Tour Packages Booking': ['Hassle-free Itinerary', 'Best Flight & Hotel Rates', 'Smooth Visa Approval', '24/7 Travel Assistance', 'Memorable Vacations', 'Transparent Costs'],
  'Astrology, Kundali & Vastu Shastra': ['Accurate Life Predictions', 'Simple Effective Remedies', 'Deep Vedic Knowledge', 'Compassionate Guidance', 'Scientific Vastu Advice', 'Confidential Sessions'],
  'Dry Cleaners & Steam Laundry': ['Gentle Stain Removal', 'Crisp Steam Press', 'Fragrant Fresh Fabric', 'On-time Delivery', 'Eco-friendly Chemicals', 'Neat Packaging'],
  'Tailoring, Boutique & Alterations': ['Perfect Body Fitting', 'Designer Cuts & Stitching', 'Prompt Timely Delivery', 'Creative Neck Designs', 'Fair Stitching Charges', 'Skilled Master Tailor'],
  'Printing Press & Signage Advertising': ['Vibrant Color Printing', 'High Quality Flex Banner', 'Quick Turnaround Delivery', 'Sharp Resolution', 'Wholesale Bulk Rates', 'Creative Graphic Design'],
  'Manufacturing & Industrial Factory': ['High Precision Quality', 'Bulk Order Reliability', 'Strict ISO Standards', 'Competitive Pricing', 'Timely Dispatch', 'Robust Infrastructure'],
  'Other / Custom Business': ['Excellent Service', 'Highly Recommended', 'Professional Staff', 'Great Value for Money', 'Quick Turnaround', 'Trustworthy Team'],
  'default': ['Excellent Service', 'Highly Recommended', 'Professional Staff', 'Great Value for Money', 'Quick Turnaround', 'Trustworthy Team']
};

// Industry-specific sub-categories / micro-niches for laser-targeted SEO reviews
export const POPULAR_SUB_CATEGORIES = {
  'Clothing, Fashion & Boutique': [
    "Men's Premium Outfits & Formal Wear",
    "Casuals, Denims & Streetwear",
    "Suits, Blazers & Tuxedos",
    "Ethnic Kurta & Wedding Sherwani",
    "Women's Designer Wear & Sarees",
    "Custom Tailoring & Alterations",
    "Kids & Family Apparel"
  ],
  'Healthcare & Dental': [
    "Root Canal & Endodontics Specialist",
    "Cosmetic Smile Makeover & Whitening",
    "Invisible Aligners & Orthodontics",
    "Dental Implants & Oral Surgery",
    "Pediatric & Kids Dental Care",
    "General Dentistry & Cleanings"
  ],
  'Hospital & Multispeciality Clinic': [
    "General Medicine & OPD Clinic",
    "Orthopedic & Joint Replacement",
    "Cardiology & Heart Care",
    "Gynecology & Maternity Hospital",
    "Pediatric & Child Specialist",
    "24/7 Emergency & ICU Care"
  ],
  'Pharmacy & Medical Store': [
    "Allopathic Medicines & Prescriptions",
    "Ayurvedic & Herbal Wellness",
    "Baby Care & Surgical Supplies",
    "Home Delivery Medical Store",
    "Emergency 24/7 Pharmacy"
  ],
  'Diagnostic & Pathology Lab': [
    "Routine & Comprehensive Blood Tests",
    "Digital X-Ray & Ultrasound",
    "MRI & CT Scan Imaging",
    "Full Body Health Packages",
    "Painless Home Sample Collection"
  ],
  'Physiotherapy & Rehabilitation': [
    "Back & Neck Pain Relief",
    "Sports Injury & Rehab Therapy",
    "Post-Surgery Physical Therapy",
    "Neuro & Stroke Rehabilitation",
    "Ergonomic Posture Correction"
  ],
  'Ayurveda, Homeopathy & Naturopathy': [
    "Vedic Pulse Diagnosis (Nadi Pariksha)",
    "Panchakarma Detox Therapy",
    "Chronic Disease Natural Healing",
    "Herbal Medicines & Dietary Plan",
    "Holistic Stress & Lifestyle Care"
  ],
  'Veterinary & Pet Care Clinic': [
    "Dog & Cat General Health Checkup",
    "Pet Vaccination & Deworming",
    "Pet Grooming & Spa Bath",
    "Veterinary Surgery & Dental Care",
    "24/7 Pet Emergency Care"
  ],
  'Eye Care & Optician Clinic': [
    "Computer Eye Testing & Vision Check",
    "Designer Optical Frames & Sunglasses",
    "Blue-Cut & Anti-Glare Lenses",
    "Contact Lens Clinic & Fitting",
    "Cataract & Lasik Consultation"
  ],
  'Cafe & Restaurant': [
    "Specialty Coffee & Artisan Cafe",
    "Family Multi-Cuisine Dining",
    "Woodfire Pizza & Italian Cafe",
    "Fast Food & Burger Joint",
    "Rooftop Ambience & Romantic Dine",
    "Pure Veg Thali & North Indian"
  ],
  'Bakery, Cakes & Pastries': [
    "Custom Designer Birthday Cakes",
    "Fresh Pastries, Donuts & Brownies",
    "Artisan Sourdough & Fresh Breads",
    "Eggless & Sugar-Free Bakery",
    "Wedding & Anniversary Cakes"
  ],
  'Fast Food & Cloud Kitchen': [
    "Crispy Burgers & Loaded Fries",
    "Rolls, Shawarma & Wraps",
    "Steamed & Fried Momos Hub",
    "Late Night Delivery Food",
    "Chinese Street Food & Noodles"
  ],
  'Sweet Shop & Mithai Store': [
    "Pure Desi Ghee Sweets & Halwa",
    "Bengali Rasgulla & Sandesh",
    "Kaju Katli & Premium Dry Fruit Sweets",
    "Namkeen, Samosa & Kachori",
    "Festive Sweet Gift Boxes"
  ],
  'Beauty, Salon & Spa': [
    "Hair Studio & Trendy Cuts",
    "Hydra Facial & Skin Glow",
    "Bridal Makeover & Party Makeup",
    "Keratin, Smoothening & Botoplex",
    "Relaxing Body Spa & Massage",
    "Nail Art & Extensions"
  ],
  'Bridal Makeup Studio & Artist': [
    "HD & Airbrush Bridal Makeover",
    "Engagement & Reception Glam",
    "Mehendi & Sangeet Makeup",
    "Pre-Bridal Skin & Hair Glow",
    "Celebrity & Portfolio Makeup"
  ],
  'Hair Studio & Men Barber Shop': [
    "Modern Fades & Haircuts",
    "Beard Trimming & Hot Towel Shave",
    "Hair Spa & Dandruff Treatment",
    "Hair Color & Highlights",
    "Relaxing Head & Shoulder Massage"
  ],
  'Skin, Dermatology & Laser Clinic': [
    "Laser Hair Removal (US-FDA)",
    "Acne & Scar Laser Treatment",
    "Anti-Aging Botox & Fillers",
    "Chemical Peels & Skin Brightening",
    "PRP Hair Regrowth Therapy"
  ],
  'Fitness & Gym': [
    "Strength & Weight Training",
    "CrossFit & Functional Fitness",
    "Personal Fitness Coaching & Diet",
    "Weight Loss & Fat Burn Bootcamp",
    "Cardio, Zumba & Aerobics"
  ],
  'Yoga & Meditation Studio': [
    "Hatha & Power Yoga Batches",
    "Pranayama & Mindfulness Meditation",
    "Pre-Natal & Post-Natal Yoga",
    "Sound Healing & Chakra Balance",
    "Beginner Friendly Morning Batches"
  ],
  'IT & Digital Marketing': [
    "SEO & Google Maps Rank 1 Booster",
    "Performance Marketing & Paid Ads",
    "Social Media Growth & Management",
    "Website Design & Conversion UI",
    "Lead Generation & Funnel Strategy"
  ],
  'Software & App Development': [
    "iOS & Android Mobile App Dev",
    "Custom Web Application & SaaS",
    "Full-Stack Software Architecture",
    "Cloud DevOps & Backend APIs",
    "UI/UX Design & Wireframing"
  ],
  'Automobile Repair & Service': [
    "Periodic Car Service & Oil Change",
    "Computerized Engine Diagnostics",
    "Car AC Gas Refill & Cooling",
    "Brake, Suspension & Clutch Overhaul",
    "Two-Wheeler & Bike Repair Center"
  ],
  'Car Detailing & Washing Center': [
    "9H Ceramic & Graphene Coating",
    "Paint Protection Film (PPF)",
    "Deep Interior Steam Clean & Shampoo",
    "Mirror Finish Scratch Polish",
    "High-Pressure Foam Wash"
  ],
  'Real Estate & Property': [
    "Luxury Residential Apartments",
    "Commercial Shops & Office Spaces",
    "Residential Plots & Land Investment",
    "Villas & Gated Communities",
    "Rental & Property Brokerage"
  ],
  'Home Decor & Interior Design': [
    "Modular Kitchen & Crockery Units",
    "Full Turnkey Interior Design",
    "False Ceiling & Ambient Lighting",
    "Custom Wardrobes & Furniture",
    "3D Architectural Walkthrough"
  ],
  'Chartered Accountant (CA) & Tax Filing': [
    "Income Tax Return (ITR) Filing",
    "GST Registration & Monthly Returns",
    "Statutory & Internal Audits",
    "Company Incorporation & Roc Compliance",
    "Accounting & Bookkeeping Services"
  ],
  'Advocate & Law Firm': [
    "Civil & Property Law Consultation",
    "Corporate & Commercial Drafting",
    "Criminal Litigation & Bail",
    "Family & Matrimonial Matters",
    "High Court & District Court Practice"
  ],
  'Education & Coaching Institute': [
    "IIT-JEE & NEET Academy",
    "UPSC & Competitive Exam Center",
    "Class 9-12 CBSE & State Board Tuition",
    "Foundation & Olympiad Classes",
    "Spoken English & Communication Skills"
  ],
  'Jewellery & Gold Showroom': [
    "100% Hallmarked 22K Gold Jewellery",
    "Certified Natural Diamond Solitaires",
    "Antique Bridal Polki & Kundan",
    "925 Pure Silver Articles & Utensils",
    "Lightweight Daily Office Jewellery"
  ],
  'Mobile Phone & Electronics Store': [
    "Latest Smartphones & Accessories",
    "Laptops, MacBooks & Tablets",
    "Smart TVs & Home Theatres",
    "Refrigerators, AC & Home Appliances",
    "Instant Zero Downpayment EMI"
  ],
  'Grocery & Kirana General Store': [
    "Daily Fresh Groceries & Staples",
    "Organic Grains, Pulses & Spices",
    "Dairy, Bread & Everyday Essentials",
    "Personal Care & Household Items",
    "Express Free Doorstep Delivery"
  ],
  'Electrician & Electrical Services': [
    "Emergency Power & Wiring Repair",
    "Inverter & Battery Wiring",
    "Ceiling Fan, Geyser & Light Fitting",
    "MCB & Short Circuit Troubleshooting",
    "Commercial Electrical Wiring"
  ],
  'AC Repair & Appliance Service': [
    "Split & Window AC Installation",
    "AC Gas Refilling & Jet Cleaning",
    "Washing Machine & Refrigerator Repair",
    "Microwave Oven & Geyser Service",
    "Annual Maintenance Contract (AMC)"
  ],
  'Deep Cleaning & Pest Control': [
    "Full Home Deep Sanitization",
    "Odorless Cockroach & Termite Control",
    "Sofa, Mattress & Carpet Shampoo",
    "Kitchen & Bathroom Descaling",
    "Commercial Office Disinfection"
  ],
  'Wedding Planner & Event Management': [
    "Royal Wedding & Destination Decor",
    "Corporate Events & Conferences",
    "Birthday & Anniversary Parties",
    "Artist & Celebrity Booking",
    "Catering & Hospitality Coordination"
  ],
  'Photography & Video Shoot Studio': [
    "Cinematic Wedding Films & Pre-Wedding",
    "Candid Photography & Drone 4K",
    "Maternity & Newborn Baby Shoots",
    "Fashion & Commercial Product Shoots",
    "High Resolution Photo Album Printing"
  ],
  'Dry Cleaners & Steam Laundry': [
    "Premium Suit & Sherwani Dry Clean",
    "Designer Saree & Lehenga Steam Press",
    "Blanket, Quilt & Curtain Cleaning",
    "Stain Removal & Fabric Softening",
    "Same-Day Express Laundry Service"
  ],
  'Bar, Pub & Lounge': [
    "Craft Cocktails & Artisan Mixology",
    "Live Sports Screening & Pub Grub",
    "Weekend DJ Night & Dance Floor",
    "Microbrewery & Craft Beers",
    "Rooftop Lounge & Sundowner Bar"
  ],
  'Catering & Event Food Service': [
    "Wedding & Grand Reception Buffet",
    "Corporate Lunches & Conferences",
    "Live Street Food & Chaat Counters",
    "Private House Parties & High Tea",
    "Pure Veg & Jain Catering Specialists"
  ],
  'Hotel, Resort & Homestay': [
    "Luxury Boutique Rooms & Suites",
    "Heritage Villa & Eco-Resort",
    "Family Vacation & Swimming Pool Stay",
    "Business Executive Stay & Conference",
    "Scenic Mountain/Beach Homestay"
  ],
  'Tattoo & Piercing Studio': [
    "Custom Realism & Portrait Tattoos",
    "Minimalist & Geometric Ink",
    "Tribal, Script & Calligraphy Tattoos",
    "Hygienic Body Piercing & Aftercare",
    "Tattoo Cover-Up & Re-Inking"
  ],
  'Sports Academy & Turf': [
    "Box Cricket & Football Turf Rental",
    "Professional Tennis & Badminton Courts",
    "Youth Cricket & Sports Academy",
    "Swimming Lessons & Aquatic Coaching",
    "Night Floodlight Turf Matches"
  ],
  'Martial Arts & Boxing Club': [
    "MMA & Mixed Martial Arts",
    "Karate & Taekwondo for Kids",
    "Boxing & Kickboxing Conditioning",
    "Self-Defense for Women",
    "Jiu-Jitsu & Wrestling Training"
  ],
  'Web Design & SEO Agency': [
    "Custom WordPress & Shopify Websites",
    "Local SEO & Google Maps Ranking",
    "High-Conversion Landing Page Design",
    "E-Commerce Web Portal Development",
    "Website Speed & Core Web Vitals"
  ],
  'Graphic Design & Video Production': [
    "Brand Identity & Logo Design",
    "Social Media Creatives & Ad Reels",
    "Corporate Video & Product Shoots",
    "Motion Graphics & 2D/3D Animation",
    "Packaging & Print Media Design"
  ],
  'Computer & Laptop Repair Service': [
    "MacBook & Laptop Screen Repair",
    "Motherboard & Chip-Level Repair",
    "SSD Upgrade & OS Installation",
    "Data Recovery & Backup Solutions",
    "Gaming PC Custom Builds"
  ],
  'Tyres, Battery & Wheel Care': [
    "Laser 3D Wheel Alignment & Balancing",
    "Tubeless Tyres All Major Brands",
    "Car & Inverter Battery Replacement",
    "Nitrogen Air Filling & Puncture Repair",
    "Suspension Inspection & Tyre Rotation"
  ],
  'Packers & Movers Logistics': [
    "Local Household Shifting & Moving",
    "Intercity & Domestic Relocation",
    "Office Furniture & IT Relocation",
    "Multi-Layer Safe Box Packing",
    "Car & Bike Transportation Logistics"
  ],
  'Car Rental, Taxi & Cab Service': [
    "Outstation Round-Trip Cabs",
    "Local Hourly Rental & City Tours",
    "Airport Pickup & Drop Taxi",
    "Luxury Wedding Car Rentals",
    "Self-Drive Cars & SUVs"
  ],
  'Building Contractor & Construction': [
    "Turnkey Residential Construction",
    "Commercial Building & Complexes",
    "Renovation & Home Remodeling",
    "RCC Structure & Civil Foundations",
    "Waterproofing & Structural Repair"
  ],
  'Architecture & Civil Engineering': [
    "Vastu-Compliant House Elevation Plans",
    "Modern Villa & Bungalow Design",
    "Commercial Blueprint & Structural Drawings",
    "3D Elevation Walkthrough Rendering",
    "Municipal Plan Sanctioning"
  ],
  'Modular Kitchen & Furniture': [
    "Acrylic & PU Finish Modular Kitchens",
    "Custom Wardrobes & Walk-in Closets",
    "Living Room TV Units & Partition Panels",
    "Bespoke Wooden Sofas & Dining Sets",
    "Office Desks & Ergonomic Workstations"
  ],
  'Sanitaryware, Tiles & Hardware': [
    "Designer Glazed Vitrified Tiles (GVT)",
    "Luxury Bathroom Fittings & Faucets",
    "Modern Countertop Washbasins & Closets",
    "Kitchen Sinks & Modular Hardware",
    "Italian Marble & Quartz Stone"
  ],
  'Legal & Financial Services': [
    "Corporate Law & Contract Advisory",
    "Startup Incorporation & Funding Legalities",
    "Trademark, Copyright & Patent Filing",
    "Wealth Management & Tax Planning",
    "Arbitration & Dispute Resolution"
  ],
  'Loans, Insurance & Investment Advisory': [
    "Home Loan & Property Mortgage",
    "Business & MSME Unsecured Loans",
    "Term Life & Health Insurance Plans",
    "Mutual Funds & SIP Wealth Planning",
    "Motor & Commercial Vehicle Insurance"
  ],
  'HR & Placement Consultancy': [
    "Executive Search & Headhunting",
    "IT & Tech Talent Recruitment",
    "Overseas Staffing & Placement",
    "Volume & Bulk Blue-Collar Hiring",
    "Payroll Management & HR Compliance"
  ],
  'Competitive Exams & IIT/NEET Academy': [
    "IIT-JEE Mains & Advanced Prep",
    "NEET-UG Medical Entrance Coaching",
    "UPSC Civil Services & State PSC",
    "Bank PO, SSC & Railway Exams",
    "Mock Test Series & Doubt Clearing"
  ],
  'School, College & University': [
    "CBSE / ICSE Senior Secondary School",
    "International Baccalaureate (IB) Academy",
    "Undergraduate Degree Programs",
    "Engineering & Management College",
    "Sports & Cultural Campus Facilities"
  ],
  'IELTS & Foreign Education Study': [
    "IELTS Academic & General Coaching",
    "PTE, TOEFL & Duolingo Prep",
    "Canada, UK & USA Student Visas",
    "University SOP & Admission Guidance",
    "Spoken English Fluency Training"
  ],
  'Music, Dance & Fine Arts Classes': [
    "Acoustic & Electric Guitar Classes",
    "Keyboard & Piano Lessons",
    "Classical Kathak & Bharatanatyam Dance",
    "Hip-Hop, Bollywood & Salsa Batches",
    "Painting, Sketching & Pottery Classes"
  ],
  'Preschool & Daycare Nursery': [
    "Playgroup & Toddler Learning",
    "Montessori Kindergarten & Nursery",
    "Full-Day & Half-Day Care Services",
    "Phonics & Fun Activity Development",
    "CCTV Monitored Safe Campus"
  ],
  'Retail Store & Supermarket': [
    "Fresh Fruits & Vegetables Section",
    "Packed Foods, Beverages & Snacks",
    "Home Hygiene & Household Goods",
    "Discount Bulk Groceries & Staples",
    "Self-Checkout & Express Counter"
  ],
  'Footwear & Leather Store': [
    "Men's Formal Leather Shoes & Loafers",
    "Women's Heels, Flats & Ethnic Mojaris",
    "Running Sneakers & Sports Shoes",
    "Pure Leather Wallets, Belts & Bags",
    "Orthopedic Comfort Daily Footwear"
  ],
  'Optical & Eyewear Store': [
    "Computerized Eye Checkup Clinic",
    "Designer Rimless & Acetate Frames",
    "Blue-Light Blocking Screen Glasses",
    "Progressive & Bifocal Power Lenses",
    "Polarized UV Sunglasses & Contacts"
  ],
  'Books, Stationery & Gift Shop': [
    "School & College Textbooks & Guides",
    "Art & Professional Craft Supplies",
    "Office Stationery & Desk Accessories",
    "Personalized Gift Mugs & Frames",
    "Novelty Greeting Cards & Board Games"
  ],
  'Plumbing & Water Solution Services': [
    "Emergency Leak Repair & Drain Unclogging",
    "Bathroom Sanitaryware & Pipe Fitting",
    "Water Tank Cleaning & Motor Installation",
    "RO Water Purifier Service & Filters",
    "Pressure Booster Pump Setup"
  ],
  'Painting & Waterproofing Services': [
    "Interior Luxury Emulsion & Texture Wall",
    "Exterior Weather-Proof Wall Coating",
    "Roof Terrace Waterproofing Membrane",
    "Damp Wall & Crack Injection Treatment",
    "Wood Polish & Metal Enamel Coating"
  ],
  'CCTV & Home Security Setup': [
    "IP Camera & 4K HD CCTV Installation",
    "Live Mobile App Remote Surveillance",
    "Smart Video Doorbell & Intercom",
    "Biometric Fingerprint Attendance Setup",
    "Burglary Alarm & Motion Sensors"
  ],
  'Solar Rooftop & Inverter Power': [
    "Residential Rooftop On-Grid Solar",
    "Government Subsidy Solar Panels",
    "Commercial Net-Metering Solar Plants",
    "Heavy-Duty Inverter & Lithium Battery",
    "Solar Maintenance & Cleaning AMC"
  ],
  'Banquet Hall & Wedding Garden': [
    "Air-Conditioned Grand Banquet Hall",
    "Open-Air Lush Green Party Lawn",
    "Royal Mandap & Stage Decoration",
    "Ample Valet Parking & Guest Rooms",
    "In-House Catering & Sound Setup"
  ],
  'DJ & Sound System Setup': [
    "Wedding Sangeet & Reception DJ Setup",
    "Club Audio, Line-Array & Bass Subwoofers",
    "Sharp Moving Heads & Laser Lights",
    "Dhol Players & Punjabi Brass Band",
    "Live Stage Sound Engineering"
  ],
  'Travel & Tour Packages Booking': [
    "International Holiday Tour Packages",
    "Domestic Honeymoon & Hill Station Trips",
    "Flight, Train & Luxury Bus Tickets",
    "Tourist Visa & Passport Assistance",
    "Customized Corporate Retreats"
  ],
  'Astrology, Kundali & Vastu Shastra': [
    "Detailed Vedic Kundali Matching & Dosh",
    "Career & Business Life Predictions",
    "Scientific Residential Vastu Consultation",
    "Certified Natural Gemstones & Rings",
    "Navagraha Puja & Remedial Solutions"
  ],
  'Tailoring, Boutique & Alterations': [
    "Designer Saree Blouse & Neck Patterns",
    "Custom Bridal Lehengas & Gowns",
    "Gentlemen's Custom Suits & Sherwanis",
    "Kurti, Salwar & Palazzo Stitching",
    "Quick Fitting & Garment Alterations"
  ],
  'Printing Press & Signage Advertising': [
    "Large Format Flex Banners & Hoardings",
    "LED Acrylic Letter Glow Sign Boards",
    "Visiting Cards & Brochure Printing",
    "Custom Vinyl Stickers & Standees",
    "Screen Printing & Box Packaging"
  ],
  'Manufacturing & Industrial Factory': [
    "Precision CNC & Metal Fabrication",
    "Plastic Injection Molding & Dies",
    "High-Volume OEM Component Production",
    "ISO 9001 Quality Assured Exports",
    "Industrial Machine Spares & Assemblies"
  ],
  'Other / Custom Business': [
    "Premium Quality Service",
    "Specialized Expert Solutions",
    "Customized Client Packages",
    "Express Same-Day Turnaround",
    "Consultation & After-Sales Support"
  ],
  'default': [
    "Premium Quality Service",
    "Specialized Expert Solutions",
    "Customized Client Packages",
    "Express Same-Day Turnaround",
    "Consultation & After-Sales Support"
  ]
};

/**
 * Normalizes any category string (from Gemini, OSM, or user) to an exact valid CATEGORIES_LIST entry
 */
export function matchToCanonicalCategory(rawStr) {
  if (!rawStr || typeof rawStr !== 'string') return null;
  const s = rawStr.trim().toLowerCase();

  // 1. Direct exact or substring match in CATEGORIES_LIST
  for (const cat of CATEGORIES_LIST) {
    if (cat.toLowerCase() === s) return cat;
  }
  for (const cat of CATEGORIES_LIST) {
    if (cat.toLowerCase().includes(s) || s.includes(cat.toLowerCase())) return cat;
  }

  // 2. Semantic synonym mapping
  if (/bake|bakery|cake|pastry|confection|doughnut|cupcake|cookie|bread|patisserie|theobroma|bakingo/i.test(s)) {
    return 'Bakery, Cakes & Pastries';
  }
  if (/sweet|mithai|halwai|namkeen|laddu|rasgulla|dessert|haldiram|bikanervala|kanha/i.test(s)) {
    return 'Sweet Shop & Mithai Store';
  }
  if (/fast food|burger|pizza|sandwich|kfc|mcdonald|domino|subway|cloud kitchen/i.test(s)) {
    return 'Fast Food & Cloud Kitchen';
  }
  if (/cafe|coffee|tea|chai|starbucks|ccd|beverage|roaster|chaayos/i.test(s)) {
    return 'Cafe & Restaurant';
  }
  if (/restaurant|dine|dining|dhaba|biryani|kitchen|food|eatery/i.test(s)) {
    return 'Cafe & Restaurant';
  }
  if (/bar|pub|lounge|brewery|club|beer|liquor/i.test(s)) {
    return 'Bar, Pub & Lounge';
  }
  if (/hotel|resort|lodge|inn|homestay|hospitality/i.test(s)) {
    return 'Hotel, Resort & Homestay';
  }
  if (/dent|dental|teeth|orthodont/i.test(s)) {
    return 'Healthcare & Dental';
  }
  if (/hospital|clinic|doctor|physician|apollo|fortis|max|medanta/i.test(s)) {
    return 'Hospital & Multispeciality Clinic';
  }
  if (/pharma|chemist|medicine|medical store|drug/i.test(s)) {
    return 'Pharmacy & Medical Store';
  }
  if (/pathology|diagnostic|lab|blood test|mri|xray/i.test(s)) {
    return 'Diagnostic & Pathology Lab';
  }
  if (/physio|rehab|physical therapy/i.test(s)) {
    return 'Physiotherapy & Rehabilitation';
  }
  if (/ayurved|homeopath|naturopath|vaidya/i.test(s)) {
    return 'Ayurveda, Homeopathy & Naturopathy';
  }
  if (/vet|veterinary|pet|animal/i.test(s)) {
    return 'Veterinary & Pet Care Clinic';
  }
  if (/eye|optician|optical|spectacle|lens|lenskart/i.test(s)) {
    return 'Eye Care & Optician Clinic';
  }
  if (/salon|spa|beauty|parlour|lakme|jawed|toni|haircut|facial/i.test(s)) {
    return 'Beauty, Salon & Spa';
  }
  if (/makeup|bridal|mehendi/i.test(s)) {
    return 'Bridal Makeup Studio & Artist';
  }
  if (/barber|men salon|shave/i.test(s)) {
    return 'Hair Studio & Men Barber Shop';
  }
  if (/skin|derma|laser|cosmetology/i.test(s)) {
    return 'Skin, Dermatology & Laser Clinic';
  }
  if (/tattoo|ink|piercing/i.test(s)) {
    return 'Tattoo & Piercing Studio';
  }
  if (/gym|fitness|crossfit|workout|bodybuilding|cult/i.test(s)) {
    return 'Fitness & Gym';
  }
  if (/yoga|meditation|pilates/i.test(s)) {
    return 'Yoga & Meditation Studio';
  }
  if (/electric|electrical|wiring|electrician/i.test(s)) {
    return 'Electrician & Electrical Services';
  }
  if (/plumb|plumbing|sanitary/i.test(s)) {
    return 'Plumbing & Water Solution Services';
  }
  if (/ac |air condition|hvac|refrigerator|fridge|washing machine/i.test(s)) {
    return 'AC Repair & Appliance Service';
  }
  if (/clean|pest control|housekeeping/i.test(s)) {
    return 'Deep Cleaning & Pest Control';
  }
  if (/paint|painter|waterproof/i.test(s)) {
    return 'Painting & Waterproofing Services';
  }
  if (/cctv|surveillance|security/i.test(s)) {
    return 'CCTV & Home Security Setup';
  }
  if (/solar|rooftop|inverter/i.test(s)) {
    return 'Solar Rooftop & Inverter Power';
  }
  if (/car repair|mechanic|garage|auto|automobile|bike/i.test(s)) {
    return 'Automobile Repair & Service';
  }
  if (/car wash|detailing|ceramic|teflon|ppf/i.test(s)) {
    return 'Car Detailing & Washing Center';
  }
  if (/tyre|tire|wheel|battery/i.test(s)) {
    return 'Tyres, Battery & Wheel Care';
  }
  if (/real estate|property|realty|broker|builder|housing/i.test(s)) {
    return 'Real Estate & Property';
  }
  if (/interior|decor|furniture|modular/i.test(s)) {
    return 'Home Decor & Interior Design';
  }
  if (/ca|chartered|tax|gst|accountant|audit/i.test(s)) {
    return 'Chartered Accountant (CA) & Tax Filing';
  }
  if (/advocate|lawyer|law firm|legal/i.test(s)) {
    return 'Advocate & Law Firm';
  }
  if (/loan|finance|insurance|investment/i.test(s)) {
    return 'Loans, Insurance & Investment Advisory';
  }
  if (/coaching|tuition|iit|jee|neet|upsc|academy/i.test(s)) {
    return 'Competitive Exams & IIT/NEET Academy';
  }
  if (/school|college|university|education/i.test(s)) {
    return 'Education & Coaching Institute';
  }
  if (/jewel|gold|diamond|silver/i.test(s)) {
    return 'Jewellery & Gold Showroom';
  }
  if (/cloth|garment|fashion|boutique|wear|apparel|zudio|zara|h&m|pantaloons/i.test(s)) {
    return 'Clothing, Fashion & Boutique';
  }
  if (/mobile|phone|electronic|laptop|croma|apple/i.test(s)) {
    return 'Mobile Phone & Electronics Store';
  }
  if (/grocery|kirana|supermarket|mart|provision/i.test(s)) {
    return 'Grocery & Kirana General Store';
  }
  if (/shoe|footwear|leather/i.test(s)) {
    return 'Footwear & Leather Store';
  }

  return null;
}

/**
 * Smart automatic category classifier based on business name keywords & brand registry
 */
export const detectCategoryFromName = (rawName) => {
  const name = (rawName || '').trim().toLowerCase();
  if (!name || name.length < 2) return null;

  // 1. Direct Famous Brand Recognition
  if (/starbucks|costa coffee|chaayos|chai point|blue tokai|third wave|barista|cafe coffee day|\bccd\b/i.test(name)) {
    return 'Cafe & Restaurant';
  }
  if (/theobroma|monginis|mio amore|karachi bakery|bake hut|cake culture|bakingo|ovenstory|belgian waffle/i.test(name)) {
    return 'Bakery, Cakes & Pastries';
  }
  if (/haldiram|bikanervala|kanha sweets|bhikharam|anand sweets|mithaiwala/i.test(name)) {
    return 'Sweet Shop & Mithai Store';
  }
  if (/kfc|mcdonald|domino|pizza hut|burger king|subway|wendy|taco bell|wow momo/i.test(name)) {
    return 'Fast Food & Cloud Kitchen';
  }
  if (/zudio|zara|h&m|pantaloons|westside|max fashion|manyavar|fabindia|biba|raymond/i.test(name)) {
    return 'Clothing, Fashion & Boutique';
  }
  if (/lenskart|titan eye|specsmakers|lawrence & mayo/i.test(name)) {
    return 'Eye Care & Optician Clinic';
  }
  if (/croma|reliance digital|vijay sales|poorvika|sangeetha/i.test(name)) {
    return 'Mobile Phone & Electronics Store';
  }
  if (/apollo|fortis|max healthcare|medanta|manipal/i.test(name)) {
    return 'Hospital & Multispeciality Clinic';
  }
  if (/clove dental|sabka dentist/i.test(name)) {
    return 'Healthcare & Dental';
  }
  if (/jawed habib|toni & guy|geetanjali|lakme salon|enrich|vlcc/i.test(name)) {
    return 'Beauty, Salon & Spa';
  }
  if (/cult\.fit|cultfit|gold\'?s gym|anytime fitness/i.test(name)) {
    return 'Fitness & Gym';
  }

  // 2. Keyword Classification
  if (/dent|tooth|teeth|smile|ortho|root canal/i.test(name)) {
    return 'Healthcare & Dental';
  }
  if (/hospital|clinic|doctor|dr\.|medicare|nursing home|physician|dispensary/i.test(name)) {
    return 'Hospital & Multispeciality Clinic';
  }
  if (/pharma|chemist|medicine|medicos|drug/i.test(name)) {
    return 'Pharmacy & Medical Store';
  }
  if (/lab|pathology|diagnostic|scan|blood test|x-ray|mri|ultrasound/i.test(name)) {
    return 'Diagnostic & Pathology Lab';
  }
  if (/physio|rehab|chiropractic/i.test(name)) {
    return 'Physiotherapy & Rehabilitation';
  }
  if (/ayur|homeo|naturopathy|vaidya|herbal/i.test(name)) {
    return 'Ayurveda, Homeopathy & Naturopathy';
  }
  if (/pet|vet|animal|dog|cat|puppy/i.test(name)) {
    return 'Veterinary & Pet Care Clinic';
  }
  if (/eye|optician|optical|vision|chashma|spectacles|lens/i.test(name)) {
    return 'Eye Care & Optician Clinic';
  }
  if (/baker|bakery|cake|pastry|bread|waffle|muffin|cupcake|confection|doughnut|patisserie/i.test(name)) {
    return 'Bakery, Cakes & Pastries';
  }
  if (/sweet|mithai|halwai|namkeen|laddu|rasgulla/i.test(name)) {
    return 'Sweet Shop & Mithai Store';
  }
  if (/cafe|coffee|brew|roast|bistro|tea|chai|mocktail|shake|juice|smoothie|shambhu/i.test(name)) {
    return 'Cafe & Restaurant';
  }
  if (/restaurant|pizza|burger|food|kitchen|dine|dhaba|biryani|roll|dosa|momos|grill|chaat|bhojanalaya/i.test(name)) {
    return 'Cafe & Restaurant';
  }
  if (/bar|pub|lounge|brewery|club|beer/i.test(name)) {
    return 'Bar, Pub & Lounge';
  }
  if (/cater|catering/i.test(name)) {
    return 'Catering & Event Food Service';
  }
  if (/hotel|resort|stay|inn|lodge|guest house|homestay|haveli/i.test(name)) {
    return 'Hotel, Resort & Homestay';
  }
  if (/makeup|bridal|makeover|mehendi/i.test(name)) {
    return 'Bridal Makeup Studio & Artist';
  }
  if (/barber|haircut|men salon|shave/i.test(name)) {
    return 'Hair Studio & Men Barber Shop';
  }
  if (/skin|derma|laser|aesthetic|cosmeto/i.test(name)) {
    return 'Skin, Dermatology & Laser Clinic';
  }
  if (/tattoo|ink|piercing/i.test(name)) {
    return 'Tattoo & Piercing Studio';
  }
  if (/salon|spa|beauty|hair|glow|luxe|nail|parlour/i.test(name)) {
    return 'Beauty, Salon & Spa';
  }
  if (/gym|fitness|crossfit|iron|muscle|workout|training|bodybuilding/i.test(name)) {
    return 'Fitness & Gym';
  }
  if (/yoga|meditation|pilates/i.test(name)) {
    return 'Yoga & Meditation Studio';
  }
  if (/turf|sports|badminton|cricket|swim|tennis/i.test(name)) {
    return 'Sports Academy & Turf';
  }
  if (/martial|karate|boxing|taekwondo|mma/i.test(name)) {
    return 'Martial Arts & Boxing Club';
  }
  if (/software|app dev|code|it solution|saas|cloud/i.test(name)) {
    return 'Software & App Development';
  }
  if (/digital|agency|seo|marketing|web design|media|social media/i.test(name)) {
    return 'IT & Digital Marketing';
  }
  if (/graphic|video|animation|branding|editing|photoshop/i.test(name)) {
    return 'Graphic Design & Video Production';
  }
  if (/computer|laptop|macbook|pc repair/i.test(name)) {
    return 'Computer & Laptop Repair Service';
  }
  if (/car wash|detailing|ceramic|teflon|ppf|dry wash/i.test(name)) {
    return 'Car Detailing & Washing Center';
  }
  if (/tyre|tire|wheel|battery|alignment/i.test(name)) {
    return 'Tyres, Battery & Wheel Care';
  }
  if (/packers|movers|logistics|relocation|transport/i.test(name)) {
    return 'Packers & Movers Logistics';
  }
  if (/taxi|cab|car rental|self drive/i.test(name)) {
    return 'Car Rental, Taxi & Cab Service';
  }
  if (/motor|auto|car garage|car repair|bike repair|service center|mechanic/i.test(name)) {
    return 'Automobile Repair & Service';
  }
  if (/realty|estate|properties|builder|homes|villa|flat|developer|plots/i.test(name)) {
    return 'Real Estate & Property';
  }
  if (/interior|decor|modular kitchen|plywood|furnish/i.test(name)) {
    return 'Home Decor & Interior Design';
  }
  if (/construction|builder|contractor|civil engineer/i.test(name)) {
    return 'Building Contractor & Construction';
  }
  if (/architect|architecture|blueprint/i.test(name)) {
    return 'Architecture & Civil Engineering';
  }
  if (/advocate|law|legal|solicitor|court|vakil/i.test(name)) {
    return 'Advocate & Law Firm';
  }
  if (/\bca\b|chartered|tax|gst|audit|accountant|accounting/i.test(name)) {
    return 'Chartered Accountant (CA) & Tax Filing';
  }
  if (/loan|finance|insurance|mutual fund|wealth|investment/i.test(name)) {
    return 'Loans, Insurance & Investment Advisory';
  }
  if (/hr|recruitment|placement|staffing|job/i.test(name)) {
    return 'HR & Placement Consultancy';
  }
  if (/coaching|iit|jee|neet|upsc|ssc|classes|tuition|vidyapeeth/i.test(name)) {
    return 'Competitive Exams & IIT/NEET Academy';
  }
  if (/school|college|university|vidyalaya|public school/i.test(name)) {
    return 'School, College & University';
  }
  if (/ielts|study abroad|visa|pte|toefl/i.test(name)) {
    return 'IELTS & Foreign Education Study';
  }
  if (/music|dance|guitar|piano|singing|classical/i.test(name)) {
    return 'Music, Dance & Fine Arts Classes';
  }
  if (/preschool|daycare|nursery|kindergarten|kids/i.test(name)) {
    return 'Preschool & Daycare Nursery';
  }
  if (/education|institute|learn|study/i.test(name)) {
    return 'Education & Coaching Institute';
  }
  if (/jewel|jeweller|gold|diamond|ornament|silver/i.test(name)) {
    return 'Jewellery & Gold Showroom';
  }
  if (/cloth|garment|fashion|boutique|wear|saree|suit|dress|textile/i.test(name)) {
    return 'Clothing, Fashion & Boutique';
  }
  if (/mobile|phone|electronics|laptop|gadget|croma/i.test(name)) {
    return 'Mobile Phone & Electronics Store';
  }
  if (/kirana|grocery|supermarket|mart|general store|provision/i.test(name)) {
    return 'Grocery & Kirana General Store';
  }
  if (/footwear|shoe|shoes|leather/i.test(name)) {
    return 'Footwear & Leather Store';
  }
  if (/book|stationery|gift|toys/i.test(name)) {
    return 'Books, Stationery & Gift Shop';
  }
  if (/retail|store|bazaar/i.test(name)) {
    return 'Retail Store & Supermarket';
  }
  if (/electric|electrical|wiring/i.test(name)) {
    return 'Electrician & Electrical Services';
  }
  if (/plumb|plumbing|sanitary/i.test(name)) {
    return 'Plumbing & Water Solution Services';
  }
  if (/ac repair|air conditioner|appliance|refrigerator|fridge|washing machine/i.test(name)) {
    return 'AC Repair & Appliance Service';
  }
  if (/cleaning|pest control|housekeeping/i.test(name)) {
    return 'Deep Cleaning & Pest Control';
  }
  if (/paint|waterproof|painter/i.test(name)) {
    return 'Painting & Waterproofing Services';
  }
  if (/cctv|security camera|surveillance/i.test(name)) {
    return 'CCTV & Home Security Setup';
  }
  if (/solar|inverter|rooftop/i.test(name)) {
    return 'Solar Rooftop & Inverter Power';
  }
  if (/wedding|event|shaadi|planner/i.test(name)) {
    return 'Wedding Planner & Event Management';
  }
  if (/photo|photographer|photography|studio|shoot/i.test(name)) {
    return 'Photography & Video Shoot Studio';
  }
  if (/banquet|marriage garden|lawn|resort venue/i.test(name)) {
    return 'Banquet Hall & Wedding Garden';
  }
  if (/dj|sound system|orchestra/i.test(name)) {
    return 'DJ & Sound System Setup';
  }
  if (/travel|travels|holiday|trip|tour|yatra/i.test(name)) {
    return 'Travel & Tour Packages Booking';
  }
  if (/astro|astrology|kundali|vastu|jyotish|pandit/i.test(name)) {
    return 'Astrology, Kundali & Vastu Shastra';
  }
  if (/dry clean|laundry|press/i.test(name)) {
    return 'Dry Cleaners & Steam Laundry';
  }
  if (/tailor|tailoring|stitching/i.test(name)) {
    return 'Tailoring, Boutique & Alterations';
  }
  if (/printing|press|flex|banner|signage/i.test(name)) {
    return 'Printing Press & Signage Advertising';
  }
  if (/factory|industry|manufacturing|mill/i.test(name)) {
    return 'Manufacturing & Industrial Factory';
  }

  return null;
};

/**
 * Normalizes or finds the best matching subcategory for a given category
 */
export function getBestSubCategory(category, businessName = '', services = []) {
  const canonicalCat = matchToCanonicalCategory(category) || category;
  const subList = POPULAR_SUB_CATEGORIES[canonicalCat] || POPULAR_SUB_CATEGORIES['default'] || [];
  if (!subList || subList.length === 0) return '';

  const contextText = `${businessName} ${Array.isArray(services) ? services.join(' ') : ''}`.toLowerCase();
  if (!contextText.trim()) return subList[0];

  let bestSub = subList[0];
  let highestScore = 0;

  for (const sub of subList) {
    const subWords = sub.toLowerCase().split(/[^a-z0-9]+/g).filter((w) => w.length > 2);
    let score = 0;
    for (const w of subWords) {
      if (contextText.includes(w)) {
        score += 2;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestSub = sub;
    }
  }

  return bestSub;
}

/**
 * Smart automatic classifier with confidence rating and top candidate recommendations
 */
export function detectCategoryWithConfidence(name = '', services = [], city = '') {
  const cleanName = (name || '').trim();
  const directCat = detectCategoryFromName(cleanName);
  const contextStr = `${cleanName} ${Array.isArray(services) ? services.join(' ') : ''}`.toLowerCase();

  const candidates = [];
  if (directCat) {
    candidates.push({ category: directCat, confidence: 0.92 });
  }

  // Scan canonical categories for high relevance keyword matches
  for (const cat of CATEGORIES_LIST) {
    if (candidates.some((c) => c.category === cat)) continue;
    const catWords = cat.toLowerCase().split(/[^a-z0-9]+/g).filter((w) => w.length > 3);
    let matchCount = 0;
    for (const w of catWords) {
      if (contextStr.includes(w)) matchCount++;
    }
    if (matchCount > 0) {
      candidates.push({
        category: cat,
        confidence: Math.min(0.85, 0.45 + matchCount * 0.2)
      });
    }
  }

  // Sort candidates by confidence
  candidates.sort((a, b) => b.confidence - a.confidence);

  const topCategory = candidates[0]?.category || 'Other / Custom Business';
  const confidence = candidates[0]?.confidence || 0.4;
  const subCategory = getBestSubCategory(topCategory, cleanName, services);

  return {
    category: topCategory,
    subCategory,
    confidence,
    isAmbiguous: confidence < 0.70 || candidates.length >= 3 && (candidates[0].confidence - candidates[1]?.confidence < 0.15),
    candidateCategories: candidates.slice(0, 3).map((c) => ({
      category: c.category,
      subCategory: getBestSubCategory(c.category, cleanName, services),
      confidence: c.confidence
    }))
  };
}

