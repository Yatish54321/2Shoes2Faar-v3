import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Send, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react';
import { SiteContent } from '../types';

interface ContactPageProps {
  content: SiteContent['contact'];
}

export const ContactPage: React.FC<ContactPageProps> = ({ content }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Speaking & Keynotes');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

  return (
    <div id="contact-page-root" className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-stone-800 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-[#C2410C]/20 dark:border-stone-700">
          <Mail className="w-3.5 h-3.5" />
          Get in Touch
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#1C1917] dark:text-stone-100">
          Connect with Veer
        </h1>
        <p className="text-sm text-[#57534E] dark:text-stone-300">
          For travel keynotes, college storytelling sessions, brand partnerships, bulk book orders, or general traveler inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info & Google Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 sm:p-8 space-y-6 shadow-xs">
            <h3 className="font-editorial text-xl font-bold text-[#1C1917] dark:text-stone-100">
              Direct Channels
            </h3>

            <div className="space-y-4 text-sm text-[#57534E] dark:text-stone-300">
              <a
                href={`mailto:${content.email}`}
                className="flex items-center gap-3 hover:text-[#C2410C] dark:hover:text-amber-400 transition-colors p-3 rounded-2xl bg-[#FAF8F5] dark:bg-stone-800 border border-[#E7E2DA] dark:border-stone-700"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-900 flex items-center justify-center text-[#C2410C] dark:text-amber-400 shadow-2xs border border-transparent dark:border-stone-700">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#78716C] dark:text-stone-400 block">Email</span>
                  <span className="font-semibold text-xs text-[#1C1917] dark:text-stone-100">{content.email}</span>
                </div>
              </a>

              <a
                href="https://instagram.com/2shoes2faar"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-[#C2410C] dark:hover:text-amber-400 transition-colors p-3 rounded-2xl bg-[#FAF8F5] dark:bg-stone-800 border border-[#E7E2DA] dark:border-stone-700"
              >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-900 flex items-center justify-center text-[#C2410C] dark:text-amber-400 shadow-2xs border border-transparent dark:border-stone-700">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#78716C] dark:text-stone-400 block">Instagram</span>
                  <span className="font-semibold text-xs text-[#1C1917] dark:text-stone-100">@2shoes2faar</span>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-stone-800 border border-[#E7E2DA] dark:border-stone-700">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-900 flex items-center justify-center text-[#C2410C] dark:text-amber-400 shadow-2xs border border-transparent dark:border-stone-700">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#78716C] dark:text-stone-400 block">Based in</span>
                  <span className="font-semibold text-xs text-[#1C1917] dark:text-stone-100">{content.location}</span>
                </div>
              </div>
            </div>

            {/* Google Form Link Card */}
            <div className="pt-4 border-t border-[#E7E2DA] dark:border-stone-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] dark:text-stone-400 block">
                Official Google Form
              </span>
              <a
                href={content.googleFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-[#FAF8F5] dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-2xl flex items-center justify-between hover:border-[#C2410C] dark:hover:border-amber-400 transition-colors group"
              >
                <div>
                  <span className="font-bold text-xs text-[#1C1917] dark:text-stone-100 group-hover:text-[#C2410C] dark:group-hover:text-amber-400 block">
                    Google Form Order & Photo Submission
                  </span>
                  <span className="text-[11px] text-[#78716C] dark:text-stone-400">
                    Submit via Google Forms if you prefer
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 sm:p-10 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 rounded-full mx-auto flex items-center justify-center border border-green-300 dark:border-green-800">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-editorial text-2xl font-bold text-[#1C1917] dark:text-stone-100">
                Thank you for reaching out, {name}!
              </h3>
              <p className="text-sm text-[#57534E] dark:text-stone-300 max-w-md mx-auto">
                Your message has been dispatched to Veer. We will reply to <strong>{email}</strong> within 24-48 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="mt-4 px-6 py-2 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 text-xs font-semibold rounded-full border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 cursor-pointer transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-editorial text-xl font-bold text-[#1C1917] dark:text-stone-100">
                Send a Note
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#57534E] dark:text-stone-300 block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohini Menon"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#57534E] dark:text-stone-300 block mb-1">
                    Your Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rohini@gmail.com"
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#57534E] dark:text-stone-300 block mb-1">
                  Purpose / Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none cursor-pointer"
                >
                  <option value="Speaking & Keynotes">Speaking & College Keynotes</option>
                  <option value="Bulk Book Order">Bulk / Bookstore Distribution</option>
                  <option value="Media & Press">Media, Podcast & Press Inquiries</option>
                  <option value="Traveler Meetup">Traveler Meetup & Chai</option>
                  <option value="Other">Other Inquiry</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#57534E] dark:text-stone-300 block mb-1">
                  Your Message *
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details about your event, question, or thought..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-full shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
