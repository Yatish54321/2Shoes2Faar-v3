import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Mail, Phone, Instagram, Copy, CheckCheck, Send, ExternalLink,
  Sparkles, CheckCircle2, AlertCircle, BookOpen, MapPin,
  Globe, Laptop, Smartphone, MessageSquare
} from 'lucide-react';
import { Supporter } from '../types';
import { SupporterAvatar } from './SupporterAvatar';

export interface FollowUpSupporterModalProps {
  supporter: Supporter | null;
  onClose: () => void;
  onTogglePaymentStatus?: (supporter: Supporter) => void;
  onAdminToast?: (toast: { type: 'success' | 'error' | 'info'; text: string }) => void;
}

type ChannelType = 'email' | 'whatsapp' | 'instagram';
type TemplateType = 'payment_verification' | 'mosaic_welcome' | 'address_confirmation' | 'photo_request' | 'custom';

// Helper function to safely format text for URLs without encoding corruption
function safeUrlEncode(str: string): string {
  if (!str) return '';
  return encodeURIComponent(str.normalize('NFC'));
}

// Clean text to avoid question marks in legacy email clients
function sanitizeForEmail(text: string, stripEmoji: boolean = false): string {
  if (!text) return '';
  let cleaned = text.normalize('NFC');
  if (stripEmoji) {
    // Replace complex unicode emoji flags and symbols with clean textual representations
    cleaned = cleaned
      .replace(/🇮🇳/g, '[India]')
      .replace(/✨/g, '*')
      .replace(/🙏/g, '')
      .replace(/⏳/g, '[Pending]')
      .replace(/✓/g, '[Verified]')
      .replace(/📦/g, '[Courier]')
      .replace(/📷|📸/g, '[Photo]')
      .replace(/🎉/g, '*')
      .replace(/•/g, '-');
  }
  return cleaned;
}

