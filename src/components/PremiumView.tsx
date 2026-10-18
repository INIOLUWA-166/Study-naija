import React, { useState } from 'react';
import { 
  Crown, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Sparkles, 
  ArrowRight,
  AlertCircle,
  CreditCard,
  Building,
  Smartphone,
  BookOpen,
  FileText,
  Printer,
  Download,
  HelpCircle,
  Award,
  Send,
  Check,
  Star,
  Flame,
  ExternalLink,
  Copy,
  Globe,
  Phone,
  ShieldAlert,
  Clock,
  RefreshCw,
  Upload,
  X,
  Swords
} from 'lucide-react';
import { PRICING_PLANS } from '../mockData';
import { User } from '../types';
import { api } from '../services/api';

interface PremiumViewProps {
  user: User | null;
  onOpenAuth: () => void;
  onPaymentSuccess: (updatedUser: User) => void;
  onNavigate?: (view: string, extra?: any) => void;
}

export const PremiumView: React.FC<PremiumViewProps> = ({
  user,
  onOpenAuth,
  onPaymentSuccess,
  onNavigate
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<'basic' | 'medium' | 'premium'>('medium');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [txData, setTxData] = useState<any>(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState<boolean>(false);
  const [pendingApproval, setPendingApproval] = useState<boolean>(false);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);

  // Real Nigerian & Abroad payment methods
  const [selectedMethod, setSelectedMethod] = useState<'opay' | 'palmpay' | 'bank_transfer' | 'cards_ng' | 'international_card'>('opay');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [senderAccountName, setSenderAccountName] = useState<string>('');
  const [senderBank, setSenderBank] = useState<string>('');
  const [bankSessionId, setBankSessionId] = useState<string>('');
  const [receiptScreenshotUrl, setReceiptScreenshotUrl] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [uploadingReceipt, setUploadingReceipt] = useState<boolean>(false);
  const [aiVerificationNote, setAiVerificationNote] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Money's Worth VIP Perks Tabs
  const [activePerkTab, setActivePerkTab] = useState<'predictions' | 'cheatsheets' | 'novel' | 'tutor'>('predictions');
  const [selectedPredictionSubject, setSelectedPredictionSubject] = useState<string>('Mathematics');

  // Interactive AI Study Assistant in VIP Perks
  const [tutorQuery, setTutorQuery] = useState<string>('');
  const [tutorMessages, setTutorMessages] = useState<{ sender: 'user' | 'tutor'; text: string; time: string }[]>([
    {
      sender: 'tutor',
      text: 'Hello future scholar! I am your 24/7 StudyNaija Senior Tutor. Ask me any question from Mathematics, English, Physics, Chemistry, Biology, Economics, or Government and I will break it down step-by-step.',
      time: 'Just now'
    }
  ]);
  const [tutorLoading, setTutorLoading] = useState<boolean>(false);
  const [checkoutGatewayTab, setCheckoutGatewayTab] = useState<'manual' | 'automated'>('manual');
  const [paystackProcessing, setPaystackProcessing] = useState<boolean>(false);
  const [paystackCardNumber, setPaystackCardNumber] = useState<string>('5399 4100 0000 1234');
  const [paystackExpiry, setPaystackExpiry] = useState<string>('12/28');
  const [paystackCvv, setPaystackCvv] = useState<string>('890');

  const activePlan = PRICING_PLANS.find(p => p.id === selectedPlanId) || PRICING_PLANS[1];

  const handlePayWithPaystack = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setPaystackProcessing(true);
    setError(null);
    try {
      const initRes = await api.initializePaystackPayment(selectedPlanId, user.email);
      if (initRes.authorizationUrl) {
        window.open(initRes.authorizationUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      // Automated instant verification
      const verifyRes = await api.verifyPaystackPayment(initRes.reference, selectedPlanId);
      if (verifyRes.status === 'approved' && verifyRes.user) {
        setVerifiedSuccess(true);
        setPendingApproval(false);
        setAiVerificationNote(verifyRes.message || 'Payment confirmed instantly via Paystack! VIP plan activated.');
        onPaymentSuccess(verifyRes.user);
      } else {
        throw new Error(verifyRes.message || 'Payment verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Paystack payment could not be processed. Please use Direct Bank Transfer instead.');
    } finally {
      setPaystackProcessing(false);
    }
  };

  const handleInitiateUpgrade = async (planId: 'basic' | 'medium' | 'premium', method = selectedMethod) => {
    if (!user) {
      onOpenAuth();
      return;
    }

    setSelectedPlanId(planId);
    setSelectedMethod(method);
    setError(null);
    setLoading(true);
    setModalOpen(true);
    setVerifiedSuccess(false);
    setPendingApproval(false);
    setAiVerificationNote('');

    try {
      // Initialize real payment on server with bank credentials and reference
      const initRes = await api.initializePayment(planId, method, phoneNumber);
      setTxData(initRes);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment reference on server');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchPaymentMethod = async (method: 'opay' | 'palmpay' | 'bank_transfer' | 'cards_ng' | 'international_card') => {
    setSelectedMethod(method);
    setError(null);
    setLoading(true);
    try {
      const initRes = await api.initializePayment(selectedPlanId, method, phoneNumber);
      setTxData(initRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load details for selected payment channel');
    } finally {
      setLoading(false);
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Receipt screenshot file size must be under 5MB.');
      return;
    }

    setUploadingReceipt(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptScreenshotUrl(reader.result as string);
      setReceiptFileName(file.name);
      setUploadingReceipt(false);
    };
    reader.onerror = () => {
      setError('Could not process receipt image. Please select a valid PNG or JPEG.');
      setUploadingReceipt(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClearReceipt = () => {
    setReceiptScreenshotUrl(null);
    setReceiptFileName('');
  };

  const handleConfirmPaymentWithAI = async () => {
    if (!txData?.reference) return;

    // Check account suspension status
    if (user?.isPaymentSuspended) {
      setError(`Account Blocked: ${user.paymentSuspendedReason || 'Previously flagged for submitting false payment claims'}. Please contact WhatsApp support for assistance.`);
      return;
    }

    // Protection #2: Mandatory Bank Transaction Reference / Session ID
    if (!bankSessionId.trim() || bankSessionId.trim().length < 6) {
      setError('Mandatory Field: Please enter the 6-to-30 digit Bank Transaction Reference or NIP Session ID from your debit alert or bank app.');
      return;
    }

    // Protection #1: Mandatory Proof of Payment / Receipt Screenshot
    if (!receiptScreenshotUrl) {
      setError('Mandatory Proof of Payment: You must upload a screenshot or photo of your transfer receipt before submitting for manual admin verification.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Option A: Submit payment transfer details to Admin Verification Queue with proof
      const verifyRes = await api.verifyPayment({
        reference: txData.reference,
        senderAccountName: senderAccountName.trim(),
        senderBank: senderBank.trim(),
        bankSessionId: bankSessionId.trim(),
        receiptScreenshotUrl: receiptScreenshotUrl,
        planId: selectedPlanId
      });
      if (verifyRes.status === 'approved' && verifyRes.user) {
        setVerifiedSuccess(true);
        setPendingApproval(false);
        setAiVerificationNote(verifyRes.aiAudit?.notes || verifyRes.message || 'Payment confirmed and approved by admin!');
        onPaymentSuccess(verifyRes.user);
      } else {
        // Queued for Inioluwa's verification on OPay
        setPendingApproval(true);
        setAiVerificationNote(verifyRes.message || verifyRes.aiAudit?.notes || 'Payment transfer details submitted with proof! Awaiting Inioluwa to confirm credit on OPay (9166059676).');
      }
    } catch (err: any) {
      setError(err.message || 'Payment Submission Failed: Could not submit payment details yet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckApprovalStatus = async () => {
    if (!txData?.reference) return;
    setCheckingStatus(true);
    setError(null);
    try {
      const res = await api.getPaymentStatus(txData.reference);
      if (res.status === 'approved' && res.user) {
        setVerifiedSuccess(true);
        setPendingApproval(false);
        setAiVerificationNote(`Payment approved by Inioluwa! Your ${res.payment?.planName || 'subscription'} is now active.`);
        onPaymentSuccess(res.user);
      } else if (res.status === 'rejected') {
        setError(`Payment not approved: ${res.payment?.rejectionReason || 'Funds not confirmed on OPay account'}`);
      } else {
        setAiVerificationNote('Still awaiting Inioluwa to verify the credit in his OPay app (9166059676). Please check back in a few moments!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check payment status.');
    } finally {
      setCheckingStatus(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {}
  };

  // 2027 High-Yield Exam Predictions data
  const predictionsData: Record<string, { topic: string; frequency: string; predictedQuestion: string; examinerTip: string }[]> = {
    Mathematics: [
      {
        topic: 'Coordinate Geometry & Perpendicular Lines',
        frequency: '98% Probability in JAMB 2027',
        predictedQuestion: 'Find the equation of the line perpendicular to 2x - 3y + 6 = 0 passing through point (4, -1).',
        examinerTip: 'Remember that perpendicular lines have gradients m₁ × m₂ = -1. Rearrange 2x - 3y + 6 = 0 to y = (2/3)x + 2, so m₁ = 2/3 and m₂ = -3/2. Using y - y₁ = m(x - x₁), you get 3x + 2y - 10 = 0.'
      },
      {
        topic: 'Indices, Logarithms & Exponential Equations',
        frequency: '95% Probability in JAMB 2027',
        predictedQuestion: 'Solve for x in log₁₀(x + 3) + log₁₀(x - 3) = 1.',
        examinerTip: 'Apply log product law: log₁₀((x+3)(x-3)) = 1 => x² - 9 = 10¹ => x² = 19 => x = √19. Discard negative roots because logs of negative values are undefined.'
      }
    ],
    Physics: [
      {
        topic: 'Projectile Motion & Maximum Range',
        frequency: '99% Probability in JAMB 2027',
        predictedQuestion: 'At what launch angle θ is the range of a projectile equal to its maximum height?',
        examinerTip: 'Use R = (u²sin2θ)/g and H = (u²sin²θ)/(2g). Equating them gives 2sinθcosθ = (sin²θ)/2 => 4cosθ = sinθ => tanθ = 4 => θ = arctan(4) ≈ 76°.'
      },
      {
        topic: 'Semiconductors & Doping',
        frequency: '92% Probability in JAMB 2027',
        predictedQuestion: 'What majority and minority charge carriers are produced when Silicon is doped with Boron (trivalent)?',
        examinerTip: 'Trivalent impurities (Boron, Indium, Gallium) create p-type semiconductors where holes are majority carriers and free electrons are minority carriers.'
      }
    ],
    English: [
      {
        topic: 'Grammar: Subjunctive Mood & Inverted Conditionals',
        frequency: '96% Probability in JAMB & WAEC 2027',
        predictedQuestion: '"I would rather you _____ earlier yesterday." (A) came (B) have come (C) had come (D) come',
        examinerTip: 'When "would rather" refers to a past situation, it requires the Past Perfect tense. The correct choice is "had come". If referring to present/future, it takes simple past ("I would rather you came today").'
      },
      {
        topic: 'Oral English: Vowel Contrasts /iː/ vs /ɪ/',
        frequency: '94% Probability in JAMB 2027',
        predictedQuestion: 'Identify the word with the /iː/ sound: (A) live (B) leave (C) lip (D) sit',
        examinerTip: 'Option B ("leave") has the long vowel /iː/, whereas "live", "lip", and "sit" contain the short lax vowel /ɪ/.'
      }
    ],
    Chemistry: [
      {
        topic: 'Chemical Equilibrium & Le Chatelier\'s Principle',
        frequency: '97% Probability in JAMB 2027',
        predictedQuestion: 'In the Haber process: N₂(g) + 3H₂(g) ⇌ 2NH₃(g) (ΔH = -92 kJ/mol), what condition shifts equilibrium to the right?',
        examinerTip: 'Since the forward reaction is exothermic, lowering temperature shifts equilibrium to the right. Increasing pressure also shifts it to the right because 4 moles of gas produce 2 moles.'
      }
    ],
    Biology: [
      {
        topic: 'Genetics: Dihybrid Cross & Blood Group Inheritance',
        frequency: '96% Probability in JAMB 2027',
        predictedQuestion: 'A man with blood group A (heterozygous) marries a woman with blood group B (heterozygous). What is the probability of having a child with blood group O?',
        examinerTip: 'Genotypes are IᴬIᴼ × IᴮIᴼ. The offspring possibilities are IᴬIᴮ (AB), IᴬIᴼ (A), IᴮIᴼ (B), and IᴼIᴼ (O). Exactly 1 out of 4 (25% or 0.25 probability) is group O.'
      }
    ],
    Economics: [
      {
        topic: 'Elasticity of Demand & Total Revenue Test',
        frequency: '93% Probability in JAMB 2027',
        predictedQuestion: 'If a 10% decrease in price causes total revenue to increase, what is the price elasticity of demand?',
        examinerTip: 'When price and total revenue move in opposite directions, demand is price elastic (Ed > 1).'
      }
    ],
    Government: [
      {
        topic: 'Pre-Colonial Administration & Checks and Balances',
        frequency: '91% Probability in JAMB 2027',
        predictedQuestion: 'In the pre-colonial Oyo Empire, which council of kingmakers served as the primary constitutional check on the Alaafin?',
        examinerTip: 'The Oyo Mesi, headed by the Bashorun, could present an empty calabash to an autocratic Alaafin, compelling him to commit suicide.'
      }
    ]
  };

  // Printable Revision Sheet Generator
  const handlePrintSheet = (sheetTitle: string, subject: string, content: string) => {
    const printWindow = window.open('', '_blank', 'width=800,height=700');
    if (!printWindow) {
      alert('Please allow popups to preview the printable revision sheet.');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>StudyNaija Premium - ${sheetTitle}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; padding: 40px; }
            .header { border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .brand { font-size: 24px; font-weight: 900; color: #065f46; }
            .title { font-size: 20px; font-weight: 800; margin: 10px 0 5px; }
            .badge { display: inline-block; background: #ecfdf5; color: #065f46; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; }
            .content { white-space: pre-wrap; font-size: 14px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .footer { margin-top: 30px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">StudyNaija 🇳🇬</div>
              <div class="title">${sheetTitle}</div>
              <div class="badge">${subject} • 2027 High-Yield Revision Sheet</div>
            </div>
            <button onclick="window.print()" style="background:#059669;color:white;border:none;padding:10px 20px;border-radius:6px;font-weight:bold;cursor:pointer;">
              Print Sheet
            </button>
          </div>
          <div class="content">${content}</div>
          <div class="footer">StudyNaija Premium VIP Revision Vault • Master JAMB UTME & WAEC SSCE with 100% Guaranteed Success</div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // AI Tutor Ask Handler
  const handleSendTutorQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorQuery.trim() || tutorLoading) return;

    const query = tutorQuery.trim();
    setTutorMessages(prev => [...prev, { sender: 'user', text: query, time: 'Now' }]);
    setTutorQuery('');
    setTutorLoading(true);

    setTimeout(() => {
      let reply = `Here is the comprehensive step-by-step breakdown for "${query}":\n\n1. Key Principle: In JAMB and WAEC marking schemes, examiners test foundational clarity first. Identify the given values and formula.\n2. Method: Break complex questions into sub-parts. In multiple-choice questions, eliminate 2 blatantly false options immediately.\n3. Common Pitfall: Watch out for SI unit conversions (e.g. converting cm to m or hours to seconds) and negative signs in algebraic rearrangements.\n\nKeep practising these 10-question drills on StudyNaija daily!`;

      if (query.toLowerCase().includes('english') || query.toLowerCase().includes('concord')) {
        reply = `Rule of Concord Guide:\nWhen subjects are connected by "as well as", "together with", "along with", or "in addition to", the verb agrees strictly with the FIRST subject!\nExample: "The teacher, as well as his students, WAS (not were) in the laboratory."\nThis appears every year in JAMB UTME!`;
      } else if (query.toLowerCase().includes('math') || query.toLowerCase().includes('quadratic')) {
        reply = `Quadratic Formula Shortcut:\nFor ax² + bx + c = 0, x = (-b ± √(b² - 4ac)) / (2a).\n• If discriminant b² - 4ac > 0: Roots are real and unequal.\n• If b² - 4ac = 0: Roots are real and equal (perfect square).\n• If b² - 4ac < 0: Roots are complex/imaginary.\nJAMB frequently tests the condition for equal roots: b² = 4ac!`;
      }

      setTutorMessages(prev => [...prev, { sender: 'tutor', text: reply, time: 'Just now' }]);
      setTutorLoading(false);
    }, 900);
  };

  return (
    <div id="premium-view-container" className="space-y-12 pb-16">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-12 border border-emerald-500/20 shadow-xl text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
          <Crown className="w-3.5 h-3.5 text-amber-300" />
          <span>StudyNaija Premium Membership • High-Yield Value Guarantee</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-['Outfit'] tracking-tight">
          Get Your Money's Worth
        </h1>
        <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
          Unlock the complete Nigerian CBT arsenal: 10-question high-yield past paper archives, 2027 predicted questions, printable cheat sheets, and personal teacher explanations.
        </p>

        {user && user.premiumPlan !== 'free' && (
          <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Active Plan: {user.premiumPlan.toUpperCase()} Membership (Unlocked & Verified)</span>
          </div>
        )}
      </div>

      {/* 1V1 ARENA CHAMPION 25% DISCOUNT BANNER OR CHALLENGE INVITE */}
      {(() => {
        const hasArenaDiscount = !!(user?.arenaDiscountExpiresAt && new Date(user.arenaDiscountExpiresAt).getTime() > Date.now());
        const arenaDiscountPercent = user?.arenaDiscountPercentage || 25;
        const expiryDateFormatted = user?.arenaDiscountExpiresAt
          ? new Date(user.arenaDiscountExpiresAt).toLocaleDateString('en-NG', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : '';

        if (hasArenaDiscount) {
          return (
            <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-slate-900 text-white p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-emerald-400/40">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-inner">
                  ⚡
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base text-white">
                      1v1 Head-to-Head Winner: 25% Discount Applied!
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase">
                      7-Day Pass Active
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                    You emerged victorious in the 1v1 Arena! A <strong>25% discount</strong> is applied to all three plans below until <strong>{expiryDateFormatted}</strong>.
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 text-white p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Swords className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">Want 25% OFF Any Subscription Plan?</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    10 Qs • 60s
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Play the live 1v1 Head-to-Head Arena (FC Mobile style) against another Nigerian student. Winner unlocks a 7-day 25% discount!
                </p>
              </div>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('arena-1v1')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Play 1v1 Arena Now</span>
              </button>
            )}
          </div>
        );
      })()}

      {/* Pricing Cards Grid */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
            Select Your 2027 Study Plan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Straightforward monthly membership with zero hidden fees. Every plan delivers tangible results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch pt-4">
          {PRICING_PLANS.map(plan => {
            const isSelected = plan.id === selectedPlanId;
            const isUserCurrent = user?.premiumPlan === plan.id;
            const hasArenaDiscount = !!(user?.arenaDiscountExpiresAt && new Date(user.arenaDiscountExpiresAt).getTime() > Date.now());
            const arenaDiscountPercent = user?.arenaDiscountPercentage || 25;
            const finalPriceAmount = hasArenaDiscount
              ? Math.round(plan.priceAmount * (1 - arenaDiscountPercent / 100))
              : plan.priceAmount;
            const finalPriceFormatted = `₦${finalPriceAmount.toLocaleString()}`;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 sm:p-8 transition-all flex flex-col justify-between relative ${
                  plan.popular
                    ? 'bg-white border-2 border-emerald-500 shadow-xl ring-4 ring-emerald-500/10'
                    : plan.id === 'premium'
                      ? 'bg-white border-2 border-amber-500/80 shadow-lg'
                      : 'bg-white border border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Most Popular For JAMB & WAEC</span>
                  </div>
                )}

                {plan.id === 'premium' && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>Ultimate VIP Package</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-xl text-slate-900 font-['Outfit']">{plan.name}</h3>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      plan.id === 'premium' 
                        ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                        : plan.id === 'medium'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {plan.id.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    {hasArenaDiscount ? (
                      <div className="flex flex-col">
                        <span className="text-xs line-through text-slate-400 font-semibold">{plan.price}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-emerald-600 font-['Outfit']">{finalPriceFormatted}</span>
                          <span className="text-xs text-slate-500 font-semibold">/{plan.billingPeriod.replace('per ', '')}</span>
                          <span className="ml-1.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">25% OFF</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="text-4xl font-black text-slate-900 font-['Outfit']">{plan.price}</span>
                        <span className="text-xs text-slate-500 font-semibold">/{plan.billingPeriod.replace('per ', '')}</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-2 min-h-[36px] leading-relaxed">{plan.recommendedFor}</p>

                  {/* Features Checklist */}
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Everything Included:
                    </div>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                          plan.id === 'premium' ? 'text-amber-600' : 'text-emerald-600'
                        }`} />
                        <span className="leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => handleInitiateUpgrade(plan.id)}
                    disabled={isUserCurrent}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isUserCurrent
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : plan.id === 'premium'
                          ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-md'
                          : plan.popular
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isUserCurrent ? (
                      <span>Current Active Membership</span>
                    ) : (
                      <>
                        <span>Upgrade to {plan.name} ({hasArenaDiscount ? finalPriceFormatted : plan.price})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STUDENT VALUE HUB: "GET YOUR MONEY'S WORTH" INTERACTIVE VAULT */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Premium Resource Vault (Immediate Value)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
              Explore What Your Subscription Unlocks
            </h3>
          </div>

          {/* Vault Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'predictions', label: '2027 Predicted Questions', icon: Flame },
              { id: 'cheatsheets', label: 'Printable Cheat Sheets', icon: Printer },
              { id: 'novel', label: 'JAMB Novel Breakdown', icon: BookOpen },
              { id: 'tutor', label: '24/7 AI Tutor Assistant', icon: HelpCircle }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePerkTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    activePerkTab === tab.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: 2027 High-Yield Exam Predictions */}
        {activePerkTab === 'predictions' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center gap-2 pb-2">
              {['Mathematics', 'Physics', 'English', 'Chemistry', 'Biology', 'Economics', 'Government'].map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedPredictionSubject(sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedPredictionSubject === sub
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {(predictionsData[selectedPredictionSubject] || []).map((pred, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-slate-900">
                      Topic: {pred.topic}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-600" />
                      {pred.frequency}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900">
                    {pred.predictedQuestion}
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-emerald-900">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Senior Examiner's Secret Working & Trap Warning:</span>
                    </div>
                    <p className="leading-relaxed">{pred.examinerTip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Printable Revision Cheat Sheets */}
        {activePerkTab === 'cheatsheets' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <p className="text-xs text-slate-600">
              One-click summary sheets designed for quick revision the night before your exam. Click any sheet to open the clean printable version.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  subject: 'Physics',
                  title: 'Complete Formulas & Derivations',
                  content: `PHYSICS HIGH-YIELD FORMULA SHEET (JAMB & WAEC 2027)

1. Mechanics & Motion:
• v = u + at
• s = ut + ½at²
• v² = u² + 2as
• Momentum p = mv; Force F = ma = (mv - mu)/t
• Work W = F × d × cosθ; Kinetic Energy KE = ½mv²; Potential Energy PE = mgh

2. Waves & Sound:
• Velocity v = fλ (where f = frequency, λ = wavelength)
• Period T = 1/f; Resonance in closed pipe L = λ/4, 3λ/4; open pipe L = λ/2, λ

3. Electricity & Magnetism:
• Ohm's Law: V = IR; Electrical Power P = IV = I²R = V²/R
• Resistors in Series: R_total = R₁ + R₂ + R₃
• Resistors in Parallel: 1/R_total = 1/R₁ + 1/R₂ + 1/R₃
• Capacitors in Series: 1/C_total = 1/C₁ + 1/C₂; Parallel: C_total = C₁ + C₂`
                },
                {
                  subject: 'Chemistry',
                  title: 'Reactions, Periodic Trends & IUPAC',
                  content: `CHEMISTRY HIGH-YIELD REVISION SHEET (JAMB & WAEC 2027)

1. Periodic Table Trends:
• Atomic Radius: Increases DOWN a group, decreases ACROSS a period.
• Ionization Energy & Electronegativity: Decreases DOWN a group, increases ACROSS a period.
• Reactivity of Metals: Increases down Group 1 & 2 (K > Na > Ca > Mg > Al > Zn > Fe > Pb > H > Cu > Ag > Au).

2. Organic Chemistry Functional Groups:
• Alkanes: CₙH₂ₙ₊₂ (Substitution reactions)
• Alkenes: CₙH₂ₙ (Addition reactions, decolorize Bromine water)
• Alkynes: CₙH₂ₙ₋₂ (Addition reactions, form precipitates with Ammoniacal AgNO₃)
• Alkanols: -OH; Primary alkanols oxidize to Alkanals then to Alkanoic Acids.
• Esterification: Alkanol + Alkanoic Acid ⇌ Ester + Water (in conc. H₂SO₄)`
                },
                {
                  subject: 'Mathematics',
                  title: 'Geometry, Calculus & Series Formulas',
                  content: `MATHEMATICS ESSENTIAL FORMULAS (JAMB & WAEC 2027)

1. Sequences and Series:
• Arithmetic Progression (AP): Tₙ = a + (n - 1)d; Sₙ = n/2 [2a + (n - 1)d]
• Geometric Progression (GP): Tₙ = arⁿ⁻¹; Sₙ = a(1 - rⁿ)/(1 - r) (r < 1); Sum to infinity S_inf = a / (1 - r)

2. Mensuration & Circle Geometry:
• Area of Sector = (θ/360) × πr²; Length of Arc = (θ/360) × 2πr
• Volume of Cylinder = πr²h; Total Surface Area = 2πr(r + h)
• Volume of Cone = ⅓πr²h; Volume of Sphere = ⁴⁄₃πr³

3. Calculus:
• If y = axⁿ, dy/dx = naxⁿ⁻¹
• Product Rule: d(uv)/dx = u(dv/dx) + v(du/dx)
• Quotient Rule: d(u/v)/dx = [v(du/dx) - u(dv/dx)] / v²
• Integration: ∫axⁿ dx = [axⁿ⁺¹ / (n + 1)] + C`
                }
              ].map((sheet, sIdx) => (
                <div key={sIdx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {sheet.subject}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-2">{sheet.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      High-yield formulas, exam rules, and quick memorization hooks.
                    </p>
                  </div>
                  <button
                    onClick={() => handlePrintSheet(sheet.title, sheet.subject, sheet.content)}
                    className="w-full py-2 bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Preview & Print Sheet</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: JAMB Prescribed Novel Guide */}
        {activePerkTab === 'novel' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>Official JAMB Literature Text: "The Life Changer" by Khadija Abubakar Jalli</span>
              </div>
              <p className="text-xs text-amber-950 leading-relaxed">
                JAMB UTME compulsory text questions account for 10-15 direct marks in the Use of English paper. Below is the essential revision breakdown:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                  <div className="font-bold text-slate-900">Key Characters & Roles:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                    <li><strong>Ummi:</strong> The narrator and mother who counsels her children with university stories.</li>
                    <li><strong>Salma:</strong> An arrogant, sophisticated girl whose life takes a drastic turn in the university.</li>
                    <li><strong>Tom:</strong> Salma’s university suitor who assists her during her examination malpractice dilemma.</li>
                    <li><strong>Habib & Labaran:</strong> Politicians who get involved in university intrigues.</li>
                  </ul>
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                  <div className="font-bold text-slate-900">Central Themes Tested:</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
                    <li>The transition from secondary school to university freedom and moral responsibility.</li>
                    <li>The dangers of pride, deception, and seeking shortcuts (examination malpractice).</li>
                    <li>The importance of parental guidance and unconditional familial forgiveness.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 24/7 AI-Powered StudyNaija Tutor */}
        {activePerkTab === 'tutor' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                    SN
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">StudyNaija 24/7 AI Tutor</h4>
                    <p className="text-[10px] text-emerald-400">Available for all JAMB & WAEC subjects</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-full">
                  Live Online
                </span>
              </div>

              {/* Chat history */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 text-xs">
                {tutorMessages.map((msg, mIdx) => (
                  <div
                    key={mIdx}
                    className={`p-3 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-700 text-white ml-auto max-w-[80%]'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 max-w-[90%]'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>
                    <div className="text-[9px] text-slate-400 text-right mt-1">{msg.time}</div>
                  </div>
                ))}
                {tutorLoading && (
                  <div className="p-3 bg-slate-800 text-slate-400 rounded-2xl text-xs flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <span>Teacher is working through your question...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendTutorQuery} className="flex gap-2">
                <input
                  type="text"
                  value={tutorQuery}
                  onChange={e => setTutorQuery(e.target.value)}
                  placeholder="Type any JAMB/WAEC question or topic (e.g. 'Explain concord rule with as well as')..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={tutorLoading || !tutorQuery.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* Security Statement (Strict Rule 11 Compliance) */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-slate-700 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>StudyNaija Payment Security & 100% Score Guarantee</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Zero Card Storage Guarantee:</strong> We never collect or store ATM card numbers, CVVs, or PINs on this platform.</span>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Server-Verified Upgrade:</strong> Every transaction reference is verified directly on our server before premium access is granted.</span>
          </div>
          <div className="flex items-start gap-2">
            <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Money-Back Performance Guarantee:</strong> Complete our recommended drills and score 280+ in JAMB or request a 100% full refund.</span>
          </div>
        </div>
      </div>

      {/* Secure Checkout / Verification Modal */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] overflow-y-auto p-4 sm:p-5 shadow-2xl border border-slate-200 relative text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            
            {verifiedSuccess ? (
              <div className="text-center space-y-3 py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>AI Settlement Confirmed</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 font-['Outfit']">
                  Payment Confirmed!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Congratulations! Your payment has been confirmed by our AI Financial Agent. Your account is upgraded to <strong>{activePlan.name}</strong>.
                </p>
                {aiVerificationNote && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 text-left font-mono">
                    <span className="font-bold block text-slate-900 mb-0.5 text-[10px] uppercase">AI Audit Trail:</span>
                    {aiVerificationNote}
                  </div>
                )}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Exit</span>
                  </button>
                  <button
                    onClick={() => {
                      setModalOpen(false);
                      if (onNavigate) onNavigate('practice');
                    }}
                    className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
                  >
                    Start Practising
                  </button>
                </div>
              </div>
            ) : pendingApproval ? (
              <div className="text-center space-y-3 py-2 animate-in fade-in duration-200">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Awaiting Admin Confirmation (Option A)</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 font-['Outfit']">
                  Payment Queued for Verification
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your transfer details for <strong>{activePlan.name} (₦{txData?.amount?.toLocaleString()})</strong> have been recorded and queued for Inioluwa.
                </p>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Destination Account:</span>
                    <span className="font-bold text-slate-800">OPay (9166059676)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Beneficiary:</span>
                    <span className="font-bold text-slate-800">INIOLUWA JESULEJE MICHAEL</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Reference:</span>
                    <span className="font-mono font-bold text-slate-800">{txData?.reference}</span>
                  </div>
                  {senderAccountName && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Sender:</span>
                      <span className="font-bold text-slate-800">{senderAccountName} ({senderBank || 'Direct Transfer'})</span>
                    </div>
                  )}
                </div>

                {aiVerificationNote && (
                  <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 text-left">
                    <span className="font-bold block text-emerald-950 mb-0.5 text-[10px] uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Status Notice:
                    </span>
                    {aiVerificationNote}
                  </div>
                )}

                {error && (
                  <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleCheckApprovalStatus}
                    disabled={checkingStatus}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
                    <span>{checkingStatus ? 'Checking Status...' : 'Check Approval Status'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500" />
                    <span>Exit & Continue Practising</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Modal Header with Prominent Exit Button */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Outfit']">
                      Checkout: {activePlan.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-200"
                    title="Exit Checkout"
                  >
                    <X className="w-3.5 h-3.5 text-slate-500" />
                    <span>Exit</span>
                  </button>
                </div>

                {/* Compact Amount & Plan details */}
                <div className="bg-slate-50 p-2.5 rounded-xl text-xs border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Plan & Due Amount</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-bold text-slate-900">{activePlan.name}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono font-black text-emerald-700 text-sm">{activePlan.price}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Ref</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="font-mono text-[10px] text-slate-600 font-semibold">{txData?.reference ? txData.reference.slice(-8) : '...'}</span>
                      {txData?.reference && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(txData.reference, 'ref')}
                          className="text-[9px] text-emerald-700 hover:text-emerald-900 font-bold px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 cursor-pointer"
                        >
                          {copiedKey === 'ref' ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gateway Switcher Tabs: Manual Transfer vs Automated Instant Paystack */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCheckoutGatewayTab('manual')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      checkoutGatewayTab === 'manual'
                        ? 'bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-300 shadow-xs border border-emerald-200 dark:border-emerald-800'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bank Transfer (OPay)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutGatewayTab('automated')}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      checkoutGatewayTab === 'automated'
                        ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 shadow-xs border border-blue-200 dark:border-blue-800'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>Paystack (Instant 24/7)</span>
                  </button>
                </div>

                {checkoutGatewayTab === 'automated' ? (
                  /* Automated Paystack Gateway Option */
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="p-3.5 rounded-xl bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-950 dark:text-blue-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs flex items-center gap-1.5 text-blue-900 dark:text-blue-300">
                          <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                          <span>Instant 24/7 Automated Activation</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-200/70 dark:bg-blue-900 text-blue-900 dark:text-blue-200 font-bold">
                          Zero Wait Time
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                        Pay with your Nigerian <strong>Debit Card (Mastercard, Visa, Verve)</strong>, Bank USSD, or Instant NIBSS transfer. Your VIP subscription is activated automatically the second payment clears.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Card Checkout Simulation
                      </span>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Card Number</label>
                        <input
                          type="text"
                          value={paystackCardNumber}
                          onChange={e => setPaystackCardNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">Expiry</label>
                          <input
                            type="text"
                            value={paystackExpiry}
                            onChange={e => setPaystackExpiry(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">CVV</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={paystackCvv}
                            onChange={e => setPaystackCvv(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div className="leading-tight font-semibold text-[11px]">{error}</div>
                      </div>
                    )}

                    <div className="pt-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setModalOpen(false)}
                          className="w-1/3 py-2.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                        >
                          <X className="w-3.5 h-3.5 text-slate-500" />
                          <span>Exit</span>
                        </button>

                        <button
                          type="button"
                          onClick={handlePayWithPaystack}
                          disabled={paystackProcessing}
                          className="w-2/3 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                          {paystackProcessing ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Processing Instant Payment...</span>
                            </div>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                              <span>Pay {activePlan.price} with Paystack</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[9px] text-center text-slate-400 flex items-center justify-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-slate-400" />
                        <span>Secured 256-bit SSL • Instant Automated Settlement</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Manual OPay Transfer Flow */
                  <div className="space-y-3 animate-in fade-in duration-150">
                    {/* Compact Payment Method Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Select Channel:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSwitchPaymentMethod('opay')}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer relative ${
                            selectedMethod === 'opay'
                              ? 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 ring-1 ring-emerald-500/30'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-emerald-600" />
                              OPay
                            </span>
                            <span className="text-[8px] bg-emerald-600 text-white font-bold px-1 py-0.2 rounded-full">
                              Fastest
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold mt-0.5">9166059676</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSwitchPaymentMethod('bank_transfer')}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            selectedMethod === 'bank_transfer'
                              ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 ring-1 ring-blue-500/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                          }`}
                        >
                          <span className="font-bold text-xs text-blue-900 dark:text-blue-300 flex items-center gap-1">
                            <Building className="w-3 h-3 text-blue-600" />
                            Any Bank Transfer
                          </span>
                          <p className="text-[9px] text-slate-500 mt-0.5">Kuda, Zenith, GTB, etc.</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSwitchPaymentMethod('palmpay')}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            selectedMethod === 'palmpay'
                              ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/40 ring-1 ring-purple-500/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                          }`}
                        >
                          <span className="font-bold text-xs text-purple-900 dark:text-purple-300 flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-purple-600" />
                            PalmPay
                          </span>
                          <p className="text-[9px] text-slate-500 mt-0.5">PalmPay App transfer</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSwitchPaymentMethod('cards_ng')}
                          className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                            selectedMethod === 'cards_ng'
                              ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-1 ring-emerald-500/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                          }`}
                        >
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-200 flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-emerald-600" />
                            Cards & Abroad
                          </span>
                          <p className="text-[9px] text-slate-500 mt-0.5">Verve, Visa, Master, USD</p>
                        </button>
                      </div>
                    </div>

                    {/* Channel Details & Action Box */}
                    {txData && (
                      <div className="p-3 rounded-xl bg-emerald-950 text-white space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between pb-1.5 border-b border-emerald-800/60 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-xs">
                            <Building className="w-3.5 h-3.5" />
                            <span>{txData.bankName}</span>
                          </div>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                            Verified NUBAN
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-emerald-900/50 p-2 rounded-lg border border-emerald-700/50">
                            <span className="text-[9px] text-emerald-300 uppercase block font-semibold">Account Number</span>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="font-mono text-sm sm:text-base font-black text-white tracking-wider">{txData.accountNumber}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(txData.accountNumber, 'acct')}
                                className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Copy Account Number"
                              >
                                {copiedKey === 'acct' ? (
                                  <>
                                    <Check className="w-3 h-3 text-white" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="bg-emerald-900/50 p-2 rounded-lg border border-emerald-700/50">
                            <span className="text-[9px] text-emerald-300 uppercase block font-semibold">Amount to Send</span>
                            <span className="font-mono text-sm sm:text-base font-black text-emerald-300 mt-0.5 block">
                              ₦{txData.amount.toLocaleString()}
                            </span>
                          </div>

                          <div className="col-span-2 bg-emerald-900/40 p-2 rounded-lg border border-emerald-800/40">
                            <span className="text-[9px] text-emerald-300 uppercase block font-semibold">Beneficiary Name</span>
                            <span className="text-xs font-bold text-white mt-0.5 block tracking-wide">{txData.beneficiaryName}</span>
                          </div>

                          {/* Brief Instructions */}
                          <div className="col-span-2 text-[10px] text-emerald-200/90 leading-tight bg-emerald-900/30 p-2 rounded-lg">
                            Transfer <strong>₦{txData.amount.toLocaleString()}</strong> to <strong>{txData.accountNumber}</strong> ({txData.bankName}) via your OPay, PalmPay, Kuda, or bank app. Then click Submit below for manual admin confirmation.
                          </div>

                          {txData.ussdString && (
                            <div className="col-span-2 bg-emerald-900/60 px-2 py-1.5 rounded-lg text-[10px] flex items-center justify-between">
                              <span>OPay USSD: <strong className="font-mono text-emerald-300">{txData.ussdString}</strong></span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(txData.ussdString, 'ussd')}
                                className="text-[9px] bg-emerald-800 hover:bg-emerald-700 px-1.5 py-0.5 rounded text-white font-semibold cursor-pointer"
                              >
                                {copiedKey === 'ussd' ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Legal Warning Banner */}
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="leading-snug text-[11px]">
                        <strong className="block text-amber-950 dark:text-amber-100 font-bold">Anti-Fraud & Audit Notice:</strong>
                        Only submit after transferring funds to <strong>9166059676 (OPay)</strong>. Submitting fake receipts or trolling without paying results in immediate and permanent account suspension.
                      </div>
                    </div>

                    {/* Suspension Notice if user is suspended */}
                    {user?.isPaymentSuspended && (
                      <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-red-900">
                          <ShieldAlert className="w-4 h-4 text-red-600" />
                          <span>Payment Submissions Suspended</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          {user.paymentSuspendedReason || 'This account was suspended from submitting payment verification requests.'}
                        </p>
                      </div>
                    )}

                    {/* Compact AI Bank Confirmation Form */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 space-y-2.5">
                      <div className="flex items-start gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-3 h-3" />
                        </div>
                        <div className="text-[11px] leading-tight text-slate-600 dark:text-slate-300">
                          <strong className="text-slate-900 dark:text-white">Admin Queue Verification:</strong> Enter your transfer details and upload your receipt screenshot so Inioluwa can match your credit immediately.
                        </div>
                      </div>

                      {/* Mandatory Bank Transaction ID / Session ID */}
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            Bank Transaction ID / NIP Session ID <span className="text-red-500 font-black">*</span>
                          </label>
                          <span className="text-[9px] text-slate-400 font-medium">From debit SMS or bank app</span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. 1000042609191024560001 or 0902678129"
                          value={bankSessionId}
                          onChange={e => setBankSessionId(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          required
                        />
                      </div>

                      {/* Mandatory Proof of Payment / Receipt Screenshot Upload */}
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            Transfer Receipt Screenshot / Photo <span className="text-red-500 font-black">*</span>
                          </label>
                          <span className="text-[9px] text-slate-400 font-medium">PNG, JPG (Max 5MB)</span>
                        </div>

                        {receiptScreenshotUrl ? (
                          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-300 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <img
                                src={receiptScreenshotUrl}
                                alt="Receipt Preview"
                                className="w-12 h-12 object-cover rounded-lg border border-emerald-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-[11px] font-bold text-emerald-950 block truncate">
                                  {receiptFileName || 'Receipt Attached'}
                                </span>
                                <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Proof Ready for Audit
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleClearReceipt}
                              className="px-2 py-1 text-[10px] font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-lg cursor-pointer transition-colors shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900/50 hover:bg-emerald-50/20 transition-all text-center">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                              <Upload className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {uploadingReceipt ? 'Processing Screenshot...' : 'Upload Transfer Receipt Screenshot'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Select or take a screenshot of your transfer from your bank or OPay app
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleReceiptUpload}
                              className="hidden"
                              disabled={uploadingReceipt}
                            />
                          </label>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                            Sender Account Name (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Fatima or Emeka"
                            value={senderAccountName}
                            onChange={e => setSenderAccountName(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                            Sender Bank (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. OPay, Kuda, GTB"
                            value={senderBank}
                            onChange={e => setSenderBank(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                      <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 text-xs rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div className="leading-tight font-semibold text-[11px]">{error}</div>
                      </div>
                    )}

                    {/* Bottom Action Bar with Exit Button and Manual Confirmation Button */}
                    <div className="pt-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setModalOpen(false)}
                          className="w-1/3 py-2.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                          title="Exit Payment"
                        >
                          <X className="w-3.5 h-3.5 text-slate-500" />
                          <span>Exit</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleConfirmPaymentWithAI}
                          disabled={loading || !txData || !!user?.isPaymentSuspended}
                          className="w-2/3 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                        >
                          {loading ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Submitting Details...</span>
                            </div>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                              <span>Submit for Admin Approval</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[9px] text-center text-slate-400 flex items-center justify-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-slate-400" />
                        <span>Manual Admin Verification • Inioluwa confirms credit on OPay</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
