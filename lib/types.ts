// User & Auth Types
export type UserRole = 'tourist' | 'operator' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  preferences?: TouristPreferences
  createdAt: Date
}

export interface TouristPreferences {
  interests: string[]
  budget: 'budget' | 'moderate' | 'luxury'
  groupSize: number
  mobility: 'full' | 'limited'
}

// Experience Types
export type ExperienceCategory = 'cultural' | 'culinary' | 'craft' | 'ritual' | 'community'
export type SubsectionType = 'direct' | 'partner'
export type ExperienceStatus = 'draft' | 'pending-review' | 'published' | 'archived'

export interface Experience {
  id: string
  title: string
  category: ExperienceCategory
  description: string
  shortDescription: string
  image: string
  images: string[]
  price: number
  currency: string
  duration: number // in hours
  groupSize: {
    min: number
    max: number
  }
  location: {
    city: string
    region: string
    coordinates: [number, number]
  }
  operatorId: string
  operator: ExperienceOperator
  rating: number
  reviewCount: number
  authenticity: {
    score: number
    badge: 'verified' | 'emerging' | 'certified'
  }
  availability: AvailabilitySlot[]
  subsections: ExperienceSubsection[]
  highlights: string[]
  inclusionsAndExclusions: {
    includes: string[]
    excludes: string[]
  }
  accessibility: {
    wheelchair: boolean
    hearingLoop: boolean
    visualAid: boolean
    mobilitySupport: boolean
  }
  status: ExperienceStatus
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ExperienceSubsection {
  id: string
  type: SubsectionType
  title: string
  description: string
  platforms: string[] // e.g., ['direct', 'airbnb', 'viator']
  url?: string
  image: string
}

export interface ExperienceOperator {
  id: string
  name: string
  email: string
  phone: string
  bio: string
  avatar: string
  rating: number
  reviewCount: number
  joinDate: Date
  verificationStatus: 'verified' | 'pending' | 'unverified'
  experiences: Experience[]
}

export interface AvailabilitySlot {
  id: string
  date: Date
  startTime: string
  endTime: string
  spotsAvailable: number
  booked: number
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'reviewed'

export interface Booking {
  id: string
  experienceId: string
  experience: Experience
  touristId: string
  operatorId: string
  date: Date
  groupSize: number
  totalPrice: number
  status: BookingStatus
  specialRequests?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type BookingManagementStatus =
  | 'pending'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'

export interface TouristBookingRecord {
  id: string
  experienceId: string
  experienceName: string
  operatorId: string
  operatorName: string
  bookingDate: string
  guests: number
  totalPrice: number
  status: BookingStatus
  bookedAt: string
  dispute?: {
    id: string
    status: DisputeStatus
  } | null
}

export interface OperatorBookingRecord {
  id: string
  experienceId: string
  experienceName: string
  guestName: string
  guestEmail: string
  bookingDate: string
  guests: number
  totalPrice: number
  status: BookingManagementStatus
  notes: string
  bookedAt: string
}

export interface CreateBookingInput {
  experienceId: string
  bookingDate: string
  guests: number
}

export type PaymentStatus = 'paid' | 'refunded' | 'failed'
export type PaymentMethod = 'card' | 'bank-transfer' | 'wallet'

export interface PaymentRecord {
  id: string
  bookingId: string
  experienceId: string
  touristId: string
  operatorId: string
  amount: number
  currency: string
  status: PaymentStatus
  method: PaymentMethod
  provider: 'simulated'
  createdAt: string
  refundedAt?: string
}

export interface TouristPaymentRecord {
  id: string
  bookingId: string
  experienceName: string
  amount: number
  currency: string
  status: PaymentStatus
  method: PaymentMethod
  createdAt: string
}

export interface EmailEventRecord {
  id: string
  recipient: string
  subject: string
  category:
    | 'booking-confirmation'
    | 'booking-cancellation'
    | 'operator-notice'
    | 'dispute-update'
    | 'system'
  status: 'queued' | 'sent'
  createdAt: string
}

export type DisputeStatus = 'open' | 'resolved'

export interface DisputeRecord {
  id: string
  bookingId: string
  touristId: string
  operatorId: string
  reason: string
  status: DisputeStatus
  createdAt: string
  resolutionNotes?: string
  resolvedAt?: string
}

export interface AdminDisputeRecord {
  id: string
  bookingId: string
  experienceName: string
  touristName: string
  operatorName: string
  reason: string
  status: DisputeStatus
  createdAt: string
  resolutionNotes?: string
  resolvedAt?: string
}

export interface ExperienceUpsertInput {
  title: string
  category: ExperienceCategory
  description: string
  shortDescription: string
  image: string
  price: number
  currency: string
  duration: number
  groupSize: {
    min: number
    max: number
  }
  location: {
    city: string
    region: string
    coordinates: [number, number]
  }
  highlights: string[]
  includes: string[]
  excludes: string[]
  status?: ExperienceStatus
}

export interface Review {
  id: string
  bookingId: string
  experienceId: string
  touristId: string
  rating: number
  title: string
  content: string
  highlights: string[]
  wouldRecommend: boolean
  createdAt: Date
}

// Filter Types
export interface ExperienceFilters {
  category?: ExperienceCategory[]
  priceRange?: [number, number]
  duration?: [number, number]
  rating?: number
  accessibility?: keyof Experience['accessibility'][]
  search?: string
  location?: string
}

// Onboarding Types
export interface OnboardingQuizResponse {
  interests: string[]
  budget: 'budget' | 'moderate' | 'luxury'
  groupSize: number
  travelStyle: string
  mobility: 'full' | 'limited'
  previousExperience: boolean
}

export type QuizResponse = OnboardingQuizResponse
