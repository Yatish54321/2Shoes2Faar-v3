import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Upload,
  QrCode,
  ArrowRight,
  BookOpen,
  Copy,
  Check,
  AlertCircle,
  ShieldAlert,
  Image as ImageIcon,
  Loader2,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Supporter, BookOrder } from '../types';
import { SupporterAvatar } from './SupporterAvatar';

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: BookOrder, supporter?: Supporter) => void;
}

const LOCAL_STORAGE_UTRS_KEY = 'veer_preorder_submitted_utrs';
const LOCAL_STORAGE_SESSION_ORDER_KEY = 'veer_preorder_last_session';

export const OrderFormModal: React.FC<OrderFormModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess
}) => {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Anti-fraud / session tracking state
  const [sessionExistingOrder, setSessionExistingOrder] = useState<{
    orderId: string;
    timestamp: string;
    fullName: string;
  } | null>(null);
  const isSubmittingRef = useRef(false);

  // Form states matching pre-order requirements
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pinCode, setPinCode] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [featuredPreference, setFeaturedPreference] = useState(true);
  const [travelComment, setTravelComment] = useState('');
  
  // Real photo upload - no dummy presets
  const [photoUrl, setPhotoUrl] = useState<string>('');
  
  // Payment proof states - both mandatory
  const [paymentRefNumber, setPaymentRefNumber] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [paymentProofUploaded, setPaymentProofUploaded] = useState(false);

  const [confirmedOrder, setConfirmedOrder] = useState<BookOrder | null>(null);

  // Check existing session submissions to prevent accidental duplicates or fraud
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_SESSION_ORDER_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const orderAgeMs = Date.now() - new Date(parsed.timestamp).getTime();
          // Flag if an order was placed within the last 12 hours
          if (orderAgeMs < 12 * 60 * 60 * 1000) {
            setSessionExistingOrder(parsed);
          }
        }
      } catch (e) {
        console.warn('Could not read session order data', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setFormError('Image size exceeds 8MB. Please select a smaller photo.');
        return;
      }
      setFormError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
  };

  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setFormError('Payment screenshot size exceeds 10MB. Please select a smaller screenshot.');
        return;
      }
      setFormError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPaymentProofUrl(event.target.result as string);
          setPaymentProofUploaded(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('2shoes2faar@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // STEP 1 VALIDATION
  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = whatsappNumber.trim();
    const trimmedCity = city.trim();
    const trimmedAddress = deliveryAddress.trim();
    const trimmedPin = pinCode.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedCity || !trimmedAddress || !trimmedPin) {
      setFormError('Please fill out all required contact and book delivery fields (*).');
      return;
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    if (trimmedPhone.replace(/[^0-9]/g, '').length < 8) {
      setFormError('Please enter a valid WhatsApp phone number.');
      return;
    }

    // MANDATORY PHOTO VALIDATION: When featured option is selected, photo upload is REQUIRED
    if (featuredPreference && !photoUrl.trim()) {
      setFormError('Profile photo upload is required to claim your featured spot on the India Mosaic & Book Appendix. Please upload your portrait.');
      return;
    }

    setStep('payment');
  };

  // STEP 2 PAYMENT & FRAUD CHECK VALIDATION
  const handleConfirmPayment = async () => {
    if (isSubmittingRef.current || loading) return;
    setFormError(null);

    const trimmedUtr = paymentRefNumber.trim().toUpperCase();

    // 1. Mandatory UTR validation
    if (!trimmedUtr || trimmedUtr.length < 6) {
      setFormError('Please enter your 12-digit UPI Transaction ID / UTR Number from your payment app.');
      return;
    }

    // 2. Mandatory Screenshot proof validation
    if (!paymentProofUploaded || !paymentProofUrl.trim()) {
      setFormError('Payment screenshot / receipt is mandatory. Please upload the screenshot of your ₹499 payment.');
      return;
    }

    // 3. Local Fraud & Duplicate Prevention Check
    try {
      const storedUtrs: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_UTRS_KEY) || '[]');
      if (storedUtrs.includes(trimmedUtr)) {
        setFormError('This UPI Transaction / UTR Number was already submitted from this browser. If you need help, please contact Veer at support.');
        return;
      }
    } catch (e) {
      console.warn('UTR check parse error', e);
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const result = await api.submitPreOrder({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        whatsappNumber: whatsappNumber.trim(),
        city: city.trim(),
        state,
        pinCode: pinCode.trim(),
        deliveryAddress: deliveryAddress.trim(),
        instagramHandle: instagramHandle.trim() || undefined,
        featuredPreference,
        travelComment: travelComment.trim() || 'Traveling across India reveals the warmth of our shared humanity.',
        photoUrl: photoUrl.trim() || undefined,
        paymentProofUrl: paymentProofUrl.trim(),
        paymentRefNumber: trimmedUtr
      });

      if (!result.success) {
        setFormError(result.message || 'Could not process pre-order. Please check details and try again.');
        return;
      }

      // Record in local anti-fraud storage
      try {
        const storedUtrs: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_UTRS_KEY) || '[]');
        storedUtrs.push(trimmedUtr);
        localStorage.setItem(LOCAL_STORAGE_UTRS_KEY, JSON.stringify(storedUtrs));

        localStorage.setItem(
          LOCAL_STORAGE_SESSION_ORDER_KEY,
          JSON.stringify({
            orderId: result.orderId,
            timestamp: new Date().toISOString(),
            fullName: fullName.trim(),
            email: email.trim()
          })
        );
      } catch (e) {
        console.warn('Could not store local session order flag', e);
      }

      const createdOrder: BookOrder = {
        id: result.orderId || `ord-${Date.now()}`,
        customerName: fullName.trim(),
        email: email.trim().toLowerCase(),
        whatsappNumber: whatsappNumber.trim(),
        city: city.trim(),
        state,
        pinCode: pinCode.trim(),
        deliveryAddress: deliveryAddress.trim(),
        instagramHandle: instagramHandle.trim(),
        featuredPreference,
        travelComment: travelComment.trim(),
        photoUrl: photoUrl.trim(),
        paymentProofUrl: paymentProofUrl.trim(),
        paymentRefNumber: trimmedUtr,
        amount: 499,
        paymentStatus: 'submitted',
        orderStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      setConfirmedOrder(createdOrder);
      setStep('success');

      // Celebration Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log('Confetti trigger', err);
      }

      onOrderSuccess(createdOrder);
    } catch (err: any) {
      console.error('Order error', err);
      setFormError(err?.message || 'Could not complete order. Please check your internet connection and retry.');
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCR', 'Ladakh / J&K'
  ];

  return (
    <div
      id="order-form-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="order-form-modal-container"
        className="bg-[#FAF8F5] dark:bg-stone-900 max-w-2xl w-full max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-3xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xl overflow-hidden relative my-auto animate-scaleUp text-[#1C1917] dark:text-[#FAF8F5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header Bar */}
        <div className="bg-[#1C1917] dark:bg-stone-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#C2410C] flex items-center justify-center text-white font-bold shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-editorial text-lg sm:text-xl font-bold text-stone-100 truncate">
                Pre-Order & Claim Mosaic Spot
              </h3>
              <p className="text-[11px] sm:text-xs text-stone-400 truncate">
                India – 28 States in 28 Weeks • By Channveer Shankad (Veer)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 ml-2 active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Indicators Bar */}
        <div className="bg-[#F2ECE1] dark:bg-stone-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs font-semibold border-b border-[#E7E2DA] dark:border-stone-700 shrink-0">
          <span className={`flex items-center gap-1.5 ${step === 'form' ? 'text-[#C2410C] dark:text-amber-400 font-bold' : 'text-[#78716C] dark:text-stone-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'form' ? 'bg-[#C2410C] text-white' : 'bg-stone-300 dark:bg-stone-700'}`}>1</span>
            <span>Details & Photo</span>
          </span>
          <span className="text-[#A8A29E] dark:text-stone-600">→</span>
          <span className={`flex items-center gap-1.5 ${step === 'payment' ? 'text-[#C2410C] dark:text-amber-400 font-bold' : 'text-[#78716C] dark:text-stone-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'payment' ? 'bg-[#C2410C] text-white' : 'bg-stone-300 dark:bg-stone-700'}`}>2</span>
            <span>Payment & Proof (₹499)</span>
          </span>
          <span className="text-[#A8A29E] dark:text-stone-600">→</span>
          <span className={`flex items-center gap-1.5 ${step === 'success' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[#78716C] dark:text-stone-400'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'success' ? 'bg-emerald-600 text-white' : 'bg-stone-300 dark:bg-stone-700'}`}>3</span>
            <span>Confirmed</span>
          </span>
        </div>

        {/* Previous Session Order Notice */}
        {sessionExistingOrder && step === 'form' && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Active pre-order found in this session ({sessionExistingOrder.orderId}) for {sessionExistingOrder.fullName}.</span>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                If you are ordering an additional copy or dispatching to another address, please ensure you complete a separate payment and provide the corresponding new UPI UTR.
              </p>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {formError && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 animate-fadeIn shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{formError}</div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Modal Body Container */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
          {/* STEP 1: FORM INPUTS */}
          {step === 'form' && (
            <form id="order-form-step1" onSubmit={handleSubmitDetails} className="space-y-4">
              {/* Featured Mosaic Opt-in banner */}
              <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#243328]/10 to-[#C2410C]/10 dark:from-stone-800 dark:to-stone-800 rounded-2xl border border-[#C2410C]/20 dark:border-stone-700 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="featured-opt-in"
                  checked={featuredPreference}
                  onChange={(e) => {
                    setFeaturedPreference(e.target.checked);
                    setFormError(null);
                  }}
                  className="mt-1 w-4 h-4 text-[#C2410C] rounded focus:ring-[#C2410C] cursor-pointer shrink-0"
                />
                <label htmlFor="featured-opt-in" className="text-xs text-[#1C1917] dark:text-stone-200 cursor-pointer space-y-0.5">
                  <strong className="block text-xs sm:text-sm font-bold text-[#C2410C] dark:text-amber-400">
                    Feature me on the Living India Mosaic & Book Appendix!
                  </strong>
                  <span className="block text-[11px] sm:text-xs text-stone-600 dark:text-stone-400">
                    Your travel portrait, city, and quote will be assigned a permanent slot in the first 1,000 supporters and printed in the book's tribute chapter.
                  </span>
                </label>
              </div>

              {/* Photo & Live Preview Section */}
              <div className="p-3.5 sm:p-4 bg-white dark:bg-stone-800/90 rounded-2xl border border-[#E7E2DA] dark:border-stone-700 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1C1917] dark:text-stone-100 flex items-center gap-1.5">
                    <span>Your Travel Portrait / Profile Photo</span>
                    {featuredPreference ? (
                      <span className="text-[11px] font-bold text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-amber-400/10 px-2 py-0.5 rounded-md">
                        * Required for Featured Spot
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                        (Optional)
                      </span>
                    )}
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Photo Display / Default Name Avatar Fallback */}
                  {photoUrl ? (
                    <div className="relative group shrink-0">
                      <img
                        src={photoUrl}
                        alt="Preview"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#C2410C] shadow-xs"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    </div>
                  ) : (
                    <div className="shrink-0 flex flex-col items-center">
                      <SupporterAvatar
                        name={fullName || 'Your Name'}
                        size="lg"
                        className="rounded-2xl shadow-xs"
                      />
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                        Default Avatar
                      </span>
                    </div>
                  )}

                  {/* Upload Actions & Guidance */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <label className="px-3.5 py-2 bg-[#EAE4D9] dark:bg-stone-700 hover:bg-[#DDD5C7] dark:hover:bg-stone-600 text-[#1C1917] dark:text-stone-100 text-xs font-semibold rounded-xl cursor-pointer inline-flex items-center gap-1.5 transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                      <span>{photoUrl ? 'Change Portrait Photo' : 'Upload Portrait Photo'}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>

                    <p className="text-[11px] text-[#78716C] dark:text-stone-400 leading-tight">
                      {featuredPreference ? (
                        <span className="text-[#C2410C] dark:text-amber-400 font-medium">
                          Upload your best travel photo. If skipped, the form cannot proceed in featured mode.
                        </span>
                      ) : (
                        <span>
                          If no custom photo is uploaded, your card will automatically display your stylish initial avatar.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Name & Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#57534E] dark:text-stone-300 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#57534E] dark:text-stone-300 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="aarav@gmail.com"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#57534E] dark:text-stone-300 block mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => {
                      setWhatsappNumber(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#57534E] dark:text-stone-300 block mb-1">
                    Instagram Handle (Optional)
                  </label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@aarav_travels"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
                  />
                </div>
              </div>

              {/* City, State, PIN Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#57534E] dark:text-stone-300 block mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="e.g. Pune"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#57534E] dark:text-stone-300 block mb-1">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
                  >
                    {indianStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#57534E] dark:text-stone-300 block mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={pinCode}
                    onChange={(e) => {
                      setPinCode(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="411004"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="text-xs font-semibold text-[#57534E] dark:text-stone-300 block mb-1">
                  Complete Delivery Address for Book Dispatch *
                </label>
                <textarea
                  rows={2}
                  required
                  value={deliveryAddress}
                  onChange={(e) => {
                    setDeliveryAddress(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="House/Flat number, Street, Landmark, Area..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none resize-none"
                />
              </div>

              {/* Travel Quote */}
              {featuredPreference && (
                <div>
                  <label className="text-xs font-semibold text-[#57534E] dark:text-stone-300 block mb-1">
                    What makes you travel? (Your Quote for the Map & Book)
                  </label>
                  <textarea
                    rows={2}
                    value={travelComment}
                    onChange={(e) => setTravelComment(e.target.value)}
                    placeholder="e.g. Exploring India one state at a time with Veer..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none resize-none"
                  />
                </div>
              )}
            </form>
          )}

          {/* STEP 2: UPI PAYMENT & STRICT PROOF COLLECTION */}
          {step === 'payment' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center p-4 bg-white dark:bg-stone-800/90 rounded-2xl border border-[#E7E2DA] dark:border-stone-700 shadow-xs">
                {/* Official UPI Payment QR Code Image */}
                <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-white p-2.5 rounded-2xl border-2 border-[#C2410C]/30 shadow-md flex flex-col items-center justify-center relative overflow-hidden group">
                  <img
                    src="/assets/payment-qr.jpg"
                    alt="UPI Payment QR Code - 2shoes2faar@upi"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      // Graceful fallback if image fails to load
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.qr-icon-fallback');
                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                    }}
                  />
                  <div className="qr-icon-fallback hidden flex-col items-center justify-center text-stone-700">
                    <QrCode className="w-28 h-28 sm:w-32 sm:h-32 text-stone-900" />
                    <span className="text-[10px] font-bold text-[#C2410C] mt-1">2shoes2faar@upi</span>
                  </div>
                  <div className="absolute bottom-1.5 bg-black/85 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs pointer-events-none">
                    Scan to Pay ₹499
                  </div>
                </div>

                {/* Copyable UPI ID */}
                <div className="mt-3.5 flex items-center justify-center gap-2">
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">UPI ID:</span>
                  <code className="text-xs font-bold bg-[#EAE4D9] dark:bg-stone-700 px-2.5 py-1 rounded-lg text-[#1C1917] dark:text-stone-100 font-mono">
                    2shoes2faar@upi
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-1.5 text-xs text-stone-600 dark:text-stone-300 hover:text-[#C2410C] bg-stone-100 dark:bg-stone-700 rounded-lg transition-colors cursor-pointer"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="text-base font-bold text-[#1C1917] dark:text-stone-100 mt-2">
                  Amount: <span className="text-[#C2410C] dark:text-amber-400 font-black">₹499</span>{' '}
                  <span className="text-xs font-normal text-stone-400 line-through">₹799</span>
                </div>

                <div className="mt-2 text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Direct Pre-Order Payment • Verified by Veer Shankad</span>
                </div>
              </div>

              {/* Mandatory Transaction ID & Mandatory Proof Upload */}
              <div className="p-3.5 sm:p-4 bg-white dark:bg-stone-800/90 rounded-2xl border border-[#E7E2DA] dark:border-stone-700 space-y-3.5 shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#1C1917] dark:text-stone-100">
                      1. UPI Transaction ID / UTR Number *
                    </label>
                    <span className="text-[10px] font-bold text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-amber-400/10 px-2 py-0.5 rounded-md">
                      Mandatory
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={paymentRefNumber}
                    onChange={(e) => {
                      setPaymentRefNumber(e.target.value);
                      setFormError(null);
                    }}
                    placeholder="e.g. 423871928472 (12-digit UTR from payment receipt)"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FAF8F5] dark:bg-stone-900 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 block">
                    You will find the 12-digit UTR in Google Pay, PhonePe, Paytm, or BHIM transaction details.
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#1C1917] dark:text-stone-100">
                      2. Payment Screenshot / Receipt *
                    </label>
                    <span className="text-[10px] font-bold text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-amber-400/10 px-2 py-0.5 rounded-md">
                      Mandatory
                    </span>
                  </div>

                  {paymentProofUploaded && paymentProofUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl">
                      <img
                        src={paymentProofUrl}
                        alt="Receipt Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-emerald-400 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block truncate">
                          ✓ Payment Screenshot Attached
                        </span>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                          Ready for administrative verification
                        </span>
                      </div>
                      <label className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-stone-800 border border-emerald-400 text-emerald-800 dark:text-emerald-200 rounded-lg cursor-pointer hover:bg-emerald-100 dark:hover:bg-stone-700 transition-colors">
                        Change
                        <input type="file" accept="image/*" onChange={handlePaymentProofUpload} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#C2410C]/40 dark:border-amber-500/40 rounded-xl hover:bg-[#FAF8F5] dark:hover:bg-stone-900 cursor-pointer text-xs text-[#78716C] dark:text-stone-400 gap-1.5 transition-colors text-center">
                      <Upload className="w-5 h-5 text-[#C2410C] dark:text-amber-400" />
                      <span className="font-semibold text-[#1C1917] dark:text-stone-200">
                        Upload Screenshot of ₹499 Payment *
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        PNG, JPG, or WEBP up to 10MB
                      </span>
                      <input type="file" accept="image/*" onChange={handlePaymentProofUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & CONFIRMATION */}
          {step === 'success' && confirmedOrder && (
            <div className="text-center space-y-4 py-2 animate-fadeIn">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-300 dark:border-emerald-800 shadow-sm">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <div>
                <h4 className="font-editorial text-xl sm:text-2xl font-bold text-[#1C1917] dark:text-stone-100">
                  Welcome to the Journey, {confirmedOrder.customerName}!
                </h4>
                <p className="text-xs sm:text-sm text-[#57534E] dark:text-stone-300 mt-1 max-w-md mx-auto">
                  Your book pre-order <code className="font-bold text-[#C2410C] dark:text-amber-400">{confirmedOrder.id}</code> with UTR <code className="font-bold text-[#1C1917] dark:text-stone-200">{confirmedOrder.paymentRefNumber}</code> has been securely submitted.
                </p>
              </div>

              <div className="p-3.5 bg-[#EAE4D9]/60 dark:bg-stone-800/80 rounded-2xl text-xs text-[#57534E] dark:text-stone-300 max-w-md mx-auto border border-[#E7E2DA] dark:border-stone-700 text-left space-y-1">
                <p>📦 <strong>Delivery to:</strong> {confirmedOrder.deliveryAddress}, {confirmedOrder.city}, {confirmedOrder.state} ({confirmedOrder.pinCode})</p>
                <p>📱 <strong>WhatsApp Updates:</strong> {confirmedOrder.whatsappNumber}</p>
                <p className="text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                  ✓ Recorded on the Living India Mosaic & Book Appendix
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="bg-[#FAF8F5] dark:bg-stone-900 px-4 sm:px-6 py-3.5 border-t border-[#E7E2DA] dark:border-stone-800 flex items-center justify-between gap-3 shrink-0">
          {step === 'form' && (
            <>
              <div className="text-xs sm:text-sm font-bold text-[#1C1917] dark:text-stone-100">
                Total: <span className="text-[#C2410C] dark:text-amber-400 font-black">₹499</span>{' '}
                <span className="text-[11px] font-normal text-[#78716C] dark:text-stone-400 line-through hidden sm:inline">₹799</span>
              </div>
              <button
                type="submit"
                form="order-form-step1"
                className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'payment' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setFormError(null);
                }}
                disabled={loading}
                className="px-3.5 py-2 text-xs font-semibold text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-50"
              >
                ← Back to Details
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={loading}
                className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ml-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying & Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Payment Proof (₹499)</span>
                  </>
                )}
              </button>
            </>
          )}

          {step === 'success' && (
            <div className="w-full flex items-center justify-center">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs transition-all cursor-pointer"
              >
                Explore Your Spot on the Map
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
