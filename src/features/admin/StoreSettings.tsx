import React, { useState, useEffect } from 'react';
import { NadhirService } from '../../services/api';
import type { StoreSettings, FAQItem } from '../../types';
import { Save, Plus, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const StoreSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Form state
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubtext, setHeroSubtext] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [contactEmail, setContactEmail] = useState('nadhirthobes@gmail.com');
  const [contactPhone, setContactPhone] = useState('254799999355');
  const [whatsappNumber, setWhatsappNumber] = useState('254799999355');
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/nadhirthobes?igsh=MWdwdTVtM2lidzVj');
  const [tiktokUrl, setTiktokUrl] = useState('https://www.tiktok.com/@nadhirthobes?_r=1&_t=ZS-95JiSygkp2S');
  const [maintenance_mode, setMaintenanceMode] = useState(false);
  const [is_live, setIsLive] = useState(false);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await NadhirService.getStoreSettings();
        if (data) {
          setSettings(data);
          setHeroHeadline(data.hero_headline);
          setHeroSubtext(data.hero_subtext);
          setAboutText(data.about_us_text);
          setContactEmail(data.contact_email);
          setContactPhone(data.contact_phone);
          setWhatsappNumber(data.whatsapp_number);
          setInstagramUrl(data.instagram_url || '');
          setTiktokUrl(data.tiktok_url || '');
          setMaintenanceMode(data.maintenance_mode);
          setIsLive(data.is_live);
          setFaqItems(data.faq_json || []);
        }
      } catch (err: unknown) {
        console.error('Failed to load store settings:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await NadhirService.updateStoreSettings({
        hero_headline: heroHeadline,
        hero_subtext: heroSubtext,
        about_us_text: aboutText,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        whatsapp_number: whatsappNumber,
        instagram_url: instagramUrl,
        tiktok_url: tiktokUrl,
        maintenance_mode: maintenance_mode,
        is_live: is_live,
        faq_json: faqItems,
      });
      setSaveMessage('Settings saved successfully.');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: unknown) {
      setSaveMessage(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const addFaqItem = () => {
    setFaqItems([...faqItems, { question: '', answer: '' }]);
  };

  const removeFaqItem = (index: number) => {
    setFaqItems(faqItems.filter((_, i) => i !== index));
  };

  const updateFaqItem = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqItems];
    updated[index] = { ...updated[index], [field]: value };
    setFaqItems(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-red-50 border border-red-200 p-8 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
        <p className="text-red-700 font-medium">Store settings not found.</p>
        <p className="text-red-500 text-sm mt-2">Run the SQL seed script in the Supabase SQL Editor first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-charcoal/5 pb-8">
        <div>
          <h1 className="text-3xl font-serif text-charcoal tracking-tight">Store Settings</h1>
          <p className="text-charcoal/40 text-sm mt-1">Manage storefront content without touching code.</p>
        </div>
        <Button onClick={handleSave} isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
          Save All Changes
        </Button>
      </div>

      {saveMessage && (
        <div className={`p-4 text-sm border ${saveMessage.includes('success') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {saveMessage}
        </div>
      )}

      {/* Launch Status Toggle */}
      <div className={`p-6 border-2 transition-colors ${!is_live ? 'border-gold/30 bg-gold/5' : 'border-charcoal/5 bg-white'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${!is_live ? 'bg-gold/10 text-gold' : 'bg-charcoal/5 text-charcoal/40'}`}>
              <Save className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-charcoal text-sm">Store Launch Status (is_live)</p>
              <p className="text-xs text-charcoal/40 mt-1">
                When disabled, everyone sees "Coming Soon". When enabled, the site is live (unless Maintenance is on).
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={is_live}
              onChange={(e) => setIsLive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-charcoal/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold" />
          </label>
        </div>
      </div>

      {/* Maintenance Mode Toggle */}
      <div className={`p-6 border-2 transition-colors ${maintenance_mode ? 'border-red-300 bg-red-50/50' : 'border-charcoal/5 bg-white'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${maintenance_mode ? 'text-red-500' : 'text-charcoal/20'}`} />
            <div>
              <p className="font-medium text-charcoal text-sm">Maintenance Mode</p>
              <p className="text-xs text-charcoal/40 mt-1">
                Only visible if the store is LIVE. Shows "Under Maintenance" to visitors.
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={maintenance_mode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-charcoal/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" />
          </label>
        </div>
      </div>

      {/* Hero Section */}
      <fieldset className="space-y-4 bg-white border border-charcoal/5 p-6">
        <legend className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] px-2">Hero Section</legend>
        <Input
          label="Headline"
          value={heroHeadline}
          onChange={(e) => setHeroHeadline(e.target.value)}
          placeholder="Elevate Your Presence."
        />
        <Input
          label="Subtext"
          isTextArea
          rows={3}
          value={heroSubtext}
          onChange={(e) => setHeroSubtext(e.target.value)}
          placeholder="Discover impeccable tailoring..."
        />
      </fieldset>

      {/* Contact Information */}
      <fieldset className="space-y-4 bg-white border border-charcoal/5 p-6">
        <legend className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] px-2">Contact Information</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <Input
            label="Phone Number"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="254799999355"
          />
          <Input
            label="WhatsApp Number"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="254799999355"
          />
        </div>
      </fieldset>

      {/* Social Links */}
      <fieldset className="space-y-4 bg-white border border-charcoal/5 p-6">
        <legend className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] px-2">Social Media</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Instagram URL"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/nadhir"
          />
          <Input
            label="TikTok URL"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            placeholder="https://tiktok.com/@nadhir"
          />
        </div>
      </fieldset>

      {/* About Text */}
      <fieldset className="space-y-4 bg-white border border-charcoal/5 p-6">
        <legend className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] px-2">About Page</legend>
        <Input
          label="About Us Text"
          isTextArea
          rows={8}
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          placeholder="Tell your brand story..."
        />
        <p className="text-[10px] text-charcoal/30 italic">Use blank lines between paragraphs to create visual separation on the About page.</p>
      </fieldset>

      {/* FAQ Editor */}
      <fieldset className="space-y-4 bg-white border border-charcoal/5 p-6">
        <legend className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] px-2">FAQ ({faqItems.length} items)</legend>
        
        <div className="space-y-4">
          {faqItems.map((faq, idx) => (
            <div key={idx} className="border border-charcoal/5 p-4 space-y-3 relative group bg-ivory/30">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-bold text-charcoal/20 uppercase tracking-widest mt-2 shrink-0">Q{idx + 1}</span>
                <div className="flex-grow space-y-3">
                  <input
                    value={faq.question}
                    onChange={(e) => updateFaqItem(idx, 'question', e.target.value)}
                    placeholder="Question..."
                    className="w-full bg-white border border-charcoal/10 p-3 text-sm text-charcoal focus:border-gold outline-none"
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(e) => updateFaqItem(idx, 'answer', e.target.value)}
                    placeholder="Answer..."
                    rows={3}
                    className="w-full bg-white border border-charcoal/10 p-3 text-sm text-charcoal/70 focus:border-gold outline-none resize-y"
                  />
                </div>
                <button
                  onClick={() => removeFaqItem(idx)}
                  className="text-charcoal/20 hover:text-red-500 transition-colors p-1 shrink-0"
                  title="Remove this FAQ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Button variant="secondary" size="sm" onClick={addFaqItem} leftIcon={<Plus className="w-3 h-3" />}>
          Add FAQ Item
        </Button>
      </fieldset>

      {/* Bottom Save */}
      <div className="flex justify-end pt-4 border-t border-charcoal/5">
        <Button onClick={handleSave} isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
          Save All Changes
        </Button>
      </div>
    </div>
  );
};
