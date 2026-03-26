import { create } from 'zustand'
import { Crop } from 'react-image-crop'

export interface PhotoItem {
  id: string
  file: File
  preview: string
  croppedPreview?: string
  cropData?: Crop
  copies: number
  processed?: boolean
  processedUrl?: string
}

export interface AdvancedSettings {
  width: number
  height: number
  spacing: number
  border: number
  backgroundColor: string
}

export interface UIState {
  isUploading: boolean
  isProcessing: boolean
  isGeneratingPDF: boolean
  showCropper: boolean
  showFeedback: boolean
  showAdvancedOptions: boolean
  processingProgress: number
  error: string | null
}

interface PassportStore {
  // Photos
  photos: PhotoItem[]
  selectedPhotoId: string | null
  
  // Settings
  advancedSettings: AdvancedSettings
  
  // API Key
  removeBgApiKey: string
  
  // UI State
  ui: UIState
  
  // Generated PDF
  generatedPdfUrl: string | null
  
  // Actions - Photos
  addPhotos: (photos: PhotoItem[]) => void
  removePhoto: (id: string) => void
  updatePhoto: (id: string, updates: Partial<PhotoItem>) => void
  setSelectedPhoto: (id: string | null) => void
  clearAllPhotos: () => void
  
  // Actions - Settings
  updateAdvancedSettings: (settings: Partial<AdvancedSettings>) => void
  
  // Actions - API Key
  setRemoveBgApiKey: (key: string) => void
  
  // Actions - UI
  setUIState: (updates: Partial<UIState>) => void
  setError: (error: string | null) => void
  
  // Actions - PDF
  setGeneratedPdfUrl: (url: string | null) => void
  
  // Computed
  getTotalPhotos: () => number
}

const defaultAdvancedSettings: AdvancedSettings = {
  width: 390,
  height: 480,
  spacing: 30,
  border: 2,
  backgroundColor: '#ffffff'
}

const defaultUIState: UIState = {
  isUploading: false,
  isProcessing: false,
  isGeneratingPDF: false,
  showCropper: false,
  showFeedback: false,
  showAdvancedOptions: false,
  processingProgress: 0,
  error: null
}

export const usePassportStore = create<PassportStore>((set, get) => ({
  // Initial State
  photos: [],
  selectedPhotoId: null,
  advancedSettings: defaultAdvancedSettings,
  removeBgApiKey: '',
  ui: defaultUIState,
  generatedPdfUrl: null,
  
  // Photos Actions
  addPhotos: (newPhotos) => set((state) => ({
    photos: [...state.photos, ...newPhotos]
  })),
  
  removePhoto: (id) => set((state) => ({
    photos: state.photos.filter(photo => photo.id !== id),
    selectedPhotoId: state.selectedPhotoId === id ? null : state.selectedPhotoId
  })),
  
  updatePhoto: (id, updates) => set((state) => ({
    photos: state.photos.map(photo => 
      photo.id === id ? { ...photo, ...updates } : photo
    )
  })),
  
  setSelectedPhoto: (id) => set({ selectedPhotoId: id }),
  
  clearAllPhotos: () => set({ 
    photos: [], 
    selectedPhotoId: null,
    generatedPdfUrl: null 
  }),
  
  // Settings Actions
  updateAdvancedSettings: (settings) => set((state) => ({
    advancedSettings: { ...state.advancedSettings, ...settings }
  })),
  
  // API Key Actions
  setRemoveBgApiKey: (key) => set({ removeBgApiKey: key }),
  
  // UI Actions
  setUIState: (updates) => set((state) => ({
    ui: { ...state.ui, ...updates }
  })),
  
  setError: (error) => set((state) => ({
    ui: { ...state.ui, error }
  })),
  
  // PDF Actions
  setGeneratedPdfUrl: (url) => set({ generatedPdfUrl: url }),
  
  // Computed
  getTotalPhotos: () => {
    const { photos } = get()
    return photos.reduce((total, photo) => total + photo.copies, 0)
  }
}))

// Utility function to generate unique IDs
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