export const FollowUpSupporterModal: React.FC<FollowUpSupporterModalProps> = ({
  supporter,
  onClose,
  onTogglePaymentStatus,
  onAdminToast
}) => {
  if (!supporter) return null;

  const isPaymentVerified = supporter.paymentVerified === true;
  const initialTemplate: TemplateType = !isPaymentVerified ? 'payment_verification' : 'mosaic_welcome';

  const [channel, setChannel] = useState<ChannelType>('email');
  const [template, setTemplate] = useState<TemplateType>(initialTemplate);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [usePlainEncoding, setUsePlainEncoding] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const cleanPhone = (supporter.whatsappNumber || '').replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const cleanInsta = (supporter.instagramHandle || '').replace('@', '').trim();
  const cityState = [supporter.city, supporter.state].filter(Boolean).join(', ') || 'India';
  const fullAddress = (supporter as any).deliveryAddress || supporter.city || '';
  const pinCode = (supporter as any).pinCode || '';

  // Generate templates based on supporter details
  const getTemplateContent = (t: TemplateType, ch: ChannelType, plain: boolean) => {
    const name = supporter.fullName || 'Valued Supporter';
    const num = supporter.supporterNumber || '—';
    const statusText = isPaymentVerified ? 'Payment Verified' : 'Verification In Progress';

    if (t === 'payment_verification') {
      if (ch === 'email') {
        const rawSubject = `Payment Verification for your 2Shoes2Faar Pre-Order (Supporter #${num})`;
        const rawBody = `Hi ${name},

Thank you so much for supporting the 28-week solo journey across India and pre-ordering your copy of 'India - 28 States in 28 Weeks'!

We are currently verifying supporter transactions for the 1,000 Living India Mosaic. Could you please share your UPI Reference / Transaction ID or payment screenshot so we can verify your booking and lock in your supporter slot (#${num})?

Supporter Details:
- Supporter Name: ${name}
- Sequence Slot: #${num}
- Destination: ${cityState}

You can reply directly to this email with your transaction screenshot or reference number.

Warm regards,
Channveer Shankad (Veer)
Author & Solo Traveler, 2Shoes2Faar
https://2shoes2faar.com`;
        return {
          subject: sanitizeForEmail(rawSubject, plain),
          body: sanitizeForEmail(rawBody, plain)
        };
      } else if (ch === 'whatsapp') {
        return {
          subject: '',
          body: `Hi ${name}! This is Veer from 2Shoes2Faar. Thank you for pre-ordering 'India - 28 States in 28 Weeks' (Supporter #${num})! We are currently verifying payment details for the Living India Mosaic. Could you please share your UPI reference number or payment screenshot? Thank you so much!`
        };
      } else {
        return {
          subject: '',
          body: `Hey ${name}! Veer here from 2Shoes2Faar. Thank you for backing 'India - 28 States in 28 Weeks' (Supporter #${num})! Could you share your UPI ref for payment verification so we can finalize your slot? Excited to feature you!`
        };
      }
    }

    if (t === 'mosaic_welcome') {
      if (ch === 'email') {
        const rawSubject = `Your Story is on the Living India Mosaic (Slot #${num}) | 2Shoes2Faar`;
        const rawBody = `Hi ${name},

Congratulations! Your supporter profile has been reserved at Slot #${num} on the Living India Mosaic.

Your slot celebrates the spirit of travel and the 28 Indian states journey. You can explore your tile on the official interactive map here:
https://2shoes2faar.com

Supporter Summary:
- Supporter: ${name} (Slot #${num})
- Origin: ${cityState}
- Payment Status: ${statusText}
- Mosaic Cell: ${supporter.mapCellId || 'Assigned'}

Thank you for being an integral part of this collective canvas!

Warmly,
Channveer Shankad (Veer)
2Shoes2Faar | Solo Odyssey Across India
https://2shoes2faar.com`;
        return {
          subject: sanitizeForEmail(rawSubject, plain),
          body: sanitizeForEmail(rawBody, plain)
        };
      } else if (ch === 'whatsapp') {
        return {
          subject: '',
          body: `Hi ${name}! Your story is now reserved at Slot #${num} on the 1,000 Living India Mosaic for 'India - 28 States in 28 Weeks'! You can view your slot live on the map at https://2shoes2faar.com. Thank you for being a wonderful backer!`
        };
      } else {
        return {
          subject: '',
          body: `Hey ${name}! You're officially at Slot #${num} on the 1,000 Living India Mosaic! Check it out at https://2shoes2faar.com. Thank you so much for joining the journey!`
        };
      }
    }

    if (t === 'address_confirmation') {
      if (ch === 'email') {
        const rawSubject = `Courier Dispatch & Address Confirmation: 'India - 28 States in 28 Weeks'`;
        const rawBody = `Hi ${name},

We are preparing courier dispatch and packaging for your edition of 'India - 28 States in 28 Weeks'.

Please confirm if the following shipping details are accurate:
- Full Name: ${name}
- Delivery Address: ${fullAddress || 'Not provided'}
- City & State: ${cityState}
- PIN Code: ${pinCode || 'Not provided'}
- WhatsApp Contact: ${supporter.whatsappNumber || 'Not provided'}

If any address adjustments or landmark details are needed, simply reply to this email before dispatch.

Best regards,
Channveer Shankad (Veer)
2Shoes2Faar Team`;
        return {
          subject: sanitizeForEmail(rawSubject, plain),
          body: sanitizeForEmail(rawBody, plain)
        };
      } else if (ch === 'whatsapp') {
        return {
          subject: '',
          body: `Hi ${name}! We are preparing courier dispatch for your copy of 'India - 28 States in 28 Weeks'. Please confirm if this delivery address is correct:
${fullAddress}, ${cityState} - ${pinCode} (Phone: ${supporter.whatsappNumber}). Let me know if any updates are needed!`
        };
      } else {
        return {
          subject: '',
          body: `Hey ${name}! Preparing book dispatch for 'India - 28 States in 28 Weeks'! Please confirm your address: ${fullAddress}, ${cityState} - ${pinCode}. Let me know if any updates are needed!`
        };
      }
    }

    if (t === 'photo_request') {
      if (ch === 'email') {
        const rawSubject = `Photo & Travel Quote for your Living India Mosaic Slot (#${num})`;
        const rawBody = `Hi ${name},

To ensure your slot (#${num}) on the Living India Mosaic looks vibrant, could you please reply with:
1. A high-resolution travel picture (portrait or landscape).
2. A short quote or memory (1-2 sentences) about what travel means to you.

We will format and embed it directly into your mosaic tile on https://2shoes2faar.com!

Warm regards,
Channveer Shankad (Veer)
2Shoes2Faar`;
        return {
          subject: sanitizeForEmail(rawSubject, plain),
          body: sanitizeForEmail(rawBody, plain)
        };
      } else if (ch === 'whatsapp') {
        return {
          subject: '',
          body: `Hi ${name}! To make your Living India Mosaic tile (#${num}) look amazing, please share a high-res travel photo and 1-2 lines on what makes you travel. Excited to feature it!`
        };
      } else {
        return {
          subject: '',
          body: `Hey ${name}! Would love to add your travel photo and a quick quote to your Mosaic slot (#${num}) on https://2shoes2faar.com! Please share when you can!`
        };
      }
    }

    // Custom template
    const rawCustomSubject = `Update from 2Shoes2Faar: Supporter #${num}`;
    const rawCustomBody = `Hi ${name},

Hope you are doing well!

[Write your message or share helpful resources here]

Warm regards,
Channveer Shankad (Veer)
2Shoes2Faar | https://2shoes2faar.com`;

    return {
      subject: sanitizeForEmail(rawCustomSubject, plain),
      body: sanitizeForEmail(rawCustomBody, plain)
    };
  };

  // Update content whenever template, channel, or plain toggle changes
  useEffect(() => {
    const data = getTemplateContent(template, channel, usePlainEncoding);
    setSubject(data.subject);
    setMessage(data.body);
  }, [template, channel, supporter, usePlainEncoding]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    if (onAdminToast) {
      onAdminToast({ type: 'success', text: `Copied ${label} to clipboard!` });
    }
    setTimeout(() => setCopiedItem(null), 2500);
  };

  // Copy full package (Recipient + Subject + Body)
  const handleCopyFullEmailPackage = () => {
    const fullPkg = `To: ${supporter.email || ''}\nSubject: ${subject}\n\n${message}`;
    handleCopy(fullPkg, 'Full Email Package');
  };

  // 1. Direct Webmail: Open in Gmail Web Compose (Desktop favorite - bypasses OS app prompts)
  const handleOpenGmail = () => {
    if (!supporter.email) {
      if (onAdminToast) onAdminToast({ type: 'error', text: 'No email address found.' });
      return;
    }
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${safeUrlEncode(supporter.email)}&su=${safeUrlEncode(subject)}&body=${safeUrlEncode(message)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  // 2. Direct Webmail: Open in Outlook Web Compose
  const handleOpenOutlook = () => {
    if (!supporter.email) {
      if (onAdminToast) onAdminToast({ type: 'error', text: 'No email address found.' });
      return;
    }
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${safeUrlEncode(supporter.email)}&subject=${safeUrlEncode(subject)}&body=${safeUrlEncode(message)}`;
    window.open(outlookUrl, '_blank', 'noopener,noreferrer');
  };

  // 3. Native Default App: Mailto (for mobile or configured desktop clients)
  const handleLaunchEmailClient = () => {
    if (!supporter.email) {
      if (onAdminToast) onAdminToast({ type: 'error', text: 'No email address found.' });
      return;
    }
    const mailtoUrl = `mailto:${safeUrlEncode(supporter.email)}?subject=${safeUrlEncode(subject)}&body=${safeUrlEncode(message)}`;
    window.location.href = mailtoUrl;
  };

  const handleOpenWhatsApp = () => {
    if (!formattedPhone) {
      if (onAdminToast) onAdminToast({ type: 'error', text: 'No WhatsApp phone number found.' });
      return;
    }
    const waUrl = `https://wa.me/${formattedPhone}?text=${safeUrlEncode(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenInstagram = () => {
    if (!cleanInsta || ['not yet', 'no', 'none', 'n/a', 'na'].includes(cleanInsta.toLowerCase())) {
      if (onAdminToast) onAdminToast({ type: 'error', text: 'No valid Instagram handle found.' });
      return;
    }
    const instaUrl = `https://instagram.com/${cleanInsta}`;
    window.open(instaUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 max-w-2xl w-full rounded-2xl sm:rounded-3xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xl overflow-hidden my-auto animate-scaleUp flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#FAF8F5] dark:bg-stone-950 border-b border-[#E7E2DA] dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#C2410C]/10 dark:bg-stone-800 border border-[#C2410C]/30 dark:border-stone-700 text-[#C2410C] dark:text-amber-400 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="font-editorial text-base sm:text-lg font-bold text-[#1C1917] dark:text-stone-100 truncate">
                  Supporter Outreach &amp; Follow-Up
                </h3>
                <span className="font-mono text-[10px] sm:text-xs font-bold px-2 py-0.5 bg-[#C2410C]/10 dark:bg-stone-800 text-[#C2410C] dark:text-amber-400 rounded-full border border-[#C2410C]/20 dark:border-stone-700 shrink-0">
                  #{supporter.supporterNumber}
                </span>
              </div>
              <p className="text-[11px] text-[#78716C] dark:text-stone-400 hidden sm:block truncate">
                Direct email (Gmail/Web/App), WhatsApp messaging, and Instagram outreach.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#EAE4D9] dark:hover:bg-stone-800 text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-100 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 bg-white dark:bg-stone-900">
          {/* Supporter Profile Info Card */}
          <div className="bg-[#FAF8F5] dark:bg-stone-800/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#E7E2DA] dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <SupporterAvatar
                photoUrl={supporter.photoUrl}
                name={supporter.fullName}
                supporterNumber={supporter.supporterNumber}
                id={supporter.id}
                size="md"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm text-[#1C1917] dark:text-stone-100 truncate">{supporter.fullName}</span>
                  {supporter.featured ? (
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" />
                      Mosaic
                    </span>
                  ) : (
                    <span className="text-[10px] bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600 font-medium px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                      <BookOpen className="w-2.5 h-2.5" />
                      Book Only
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#78716C] dark:text-stone-400 mt-0.5">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#C2410C] dark:text-amber-400 shrink-0" />
                    {cityState}
                  </span>
                  {supporter.mapCellId && (
                    <span className="font-mono text-[10px] bg-white dark:bg-stone-900 text-[#1C1917] dark:text-stone-200 px-1.5 py-0.2 rounded border border-[#E7E2DA] dark:border-stone-700">
                      {supporter.mapCellId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Payment status badge & toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onTogglePaymentStatus && onTogglePaymentStatus(supporter)}
                title="Click to toggle Payment Verified status"
                className={`w-full sm:w-auto px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  isPaymentVerified
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                    : 'bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800 animate-pulse'
                }`}
              >
                {isPaymentVerified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span>✓ Payment Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                    <span>⏳ Payment Pending</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Copy Contact Bar (Email, WhatsApp, IG) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Email pill */}
            <div className="p-2 sm:p-2.5 bg-white dark:bg-stone-800 rounded-xl border border-[#E7E2DA] dark:border-stone-700 flex items-center justify-between gap-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Mail className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400 shrink-0" />
                <span className="text-xs text-[#1C1917] dark:text-stone-200 font-medium truncate" title={supporter.email || 'No email'}>
                  {supporter.email || 'No email provided'}
                </span>
              </div>
              {supporter.email && (
                <button
                  type="button"
                  onClick={() => handleCopy(supporter.email!, 'Email')}
                  className="p-1 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 rounded text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-100 cursor-pointer shrink-0"
                  title="Copy Email"
                >
                  {copiedItem === 'Email' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* WhatsApp pill */}
            <div className="p-2 sm:p-2.5 bg-white dark:bg-stone-800 rounded-xl border border-[#E7E2DA] dark:border-stone-700 flex items-center justify-between gap-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs text-[#1C1917] dark:text-stone-200 font-mono truncate">
                  {supporter.whatsappNumber || 'No phone'}
                </span>
              </div>
              {supporter.whatsappNumber && (
                <button
                  type="button"
                  onClick={() => handleCopy(supporter.whatsappNumber!, 'Phone')}
                  className="p-1 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 rounded text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-100 cursor-pointer shrink-0"
                  title="Copy WhatsApp Number"
                >
                  {copiedItem === 'Phone' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Instagram pill */}
            <div className="p-2 sm:p-2.5 bg-white dark:bg-stone-800 rounded-xl border border-[#E7E2DA] dark:border-stone-700 flex items-center justify-between gap-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Instagram className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400 shrink-0" />
                <span className="text-xs text-[#1C1917] dark:text-stone-200 truncate font-medium">
                  {supporter.instagramHandle || 'No handle'}
                </span>
              </div>
              {cleanInsta && !['not yet', 'no', 'none', 'n/a', 'na'].includes(cleanInsta.toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => handleCopy(supporter.instagramHandle!, 'Instagram Handle')}
                  className="p-1 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 rounded text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-100 cursor-pointer shrink-0"
                  title="Copy Instagram Handle"
                >
                  {copiedItem === 'Instagram Handle' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          {/* 1. Outreach Channel Switcher */}
          <div className="space-y-1.5">
            <label className="font-bold text-xs text-[#1C1917] dark:text-stone-100 block">
              1. Select Outreach Channel
            </label>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setChannel('email')}
                className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl border text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all ${
                  channel === 'email'
                    ? 'bg-[#1C1917] dark:bg-stone-800 text-white border-[#1C1917] dark:border-stone-600 shadow-sm'
                    : 'bg-[#FAF8F5] dark:bg-stone-800/60 text-[#57534E] dark:text-stone-300 border-[#E7E2DA] dark:border-stone-700 hover:bg-[#EAE4D9] dark:hover:bg-stone-700'
                }`}
              >
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C2410C] dark:text-amber-400 shrink-0" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl border text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all ${
                  channel === 'whatsapp'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                    : 'bg-[#FAF8F5] dark:bg-stone-800/60 text-[#57534E] dark:text-stone-300 border-[#E7E2DA] dark:border-stone-700 hover:bg-[#EAE4D9] dark:hover:bg-stone-700'
                }`}
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('instagram')}
                className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl sm:rounded-2xl border text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer transition-all ${
                  channel === 'instagram'
                    ? 'bg-[#C2410C] text-white border-[#C2410C] shadow-sm'
                    : 'bg-[#FAF8F5] dark:bg-stone-800/60 text-[#57534E] dark:text-stone-300 border-[#E7E2DA] dark:border-stone-700 hover:bg-[#EAE4D9] dark:hover:bg-stone-700'
                }`}
              >
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
                <span>Instagram</span>
              </button>
            </div>
          </div>

          {/* 2. Message Templates */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-[#1C1917] dark:text-stone-100">
                2. Select Message Context
              </label>
              {channel === 'email' && (
                <button
                  type="button"
                  onClick={() => setUsePlainEncoding(!usePlainEncoding)}
                  className="text-[10px] text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-100 flex items-center gap-1 cursor-pointer"
                >
                  <span className={usePlainEncoding ? 'font-bold text-[#C2410C] dark:text-amber-400' : ''}>
                    {usePlainEncoding ? '✓ Clean ASCII Text' : '⚡ Clean Text Format'}
                  </span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'payment_verification', label: 'Payment Verification', highlight: !isPaymentVerified },
                { id: 'mosaic_welcome', label: 'Mosaic Slot Welcome', highlight: isPaymentVerified },
                { id: 'address_confirmation', label: 'Courier Address Check', highlight: false },
                { id: 'photo_request', label: 'Photo & Quote Request', highlight: false },
                { id: 'custom', label: 'Custom Message', highlight: false }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id as TemplateType)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer ${
                    template === t.id
                      ? 'bg-[#C2410C] text-white border-[#C2410C] font-bold shadow-2xs'
                      : t.highlight
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-100'
                      : 'bg-white dark:bg-stone-800 text-[#57534E] dark:text-stone-300 border-[#E7E2DA] dark:border-stone-700 hover:bg-[#FAF8F5] dark:hover:bg-stone-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Subject (for Email) */}
          {channel === 'email' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs text-[#1C1917] dark:text-stone-100">
                  Subject Line
                </label>
                <button
                  type="button"
                  onClick={() => handleCopy(subject, 'Subject')}
                  className="text-[10px] text-[#C2410C] dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Copy Subject
                </button>
              </div>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#D1C7B7] dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-[#C2410C] focus:outline-none text-xs text-[#1C1917] dark:text-stone-100 font-medium"
              />
            </div>
          )}

          {/* Editable Message Content */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-[#1C1917] dark:text-stone-100">
                Message Content (Editable)
              </label>
              <div className="flex items-center gap-2 text-[10px] text-[#78716C] dark:text-stone-400">
                <span>{message.length} chars</span>
              </div>
            </div>
            <textarea
              rows={channel === 'email' ? 7 : 4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-xl sm:rounded-2xl border border-[#D1C7B7] dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-[#C2410C] focus:outline-none text-xs text-[#1C1917] dark:text-stone-100 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Modal Footer / 1-Click Action Hub (Fully Responsive) */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-[#FAF8F5] dark:bg-stone-950 border-t border-[#E7E2DA] dark:border-stone-800 space-y-2.5 shrink-0">
          {/* Email Specific Multi-Option Dispatch Bar */}
          {channel === 'email' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Copy full package */}
                <button
                  type="button"
                  onClick={handleCopyFullEmailPackage}
                  className="px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-100 text-xs font-semibold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  title="Copy recipient email + subject + message in one go"
                >
                  {copiedItem === 'Full Email Package' ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">Copied All!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                      <span className="text-[11px]">Copy All Details</span>
                    </>
                  )}
                </button>

                {/* Default Mail Client fallback */}
                <button
                  type="button"
                  onClick={handleLaunchEmailClient}
                  disabled={!supporter.email}
                  className="px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#57534E] dark:text-stone-300 text-[11px] font-semibold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  title="Open in System Default Mail Application (Apple Mail, Thunderbird, etc.)"
                >
                  <Laptop className="w-3.5 h-3.5 text-[#78716C] dark:text-stone-400" />
                  <span>Mail App (mailto)</span>
                </button>
              </div>

              {/* Primary Webmail Options */}
              <div className="flex items-center gap-1.5">
                {/* 1. Gmail Web - Opens Compose directly in Browser! */}
                <button
                  type="button"
                  onClick={handleOpenGmail}
                  disabled={!supporter.email}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open in Gmail</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </button>

                {/* 2. Outlook Web */}
                <button
                  type="button"
                  onClick={handleOpenOutlook}
                  disabled={!supporter.email}
                  className="px-3 py-2 bg-[#1C1917] dark:bg-stone-800 hover:bg-[#292524] dark:hover:bg-stone-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1 transition-transform active:scale-95 border border-transparent dark:border-stone-700"
                  title="Open compose in Outlook Web"
                >
                  <span>Outlook</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </button>
              </div>
            </div>
          )}

          {/* WhatsApp Specific Action Bar */}
          {channel === 'whatsapp' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleCopy(message, 'WhatsApp Message')}
                className="px-3.5 py-2 bg-white dark:bg-stone-800 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-100 text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {copiedItem === 'WhatsApp Message' ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">Message Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                disabled={!formattedPhone}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Open WhatsApp Chat</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </button>
            </div>
          )}

          {/* Instagram Specific Action Bar */}
          {channel === 'instagram' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleCopy(message, 'Instagram Message')}
                className="px-3.5 py-2 bg-white dark:bg-stone-800 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-100 text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                {copiedItem === 'Instagram Message' ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">DM Text Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                    <span>Copy DM Text</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenInstagram}
                disabled={!cleanInsta || ['not yet', 'no', 'none', 'n/a', 'na'].includes(cleanInsta.toLowerCase())}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <Instagram className="w-4 h-4" />
                <span>Open Instagram Profile</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
