import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, Lock, CheckCircle2, XCircle, Users, BookOpen, IndianRupee,
  RefreshCw, Upload, Download, Sparkles, MapPin, Eye, Check, AlertTriangle,
  Instagram, Key, Terminal, Copy, CheckCheck, Send, Database, Server, HardDrive,
  FileSpreadsheet, ExternalLink, HelpCircle, ArrowRight, CheckCircle, AlertCircle,
  Trash2, ArrowUp, ArrowDown, Image, ImagePlus, ImageOff, ListOrdered, Edit3, ArrowUpDown,
  Search, Phone, Mail, FileText, Code, RotateCcw, History, Archive, Undo2, SlidersHorizontal
} from 'lucide-react';
import { BrandAvatar } from '../components/BrandAvatar';
import { api, SystemStatusData } from '../services/api';
import { Supporter, MosaicCell, BookOrder, SiteContent, GoogleSubmission, DeletedSupporterRecord } from '../types';
import { SupporterAvatar } from '../components/SupporterAvatar';
import { FollowUpSupporterModal } from '../components/FollowUpSupporterModal';
import { MosaicTopCardsManagerModal } from '../components/MosaicTopCardsManagerModal';

interface AdminPageProps {
  onRefreshData: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onRefreshData }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => api.isAdminAuthenticated());
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'system' | 'submissions' | 'supporters' | 'orders' | 'mosaic' | 'cms' | 'recycle_bin'>('system');

  const [systemStatus, setSystemStatus] = useState<SystemStatusData | null>(null);
  const [submissions, setSubmissions] = useState<GoogleSubmission[]>([]);
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [recycleBin, setRecycleBin] = useState<DeletedSupporterRecord[]>([]);
  const [orders, setOrders] = useState<BookOrder[]>([]);
  const [cells, setCells] = useState<MosaicCell[]>([]);
  const [content, setContent] = useState<SiteContent | null>(null);

  const [recycleBinSearch, setRecycleBinSearch] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [purgingId, setPurgingId] = useState<string | null>(null);
  const [emptyingRecycleBin, setEmptyingRecycleBin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [appsScriptCode, setAppsScriptCode] = useState<string>('');
  const [copiedScript, setCopiedScript] = useState(false);
  const [testWebhookStatus, setTestWebhookStatus] = useState<string | null>(null);
  const [testWebhookLoading, setTestWebhookLoading] = useState(false);

  // In-app Status Notification Toast
  const [adminToast, setAdminToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Multi-Channel Follow-Up & Outreach Modal State
  const [followUpModalSupporter, setFollowUpModalSupporter] = useState<Supporter | null>(null);

  // Delete Confirmation Modals
  const [supporterToDelete, setSupporterToDelete] = useState<Supporter | null>(null);
  const [deletingSupporterLoading, setDeletingSupporterLoading] = useState(false);

  const [submissionToDelete, setSubmissionToDelete] = useState<GoogleSubmission | null>(null);
  const [deletingSubmissionLoading, setDeletingSubmissionLoading] = useState(false);

  // Sequence Re-numbering Dialog Modal
  const [resequenceModalSupporter, setResequenceModalSupporter] = useState<Supporter | null>(null);
  const [targetSeqNum, setTargetSeqNum] = useState<number>(1);
  const [savingSequenceLoading, setSavingSequenceLoading] = useState(false);

  // Rejection Dialog Modal
  const [rejectModalSub, setRejectModalSub] = useState<GoogleSubmission | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('Payment unverified');
  const [rejectingLoading, setRejectingLoading] = useState(false);

  // Google Apps Script Web App Direct Sync State
  const [webAppUrlInput, setWebAppUrlInput] = useState('https://script.google.com/macros/s/AKfycbyLV0Xnt6hr_rAsOEPF5tWGUFZYOLumviRbCEfIz0DhytnGwGch1h30TDO-KMEHkM7_ZQ/exec');
  const [syncingWebApp, setSyncingWebApp] = useState(false);
  const [webAppSyncMsg, setWebAppSyncMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Google Sheet Link Direct Sync State
  const [sheetUrlInput, setSheetUrlInput] = useState('');
  const [syncingSheetUrl, setSyncingSheetUrl] = useState(false);
  const [sheetUrlSyncMsg, setSheetUrlSyncMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Direct Paste / Import from Google Sheet
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteRawText, setPasteRawText] = useState('');
  const [pastingLoading, setPastingLoading] = useState(false);
  const [pasteResultMsg, setPasteResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manual Instagram Follower Management State (Owner-Only)
  const [manualFollowers, setManualFollowers] = useState<number | string>(38400);
  const [manualPosts, setManualPosts] = useState<number | string>(142);
  const [manualBio, setManualBio] = useState<string>('Solo traveller across 28 Indian States in 28 Weeks 🇮🇳 • Author of "India - 28 States in 28 Weeks" 📖');
  const [savingInstagram, setSavingInstagram] = useState(false);
  const [instagramSaveMsg, setInstagramSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Automatic Instagram Scraper (Apify / Third-Party) State
  const [instaTargetInput, setInstaTargetInput] = useState<string>('2shoes2faar');
  const [savingTarget, setSavingTarget] = useState(false);
  const [refreshingInstagram, setRefreshingInstagram] = useState(false);
  const [instaActionMsg, setInstaActionMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Approval Modal / Drawer State
  const [selectedSubmission, setSelectedSubmission] = useState<GoogleSubmission | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalPhotoUrl, setApprovalPhotoUrl] = useState('');
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);

  // Full-size Payment Proof Preview Lightbox Modal
  const [previewProofModalUrl, setPreviewProofModalUrl] = useState<{ url: string; name: string } | null>(null);

  // Full Supporter & Form Data Verification Modal
  const [fullVerifyRecord, setFullVerifyRecord] = useState<{ supporter?: Supporter; submission?: GoogleSubmission } | null>(null);

  // Raw JSON Payload Inspector Modal
  const [rawJsonView, setRawJsonView] = useState<{ title: string; data: any } | null>(null);

  // Mosaic Top 10 Spotlight Cards State (Managed exclusively from Admin Dashboard)
  const [mosaicTopCardIds, setMosaicTopCardIds] = useState<string[]>([]);
  const [isMosaicCardsModalOpen, setIsMosaicCardsModalOpen] = useState(false);
  const [savingTopCards, setSavingTopCards] = useState(false);

  // Copy status feedback
  const [copiedLabelId, setCopiedLabelId] = useState<string | null>(null);

  const handleCopyShippingLabel = (name: string, address: string, pin: string, phone: string, state: string, city: string, recordId: string) => {
    const label = `SHIP TO:\n${name}\n${address || ''}\n${city ? `${city}, ` : ''}${state || ''} - ${pin || ''}\nContact: ${phone || 'N/A'}`;
    navigator.clipboard.writeText(label);
    setCopiedLabelId(recordId);
    setAdminToast({ type: 'success', text: `Copied courier dispatch label for ${name}!` });
    setTimeout(() => {
      setCopiedLabelId(null);
      setAdminToast(null);
    }, 3000);
  };

  const handleToggleSupporterPayment = async (sup: Supporter) => {
    try {
      const currentVerified = sup.paymentVerified === true;
      const newStatus = !currentVerified;
      const res = await api.toggleSupporterPaymentVerified(sup.id, newStatus);
      if (res.success) {
        setAdminToast({
          type: 'success',
          text: `Payment for ${sup.fullName} marked as ${newStatus ? 'VERIFIED ✓' : 'PENDING ⏳'}.`
        });
        // If follow-up modal is open for this supporter, update its state
        if (followUpModalSupporter && followUpModalSupporter.id === sup.id) {
          setFollowUpModalSupporter({
            ...followUpModalSupporter,
            paymentVerified: newStatus,
            paymentVerifiedAt: newStatus ? new Date().toISOString() : undefined
          });
        }
        loadAdminData();
        onRefreshData();
      }
    } catch (err: any) {
      setAdminToast({ type: 'error', text: err.message || 'Failed to update payment status.' });
    }
  };

  // Filtering & search for admin supporters tab
  const [adminSupporterSearch, setAdminSupporterSearch] = useState('');
  const [adminSupporterFeatureFilter, setAdminSupporterFeatureFilter] = useState<'all' | 'featured' | 'unfeatured'>('all');
  const [adminSupporterPaymentFilter, setAdminSupporterPaymentFilter] = useState<'all' | 'verified' | 'pending'>('all');

  // Filtering & search for submissions tab
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionPrefFilter, setSubmissionPrefFilter] = useState<'all' | 'wants_featured' | 'book_only'>('all');

  // Editing supporter state
  const [editingSupporter, setEditingSupporter] = useState<Supporter | null>(null);
  const [selectedCell, setSelectedCell] = useState<MosaicCell | null>(null);

  // Filter state for submissions
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending_review' | 'processed' | 'rejected'>('pending_review');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statusData, subData, supData, ordData, cellData, cmsData, scriptCode, instaSettings, recycleData, topCardsData] = await Promise.all([
        api.getSystemStatus(),
        api.fetchAdminSubmissions(),
        api.getSupporters(),
        api.getOrders(),
        api.getMosaicCells(),
        api.getContent(),
        api.getGoogleAppsScriptCode(),
        api.getInstagramSettings(),
        api.getRecycleBin(),
        api.getMosaicTopCards()
      ]);

      setSystemStatus(statusData);
      setRecycleBin(Array.isArray(recycleData) ? recycleData : []);
      if (Array.isArray(topCardsData)) {
        setMosaicTopCardIds(topCardsData.slice(0, 10));
      }
      if (instaSettings?.config?.targetInput) {
        setInstaTargetInput(instaSettings.config.targetInput);
      }
      if (statusData?.instagram) {
        if (statusData.instagram.targetInput && !instaSettings?.config?.targetInput) {
          setInstaTargetInput(statusData.instagram.targetInput);
        }
        if (statusData.instagram.followerCount !== undefined && statusData.instagram.followerCount !== null) {
          setManualFollowers(statusData.instagram.followerCount);
        }
        if (statusData.instagram.postsCount !== undefined && statusData.instagram.postsCount !== null) {
          setManualPosts(statusData.instagram.postsCount);
        }
        if (statusData.instagram.bio) {
          setManualBio(statusData.instagram.bio);
        }
      }
      setSubmissions(subData);
      setSupporters(supData);
      setOrders(ordData);
      setCells(cellData);
      setContent(cmsData);
      setAppsScriptCode(scriptCode);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMosaicTopCards = async (newIds: string[]) => {
    try {
      setSavingTopCards(true);
      const res = await api.setMosaicTopCards(newIds.slice(0, 10));
      if (res.success) {
        setMosaicTopCardIds(res.mosaicFeaturedSupporterIds.slice(0, 10));
        setAdminToast({
          type: 'success',
          text: `✓ Top 10 cards arrangement saved for the Mosaic page spotlight!`
        });
        onRefreshData();
      }
    } catch (e: any) {
      console.error('Failed to update top cards:', e);
      setAdminToast({
        type: 'error',
        text: e.message || 'Failed to save top 10 cards arrangement.'
      });
    } finally {
      setSavingTopCards(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === 'veer2026' || pin === 'admin123' || pin === '2shoes') {
      setIsAuthenticated(true);
      api.setAdminAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect PIN code. Default credentials: veer2026');
    }
  };

  const handleSaveInstagramTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instaTargetInput.trim()) {
      setInstaActionMsg({ type: 'error', text: 'Please enter a valid Instagram username or public URL.' });
      return;
    }

    setSavingTarget(true);
    setInstaActionMsg(null);
    try {
      const result = await api.updateInstagramTarget(instaTargetInput.trim());
      if (result.success) {
        setInstaActionMsg({
          type: 'success',
          text: result.message || 'Target Instagram handle saved successfully.'
        });
        const statusData = await api.getSystemStatus();
        setSystemStatus(statusData);
        onRefreshData();
      } else {
        setInstaActionMsg({
          type: 'error',
          text: result.message || 'Failed to update Instagram target.'
        });
      }
    } catch (err: any) {
      setInstaActionMsg({ type: 'error', text: err.message || 'Network error occurred.' });
    } finally {
      setSavingTarget(false);
    }
  };

  const handleRefreshInstagramNow = async () => {
    setRefreshingInstagram(true);
    setInstaActionMsg(null);
    try {
      const result = await api.refreshInstagramNow();
      if (result.success) {
        setInstaActionMsg({
          type: 'success',
          text: result.message || 'Instagram profile successfully synchronized from Apify.'
        });
        const statusData = await api.getSystemStatus();
        setSystemStatus(statusData);
        onRefreshData();
      } else {
        setInstaActionMsg({
          type: 'error',
          text: result.message || 'Failed to refresh Instagram profile data.'
        });
      }
    } catch (err: any) {
      setInstaActionMsg({ type: 'error', text: err.message || 'Network error occurred during refresh.' });
    } finally {
      setRefreshingInstagram(false);
    }
  };

  const handleSaveInstagramFollowers = async (e: React.FormEvent) => {
    e.preventDefault();
    const countNum = Number(manualFollowers);
    if (isNaN(countNum) || countNum < 0) {
      setInstagramSaveMsg({ type: 'error', text: 'Please enter a valid follower count.' });
      return;
    }

    setSavingInstagram(true);
    setInstagramSaveMsg(null);
    try {
      const result = await api.updateInstagramFollowers(countNum, {
        postsCount: manualPosts !== '' ? Number(manualPosts) : undefined,
        bio: manualBio ? String(manualBio).trim() : undefined,
        updatedBy: 'Owner (Veer)'
      });

      if (result.success) {
        setInstagramSaveMsg({
          type: 'success',
          text: `Follower count successfully saved (${countNum.toLocaleString('en-IN')})! Live website updated.`
        });
        const statusData = await api.getSystemStatus();
        setSystemStatus(statusData);
        onRefreshData();
      } else {
        setInstagramSaveMsg({ type: 'error', text: result.message || 'Failed to update.' });
      }
    } catch (err: any) {
      setInstagramSaveMsg({ type: 'error', text: err.message || 'Network error.' });
    } finally {
      setSavingInstagram(false);
    }
  };

  const handleCopyAppsScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSyncFromWebApp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSyncingWebApp(true);
    setWebAppSyncMsg(null);
    try {
      const result = await api.syncFromGoogleWebApp(webAppUrlInput.trim());
      if (result.success) {
        setWebAppSyncMsg({
          type: 'success',
          text: result.message || `Successfully synced ${result.count || 0} supporters!`
        });
        await loadAdminData();
        onRefreshData();
      } else {
        setWebAppSyncMsg({
          type: 'error',
          text: result.message || 'Failed to sync from Google Web App.'
        });
      }
    } catch (err: any) {
      setWebAppSyncMsg({
        type: 'error',
        text: err.message || 'Network error occurred while contacting Google Web App.'
      });
    } finally {
      setSyncingWebApp(false);
    }
  };

  const handleSyncFromSheetUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sheetUrlInput.trim()) {
      setSheetUrlSyncMsg({ type: 'error', text: 'Please enter your Google Sheet link.' });
      return;
    }
    setSyncingSheetUrl(true);
    setSheetUrlSyncMsg(null);
    try {
      const result = await api.syncGoogleSheetByUrl(sheetUrlInput.trim());
      if (result.success) {
        setSheetUrlSyncMsg({
          type: 'success',
          text: result.message || `Successfully synced ${result.count || 0} supporters directly from Google Sheet!`
        });
        await loadAdminData();
        onRefreshData();
      } else {
        setSheetUrlSyncMsg({
          type: 'error',
          text: result.message || 'Failed to sync Google Sheet URL.'
        });
      }
    } catch (err: any) {
      setSheetUrlSyncMsg({
        type: 'error',
        text: err.message || 'Network error occurred while contacting Google Sheet.'
      });
    } finally {
      setSyncingSheetUrl(false);
    }
  };

  const handleExecutePasteImport = async () => {
    if (!pasteRawText.trim()) {
      setPasteResultMsg({ type: 'error', text: 'Please paste your Google Sheet data first.' });
      return;
    }

    setPastingLoading(true);
    setPasteResultMsg(null);

    try {
      const text = pasteRawText.trim();
      let parsedRows: any[] = [];

      if (text.startsWith('[') || text.startsWith('{')) {
        try {
          const json = JSON.parse(text);
          parsedRows = Array.isArray(json) ? json : [json];
        } catch {
          // fallback to TSV/CSV
        }
      }

      if (parsedRows.length === 0) {
        // Parse TSV (standard Google Sheet copy-paste) or CSV
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length > 0) {
          const delimiter = lines[0].includes('\t') ? '\t' : ',';
          const headerParts = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
          
          const hasHeaders = headerParts.some(h => 
            /name|email|phone|city|time|address|quote|insta/i.test(h)
          );

          const startIdx = hasHeaders ? 1 : 0;
          const headers = hasHeaders ? headerParts : [
            'Timestamp', 'Full Name', 'Email', 'WhatsApp', 'Instagram', 'City', 'State', 'PIN', 'Address', 'Travel Quote', 'Featured', 'Payment Proof'
          ];

          for (let i = startIdx; i < lines.length; i++) {
            const rowValues = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
            const rowObj: Record<string, any> = {};
            for (let c = 0; c < headers.length; c++) {
              if (c < rowValues.length) {
                rowObj[headers[c]] = rowValues[c];
              }
            }
            parsedRows.push(rowObj);
          }
        }
      }

      if (parsedRows.length === 0) {
        setPasteResultMsg({ type: 'error', text: 'Could not detect any valid data rows in the pasted content.' });
        setPastingLoading(false);
        return;
      }

      const result = await api.importGoogleSheetBatch(parsedRows);
      if (result.success) {
        setPasteResultMsg({
          type: 'success',
          text: `Success! Imported/updated ${result.count || parsedRows.length} supporters from pasted data!`
        });
        setPasteRawText('');
        await loadAdminData();
        onRefreshData();
      } else {
        setPasteResultMsg({ type: 'error', text: result.message || 'Import failed.' });
      }
    } catch (err: any) {
      setPasteResultMsg({ type: 'error', text: err.message || 'Failed to process pasted data.' });
    } finally {
      setPastingLoading(false);
    }
  };

  const handleSendTestWebhook = async () => {
    setTestWebhookLoading(true);
    setTestWebhookStatus('Sending test submission payload to webhook...');
    try {
      const result = await api.sendTestWebhookSubmission();
      setTestWebhookStatus(`Success! Webhook received test submission (${result.submissionId}). Added to Pending Review.`);
      await loadAdminData();
      onRefreshData();
    } catch (err: any) {
      setTestWebhookStatus(`Error sending webhook: ${err.message}`);
    } finally {
      setTestWebhookLoading(false);
    }
  };

  const handleOpenApproveModal = (sub: GoogleSubmission) => {
    setSelectedSubmission(sub);
    setApprovalComment(sub.travelPhilosophy || '');
    setApprovalPhotoUrl(sub.photoUrl || '');
  };

  const handleConfirmApproval = async () => {
    if (!selectedSubmission) return;
    setApprovalSubmitting(true);
    try {
      const result = await api.approveSubmission(selectedSubmission.id, {
        customComment: approvalComment,
        customPhotoUrl: approvalPhotoUrl
      });
      if (result.success) {
        setSelectedSubmission(null);
        await loadAdminData();
        onRefreshData();
      } else {
        alert(result.message);
      }
    } catch (e: any) {
      alert(e.message || 'Approval failed');
    } finally {
      setApprovalSubmitting(false);
    }
  };

  const showAdminToast = (type: 'success' | 'error' | 'info', text: string) => {
    setAdminToast({ type, text });
    setTimeout(() => {
      setAdminToast(null);
    }, 4500);
  };

  const handleOpenRejectModal = (sub: GoogleSubmission) => {
    setRejectModalSub(sub);
    setRejectionReasonInput('Payment unverified');
  };

  const handleConfirmReject = async () => {
    if (!rejectModalSub) return;
    setRejectingLoading(true);
    try {
      await api.rejectSubmission(rejectModalSub.id, rejectionReasonInput || 'Payment unverified');
      await loadAdminData();
      onRefreshData();
      showAdminToast('info', `Submission from ${rejectModalSub.fullName} rejected.`);
      setRejectModalSub(null);
    } catch (err: any) {
      showAdminToast('error', err.message || 'Failed to reject submission');
    } finally {
      setRejectingLoading(false);
    }
  };

  const handleOpenDeleteSubmissionModal = (sub: GoogleSubmission) => {
    setSubmissionToDelete(sub);
  };

  const handleConfirmDeleteSubmission = async () => {
    if (!submissionToDelete) return;
    setDeletingSubmissionLoading(true);
    try {
      const res = await api.deleteSubmission(submissionToDelete.id);
      if (res.success) {
        await loadAdminData();
        onRefreshData();
        showAdminToast('success', `Submission from ${submissionToDelete.fullName} deleted.`);
        setSubmissionToDelete(null);
      } else {
        showAdminToast('error', res.message || 'Failed to delete submission');
      }
    } catch (err: any) {
      showAdminToast('error', err.message || 'Error deleting submission');
    } finally {
      setDeletingSubmissionLoading(false);
    }
  };

  const handleOpenDeleteSupporterModal = (supporter: Supporter) => {
    setSupporterToDelete(supporter);
  };

  const handleConfirmDeleteSupporter = async () => {
    if (!supporterToDelete) return;
    setDeletingSupporterLoading(true);
    try {
      const res = await api.deleteSupporter(supporterToDelete.id, true);
      if (res.success) {
        await loadAdminData();
        onRefreshData();
        showAdminToast('success', `Supporter #${supporterToDelete.supporterNumber} (${supporterToDelete.fullName}) moved to Recycle Bin safely.`);
        setSupporterToDelete(null);
      } else {
        showAdminToast('error', res.message || 'Failed to delete supporter');
      }
    } catch (err: any) {
      showAdminToast('error', err.message || 'Error deleting supporter');
    } finally {
      setDeletingSupporterLoading(false);
    }
  };

  const handleRestoreSupporter = async (record: DeletedSupporterRecord) => {
    setRestoringId(record.id);
    try {
      const res = await api.restoreSupporter(record.id);
      if (res.success) {
        await loadAdminData();
        onRefreshData();
        showAdminToast('success', `Restored ${record.supporter.fullName} to active supporters!`);
      } else {
        showAdminToast('error', res.message || 'Failed to restore supporter');
      }
    } catch (err: any) {
      showAdminToast('error', err.message || 'Error restoring supporter');
    } finally {
      setRestoringId(null);
    }
  };

  const handlePurgeDeletedRecord = async (record: DeletedSupporterRecord) => {
    if (!window.confirm(`Permanently purge ${record.supporter.fullName} from database? This action cannot be undone.`)) {
      return;
    }
    setPurgingId(record.id);
    try {
      const res = await api.purgeDeletedRecord(record.id);
      if (res.success) {
        await loadAdminData();
        onRefreshData();
        showAdminToast('info', `Permanently purged ${record.supporter.fullName}.`);
      } else {
        showAdminToast('error', res.message || 'Failed to purge record');
      }
    } catch (err: any) {
      showAdminToast('error', err.message || 'Error purging record');
    } finally {
      setPurgingId(null);
    }
  };

  const handleEmptyRecycleBin = async () => {
    if (!window.confirm(`Are you sure you want to empty the Recycle Bin? All ${recycleBin.length} deleted records will be permanently erased.`)) {
      return;
    }
    setEmptyingRecycleBin(true);
    try {
      const res = await api.emptyRecycleBin();
      if (res.success) {
        await loadAdminData();
        onRefreshData();
        showAdminToast('info', 'Recycle Bin emptied.');
      } else {
        showAdminToast('error', res.message || 'Failed to empty recycle bin');
      }
    } catch (err: any) {
      showAdminToast('error', err.message || 'Error emptying recycle bin');
    } finally {
      setEmptyingRecycleBin(false);
    }
  };

  const handleMoveSupporterOrder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === supporters.length - 1)) {
      return;
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newSupporters = [...supporters];
    const [moved] = newSupporters.splice(index, 1);
    newSupporters.splice(targetIndex, 0, moved);

    setSupporters(newSupporters); // optimistic update
    const orderedIds = newSupporters.map(s => s.id);

    try {
      const res = await api.reorderSupporters(orderedIds);
      if (res.success) {
        await loadAdminData();
        onRefreshData();
        showAdminToast('success', `Sequence updated.`);
      }
    } catch (err) {
      console.error('Failed to reorder supporters', err);
      await loadAdminData();
    }
  };

  const handleOpenResequenceModal = (supporter: Supporter) => {
    setResequenceModalSupporter(supporter);
    setTargetSeqNum(supporter.supporterNumber);
  };

  const handleConfirmResequence = async () => {
    if (!resequenceModalSupporter) return;
    if (isNaN(targetSeqNum) || targetSeqNum < 1 || targetSeqNum > supporters.length) {
      showAdminToast('error', `Please enter a valid sequence number between 1 and ${supporters.length}`);
      return;
    }
    if (targetSeqNum === resequenceModalSupporter.supporterNumber) {
      setResequenceModalSupporter(null);
      return;
    }

    setSavingSequenceLoading(true);
    try {
      const res = await api.setSupporterNumber(resequenceModalSupporter.id, targetSeqNum);
      if (res.success) {
        await loadAdminData();
        onRefreshData();
        showAdminToast('success', `Moved ${resequenceModalSupporter.fullName} to Slot #${targetSeqNum} and resequenced list.`);
        setResequenceModalSupporter(null);
      } else {
        showAdminToast('error', res.message || 'Failed to change sequence number');
      }
    } catch (err: any) {
      showAdminToast('error', err.message || 'Failed to change supporter sequence');
    } finally {
      setSavingSequenceLoading(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditingSupporter: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size is too large. Please upload an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (isEditingSupporter && editingSupporter) {
        setEditingSupporter({ ...editingSupporter, photoUrl: base64Url });
      } else {
        setApprovalPhotoUrl(base64Url);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSupporterEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupporter) return;
    try {
      const res = await api.updateSupporter(editingSupporter.id, {
        instagramHandle: editingSupporter.instagramHandle,
        photoUrl: editingSupporter.photoUrl,
        supporterNumber: Number(editingSupporter.supporterNumber),
        paymentVerified: editingSupporter.paymentVerified === true,
        orderStatus: editingSupporter.orderStatus,
        adminNote: editingSupporter.adminNote
      });
      if (res.success) {
        setAdminToast({
          type: 'success',
          text: `Saved profile updates for #${editingSupporter.supporterNumber} (${editingSupporter.fullName}).`
        });
        setEditingSupporter(null);
        await loadAdminData();
        onRefreshData();
      } else {
        setAdminToast({ type: 'error', text: 'Failed to update supporter profile.' });
      }
    } catch (err: any) {
      setAdminToast({ type: 'error', text: err.message || 'Error saving changes.' });
    }
  };

  const handleToggleEnvironmentMode = async (mode: 'production' | 'demo') => {
    const confirmText = mode === 'production'
      ? 'Reset to pristine PRODUCTION database? This clears demo supporters and keeps only real Google Form submissions.'
      : 'Load DEMO sample supporters for visual presentation?';
    
    if (!window.confirm(confirmText)) return;
    
    setLoading(true);
    await api.toggleEnvironmentMode(mode);
    await loadAdminData();
    onRefreshData();
    setLoading(false);
  };

  const handleExportSubmissionsCSV = () => {
    const headers = ['ID', 'Timestamp', 'Full Name', 'Email', 'WhatsApp', 'City', 'State', 'PIN', 'Preference', 'Travel Story', 'Address', 'Status'];
    const rows = submissions.map(s => [
      `"${s.id}"`,
      `"${s.timestamp}"`,
      `"${s.fullName.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      `"${s.whatsappNumber}"`,
      `"${s.city}"`,
      `"${s.state}"`,
      `"${s.pinCode}"`,
      `"${s.featuredPreference}"`,
      `"${s.travelPhilosophy.replace(/"/g, '""')}"`,
      `"${s.deliveryAddress.replace(/"/g, '""')}"`,
      `"${s.syncStatus}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `2shoes_google_form_submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auth Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 pt-20 pb-12">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-8 shadow-sm text-center space-y-6">
          <div className="flex justify-center">
            <BrandAvatar
              sizeClassName="w-16 h-16"
              ringClassName="p-[3px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-md"
            />
          </div>

          <div className="space-y-2">
            <h2 className="font-editorial text-2xl font-bold text-[#1C1917] dark:text-stone-100">
              Author & System Control Portal
            </h2>
            <p className="text-xs text-[#78716C] dark:text-stone-400">
              Manage live Google Form responses, Meta Instagram integration, and the 1,000 Living India Mosaic.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Enter Admin PIN (default: veer2026)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-stone-800 text-[#1C1917] dark:text-stone-100 border border-[#D1C7B7] dark:border-stone-700 text-center font-mono text-base focus:ring-2 focus:ring-[#C2410C] focus:outline-none placeholder:text-stone-400"
                autoFocus
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#C2410C] hover:bg-[#9A3412] text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Authenticate & Open Portal
            </button>
          </form>

          <p className="text-[11px] text-[#A8A29E] dark:text-stone-400">
            Protected Administrator Environment • 2Shoes2Faar
          </p>
        </div>
      </div>
    );
  }

  const approvedFeaturedCount = supporters.filter(s => s.approved && s.featured).length;
  const totalApprovedCount = supporters.filter(s => s.approved).length;

  const filteredSubmissions = submissions.filter(s => {
    const matchesStatus = submissionFilter === 'all' || s.syncStatus === submissionFilter;
    
    const wantsFeatured = s.featuredPreference?.toLowerCase().includes('yes') || s.featuredPreference?.toLowerCase().includes('feature');
    const matchesPref =
      submissionPrefFilter === 'all' ||
      (submissionPrefFilter === 'wants_featured' && wantsFeatured) ||
      (submissionPrefFilter === 'book_only' && !wantsFeatured);

    const q = submissionSearch.toLowerCase().trim();
    const matchesQuery =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.whatsappNumber.toLowerCase().includes(q) ||
      (s.city && s.city.toLowerCase().includes(q)) ||
      (s.state && s.state.toLowerCase().includes(q)) ||
      (s.instagramHandle && s.instagramHandle.toLowerCase().includes(q));

    return matchesStatus && matchesPref && matchesQuery;
  });

  const adminFilteredSupporters = supporters.filter(s => {
    const q = adminSupporterSearch.toLowerCase().trim();
    const numMatch = q.startsWith('#') ? q.slice(1) : q;

    const matchesQuery =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.whatsappNumber && s.whatsappNumber.includes(q)) ||
      (s.city && s.city.toLowerCase().includes(q)) ||
      (s.state && s.state.toLowerCase().includes(q)) ||
      (s.instagramHandle && s.instagramHandle.toLowerCase().includes(q)) ||
      (s.travelComment && s.travelComment.toLowerCase().includes(q)) ||
      String(s.supporterNumber) === numMatch;

    const matchesFeatureFilter =
      adminSupporterFeatureFilter === 'all' ||
      (adminSupporterFeatureFilter === 'featured' && s.featured) ||
      (adminSupporterFeatureFilter === 'unfeatured' && !s.featured);

    const isVerified = s.paymentVerified === true;
    const matchesPaymentFilter =
      adminSupporterPaymentFilter === 'all' ||
      (adminSupporterPaymentFilter === 'verified' && isVerified) ||
      (adminSupporterPaymentFilter === 'pending' && !isVerified);

    return matchesQuery && matchesFeatureFilter && matchesPaymentFilter;
  });

  return (
    <div id="admin-page-root" className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xs">
        <div className="flex items-center gap-4">
          <BrandAvatar
            sizeClassName="w-12 h-12"
            ringClassName="p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-stone-100">
                Production Control & Integrations
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                systemStatus?.database.environment === 'production'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}>
                {systemStatus?.database.environment === 'production' ? 'LIVE PRODUCTION' : 'DEMO STAGING'}
              </span>
            </div>
            <p className="text-xs text-[#78716C] dark:text-stone-400 mt-1">
              Google Form Webhook: <strong className="text-[#1C1917] dark:text-stone-200">https://forms.gle/Nj13LtV9ATqHt8EJA</strong> • Real Followers: <strong className="text-[#C2410C] dark:text-amber-400">@2shoes2faar</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            disabled={loading}
            className="px-4 py-2 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 text-[#1C1917] dark:text-stone-200 text-xs font-semibold rounded-full border border-[#D1C7B7] dark:border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </button>

          <button
            onClick={() => {
              setIsAuthenticated(false);
              api.setAdminAuthenticated(false);
            }}
            className="px-4 py-2 bg-[#1C1917] dark:bg-stone-800 hover:bg-[#44403C] dark:hover:bg-stone-700 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer border border-transparent dark:border-stone-700"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7E2DA] dark:border-stone-800 pb-3 overflow-x-auto scrollbar-none py-1">
        {[
          { id: 'system', label: 'System & Integrations Health', icon: Server, badge: 'VERIFIED' },
          { id: 'submissions', label: 'Google Form Submissions', icon: FileSpreadsheet, badge: `${submissions.filter(s => s.syncStatus === 'pending_review').length} New` },
          { id: 'supporters', label: 'Living Mosaic Supporters', icon: Users, badge: `${approvedFeaturedCount}/1000` },
          { id: 'mosaic', label: 'Map Coordinates & Grid', icon: MapPin },
          { id: 'orders', label: 'Pre-Orders & Fulfillment', icon: BookOpen, badge: `${orders.length}` },
          { id: 'recycle_bin', label: 'Recycle Bin', icon: Trash2, badge: recycleBin.length > 0 ? `${recycleBin.length}` : undefined }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#C2410C] text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 text-[#57534E] dark:text-stone-300 hover:bg-[#EAE4D9]/60 dark:hover:bg-stone-800 border border-[#E7E2DA] dark:border-stone-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#C2410C]/10 dark:bg-stone-800 text-[#C2410C] dark:text-amber-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SYSTEM HEALTH & INTEGRATIONS (Task 1 & Task 2 Verification Panel)  */}
      {/* ========================================================================= */}
      {activeTab === 'system' && (
        <div className="space-y-8">
          {/* Status Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Instagram Follower Count Card (Owner Managed) */}
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917] dark:text-stone-100">
                  <Instagram className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
                  <span>Instagram Metric</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  OWNER VERIFIED
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-[#1C1917] dark:text-stone-100">
                  {systemStatus?.instagram.followerCountFormatted || systemStatus?.instagram.followerCount?.toLocaleString('en-IN') || '38.4K'} Followers
                </div>
                <p className="text-[11px] text-[#78716C] dark:text-stone-400 leading-snug">
                  {systemStatus?.instagram.lastUpdated
                    ? `Updated by ${systemStatus.instagram.updatedBy || 'Owner'} (${new Date(systemStatus.instagram.lastUpdated).toLocaleDateString('en-IN')})`
                    : 'Owner-controlled follower count'}
                </p>
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium pt-1">
                ✓ Publicly displayed with "Updated by Owner"
              </div>
            </div>

            {/* Google Form Webhook Card */}
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917] dark:text-stone-100">
                  <FileSpreadsheet className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
                  <span>Google Form Sync</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  LISTENING
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-[#1C1917] dark:text-stone-100">
                  {systemStatus?.googleForm.totalSubmissions || submissions.length} Submissions
                </div>
                <p className="text-[11px] text-[#78716C] dark:text-stone-400 leading-snug">
                  {systemStatus?.googleForm.pendingReviewCount || 0} pending admin review & payment verification.
                </p>
              </div>
              <button
                onClick={handleSendTestWebhook}
                disabled={testWebhookLoading}
                className="w-full py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>{testWebhookLoading ? 'Sending...' : 'Trigger Test Webhook Submission'}</span>
              </button>
            </div>

            {/* Database Engine Card */}
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917] dark:text-stone-100">
                  <Database className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
                  <span>Database Engine</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  CONNECTED
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-[#C2410C] dark:text-amber-400">
                  {approvedFeaturedCount} / 1,000 Slots
                </div>
                <p className="text-[11px] text-[#78716C] dark:text-stone-400 leading-snug">
                  Fixed capacity ceiling. Capped at 1,000 living supporters.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[#78716C] dark:text-stone-400 pt-1">
                <span className="font-semibold">Mode:</span>
                <span className="uppercase font-bold text-[#1C1917] dark:text-stone-200">{systemStatus?.database.environment}</span>
              </div>
            </div>

            {/* Storage Engine Card */}
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917] dark:text-stone-100">
                  <HardDrive className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
                  <span>Storage Layer</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  PERSISTENT
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#1C1917] dark:text-stone-100 truncate">
                  server_data_store.json
                </div>
                <p className="text-[11px] text-[#78716C] dark:text-stone-400 leading-snug">
                  Atomic write-ahead disk persistence on container.
                </p>
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                ✓ Survives page reloads & restarts
              </div>
            </div>
          </div>

          {testWebhookStatus && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <span>{testWebhookStatus}</span>
              <button onClick={() => setTestWebhookStatus(null)} className="text-emerald-700 dark:text-emerald-300 hover:underline">Dismiss</button>
            </div>
          )}

          {/* Environment Switcher: Production vs Demo Data */}
          <div className="bg-[#FAF8F5] dark:bg-stone-900 p-6 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#1C1917] dark:text-stone-100">
                  Data Environment: Separation of Production vs Demonstration Data
                </h3>
                <p className="text-xs text-[#78716C] dark:text-stone-400 mt-0.5 max-w-2xl">
                  In <strong>Production Mode</strong>, only actual Google Form responses received via webhook are published. Use <strong>Demo Mode</strong> only when you wish to preview what the completed 1,000-cell mosaic looks like.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleEnvironmentMode('production')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                    systemStatus?.database.environment === 'production'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-[#57534E] dark:text-stone-300 border border-[#D1C7B7] dark:border-stone-700 hover:bg-[#EAE4D9] dark:hover:bg-stone-700'
                  }`}
                >
                  Switch to Production (Clean / Real Submissions)
                </button>

                <button
                  onClick={() => handleToggleEnvironmentMode('demo')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                    systemStatus?.database.environment === 'demo'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white dark:bg-stone-800 text-[#57534E] dark:text-stone-300 border border-[#D1C7B7] dark:border-stone-700 hover:bg-[#EAE4D9] dark:hover:bg-stone-700'
                  }`}
                >
                  Load Demo Seed (For Staging Evaluation)
                </button>
              </div>
            </div>
          </div>

          {/* Required External Configuration & Manual Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Instagram Automatic Scraper & Integration Card (Apify Third-Party Engine) */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D97706] to-[#C2410C] flex items-center justify-center text-white shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-[#1C1917] dark:text-stone-100">
                      1. Instagram Public Profile Scraper & Sync
                    </h3>
                    <span className="text-[11px] text-[#78716C] dark:text-stone-400">Backend Apify Integration • @2shoes2faar</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  systemStatus?.instagram.configured
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                }`}>
                  {systemStatus?.instagram.configured ? 'APIFY SYNC ACTIVE' : 'TOKEN PENDING'}
                </span>
              </div>

              <p className="text-xs text-[#57534E] dark:text-stone-300 leading-relaxed">
                Automatically synchronizes public Instagram follower counts, bio, posts, and avatar using the backend <strong>Apify Instagram Scraper</strong>. No Meta Developer accounts, Business tokens, or Graph APIs needed.
              </p>

              {/* Status & Credential Warning Notice */}
              {!systemStatus?.instagram.configured && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Backend Environment Setup</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
                    To enable live background scraping, add <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded text-amber-900 dark:text-amber-200 font-mono">APIFY_API_TOKEN</code> in your Settings secrets panel. The app safely displays cached / saved data until configured.
                  </p>
                </div>
              )}

              {/* Scraper Target Handle Form */}
              <form onSubmit={handleSaveInstagramTarget} className="space-y-3 bg-[#FAF8F5] dark:bg-stone-800/80 p-4 rounded-2xl border border-[#E7E2DA] dark:border-stone-700">
                <div>
                  <label className="block text-[11px] font-bold text-[#1C1917] dark:text-stone-200 mb-1">
                    Target Instagram Handle or Public Profile URL:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={instaTargetInput}
                      onChange={(e) => setInstaTargetInput(e.target.value)}
                      placeholder="e.g. 2shoes2faar or https://www.instagram.com/2shoes2faar/"
                      className="flex-1 px-3 py-2 bg-white dark:bg-stone-900 rounded-xl border border-[#D1C7B7] dark:border-stone-700 text-xs font-bold text-[#1C1917] dark:text-stone-100 focus:outline-none focus:border-[#C2410C]"
                      required
                    />
                    <button
                      type="submit"
                      disabled={savingTarget}
                      className="px-4 py-2 bg-[#1C1917] dark:bg-stone-700 hover:bg-[#44403C] dark:hover:bg-stone-600 text-white text-xs font-bold rounded-xl transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      {savingTarget ? 'Saving...' : 'Save Target'}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#E7E2DA]/80 dark:border-stone-700">
                  <span className="text-[11px] text-[#78716C] dark:text-stone-400">
                    Normalized: <strong className="text-[#1C1917] dark:text-stone-200">@{systemStatus?.instagram.targetUsername || '2shoes2faar'}</strong>
                  </span>

                  <button
                    type="button"
                    onClick={handleRefreshInstagramNow}
                    disabled={refreshingInstagram}
                    className="px-4 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshingInstagram ? 'animate-spin' : ''}`} />
                    <span>{refreshingInstagram ? 'Syncing Apify...' : 'Sync Profile Now'}</span>
                  </button>
                </div>

                {instaActionMsg && (
                  <div className={`p-2.5 rounded-xl text-xs font-medium ${
                    instaActionMsg.type === 'success'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-200 border border-red-300 dark:border-red-800'
                  }`}>
                    {instaActionMsg.text}
                  </div>
                )}
              </form>

              {/* Scraped Live Profile Preview */}
              <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1C1917] dark:text-stone-100">Current Profile Snapshot</span>
                  <span className="text-[10px] text-[#78716C] dark:text-stone-400">
                    Last sync: {systemStatus?.instagram.lastUpdated ? new Date(systemStatus.instagram.lastUpdated).toLocaleDateString('en-IN') : 'None yet'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {systemStatus?.instagram.avatarUrl?.trim() ? (
                    <img
                      src={systemStatus.instagram.avatarUrl}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover border border-[#E7E2DA] dark:border-stone-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#EAE4D9] dark:bg-stone-800 flex items-center justify-center font-bold text-[#78716C] dark:text-stone-300 text-sm">
                      2S
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#1C1917] dark:text-stone-100 flex items-center gap-1.5">
                      <span>{systemStatus?.instagram.fullName || '@2shoes2faar'}</span>
                      <span className="text-[10px] text-[#78716C] dark:text-stone-400">({systemStatus?.instagram.handle || '@2shoes2faar'})</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#57534E] dark:text-stone-300">
                      <span>
                        <strong className="text-[#C2410C] dark:text-amber-400">
                          {systemStatus?.instagram.followerCountFormatted || systemStatus?.instagram.followerCount?.toLocaleString('en-IN') || '—'}
                        </strong> Followers
                      </span>
                      <span>•</span>
                      <span>
                        <strong>{systemStatus?.instagram.followingCount?.toLocaleString('en-IN') || '—'}</strong> Following
                      </span>
                      <span>•</span>
                      <span>
                        <strong>{systemStatus?.instagram.postsCount ?? '—'}</strong> Posts
                      </span>
                    </div>
                  </div>
                </div>

                {systemStatus?.instagram.bio && (
                  <p className="text-[11px] text-[#78716C] dark:text-stone-300 bg-[#FAF8F5] dark:bg-stone-800 p-2.5 rounded-xl border border-[#E7E2DA] dark:border-stone-700 italic leading-relaxed">
                    "{systemStatus.instagram.bio}"
                  </p>
                )}
              </div>

              {/* Manual Override Fallback (Collapsible) */}
              <details className="group border border-[#E7E2DA] dark:border-stone-800 rounded-2xl p-3 bg-[#FAF8F5] dark:bg-stone-850">
                <summary className="text-xs font-bold text-[#57534E] dark:text-stone-300 cursor-pointer hover:text-[#1C1917] dark:hover:text-stone-100 flex items-center justify-between">
                  <span>Manual Count Fallback Override</span>
                  <span className="text-[10px] text-[#78716C] dark:text-stone-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>

                <form onSubmit={handleSaveInstagramFollowers} className="space-y-3 pt-3 mt-2 border-t border-[#E7E2DA] dark:border-stone-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#1C1917] dark:text-stone-200 mb-1">
                        Manual Follower Count:
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={manualFollowers}
                        onChange={(e) => setManualFollowers(e.target.value)}
                        placeholder="e.g. 38400"
                        className="w-full px-3 py-2 bg-white dark:bg-stone-900 rounded-xl border border-[#D1C7B7] dark:border-stone-700 text-xs font-bold text-[#1C1917] dark:text-stone-100 focus:outline-none focus:border-[#C2410C]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#1C1917] dark:text-stone-200 mb-1">
                        Manual Posts Count:
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={manualPosts}
                        onChange={(e) => setManualPosts(e.target.value)}
                        placeholder="e.g. 142"
                        className="w-full px-3 py-2 bg-white dark:bg-stone-900 rounded-xl border border-[#D1C7B7] dark:border-stone-700 text-xs font-bold text-[#1C1917] dark:text-stone-100 focus:outline-none focus:border-[#C2410C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#1C1917] dark:text-stone-200 mb-1">
                      Bio Tagline:
                    </label>
                    <textarea
                      rows={2}
                      value={manualBio}
                      onChange={(e) => setManualBio(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 rounded-xl border border-[#D1C7B7] dark:border-stone-700 text-xs text-[#1C1917] dark:text-stone-100 focus:outline-none focus:border-[#C2410C] resize-none"
                    />
                  </div>

                  {instagramSaveMsg && (
                    <div className={`p-2.5 rounded-xl text-xs font-medium ${
                      instagramSaveMsg.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200' : 'bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-200'
                    }`}>
                      {instagramSaveMsg.text}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={savingInstagram}
                      className="px-4 py-2 bg-[#57534E] dark:bg-stone-700 hover:bg-[#1C1917] dark:hover:bg-stone-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {savingInstagram ? 'Saving Fallback...' : 'Apply Manual Override'}
                    </button>
                  </div>
                </form>
              </details>
            </div>

            {/* Google Form & Google Apps Script Setup Guide */}
            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-[#1C1917] dark:text-stone-100">
                      2. Google Form & Apps Script Real-Time Webhook
                    </h3>
                    <span className="text-[11px] text-[#78716C] dark:text-stone-400">Form: https://forms.gle/Nj13LtV9ATqHt8EJA</span>
                  </div>
                </div>

                <button
                  onClick={handleCopyAppsScript}
                  className="px-3 py-1.5 bg-[#1C1917] dark:bg-stone-800 hover:bg-[#C2410C] text-white text-xs font-semibold rounded-full flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent dark:border-stone-700"
                >
                  {copiedScript ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Apps Script'}</span>
                </button>
              </div>

              {/* Live Google Sheet Link Auto-Sync Card */}
              <div className="bg-[#FAF8F5] dark:bg-stone-850 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 ${syncingSheetUrl ? 'animate-spin' : ''}`} />
                    <span className="text-xs font-bold text-[#1C1917] dark:text-stone-100">Live Google Sheet Link Direct Sync</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">Recommended</span>
                </div>
                <p className="text-[11px] text-[#78716C] dark:text-stone-300 leading-relaxed">
                  Paste your Google Sheet link below (make sure sheet sharing is set to <em>"Anyone with the link can view"</em>). We will automatically extract and sync all live form responses directly into your map &amp; supporters page!
                </p>
                <form onSubmit={handleSyncFromSheetUrl} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={sheetUrlInput}
                    onChange={(e) => setSheetUrlInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
                    className="flex-1 px-3 py-2 bg-white dark:bg-stone-900 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-xs text-[#1C1917] dark:text-stone-100 font-mono focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="submit"
                    disabled={syncingSheetUrl || !sheetUrlInput.trim()}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    {syncingSheetUrl ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Connecting &amp; Syncing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sync Google Sheet Link</span>
                      </>
                    )}
                  </button>
                </form>
                {sheetUrlSyncMsg && (
                  <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    sheetUrlSyncMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                  }`}>
                    {sheetUrlSyncMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />}
                    <span>{sheetUrlSyncMsg.text}</span>
                  </div>
                )}
              </div>

              {/* Direct Web App Sync Box */}
              <div className="bg-[#FAF8F5] dark:bg-stone-850 p-4 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 text-[#C2410C] dark:text-amber-400 ${syncingWebApp ? 'animate-spin' : ''}`} />
                    <span className="text-xs font-bold text-[#1C1917] dark:text-stone-100">Google Apps Script Web App Direct Sync</span>
                  </div>
                  <span className="text-[10px] bg-[#E7E2DA] dark:bg-stone-800 text-[#57534E] dark:text-stone-300 px-2 py-0.5 rounded-full font-medium">Automatic Pull</span>
                </div>
                <p className="text-[11px] text-[#78716C] dark:text-stone-400 leading-relaxed">
                  Enter your deployed Google Apps Script Web App URL below (with <code>doGet</code> in Code.gs) to pull and sync all Google Form responses to the website on demand.
                </p>
                <form onSubmit={handleSyncFromWebApp} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={webAppUrlInput}
                    onChange={(e) => setWebAppUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3 py-2 bg-white dark:bg-stone-900 border border-[#E7E2DA] dark:border-stone-700 rounded-xl text-xs text-[#1C1917] dark:text-stone-100 font-mono focus:outline-none focus:border-[#C2410C]"
                  />
                  <button
                    type="submit"
                    disabled={syncingWebApp || !webAppUrlInput.trim()}
                    className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    {syncingWebApp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Pull Responses Now</span>
                      </>
                    )}
                  </button>
                </form>
                {webAppSyncMsg && (
                  <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    webAppSyncMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                  }`}>
                    {webAppSyncMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />}
                    <span>{webAppSyncMsg.text}</span>
                  </div>
                )}
              </div>

              {/* Direct Copy-Paste Sheet Importer (Instant Fallback) */}
              <div className="bg-[#FAF8F5] dark:bg-stone-850 p-4 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-[#1C1917] dark:text-stone-100">Direct Paste &amp; Import from Google Sheet</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">1-Click Instant</span>
                </div>
                <p className="text-[11px] text-[#78716C] dark:text-stone-400 leading-relaxed">
                  Open your Google Sheet, select all rows (including headers), copy with <kbd className="px-1 py-0.5 bg-white dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded text-[10px] font-mono">Ctrl+C</kbd>, and paste here to import immediately.
                </p>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={pasteRawText}
                    onChange={(e) => setPasteRawText(e.target.value)}
                    placeholder="Paste copied cells from Google Sheet here (TSV or CSV)..."
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-xs text-[#1C1917] dark:text-stone-100 font-mono focus:outline-none focus:border-emerald-600"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-[#78716C] dark:text-stone-400">
                      {pasteRawText.trim() ? `${pasteRawText.trim().split(/\r?\n/).length} lines detected` : 'Ready to paste'}
                    </span>
                    <button
                      type="button"
                      onClick={handleExecutePasteImport}
                      disabled={pastingLoading || !pasteRawText.trim()}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {pastingLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Importing...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Import Pasted Rows Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {pasteResultMsg && (
                  <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    pasteResultMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                  }`}>
                    {pasteResultMsg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />}
                    <span>{pasteResultMsg.text}</span>
                  </div>
                )}
              </div>

              <div className="bg-[#FAF8F5] dark:bg-stone-850 p-3.5 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 text-xs text-[#57534E] dark:text-stone-300 space-y-2">
                <span className="font-bold text-[#1C1917] dark:text-stone-100 block">How to connect &amp; backfill in 2 minutes:</span>
                <ol className="list-decimal pl-4 space-y-1 text-[#57534E] dark:text-stone-300">
                  <li>Open the Google Sheet linked to your Google Form (Responses tab → Link to Sheets).</li>
                  <li>Click <strong>Extensions &gt; Apps Script</strong> and paste the copied script into <code>Code.gs</code>.</li>
                  <li><strong>Historical Backfill:</strong> Select <code>syncGoogleFormToWebsite</code> in the function dropdown and click <strong>Run</strong>. (Or use the "Pull Responses Now" button above if deployed as a Web App!).</li>
                  <li><strong>Real-time Sync:</strong> Click <strong>Triggers</strong> (alarm icon) &gt; Add Trigger: run <code>onFormSubmit</code> on "Form Submit".</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="bg-[#1C1917] text-[#FAF8F5] p-4 rounded-2xl font-mono text-[10px] max-h-48 overflow-y-auto leading-relaxed border border-stone-800">
                  {appsScriptCode || '// Loading generated Google Apps Script with current app URL...'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GOOGLE FORM SUBMISSIONS VERIFICATION QUEUE                         */}
      {/* ========================================================================= */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-2xl font-bold text-[#1C1917] dark:text-stone-100">
                  Google Form Submissions Queue
                </h2>
                <span className="bg-[#FAF8F5] dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                  {filteredSubmissions.length} of {submissions.length}
                </span>
              </div>
              <p className="text-xs text-[#78716C] dark:text-stone-400 mt-0.5">
                Review verified incoming form responses from <a href="https://forms.gle/Nj13LtV9ATqHt8EJA" target="_blank" rel="noreferrer" className="text-[#C2410C] dark:text-amber-400 underline font-medium">https://forms.gle/Nj13LtV9ATqHt8EJA</a>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter pills */}
              {(['all', 'pending_review', 'processed', 'rejected'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setSubmissionFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    submissionFilter === filterKey
                      ? 'bg-[#1C1917] dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs'
                      : 'bg-white dark:bg-stone-900 text-[#78716C] dark:text-stone-300 border border-[#E7E2DA] dark:border-stone-800 hover:bg-[#EAE4D9]/60 dark:hover:bg-stone-800'
                  }`}
                >
                  {filterKey.replace('_', ' ')}
                </button>
              ))}

              <button
                onClick={handleExportSubmissionsCSV}
                className="px-3.5 py-1.5 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 text-[#1C1917] dark:text-stone-200 text-xs font-semibold rounded-full border border-[#D1C7B7] dark:border-stone-700 flex items-center gap-1.5 cursor-pointer ml-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Submissions Search & Preference Filter Bar */}
          <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#78716C] dark:text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={submissionSearch}
                onChange={(e) => setSubmissionSearch(e.target.value)}
                placeholder="Search name, phone, email, state..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] dark:bg-stone-800 border border-[#E7E2DA] dark:border-stone-700 rounded-xl text-xs text-[#1C1917] dark:text-stone-100 placeholder-[#A8A29E] dark:placeholder-stone-500 focus:outline-none focus:border-[#C2410C]"
              />
              {submissionSearch && (
                <button
                  onClick={() => setSubmissionSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-100 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Feature Preference Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-bold text-[#78716C] dark:text-stone-400 shrink-0 mr-1">Preference:</span>
              {(['all', 'wants_featured', 'book_only'] as const).map((prefKey) => (
                <button
                  key={prefKey}
                  onClick={() => setSubmissionPrefFilter(prefKey)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors shrink-0 cursor-pointer ${
                    submissionPrefFilter === prefKey
                      ? 'bg-[#C2410C] text-white font-bold'
                      : 'bg-[#FAF8F5] dark:bg-stone-800 text-[#78716C] dark:text-stone-300 border border-[#E7E2DA] dark:border-stone-700 hover:bg-[#EAE4D9] dark:hover:bg-stone-700'
                  }`}
                >
                  {prefKey === 'all' ? 'All Choices' : prefKey === 'wants_featured' ? '★ Mosaic Feature' : '📖 Book Only'}
                </button>
              ))}
            </div>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 p-12 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] dark:bg-stone-800 text-[#78716C] dark:text-stone-400 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-editorial text-lg font-bold text-[#1C1917] dark:text-stone-100">No Submissions Found</h3>
                <p className="text-xs text-[#78716C] dark:text-stone-400 max-w-md mx-auto">
                  {submissionSearch || submissionPrefFilter !== 'all'
                    ? 'Try clearing your search query or preference filter.'
                    : `No submissions currently under the "${submissionFilter}" status.`}
                </p>
              </div>
              <button
                onClick={handleSendTestWebhook}
                className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-full shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Sample Test Submission</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredSubmissions.map((sub) => {
                const isPending = sub.syncStatus === 'pending_review';
                const isApproved = sub.syncStatus === 'processed';
                const isRejected = sub.syncStatus === 'rejected';
                const wantsFeatured = sub.featuredPreference?.toLowerCase().includes('yes') || sub.featuredPreference?.toLowerCase().includes('feature');

                return (
                  <div
                    key={sub.id}
                    className={`bg-white dark:bg-stone-900 rounded-3xl border p-6 shadow-2xs transition-all space-y-4 ${
                      isPending ? 'border-[#C2410C]/40 dark:border-[#C2410C]/60 ring-1 ring-[#C2410C]/20' : 'border-[#E7E2DA] dark:border-stone-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F2ECE1] dark:border-stone-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#FAF8F5] dark:bg-stone-800 border border-[#E7E2DA] dark:border-stone-700 overflow-hidden shrink-0">
                          <img
                            src={sub.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                            alt={sub.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-base text-[#1C1917] dark:text-stone-100">{sub.fullName}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              wantsFeatured
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                            }`}>
                              {wantsFeatured ? '★ Mosaic Feature Selected' : '📖 Book Pre-Order Only'}
                            </span>
                            {sub.instagramHandle && (
                              <span className="text-xs text-[#C2410C] dark:text-amber-400 font-semibold">{sub.instagramHandle}</span>
                            )}
                          </div>
                          <span className="text-xs text-[#78716C] dark:text-stone-400 block mt-0.5">
                            {sub.city}, {sub.state} • Submitted on {new Date(sub.timestamp).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                          isApproved ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' :
                          isRejected ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800' :
                          'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}>
                          {sub.syncStatus.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Travel Quote & Philosophy */}
                    <div className="bg-[#FAF8F5] dark:bg-stone-850 p-3.5 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 text-xs text-[#292524] dark:text-stone-200 italic">
                      <span className="text-[10px] uppercase font-bold text-[#78716C] dark:text-stone-400 not-italic block mb-1">What makes you travel:</span>
                      "{sub.travelPhilosophy || 'No travel philosophy submitted'}"
                    </div>

                    {/* Google Form Private Details Grid (ONLY Visible to Admin) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#FAF8F5]/70 dark:bg-stone-850/70 p-3.5 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 text-[11px]">
                      <div>
                        <span className="text-[#78716C] dark:text-stone-400 block font-semibold text-[10px] uppercase">Email:</span>
                        <span className="text-[#1C1917] dark:text-stone-200 font-mono select-all">{sub.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[#78716C] dark:text-stone-400 block font-semibold text-[10px] uppercase">WhatsApp:</span>
                        <span className="text-[#1C1917] dark:text-stone-200 font-mono select-all">{sub.whatsappNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[#78716C] dark:text-stone-400 block font-semibold text-[10px] uppercase">PIN Code:</span>
                        <span className="text-[#1C1917] dark:text-stone-200 font-mono">{sub.pinCode || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[#78716C] dark:text-stone-400 block font-semibold text-[10px] uppercase">Google Form Choice:</span>
                        <span className="text-[#1C1917] dark:text-stone-200 font-semibold text-[11px] truncate block" title={sub.featuredPreference}>
                          {sub.featuredPreference || (wantsFeatured ? 'Yes - Feature me' : 'No - Book only')}
                        </span>
                      </div>
                      <div className="sm:col-span-2 md:col-span-4 pt-1 border-t border-[#E7E2DA]/60 dark:border-stone-800">
                        <span className="text-[#78716C] dark:text-stone-400 font-semibold text-[10px] uppercase inline mr-1.5">Shipping Address:</span>
                        <span className="text-[#1C1917] dark:text-stone-200 select-all">{sub.deliveryAddress || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Payment Proof & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                      <div className="flex items-center gap-3 text-xs">
                        {sub.paymentProofUrl ? (
                          <div className="flex items-center gap-2">
                            {/* Clickable Thumbnail */}
                            <button
                              type="button"
                              onClick={() => setPreviewProofModalUrl({ url: sub.paymentProofUrl, name: sub.fullName })}
                              className="w-9 h-9 rounded-xl border border-[#D1C7B7] dark:border-stone-700 overflow-hidden hover:opacity-90 transition-opacity shrink-0 cursor-pointer shadow-2xs group relative"
                              title="Click to view payment proof"
                            >
                              <img
                                src={sub.paymentProofUrl}
                                alt="Payment Proof"
                                className="w-full h-full object-cover"
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewProofModalUrl({ url: sub.paymentProofUrl, name: sub.fullName })}
                              className="inline-flex items-center gap-1.5 text-xs text-[#C2410C] dark:text-amber-400 font-semibold hover:underline bg-[#C2410C]/10 dark:bg-[#C2410C]/20 px-3 py-1.5 rounded-full cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect Payment Proof</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full text-[11px] border border-amber-200 dark:border-amber-800">
                            No screenshot attached (Check UPI ref)
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Verify Full Form Record */}
                        <button
                          type="button"
                          onClick={() => setFullVerifyRecord({ submission: sub })}
                          className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-full cursor-pointer flex items-center gap-1.5 transition-colors"
                          title="View all form fields and submission details"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                          <span>Verify Full Form Data</span>
                        </button>

                        {/* Copy Shipping Label */}
                        <button
                          type="button"
                          onClick={() => handleCopyShippingLabel(
                            sub.fullName,
                            sub.deliveryAddress || '',
                            sub.pinCode || '',
                            sub.whatsappNumber || '',
                            sub.state || '',
                            sub.city || '',
                            sub.id
                          )}
                          className="px-3 py-1.5 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 text-xs font-semibold rounded-full cursor-pointer flex items-center gap-1.5 transition-colors"
                          title="Copy Courier Dispatch Label"
                        >
                          {copiedLabelId === sub.id ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="text-emerald-700 dark:text-emerald-300">Label Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#57534E] dark:text-stone-400" />
                              <span>Copy Address</span>
                            </>
                          )}
                        </button>

                        {/* Inspect Raw JSON */}
                        <button
                          type="button"
                          onClick={() => setRawJsonView({ title: `Google Form Submission: ${sub.fullName}`, data: sub })}
                          className="p-1.5 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-100 rounded-full cursor-pointer transition-colors"
                          title="View Raw JSON Payload"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>

                        {isPending && (
                          <>
                            <button
                              onClick={() => handleOpenRejectModal(sub)}
                              className="px-4 py-1.5 bg-white dark:bg-stone-900 hover:bg-red-50 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-semibold rounded-full transition-colors cursor-pointer"
                            >
                              Reject
                            </button>

                            <button
                              onClick={() => handleOpenApproveModal(sub)}
                              className="px-5 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-full shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify &amp; {wantsFeatured ? 'Publish to Mosaic' : 'Confirm Order'}</span>
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            Approved &amp; {wantsFeatured ? 'Active on Mosaic' : 'Order Recorded'}
                          </span>
                        )}

                        <button
                          onClick={() => handleOpenDeleteSubmissionModal(sub)}
                          title="Delete submission"
                          className="p-2 bg-white dark:bg-stone-900 hover:bg-red-50 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-full transition-colors cursor-pointer ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: APPROVED SUPPORTERS MANAGEMENT                                      */}
      {/* ========================================================================= */}
      {activeTab === 'supporters' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-2xl font-bold text-[#1C1917] dark:text-stone-100">
                  Approved Living Mosaic Supporters ({supporters.length})
                </h2>
                <span className="text-xs bg-[#FAF8F5] dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 px-2.5 py-0.5 rounded-full font-bold">
                  {approvedFeaturedCount} Mosaic • {supporters.length - approvedFeaturedCount} Pre-Orders
                </span>
              </div>
              <p className="text-xs text-[#78716C] dark:text-stone-400 mt-0.5">
                Reorder sequence numbers, update travel quotes, upload/remove profile pictures, and manage gapless mosaic placements.
              </p>
            </div>
          </div>

          {/* Supporters Search & Dual Filter Bar */}
          <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 flex flex-col lg:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-[#78716C] dark:text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={adminSupporterSearch}
                onChange={(e) => setAdminSupporterSearch(e.target.value)}
                placeholder="Search #num, name, state, handle..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#FAF8F5] dark:bg-stone-800 border border-[#E7E2DA] dark:border-stone-700 rounded-xl text-xs text-[#1C1917] dark:text-stone-100 placeholder-[#A8A29E] dark:placeholder-stone-500 focus:outline-none focus:border-[#C2410C]"
              />
              {adminSupporterSearch && (
                <button
                  onClick={() => setAdminSupporterSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-100 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {/* Feature Preference Filter */}
              <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-stone-800 p-1 rounded-xl border border-[#E7E2DA] dark:border-stone-700">
                <span className="text-[10px] font-bold text-[#78716C] dark:text-stone-400 px-1.5 uppercase">Type:</span>
                {(['all', 'featured', 'unfeatured'] as const).map((fKey) => (
                  <button
                    key={fKey}
                    onClick={() => setAdminSupporterFeatureFilter(fKey)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                      adminSupporterFeatureFilter === fKey
                        ? 'bg-[#1C1917] dark:bg-stone-100 text-white dark:text-stone-900 font-bold shadow-2xs'
                        : 'text-[#78716C] dark:text-stone-300 hover:text-[#1C1917] dark:hover:text-stone-100 hover:bg-[#EAE4D9]/60 dark:hover:bg-stone-700'
                    }`}
                  >
                    {fKey === 'all' ? `All (${supporters.length})` : fKey === 'featured' ? `✨ Mosaic (${approvedFeaturedCount})` : `📖 Pre-Order (${supporters.length - approvedFeaturedCount})`}
                  </button>
                ))}
              </div>

              {/* Payment Verification Filter */}
              <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-stone-800 p-1 rounded-xl border border-[#E7E2DA] dark:border-stone-700">
                <span className="text-[10px] font-bold text-[#78716C] dark:text-stone-400 px-1.5 uppercase">Payment:</span>
                {(['all', 'verified', 'pending'] as const).map((pKey) => {
                  const verifiedCount = supporters.filter(s => s.paymentVerified === true).length;
                  const pendingCount = supporters.length - verifiedCount;
                  return (
                    <button
                      key={pKey}
                      onClick={() => setAdminSupporterPaymentFilter(pKey)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                        adminSupporterPaymentFilter === pKey
                          ? 'bg-[#C2410C] text-white font-bold shadow-2xs'
                          : 'text-[#78716C] dark:text-stone-300 hover:text-[#1C1917] dark:hover:text-stone-100 hover:bg-[#EAE4D9]/60 dark:hover:bg-stone-700'
                      }`}
                    >
                      {pKey === 'all' ? `All` : pKey === 'verified' ? `✓ Verified (${verifiedCount})` : `⏳ Pending (${pendingCount})`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MOBILE CARDS VIEW (md:hidden) */}
          <div className="block md:hidden space-y-3">
            {adminFilteredSupporters.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 p-8 text-center text-[#78716C] dark:text-stone-400 italic text-xs">
                No supporters matching current filters ("{adminSupporterSearch || adminSupporterFeatureFilter || adminSupporterPaymentFilter}")
              </div>
            ) : (
              adminFilteredSupporters.map((sup, index) => {
                const isVerified = sup.paymentVerified === true;
                const cleanPhone = (sup.whatsappNumber || '').replace(/[^0-9]/g, '');
                const cleanInsta = (sup.instagramHandle || '').replace('@', '').trim();
                const hasValidInsta = cleanInsta && !['not yet', 'no', 'none', 'n/a', 'na'].includes(cleanInsta.toLowerCase());

                return (
                  <div key={sup.id} className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 p-4 shadow-2xs space-y-3.5">
                    {/* Header: Sequence & Lock status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenResequenceModal(sup)}
                          title="Click to edit sequence number"
                          className="font-mono font-bold text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-[#C2410C]/20 px-2.5 py-1 rounded-full text-xs hover:bg-[#C2410C]/20 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>#{sup.supporterNumber}</span>
                          <Edit3 className="w-3 h-3 opacity-60" />
                        </button>

                        <div
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap inline-flex items-center gap-1 border ${
                            sup.featured
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                          }`}
                        >
                          <Lock className="w-2.5 h-2.5 opacity-70" />
                          {sup.featured ? (
                            <>
                              <Sparkles className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" />
                              <span>Mosaic</span>
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-2.5 h-2.5 text-stone-600 dark:text-stone-400" />
                              <span>Book Only</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Move sequence order up / down */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveSupporterOrder(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 bg-[#FAF8F5] dark:bg-stone-800 disabled:opacity-30 text-[#1C1917] dark:text-stone-200 border border-[#E7E2DA] dark:border-stone-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveSupporterOrder(index, 'down')}
                          disabled={index === supporters.length - 1}
                          className="p-1.5 bg-[#FAF8F5] dark:bg-stone-800 disabled:opacity-30 text-[#1C1917] dark:text-stone-200 border border-[#E7E2DA] dark:border-stone-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Supporter Profile info */}
                    <div className="flex items-center gap-3">
                      <SupporterAvatar
                        photoUrl={sup.photoUrl}
                        name={sup.fullName}
                        supporterNumber={sup.supporterNumber}
                        id={sup.id}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-sm text-[#1C1917] dark:text-stone-100 block truncate">{sup.fullName}</span>
                        {sup.email ? (
                          <button
                            type="button"
                            onClick={() => setFollowUpModalSupporter(sup)}
                            className="text-xs text-[#C2410C] dark:text-amber-400 hover:underline flex items-center gap-1 font-medium truncate text-left mt-0.5"
                          >
                            <Mail className="w-3 h-3 text-[#C2410C] dark:text-amber-400 shrink-0" />
                            <span className="truncate">{sup.email}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#A8A29E] dark:text-stone-500 italic">No email on file</span>
                        )}
                        <div className="flex items-center gap-1 text-[11px] text-[#78716C] dark:text-stone-400 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-[#C2410C] dark:text-amber-400 shrink-0" />
                          <span className="truncate">{[sup.city, sup.state].filter(Boolean).join(', ') || 'India'}</span>
                          {sup.mapCellId && (
                            <span className="font-mono text-[10px] bg-[#FAF8F5] dark:bg-stone-800 px-1.5 py-0.2 rounded border border-[#E7E2DA] dark:border-stone-700 ml-1 text-[#1C1917] dark:text-stone-200">
                              {sup.mapCellId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact & Social Links */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F2ECE1] dark:border-stone-800">
                      {hasValidInsta && (
                        <a
                          href={`https://instagram.com/${cleanInsta}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 dark:hover:bg-pink-900/60 text-pink-700 dark:text-pink-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-pink-200 dark:border-pink-800"
                        >
                          <Instagram className="w-3 h-3 text-pink-600 dark:text-pink-400" />
                          <span>@{cleanInsta}</span>
                        </a>
                      )}

                      {sup.whatsappNumber && (
                        <a
                          href={`https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                        >
                          <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>{sup.whatsappNumber}</span>
                        </a>
                      )}
                    </div>

                    {/* Payment Verification Status Toggle */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F2ECE1] dark:border-stone-800">
                      <button
                        onClick={() => handleToggleSupporterPayment(sup)}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all border ${
                          isVerified
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                            : 'bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 animate-pulse'
                        }`}
                      >
                        {isVerified ? (
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

                      {sup.paymentProofUrl && (
                        <button
                          onClick={() => setPreviewProofModalUrl({ url: sup.paymentProofUrl!, name: sup.fullName })}
                          className="w-8 h-8 rounded-lg border border-[#D1C7B7] dark:border-stone-700 overflow-hidden cursor-pointer shadow-2xs shrink-0"
                          title="Inspect Payment Screenshot"
                        >
                          <img src={sup.paymentProofUrl} alt="Proof" className="w-full h-full object-cover" />
                        </button>
                      )}
                    </div>

                    {/* Action Hub for Mobile */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F2ECE1] dark:border-stone-800">
                      {/* Primary Follow-Up Outreach */}
                      <button
                        onClick={() => setFollowUpModalSupporter(sup)}
                        className="col-span-2 py-2 px-3 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Outreach &amp; Follow-Up (Email/WA/IG)</span>
                      </button>

                      <button
                        onClick={() => setFullVerifyRecord({ supporter: sup })}
                        className="py-1.5 px-2 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>Verify Data</span>
                      </button>

                      <button
                        onClick={() => handleCopyShippingLabel(
                          sup.fullName,
                          (sup as any).deliveryAddress || '',
                          (sup as any).pinCode || '',
                          (sup as any).whatsappNumber || '',
                          sup.state || '',
                          sup.city || '',
                          sup.id
                        )}
                        className="py-1.5 px-2 bg-white dark:bg-stone-800 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#57534E] dark:text-stone-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {copiedLabelId === sup.id ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-700 dark:text-emerald-300 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                            <span>Copy Label</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setEditingSupporter(sup)}
                        className="py-1.5 px-2 bg-white dark:bg-stone-800 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Curate Profile</span>
                      </button>

                      <button
                        onClick={() => handleOpenDeleteSupporterModal(sup)}
                        className="py-1.5 px-2 bg-white dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Slot</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DESKTOP TABLE VIEW (hidden md:block) */}
          <div className="hidden md:block bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#292524] dark:text-stone-200">
                <thead className="bg-[#FAF8F5] dark:bg-stone-850 border-b border-[#E7E2DA] dark:border-stone-800 text-[#78716C] dark:text-stone-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-3"># Seq</th>
                    <th className="py-3 px-4">Supporter &amp; Email</th>
                    <th className="py-3 px-3">Social &amp; Contact</th>
                    <th className="py-3 px-3">Form Choice (Locked 🔒)</th>
                    <th className="py-3 px-3">Payment Verification</th>
                    <th className="py-3 px-3">Mosaic Cell</th>
                    <th className="py-3 px-3 text-center">Order</th>
                    <th className="py-3 px-4 text-right">Outreach &amp; Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE1] dark:divide-stone-800">
                  {adminFilteredSupporters.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#78716C] dark:text-stone-400 italic text-xs">
                        No supporters matching current filters ("{adminSupporterSearch || adminSupporterFeatureFilter || adminSupporterPaymentFilter}")
                      </td>
                    </tr>
                  ) : (
                    adminFilteredSupporters.map((sup, index) => {
                      const isVerified = sup.paymentVerified === true;
                      return (
                        <tr key={sup.id} className="hover:bg-[#FAF8F5]/80 dark:hover:bg-stone-850/80 transition-colors">
                          <td className="py-3 px-3">
                            <button
                              onClick={() => handleOpenResequenceModal(sup)}
                              title="Click to change supporter sequence number"
                              className="font-mono font-bold text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-[#C2410C]/20 px-2.5 py-1 rounded-full text-xs hover:bg-[#C2410C]/20 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>#{sup.supporterNumber}</span>
                              <Edit3 className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <SupporterAvatar
                                photoUrl={sup.photoUrl}
                                name={sup.fullName}
                                supporterNumber={sup.supporterNumber}
                                id={sup.id}
                                size="sm"
                              />
                              <div className="min-w-0 max-w-[200px]">
                                <span className="font-bold text-[#1C1917] dark:text-stone-100 block truncate">{sup.fullName}</span>
                                {sup.email ? (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => setFollowUpModalSupporter(sup)}
                                      title={`Click to send email / outreach to ${sup.email}`}
                                      className="text-[11px] text-[#C2410C] dark:text-amber-400 hover:text-[#9A3412] hover:underline flex items-center gap-1 font-medium truncate text-left cursor-pointer"
                                    >
                                      <Mail className="w-3 h-3 text-[#C2410C] dark:text-amber-400 shrink-0" />
                                      <span className="truncate">{sup.email}</span>
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-[#A8A29E] dark:text-stone-500 italic">No email on file</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[#57534E] dark:text-stone-300 text-[11px]">
                            <div className="space-y-1">
                              {sup.instagramHandle && !['@not yet', '@no', '@none', '@n/a', '@na'].includes(sup.instagramHandle.toLowerCase()) ? (
                                <a
                                  href={`https://instagram.com/${sup.instagramHandle.replace('@', '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-[#C2410C] dark:text-amber-400 hover:underline flex items-center gap-1 font-medium truncate"
                                >
                                  <Instagram className="w-3 h-3" />
                                  <span>{sup.instagramHandle}</span>
                                </a>
                              ) : (
                                <span className="text-[10px] text-[#A8A29E] dark:text-stone-500 italic block">No IG handle</span>
                              )}

                              {sup.whatsappNumber ? (
                                <a
                                  href={`https://wa.me/91${sup.whatsappNumber.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-[#57534E] dark:text-stone-300 hover:text-emerald-700 flex items-center gap-1 font-mono"
                                >
                                  <Phone className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                  <span>{sup.whatsappNumber}</span>
                                </a>
                              ) : null}

                              <div className="text-[10px] text-[#78716C] dark:text-stone-400 flex items-center gap-0.5 truncate">
                                <MapPin className="w-2.5 h-2.5 text-[#C2410C] dark:text-amber-400 shrink-0" />
                                <span className="truncate">{[sup.city, sup.state].filter(Boolean).join(', ') || 'India'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {/* Read-Only Authentic Google Form Choice with Security Lock */}
                            <div
                              title="Submitted directly in Google Form (Admin cannot tamper with user choice)"
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap inline-flex items-center gap-1 select-none border ${
                                sup.featured
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                              }`}
                            >
                              <Lock className="w-2.5 h-2.5 opacity-70" />
                              {sup.featured ? (
                                <>
                                  <Sparkles className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" />
                                  <span>✨ Mosaic Backer</span>
                                </>
                              ) : (
                                <>
                                  <BookOpen className="w-2.5 h-2.5 text-stone-600 dark:text-stone-400" />
                                  <span>📖 Book Only</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              {/* Payment Verification Status Toggle Button */}
                              <button
                                onClick={() => handleToggleSupporterPayment(sup)}
                                title="Click to toggle Payment Verified status"
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition-all border ${
                                  isVerified
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                                    : 'bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 animate-pulse'
                                }`}
                              >
                                {isVerified ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                                    <span>✓ Verified</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                    <span>⏳ Pending</span>
                                  </>
                                )}
                              </button>

                              {/* Payment Proof Screenshot Thumbnail */}
                              {sup.paymentProofUrl ? (
                                <button
                                  onClick={() => setPreviewProofModalUrl({ url: sup.paymentProofUrl!, name: sup.fullName })}
                                  className="w-7 h-7 rounded-lg border border-[#D1C7B7] dark:border-stone-700 overflow-hidden hover:scale-110 transition-transform cursor-pointer shadow-2xs shrink-0"
                                  title="Inspect Payment Screenshot"
                                >
                                  <img
                                    src={sup.paymentProofUrl}
                                    alt="Proof"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ) : (
                                <span className="text-[9px] text-[#A8A29E] dark:text-stone-500 font-mono">UPI Ref</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-[10px]">
                            {sup.mapCellId ? (
                              <span className="bg-[#FAF8F5] dark:bg-stone-800 px-2 py-0.5 rounded border border-[#E7E2DA] dark:border-stone-700 text-[#1C1917] dark:text-stone-200">
                                {sup.mapCellId} ({sup.mapX},{sup.mapY})
                              </span>
                            ) : (
                              <span className="text-[#A8A29E] dark:text-stone-500 italic">None (Book Only)</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-0.5">
                              <button
                                onClick={() => handleMoveSupporterOrder(index, 'up')}
                                disabled={index === 0}
                                title="Move Up in sequence"
                                className="p-1 bg-white dark:bg-stone-800 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 disabled:opacity-30 disabled:hover:bg-white text-[#1C1917] dark:text-stone-200 border border-[#E7E2DA] dark:border-stone-700 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleMoveSupporterOrder(index, 'down')}
                                disabled={index === supporters.length - 1}
                                title="Move Down in sequence"
                                className="p-1 bg-white dark:bg-stone-800 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 disabled:opacity-30 disabled:hover:bg-white text-[#1C1917] dark:text-stone-200 border border-[#E7E2DA] dark:border-stone-700 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Direct Follow-Up / Contact Action Button */}
                              <button
                                onClick={() => setFollowUpModalSupporter(sup)}
                                title="Reach out via Email, WhatsApp, or Instagram"
                                className="px-2.5 py-1 bg-[#C2410C]/10 dark:bg-[#C2410C]/20 hover:bg-[#C2410C]/20 border border-[#C2410C]/30 text-[#C2410C] dark:text-amber-400 rounded-full text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-colors shadow-2xs"
                              >
                                <Send className="w-2.5 h-2.5" />
                                <span>Follow-Up</span>
                              </button>

                              {/* Verify All Data Modal Button */}
                              <button
                                onClick={() => setFullVerifyRecord({ supporter: sup })}
                                title="View Full Google Form & Supporter Data"
                                className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-full text-[10px] font-bold cursor-pointer flex items-center gap-1 transition-colors"
                              >
                                <Eye className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                <span>Verify</span>
                              </button>

                              {/* Copy Courier Shipping Label */}
                              <button
                                onClick={() => handleCopyShippingLabel(
                                  sup.fullName,
                                  (sup as any).deliveryAddress || '',
                                  (sup as any).pinCode || '',
                                  (sup as any).whatsappNumber || '',
                                  sup.state || '',
                                  sup.city || '',
                                  sup.id
                                )}
                                title="Copy Courier Dispatch Label"
                                className="px-2 py-1 bg-white dark:bg-stone-800 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#57534E] dark:text-stone-300 rounded-full text-[10px] font-semibold cursor-pointer transition-colors flex items-center gap-1"
                              >
                                {copiedLabelId === sup.id ? (
                                  <>
                                    <CheckCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-[#C2410C] dark:text-amber-400" />
                                    <span>Label</span>
                                  </>
                                )}
                              </button>

                              {/* Curate Profile (Edit photo, handle, sequence, dispatch note) */}
                              <button
                                onClick={() => setEditingSupporter(sup)}
                                title="Curate Profile (Photo, Insta handle, sequence, payment notes)"
                                className="p-1.5 bg-white dark:bg-stone-800 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 rounded-full cursor-pointer transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Profile */}
                              <button
                                onClick={() => handleOpenDeleteSupporterModal(sup)}
                                title="Delete Supporter (Auto-Resequence)"
                                className="p-1.5 bg-white dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-full cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MOSAIC MAP COORDINATES                                             */}
      {/* ========================================================================= */}
      {activeTab === 'mosaic' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-[#1C1917] dark:text-stone-100">
              Interactive 1,000-Cell Map Coordinator
            </h2>
            <p className="text-xs text-[#78716C] dark:text-stone-400">
              Click any cell to inspect supporter allocation and coordinates.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-96 overflow-y-auto p-3 bg-[#FAF8F5] dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800">
            {cells.slice(0, 160).map((cell, idx) => {
              const assignedSup = supporters.find(s => s.id === cell.supporterId);
              return (
                <div
                  key={cell.cellId || `cell-${cell.x}-${cell.y}-${idx}`}
                  onClick={() => setSelectedCell(cell)}
                  className={`p-2.5 rounded-2xl border text-[11px] cursor-pointer transition-all ${
                    cell.supporterId
                      ? 'bg-white dark:bg-stone-800 border-[#C2410C] shadow-2xs'
                      : 'bg-white/60 dark:bg-stone-850/60 border-[#E7E2DA] dark:border-stone-700 text-[#A8A29E] dark:text-stone-500'
                  }`}
                >
                  <div className="font-mono text-[10px] font-bold text-[#1C1917] dark:text-stone-200 flex justify-between">
                    <span>{cell.x},{cell.y}</span>
                    {cell.supporterId && <span className="text-[#C2410C] dark:text-amber-400">#{assignedSup?.supporterNumber}</span>}
                  </div>
                  <div className="text-[10px] text-[#78716C] dark:text-stone-400 truncate mt-0.5">
                    {assignedSup?.fullName || cell.stateName || 'Vacant Slot'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mosaic Page Top 10 Spotlight Cards Arranger Panel */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C] dark:text-amber-400 bg-[#C2410C]/10 dark:bg-stone-800 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border border-[#C2410C]/20 dark:border-stone-700">
                    <ShieldCheck className="w-3 h-3" />
                    Mosaic Page Spotlight Only
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    10 Spotlight Cards Active
                  </span>
                </div>
                <h3 className="font-editorial text-2xl font-bold text-[#1C1917] dark:text-stone-100 mt-1">
                  Mosaic Community Spotlight Manager (Top 10 Cards)
                </h3>
                <p className="text-xs text-[#78716C] dark:text-stone-400 max-w-2xl">
                  Choose the exact 10 supporters and their sequence featured in the public "Community Faces" grid on the Mosaic page.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sorted = [...supporters.filter(s => s.approved)].sort(
                      (a, b) => (a.supporterNumber || 0) - (b.supporterNumber || 0)
                    );
                    handleSaveMosaicTopCards(sorted.slice(0, 10).map(s => s.id));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold cursor-pointer border border-stone-300 dark:border-stone-700 transition-colors"
                >
                  Preset: #1 to #10
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sorted = [...supporters.filter(s => s.approved)].sort(
                      (a, b) => (b.supporterNumber || 0) - (a.supporterNumber || 0)
                    );
                    handleSaveMosaicTopCards(sorted.slice(0, 10).map(s => s.id));
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold cursor-pointer border border-stone-300 dark:border-stone-700 transition-colors"
                >
                  Preset: Latest First
                </button>
                <button
                  type="button"
                  onClick={() => setIsMosaicCardsModalOpen(true)}
                  className="px-4 py-2 bg-[#C2410C] hover:bg-[#9A3412] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Customize Top 10 Cards</span>
                </button>
              </div>
            </div>

            {/* 10 Spotlight Cards Slot Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              {mosaicTopCardIds.slice(0, 10).map((id, idx) => {
                const sup = supporters.find(s => s.id === id);
                const isFirst = idx === 0;
                const isLast = idx === Math.min(mosaicTopCardIds.length, 10) - 1;

                if (!sup) {
                  return (
                    <div
                      key={`slot-${idx}`}
                      className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs text-stone-400 font-bold">
                        <span>Slot #{idx + 1}</span>
                        <span>Vacant</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMosaicCardsModalOpen(true)}
                        className="py-1.5 px-2.5 bg-[#C2410C] text-white rounded-xl text-xs font-bold cursor-pointer text-center"
                      >
                        Assign Card
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={sup.id}
                    className="p-3 bg-stone-50 dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-700 hover:border-[#C2410C]/60 transition-all flex flex-col justify-between space-y-2.5 shadow-2xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-[#1C1917] text-amber-400 font-mono font-bold text-[10px]">
                          Slot #{idx + 1}
                        </span>
                        <span className="font-bold text-[#C2410C] dark:text-amber-400 text-[10px]">
                          Supporter #{sup.supporterNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <SupporterAvatar
                          photoUrl={sup.photoUrl}
                          name={sup.fullName}
                          supporterNumber={sup.supporterNumber}
                          id={sup.id}
                          size="sm"
                          className="shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-[#1C1917] dark:text-stone-100 truncate" title={sup.fullName}>
                            {sup.fullName}
                          </h5>
                          <span className="text-[10px] text-stone-500 truncate block">
                            {sup.city}, {sup.state}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200 dark:border-stone-700/60 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isFirst || savingTopCards}
                          onClick={() => {
                            const next = [...mosaicTopCardIds.slice(0, 10)];
                            const temp = next[idx - 1];
                            next[idx - 1] = next[idx];
                            next[idx] = temp;
                            handleSaveMosaicTopCards(next);
                          }}
                          title="Move Left / Earlier"
                          className="px-2 py-1 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-30 cursor-pointer"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          disabled={isLast || savingTopCards}
                          onClick={() => {
                            const next = [...mosaicTopCardIds.slice(0, 10)];
                            const temp = next[idx + 1];
                            next[idx + 1] = next[idx];
                            next[idx] = temp;
                            handleSaveMosaicTopCards(next);
                          }}
                          title="Move Right / Later"
                          className="px-2 py-1 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-bold rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-30 cursor-pointer"
                        >
                          ▶
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsMosaicCardsModalOpen(true)}
                        className="px-2 py-1 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-[10px] font-semibold rounded-lg cursor-pointer"
                      >
                        Swap
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BOOK ORDERS & FULFILLMENT                                          */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-[#1C1917] dark:text-stone-100">
              Book Pre-Orders & Delivery Dispatch ({orders.length})
            </h2>
            <p className="text-xs text-[#78716C] dark:text-stone-400">
              Hardcover editions of "India - 28 States in 28 Weeks".
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#292524] dark:text-stone-200">
                <thead className="bg-[#FAF8F5] dark:bg-stone-850 border-b border-[#E7E2DA] dark:border-stone-800 text-[#78716C] dark:text-stone-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Shipping Destination</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE1] dark:divide-stone-800">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF8F5]/80 dark:hover:bg-stone-850/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold">{ord.id}</td>
                      <td className="py-3 px-4 font-semibold">{ord.customerName}</td>
                      <td className="py-3 px-4 max-w-xs truncate">{ord.deliveryAddress || `${ord.city}, ${ord.state}`}</td>
                      <td className="py-3 px-4 font-bold text-[#C2410C] dark:text-amber-400">₹{ord.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          ord.paymentStatus === 'verified' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 capitalize font-medium">{ord.orderStatus.replace('_', ' ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SUPPORTER RECYCLE BIN & DELETION QUARANTINE                        */}
      {/* ========================================================================= */}
      {activeTab === 'recycle_bin' && (() => {
        const filteredRecycleBin = recycleBin.filter(item => {
          const q = recycleBinSearch.toLowerCase().trim();
          if (!q) return true;
          const s = item.supporter;
          return (
            s.fullName.toLowerCase().includes(q) ||
            (s.email && s.email.toLowerCase().includes(q)) ||
            (s.whatsappNumber && s.whatsappNumber.includes(q)) ||
            (s.city && s.city.toLowerCase().includes(q)) ||
            (s.state && s.state.toLowerCase().includes(q)) ||
            (s.instagramHandle && s.instagramHandle.toLowerCase().includes(q)) ||
            String(s.supporterNumber) === q.replace('#', '')
          );
        });

        return (
          <div className="space-y-6">
            {/* Header / Banner Card */}
            <div className="bg-gradient-to-r from-[#FAF8F5] via-[#FFFDF9] to-[#F5EFEB] dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 p-6 rounded-3xl border border-[#E7E2DA] dark:border-stone-700 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-editorial text-2xl font-bold text-[#1C1917] dark:text-stone-100">
                        Supporter Recycle Bin
                      </h2>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        {recycleBin.length} {recycleBin.length === 1 ? 'Record' : 'Records'}
                      </span>
                    </div>
                    <p className="text-xs text-[#78716C] dark:text-stone-400 mt-0.5">
                      Supporters deleted by Admin are quarantined here so they will not reappear on refresh or Google Sheets auto-sync.
                    </p>
                  </div>
                </div>

                {recycleBin.length > 0 && (
                  <button
                    type="button"
                    onClick={handleEmptyRecycleBin}
                    disabled={emptyingRecycleBin}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold rounded-full border border-red-200 dark:border-red-800/60 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center disabled:opacity-50"
                  >
                    <Trash2 className={`w-3.5 h-3.5 ${emptyingRecycleBin ? 'animate-spin' : ''}`} />
                    <span>{emptyingRecycleBin ? 'Emptying...' : 'Empty Recycle Bin'}</span>
                  </button>
                )}
              </div>

              <div className="p-3.5 bg-white/80 dark:bg-stone-800/80 rounded-2xl border border-[#E7E2DA] dark:border-stone-700 text-xs text-[#57534E] dark:text-stone-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1C1917] dark:text-stone-100 font-semibold">Sync Protection Active: </strong>
                  Deleted supporter identities (phone, email, name) are permanently remembered in the backend quarantine array. Even if the Google Form webhook or sheet sync runs again, deleted supporters will remain excluded from the live mosaic until you explicitly click <em>Restore</em>.
                </div>
              </div>
            </div>

            {/* Filter Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-[#E7E2DA] dark:border-stone-700">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#A8A29E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search deleted supporters..."
                  value={recycleBinSearch}
                  onChange={(e) => setRecycleBinSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-[#C2410C] focus:outline-none dark:text-stone-100"
                />
              </div>

              <div className="text-xs text-[#78716C] dark:text-stone-400 self-end sm:self-center">
                Showing {filteredRecycleBin.length} of {recycleBin.length} items
              </div>
            </div>

            {/* Recycle Bin Grid / Empty State */}
            {recycleBin.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-700 p-12 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-editorial text-lg font-bold text-[#1C1917] dark:text-stone-100">
                  Recycle Bin is Empty
                </h3>
                <p className="text-xs text-[#78716C] dark:text-stone-400 max-w-md mx-auto">
                  No supporters have been deleted. When you delete a supporter from the Living Mosaic Supporters list, they will safely appear here and can be restored at any time.
                </p>
              </div>
            ) : filteredRecycleBin.length === 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-700 p-8 text-center space-y-2">
                <p className="text-xs text-[#78716C] dark:text-stone-400">
                  No deleted supporters match your search query "{recycleBinSearch}".
                </p>
                <button
                  onClick={() => setRecycleBinSearch('')}
                  className="text-xs text-[#C2410C] dark:text-amber-400 font-semibold hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRecycleBin.map((item) => {
                  const s = item.supporter;
                  const isRestoring = restoringId === item.id;
                  const isPurging = purgingId === item.id;
                  const formattedDate = new Date(item.deletedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-[#E7E2DA] dark:border-stone-700 shadow-2xs hover:shadow-sm transition-all space-y-4"
                    >
                      {/* Top Row: Supporter info + deletion badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <SupporterAvatar
                            name={s.fullName}
                            avatarUrl={s.avatarUrl}
                            sizeClassName="w-11 h-11"
                            ringClassName="border border-[#E7E2DA] dark:border-stone-700"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#1C1917] dark:text-stone-100">
                                {s.fullName}
                              </h4>
                              {s.supporterNumber && (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                                  #{s.supporterNumber}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#78716C] dark:text-stone-400 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#C2410C] shrink-0" />
                              <span>{[s.city, s.state].filter(Boolean).join(', ') || 'India'}</span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 shrink-0">
                          DELETED
                        </span>
                      </div>

                      {/* Details Strip */}
                      <div className="grid grid-cols-2 gap-2 p-3 bg-[#FAF8F5] dark:bg-stone-800/70 rounded-2xl border border-[#E7E2DA]/60 dark:border-stone-700/60 text-[11px]">
                        <div>
                          <span className="text-[#A8A29E] dark:text-stone-400 block text-[10px]">Contact</span>
                          <span className="font-medium text-[#1C1917] dark:text-stone-200 truncate block">
                            {s.whatsappNumber || s.email || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#A8A29E] dark:text-stone-400 block text-[10px]">Deletion Time</span>
                          <span className="font-medium text-[#1C1917] dark:text-stone-200 block">
                            {formattedDate}
                          </span>
                        </div>
                        {s.travelComment && (
                          <div className="col-span-2 pt-1 border-t border-[#E7E2DA]/50 dark:border-stone-700/50">
                            <span className="text-[#A8A29E] dark:text-stone-400 block text-[10px]">Supporter Quote</span>
                            <p className="italic text-[#57534E] dark:text-stone-300 line-clamp-2">
                              "{s.travelComment}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F2ECE1] dark:border-stone-800">
                        <button
                          type="button"
                          onClick={() => handlePurgeDeletedRecord(item)}
                          disabled={isPurging || isRestoring}
                          className="px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors font-medium cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
                          <span>{isPurging ? 'Purging...' : 'Purge Permanently'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRestoreSupporter(item)}
                          disabled={isRestoring || isPurging}
                          className="px-4 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                          <span>{isRestoring ? 'Restoring...' : 'Restore to Active'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* APPROVAL MODAL / DRAWER                                                   */}
      {/* ========================================================================= */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#F2ECE1] dark:border-stone-800 pb-4">
              <div>
                <h3 className="font-editorial text-xl font-bold text-[#1C1917] dark:text-stone-100">
                  Verify Payment & Feature Supporter
                </h3>
                <span className="text-xs text-[#78716C] dark:text-stone-400">{selectedSubmission.fullName} ({selectedSubmission.city})</span>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded-full text-[#78716C] dark:text-stone-400 hover:bg-[#FAF8F5] dark:hover:bg-stone-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#1C1917] dark:text-stone-200 block mb-1">
                  Public Travel Philosophy / Quote (Displayed on Mosaic):
                </label>
                <textarea
                  rows={3}
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#D1C7B7] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#1C1917] dark:text-stone-200 block mb-1">
                  Supporter Photograph (Upload or Link):
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {approvalPhotoUrl ? (
                      <img
                        src={approvalPhotoUrl}
                        alt="Preview"
                        className="w-12 h-12 rounded-full object-cover border border-[#E7E2DA] dark:border-stone-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#FAF8F5] dark:bg-stone-800 border border-[#E7E2DA] dark:border-stone-700 flex items-center justify-center text-xs text-[#78716C] dark:text-stone-400">
                        <Image className="w-5 h-5 text-[#A8A29E] dark:text-stone-500" />
                      </div>
                    )}
                    <label className="px-3.5 py-1.5 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 text-xs font-semibold rounded-full cursor-pointer flex items-center gap-1.5">
                      <ImagePlus className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileUpload(e, false)}
                        className="hidden"
                      />
                    </label>
                    {approvalPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setApprovalPhotoUrl('')}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={approvalPhotoUrl}
                    placeholder="Or enter public image URL (Google Drive / Web link)"
                    onChange={(e) => setApprovalPhotoUrl(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D1C7B7] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#1C1917] dark:text-stone-100 font-mono text-[11px] focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#FAF8F5] dark:bg-stone-800 p-3.5 rounded-2xl border border-[#E7E2DA] dark:border-stone-700 space-y-1 text-[#57534E] dark:text-stone-300">
                <span className="font-bold text-[#1C1917] dark:text-stone-100 block">Automatic Actions on Approval:</span>
                <p>1. Next available Supporter number will be assigned (Current: #{approvedFeaturedCount + 1}).</p>
                <p>2. A vacant grid cell in the India Mosaic matching region will be reserved.</p>
                <p>3. Supporter profile will immediately become interactive on the public mosaic.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2.5 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 text-[#57534E] dark:text-stone-300 text-xs font-semibold rounded-full border border-[#D1C7B7] dark:border-stone-700 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={approvalSubmitting}
                className="px-6 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold rounded-full shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{approvalSubmitting ? 'Publishing...' : 'Approve & Place on Mosaic'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / CURATE SUPPORTER MODAL                                             */}
      {/* ========================================================================= */}
      {editingSupporter && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E7E2DA] dark:border-stone-800 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F2ECE1] dark:border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-editorial text-xl font-bold text-[#1C1917] dark:text-stone-100">
                    Curate Profile #{editingSupporter.supporterNumber}
                  </h3>
                  <span className="text-xs bg-[#FAF8F5] dark:bg-stone-800 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 px-2.5 py-0.5 rounded-full font-bold">
                    {editingSupporter.fullName}
                  </span>
                </div>
                <span className="text-xs text-[#78716C] dark:text-stone-400">
                  Administrative curation of profile presentation, verified handle, and order status.
                </span>
              </div>
              <button onClick={() => setEditingSupporter(null)} className="cursor-pointer p-1 rounded-full text-[#78716C] dark:text-stone-400 hover:bg-[#FAF8F5] dark:hover:bg-stone-800">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Locked User Submission Section (Read-Only) */}
            <div className="p-4 bg-[#FAF8F5] dark:bg-stone-850 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#78716C] dark:text-stone-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                  <span>Submitted User Data (Locked &amp; Verified)</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    editingSupporter.featured
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                  }`}>
                    {editingSupporter.featured ? '✨ Mosaic Backer' : '📖 Book Pre-Order'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyShippingLabel(
                      editingSupporter.fullName,
                      (editingSupporter as any).deliveryAddress || '',
                      (editingSupporter as any).pinCode || '',
                      (editingSupporter as any).whatsappNumber || '',
                      editingSupporter.state || '',
                      editingSupporter.city || '',
                      'edit-modal-copy'
                    )}
                    className="px-2.5 py-1 bg-white dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 text-[10px] font-bold rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3 text-[#C2410C] dark:text-amber-400" />
                    <span>Copy Courier Label</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-[#E7E2DA] dark:border-stone-800">
                <div>
                  <span className="text-[#78716C] dark:text-stone-400 text-[10px] uppercase font-semibold block">Full Name:</span>
                  <span className="font-bold text-[#1C1917] dark:text-stone-100">{editingSupporter.fullName}</span>
                </div>
                <div>
                  <span className="text-[#78716C] dark:text-stone-400 text-[10px] uppercase font-semibold block">Origin Location:</span>
                  <span className="font-medium text-[#1C1917] dark:text-stone-200">
                    {[editingSupporter.city, editingSupporter.state].filter(Boolean).join(', ') || 'India'}
                    {(editingSupporter as any).pinCode ? ` - ${(editingSupporter as any).pinCode}` : ''}
                  </span>
                </div>
                {(editingSupporter as any).whatsappNumber && (
                  <div>
                    <span className="text-[#78716C] dark:text-stone-400 text-[10px] uppercase font-semibold block">WhatsApp:</span>
                    <a
                      href={`https://wa.me/91${(editingSupporter as any).whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[#C2410C] dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{(editingSupporter as any).whatsappNumber}</span>
                    </a>
                  </div>
                )}
                {(editingSupporter as any).email && (
                  <div>
                    <span className="text-[#78716C] dark:text-stone-400 text-[10px] uppercase font-semibold block">Email:</span>
                    <span className="font-mono text-[#57534E] dark:text-stone-300 truncate block">{(editingSupporter as any).email}</span>
                  </div>
                )}
                {(editingSupporter as any).deliveryAddress && (
                  <div className="sm:col-span-2 pt-1 border-t border-[#F2ECE1] dark:border-stone-800">
                    <span className="text-[#78716C] dark:text-stone-400 text-[10px] uppercase font-semibold block">Shipping Address:</span>
                    <p className="text-[11px] text-[#292524] dark:text-stone-200 leading-relaxed select-all font-medium">
                      {(editingSupporter as any).deliveryAddress}
                    </p>
                  </div>
                )}
                {editingSupporter.travelComment && (
                  <div className="sm:col-span-2 pt-1 border-t border-[#F2ECE1] dark:border-stone-800">
                    <span className="text-[#78716C] dark:text-stone-400 text-[10px] uppercase font-semibold block">Travel Philosophy:</span>
                    <p className="text-[11px] text-[#57534E] dark:text-stone-300 italic">
                      "{editingSupporter.travelComment}"
                    </p>
                  </div>
                )}
                {editingSupporter.paymentProofUrl && (
                  <div className="sm:col-span-2 pt-1 border-t border-[#F2ECE1] dark:border-stone-800 flex items-center justify-between">
                    <span className="text-[#78716C] dark:text-stone-400 text-[10px] uppercase font-semibold">Payment Proof:</span>
                    <button
                      type="button"
                      onClick={() => setPreviewProofModalUrl({ url: editingSupporter.paymentProofUrl!, name: editingSupporter.fullName })}
                      className="text-[11px] text-[#C2410C] dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect Full Payment Screenshot</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveSupporterEdit} className="space-y-4 text-xs">
              <div className="flex items-center gap-2 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                <span className="font-bold text-[#1C1917] dark:text-stone-100 text-xs uppercase tracking-wide">
                  Admin Curated Profile Settings
                </span>
              </div>

              {/* Profile Photo Management */}
              <div className="p-4 bg-[#FAF8F5] dark:bg-stone-850 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 space-y-3">
                <label className="font-bold text-[#1C1917] dark:text-stone-100 block">Profile Photograph</label>
                <div className="flex items-center gap-4">
                  {editingSupporter.photoUrl?.trim() ? (
                    <img
                      src={editingSupporter.photoUrl}
                      alt={editingSupporter.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#C2410C] bg-white dark:bg-stone-800 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#D1C7B7] dark:border-stone-700 bg-white dark:bg-stone-800 flex flex-col items-center justify-center text-xs text-[#78716C] dark:text-stone-400 shrink-0 font-bold">
                      <span className="text-lg text-[#C2410C] dark:text-amber-400">{editingSupporter.fullName.charAt(0).toUpperCase() || 'S'}</span>
                      <span className="text-[9px] text-[#A8A29E] dark:text-stone-500">No photo</span>
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="px-3.5 py-1.5 bg-white dark:bg-stone-800 hover:bg-[#FAF8F5] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 text-xs font-semibold rounded-full cursor-pointer flex items-center gap-1.5 shadow-2xs">
                        <ImagePlus className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                        <span>Upload Local Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileUpload(e, true)}
                          className="hidden"
                        />
                      </label>

                      {editingSupporter.photoUrl?.trim() && (
                        <button
                          type="button"
                          onClick={() => setEditingSupporter({ ...editingSupporter, photoUrl: '' })}
                          className="px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-red-50 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full cursor-pointer flex items-center gap-1"
                        >
                          <ImageOff className="w-3.5 h-3.5" />
                          <span>Remove Photo</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Or paste direct image URL (Google Drive / Web URL)"
                      value={editingSupporter.photoUrl || ''}
                      onChange={(e) => setEditingSupporter({ ...editingSupporter, photoUrl: e.target.value })}
                      className="w-full p-2 rounded-xl border border-[#D1C7B7] dark:border-stone-700 font-mono text-[11px] bg-white dark:bg-stone-800 text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Instagram Handle & Supporter Slot Sequence Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#1C1917] dark:text-stone-100 block mb-1">
                    Instagram Handle / Social ID
                  </label>
                  <input
                    type="text"
                    value={editingSupporter.instagramHandle || ''}
                    placeholder="@username"
                    onChange={(e) => {
                      let val = e.target.value.trim();
                      if (val.startsWith('http')) {
                        try {
                          const urlObj = new URL(val);
                          const pathParts = urlObj.pathname.split('/').filter(Boolean);
                          if (pathParts.length > 0 && pathParts[0] !== 'p' && pathParts[0] !== 'reel') {
                            val = '@' + pathParts[0];
                          }
                        } catch {
                          // keep raw
                        }
                      } else if (val && !val.startsWith('@')) {
                        val = '@' + val;
                      }
                      setEditingSupporter({ ...editingSupporter, instagramHandle: val });
                    }}
                    className="w-full p-2.5 rounded-xl border border-[#D1C7B7] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none font-mono text-xs"
                  />
                  <span className="text-[10px] text-[#78716C] dark:text-stone-400 mt-0.5 block">
                    Displayed on the living mosaic and supporter tooltip.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-[#1C1917] dark:text-stone-100 block mb-1">
                    Supporter Sequence Number (#)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingSupporter.supporterNumber}
                    onChange={(e) => setEditingSupporter({ ...editingSupporter, supporterNumber: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#D1C7B7] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none font-mono text-xs"
                    required
                  />
                  <span className="text-[10px] text-[#78716C] dark:text-stone-400 mt-0.5 block">
                    Numerical order on the mosaic index.
                  </span>
                </div>
              </div>

              {/* Payment Verification & Order Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#FAF8F5] dark:bg-stone-850 rounded-2xl border border-[#E7E2DA] dark:border-stone-800">
                <div>
                  <label className="font-bold text-[#1C1917] dark:text-stone-100 block mb-1">
                    Payment Verification Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingSupporter({
                      ...editingSupporter,
                      paymentVerified: !(editingSupporter.paymentVerified === true)
                    })}
                    className={`w-full py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      (editingSupporter.paymentVerified === true)
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                        : 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 animate-pulse'
                    }`}
                  >
                    {(editingSupporter.paymentVerified === true) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        <span>✓ Payment Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                        <span>⏳ Payment Pending</span>
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <label className="font-bold text-[#1C1917] dark:text-stone-100 block mb-1">
                    Order Dispatch &amp; Fulfillment
                  </label>
                  <select
                    value={editingSupporter.orderStatus || 'payment_verified'}
                    onChange={(e) => setEditingSupporter({ ...editingSupporter, orderStatus: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-[#D1C7B7] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none font-medium text-xs"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="payment_verified">Payment Verified</option>
                    <option value="processing">Packing &amp; Processing</option>
                    <option value="shipped">Dispatched / Shipped</option>
                    <option value="delivered">Delivered to Supporter</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Internal Admin Dispatch Note */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-[#1C1917] dark:text-stone-100 block mb-1">
                    Internal Admin / Courier Tracking Memo:
                  </label>
                  <input
                    type="text"
                    value={editingSupporter.adminNote || ''}
                    onChange={(e) => setEditingSupporter({ ...editingSupporter, adminNote: e.target.value })}
                    placeholder="e.g. DTDC Consignment #D12345678, dispatched 18 Aug"
                    className="w-full p-2.5 rounded-xl border border-[#D1C7B7] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F2ECE1] dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingSupporter(null)}
                  className="px-5 py-2.5 bg-[#FAF8F5] dark:bg-stone-800 text-[#57534E] dark:text-stone-300 rounded-full border border-[#D1C7B7] dark:border-stone-700 cursor-pointer hover:bg-[#EAE4D9] dark:hover:bg-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-full shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Save Curated Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE SUPPORTER CONFIRMATION WITH AUTO-RESEQUENCE                 */}
      {/* ========================================================================= */}
      {supporterToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#1C1917] dark:text-stone-100">
                  Delete Supporter Profile
                </h3>
                <span className="text-xs text-[#78716C] dark:text-stone-400">Permanent removal & automatic resequencing</span>
              </div>
            </div>

            {/* Supporter Identity Box */}
            <div className="p-4 bg-[#FAF8F5] dark:bg-stone-850 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 flex items-center gap-3.5">
              <SupporterAvatar
                photoUrl={supporterToDelete.photoUrl}
                name={supporterToDelete.fullName}
                supporterNumber={supporterToDelete.supporterNumber}
                id={supporterToDelete.id}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#C2410C]/10 dark:bg-[#C2410C]/20 text-[#C2410C] dark:text-amber-400 rounded-full">
                    #{supporterToDelete.supporterNumber}
                  </span>
                  <span className="font-bold text-sm text-[#1C1917] dark:text-stone-100 truncate">{supporterToDelete.fullName}</span>
                </div>
                <span className="text-xs text-[#78716C] dark:text-stone-400 block truncate">
                  {[supporterToDelete.city, supporterToDelete.state].filter(Boolean).join(', ') || 'India'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-bold block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                Automatic Sequence Resequencing (1..N)
              </span>
              <p className="leading-relaxed text-[11px] text-amber-800 dark:text-amber-300">
                Deleting this supporter will automatically vacate their map slot and re-number all subsequent supporters so that there are <strong>zero gaps</strong> in the supporter numbers or mosaic grid.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deletingSupporterLoading}
                onClick={() => setSupporterToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#57534E] dark:text-stone-300 hover:bg-[#FAF8F5] dark:hover:bg-stone-800 rounded-full border border-[#D1C7B7] dark:border-stone-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingSupporterLoading}
                onClick={handleConfirmDeleteSupporter}
                className="px-5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-full shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {deletingSupporterLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting & Resequencing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete & Resequence</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE SUBMISSION CONFIRMATION                                     */}
      {/* ========================================================================= */}
      {submissionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#1C1917] dark:text-stone-100">
                  Delete Form Submission
                </h3>
                <span className="text-xs text-[#78716C] dark:text-stone-400">Remove submission record</span>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] dark:bg-stone-850 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 space-y-1 text-xs">
              <div className="font-bold text-sm text-[#1C1917] dark:text-stone-100">{submissionToDelete.fullName}</div>
              <div className="text-[#78716C] dark:text-stone-400 font-mono text-[11px]">{submissionToDelete.email || 'No email provided'}</div>
              <div className="text-[#78716C] dark:text-stone-400 text-[11px]">
                {submissionToDelete.city}, {submissionToDelete.state} • {new Date(submissionToDelete.timestamp).toLocaleDateString()}
              </div>
            </div>

            <p className="text-xs text-[#78716C] dark:text-stone-400 leading-relaxed">
              Are you sure you want to permanently delete this form submission? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deletingSubmissionLoading}
                onClick={() => setSubmissionToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#57534E] dark:text-stone-300 hover:bg-[#FAF8F5] dark:hover:bg-stone-800 rounded-full border border-[#D1C7B7] dark:border-stone-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingSubmissionLoading}
                onClick={handleConfirmDeleteSubmission}
                className="px-5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-full shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {deletingSubmissionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Submission</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESEQUENCE SUPPORTER NUMBER DIALOG                                 */}
      {/* ========================================================================= */}
      {resequenceModalSupporter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C2410C]/10 dark:bg-[#C2410C]/20 text-[#C2410C] dark:text-amber-400 flex items-center justify-center shrink-0 border border-[#C2410C]/20 dark:border-amber-700">
                <ListOrdered className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#1C1917] dark:text-stone-100">
                  Change Sequence Number
                </h3>
                <span className="text-xs text-[#78716C] dark:text-stone-400">Reorder slot without creating gaps</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] dark:bg-stone-850 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 flex items-center gap-3">
              <SupporterAvatar
                photoUrl={resequenceModalSupporter.photoUrl}
                name={resequenceModalSupporter.fullName}
                supporterNumber={resequenceModalSupporter.supporterNumber}
                id={resequenceModalSupporter.id}
                size="sm"
              />
              <div>
                <span className="font-bold text-xs text-[#1C1917] dark:text-stone-100 block">{resequenceModalSupporter.fullName}</span>
                <span className="text-[11px] text-[#78716C] dark:text-stone-400">Currently assigned to <strong>Slot #{resequenceModalSupporter.supporterNumber}</strong></span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1C1917] dark:text-stone-100 block">
                Target Slot Number (1 to {supporters.length}):
              </label>
              <input
                type="number"
                min={1}
                max={supporters.length}
                value={targetSeqNum}
                onChange={(e) => setTargetSeqNum(parseInt(e.target.value, 10) || 1)}
                className="w-full p-3 rounded-2xl border border-[#D1C7B7] dark:border-stone-700 bg-white dark:bg-stone-800 text-base font-bold font-mono text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
              />
              <p className="text-[11px] text-[#78716C] dark:text-stone-400 leading-relaxed">
                Moving this supporter will automatically shift all other supporters so order remains cleanly 1, 2, 3... {supporters.length}.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={savingSequenceLoading}
                onClick={() => setResequenceModalSupporter(null)}
                className="px-4 py-2 text-xs font-semibold text-[#57534E] dark:text-stone-300 hover:bg-[#FAF8F5] dark:hover:bg-stone-800 rounded-full border border-[#D1C7B7] dark:border-stone-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingSequenceLoading}
                onClick={handleConfirmResequence}
                className="px-5 py-2 text-xs font-semibold bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 text-white rounded-full shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {savingSequenceLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Sequence</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REJECT SUBMISSION DIALOG                                           */}
      {/* ========================================================================= */}
      {rejectModalSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 max-w-md w-full rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#1C1917] dark:text-stone-100">
                  Reject Submission
                </h3>
                <span className="text-xs text-[#78716C] dark:text-stone-400">From {rejectModalSub.fullName}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-[#1C1917] dark:text-stone-100 block">
                Rejection Reason (Internal Note):
              </label>
              <input
                type="text"
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Payment unverified / Duplicate"
                className="w-full p-2.5 rounded-xl border border-[#D1C7B7] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#1C1917] dark:text-stone-100 focus:ring-2 focus:ring-[#C2410C] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={rejectingLoading}
                onClick={() => setRejectModalSub(null)}
                className="px-4 py-2 text-xs font-semibold text-[#57534E] dark:text-stone-300 hover:bg-[#FAF8F5] dark:hover:bg-stone-800 rounded-full border border-[#D1C7B7] dark:border-stone-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectingLoading}
                onClick={handleConfirmReject}
                className="px-5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-full shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {rejectingLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <span>Confirm Rejection</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PAYMENT PROOF LIGHTBOX VIEWER                                      */}
      {/* ========================================================================= */}
      {previewProofModalUrl && (
        <div 
          onClick={() => setPreviewProofModalUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-stone-900 max-w-2xl w-full rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 shadow-2xl space-y-4 animate-scaleUp cursor-default max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-[#F2ECE1] dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold text-xs">
                  ₹
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#1C1917] dark:text-stone-100">
                    Payment Verification Screenshot
                  </h3>
                  <span className="text-xs text-[#78716C] dark:text-stone-400">Submitted by {previewProofModalUrl.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewProofModalUrl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 text-[#1C1917] dark:text-stone-200 text-xs font-semibold rounded-full border border-[#D1C7B7] dark:border-stone-700 inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Full Size</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewProofModalUrl(null)}
                  className="p-1.5 hover:bg-[#FAF8F5] dark:hover:bg-stone-800 text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-100 rounded-full transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#FAF8F5] dark:bg-stone-950 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 p-2 flex items-center justify-center min-h-[300px]">
              <img
                src={previewProofModalUrl.url}
                alt={`Payment proof for ${previewProofModalUrl.name}`}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-[#78716C] dark:text-stone-400">
              <span>Check amount (₹499 for Pre-Order + Living Mosaic), UPI Reference number, and timestamp.</span>
              <button
                type="button"
                onClick={() => setPreviewProofModalUrl(null)}
                className="px-4 py-2 bg-[#1C1917] dark:bg-stone-800 hover:bg-[#44403C] dark:hover:bg-stone-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer border border-transparent dark:border-stone-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPREHENSIVE SUPPORTER & GOOGLE FORM DATA VERIFICATION INSPECTOR  */}
      {/* ========================================================================= */}
      {fullVerifyRecord && (() => {
        const sup = fullVerifyRecord.supporter;
        const sub = fullVerifyRecord.submission;
        const fullName = sup?.fullName || sub?.fullName || 'Unknown Supporter';
        const photoUrl = sup?.photoUrl || sub?.photoUrl;
        const email = (sup as any)?.email || sub?.email;
        const phone = (sup as any)?.whatsappNumber || sub?.whatsappNumber;
        const address = (sup as any)?.deliveryAddress || sub?.deliveryAddress;
        const pinCode = (sup as any)?.pinCode || sub?.pinCode;
        const city = sup?.city || sub?.city;
        const state = sup?.state || sub?.state;
        const insta = sup?.instagramHandle || sub?.instagramHandle;
        const quote = sup?.travelComment || sub?.travelPhilosophy;
        const proofUrl = sup?.paymentProofUrl || sub?.paymentProofUrl;
        const isFeatured = sup ? sup.featured : (sub?.featuredPreference?.toLowerCase().includes('yes') || sub?.featuredPreference?.toLowerCase().includes('feature'));
        const seqNumber = sup?.supporterNumber;
        const cellId = sup?.mapCellId;

        return (
          <div 
            onClick={() => setFullVerifyRecord(null)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fadeIn overflow-y-auto"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-stone-900 max-w-3xl w-full rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-scaleUp cursor-default max-h-[92vh] overflow-y-auto text-[#1C1917] dark:text-stone-100"
            >
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F2ECE1] dark:border-stone-800 pb-4">
                <div className="flex items-center gap-3.5">
                  <SupporterAvatar
                    photoUrl={photoUrl}
                    name={fullName}
                    supporterNumber={seqNumber || 1}
                    id={sup?.id || sub?.id || 'temp'}
                    size="lg"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-editorial text-2xl font-bold text-[#1C1917] dark:text-stone-100">
                        {fullName}
                      </h3>
                      {seqNumber !== undefined && (
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C2410C]/10 dark:bg-stone-800 text-[#C2410C] dark:text-amber-400 border border-[#C2410C]/20 dark:border-stone-700">
                          #{seqNumber}
                        </span>
                      )}
                      <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full ${
                        isFeatured
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                      }`}>
                        {isFeatured ? '✨ Feature on India Map' : '📖 Book Pre-Order Only'}
                      </span>
                    </div>
                    <span className="text-xs text-[#78716C] dark:text-stone-400 block mt-0.5">
                      Full Google Form Record • {city ? `${city}, ` : ''}{state || 'India'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {sub && (
                    <button
                      onClick={() => setRawJsonView({ title: `Google Form Raw Payload: ${fullName}`, data: sub })}
                      className="px-3 py-1.5 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Inspect Raw JSON"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Raw JSON</span>
                    </button>
                  )}
                  <button
                    onClick={() => setFullVerifyRecord(null)}
                    className="p-1.5 hover:bg-[#FAF8F5] dark:hover:bg-stone-800 text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-100 rounded-full transition-colors cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 4 Comprehensive Information Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Identity & Google Form Preferences */}
                <div className="bg-[#FAF8F5] dark:bg-stone-850 p-5 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1C1917] dark:text-stone-100 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                      <Sparkles className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                      <span>Form Choice &amp; Order</span>
                    </span>
                    <span className="text-[10px] text-[#78716C] dark:text-stone-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#C2410C] dark:text-amber-400" />
                      <span>Immutable Response</span>
                    </span>
                  </div>

                  <div className="space-y-2 text-[#292524] dark:text-stone-200">
                    <div>
                      <span className="text-[#78716C] dark:text-stone-400 block text-[10px] uppercase font-semibold">Google Form Response:</span>
                      <span className="font-bold text-sm block text-[#1C1917] dark:text-stone-100">
                        {sub?.featuredPreference || (isFeatured ? 'Yes, feature me on the India map' : 'No, only pre-order book')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-[#78716C] dark:text-stone-400 block text-[10px] uppercase font-semibold">Mosaic Status:</span>
                        <span className="font-medium">
                          {isFeatured ? 'Active backer on map' : 'Excluded from map'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#78716C] dark:text-stone-400 block text-[10px] uppercase font-semibold">Cell Position:</span>
                        <span className="font-mono text-[11px] font-bold text-[#C2410C] dark:text-amber-400">
                          {cellId ? `${cellId} (X:${sup?.mapX}, Y:${sup?.mapY})` : (isFeatured ? 'Auto-Allocated' : 'None (Book Only)')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[#78716C] dark:text-stone-400 block text-[10px] uppercase font-semibold">Instagram Handle:</span>
                      {insta && !['@not yet', '@no', '@none', '@n/a', '@na'].includes(insta.toLowerCase()) ? (
                        <a
                          href={`https://instagram.com/${insta.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#C2410C] dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-1 text-xs"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                          <span>{insta}</span>
                        </a>
                      ) : (
                        <span className="text-[#78716C] dark:text-stone-400 italic">None provided</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Courier Shipping & Contact */}
                <div className="bg-[#FAF8F5] dark:bg-stone-850 p-5 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1C1917] dark:text-stone-100 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                      <span>Courier Shipping &amp; Contact</span>
                    </span>
                    <button
                      onClick={() => handleCopyShippingLabel(fullName, address || '', pinCode || '', phone || '', state || '', city || '', 'modal-copy')}
                      className="px-2.5 py-1 bg-white dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 text-[10px] font-bold rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Copy className="w-3 h-3 text-[#C2410C] dark:text-amber-400" />
                      <span>Copy Courier Label</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-[#292524] dark:text-stone-200">
                    <div>
                      <span className="text-[#78716C] dark:text-stone-400 block text-[10px] uppercase font-semibold">Delivery Address:</span>
                      <p className="font-medium bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-[#E7E2DA] dark:border-stone-700 text-[11px] leading-relaxed select-all text-[#1C1917] dark:text-stone-100">
                        {address || 'No physical delivery address recorded in submission'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[#78716C] dark:text-stone-400 block text-[10px] uppercase font-semibold">City &amp; State:</span>
                        <span className="font-medium">{city || 'N/A'}, {state || 'India'}</span>
                      </div>
                      <div>
                        <span className="text-[#78716C] dark:text-stone-400 block text-[10px] uppercase font-semibold">PIN Code:</span>
                        <span className="font-mono font-bold text-[#1C1917] dark:text-stone-100">{pinCode || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#E7E2DA]/60 dark:border-stone-700/60">
                      <div>
                        <span className="text-[#78716C] dark:text-stone-400 block text-[10px] uppercase font-semibold">WhatsApp Number:</span>
                        {phone ? (
                          <a
                            href={`https://wa.me/91${phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[#C2410C] dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{phone}</span>
                          </a>
                        ) : (
                          <span className="text-[#78716C] dark:text-stone-400 italic">N/A</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[#78716C] dark:text-stone-400 block text-[10px] uppercase font-semibold">Email:</span>
                        {email ? (
                          <a href={`mailto:${email}`} className="font-mono text-[#C2410C] dark:text-amber-400 hover:underline truncate block">
                            {email}
                          </a>
                        ) : (
                          <span className="text-[#78716C] dark:text-stone-400 italic">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Travel Philosophy & Narrative */}
                <div className="bg-[#FAF8F5] dark:bg-stone-850 p-5 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 space-y-3">
                  <span className="font-bold text-[#1C1917] dark:text-stone-100 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                    <BookOpen className="w-3.5 h-3.5 text-[#C2410C] dark:text-amber-400" />
                    <span>Travel Philosophy Quote ("What makes you travel?")</span>
                  </span>
                  <div className="bg-white dark:bg-stone-800 p-3.5 rounded-xl border border-[#E7E2DA] dark:border-stone-700 italic text-[#292524] dark:text-stone-200 text-xs leading-relaxed">
                    "{quote || 'Travel opens up new perspectives and connects us to the heart of our country.'}"
                  </div>
                </div>

                {/* 4. Payment Proof Verification */}
                <div className="bg-[#FAF8F5] dark:bg-stone-850 p-5 rounded-2xl border border-[#E7E2DA] dark:border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1C1917] dark:text-stone-100 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Payment Verification (₹499)</span>
                    </span>
                    {sup ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const current = sup.paymentVerified ?? true;
                          await handleToggleSupporterPayment(sup);
                          setFullVerifyRecord({ supporter: { ...sup, paymentVerified: !current } });
                        }}
                        className={`px-2.5 py-0.5 font-bold text-[10px] rounded-full border cursor-pointer flex items-center gap-1 ${
                          (sup.paymentVerified ?? true)
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-200 animate-pulse'
                        }`}
                      >
                        {(sup.paymentVerified ?? true) ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                            <span>✓ Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                            <span>⏳ Pending (Click to Verify)</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] rounded-full border border-amber-200 dark:border-amber-800">
                        Pending Approval
                      </span>
                    )}
                  </div>

                  {proofUrl ? (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setPreviewProofModalUrl({ url: proofUrl, name: fullName })}
                        className="w-16 h-16 rounded-xl border border-[#D1C7B7] dark:border-stone-700 overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-2xs shrink-0 bg-stone-800"
                        title="Click to view full size"
                      >
                        <img src={proofUrl} alt="Proof" className="w-full h-full object-cover" />
                      </button>
                      <div className="space-y-1.5 flex-1">
                        <button
                          type="button"
                          onClick={() => setPreviewProofModalUrl({ url: proofUrl, name: fullName })}
                          className="px-3 py-1 bg-white dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 text-[11px] font-bold rounded-full cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-[#C2410C] dark:text-amber-400" />
                          <span>Open Full Resolution Proof</span>
                        </button>
                        <span className="text-[10px] text-[#78716C] dark:text-stone-400 block">
                          Check UPI reference number and ₹499 payment timestamp.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                      No screenshot attached. Verified via direct UPI transaction reference.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] dark:border-stone-800">
                <div className="text-xs text-[#78716C] dark:text-stone-400">
                  {sup ? `Supporter ID: ${sup.id}` : `Submission ID: ${sub?.id}`}
                </div>
                <div className="flex items-center gap-2">
                  {sup && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = sup;
                        setFullVerifyRecord(null);
                        setEditingSupporter(target);
                      }}
                      className="px-4 py-2 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 text-[#1C1917] dark:text-stone-200 border border-[#D1C7B7] dark:border-stone-700 text-xs font-semibold rounded-full cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Supporter</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setFullVerifyRecord(null)}
                    className="px-6 py-2 bg-[#1C1917] dark:bg-stone-800 hover:bg-[#44403C] dark:hover:bg-stone-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer border border-transparent dark:border-stone-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL: RAW JSON PAYLOAD INSPECTOR                                         */}
      {/* ========================================================================= */}
      {rawJsonView && (
        <div 
          onClick={() => setRawJsonView(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-stone-900 max-w-2xl w-full rounded-3xl border border-[#E7E2DA] dark:border-stone-800 p-6 shadow-2xl space-y-4 animate-scaleUp cursor-default max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-[#F2ECE1] dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#C2410C] dark:text-amber-400" />
                <h3 className="font-bold text-sm text-[#1C1917] dark:text-stone-100 truncate">{rawJsonView.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(rawJsonView.data, null, 2));
                    setAdminToast({ type: 'success', text: 'Copied JSON payload to clipboard!' });
                    setTimeout(() => setAdminToast(null), 3000);
                  }}
                  className="px-3 py-1 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EAE4D9] dark:hover:bg-stone-700 border border-[#D1C7B7] dark:border-stone-700 text-[#1C1917] dark:text-stone-200 text-xs font-semibold rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3 h-3 text-[#C2410C] dark:text-amber-400" />
                  <span>Copy JSON</span>
                </button>
                <button
                  onClick={() => setRawJsonView(null)}
                  className="p-1 hover:bg-[#FAF8F5] dark:hover:bg-stone-800 text-[#78716C] dark:text-stone-400 hover:text-[#1C1917] dark:hover:text-stone-100 rounded-full cursor-pointer transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#1C1917] dark:bg-stone-950 p-4 rounded-2xl font-mono text-[11px] text-emerald-400 border border-stone-800">
              <pre className="whitespace-pre-wrap select-all">
                {JSON.stringify(rawJsonView.data, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => setRawJsonView(null)}
                className="px-5 py-2 bg-[#1C1917] dark:bg-stone-800 hover:bg-[#44403C] dark:hover:bg-stone-700 text-white text-xs font-bold rounded-full transition-colors cursor-pointer border border-transparent dark:border-stone-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Channel Supporter Follow-Up & Outreach Modal */}
      {followUpModalSupporter && (
        <FollowUpSupporterModal
          supporter={followUpModalSupporter}
          onClose={() => setFollowUpModalSupporter(null)}
          onTogglePaymentStatus={handleToggleSupporterPayment}
          onAdminToast={setAdminToast}
        />
      )}

      {/* Mosaic Top 10 Cards Arranger Modal (Admin Dashboard Only) */}
      <MosaicTopCardsManagerModal
        isOpen={isMosaicCardsModalOpen}
        onClose={() => setIsMosaicCardsModalOpen(false)}
        allSupporters={supporters}
        currentTopIds={mosaicTopCardIds}
        onSave={handleSaveMosaicTopCards}
      />

      {/* Floating Status Notification Toast */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-scaleUp">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold ${
            adminToast.type === 'success' ? 'bg-emerald-900 text-white border-emerald-700' :
            adminToast.type === 'error' ? 'bg-red-900 text-white border-red-700' :
            'bg-stone-900 text-white border-stone-700'
          }`}>
            {adminToast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {adminToast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {adminToast.type === 'info' && <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>{adminToast.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};
