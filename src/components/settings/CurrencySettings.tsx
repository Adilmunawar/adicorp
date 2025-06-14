
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { BadgeDollarSign } from "lucide-react";

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
  locale: string;
}

const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', locale: 'ur-PK' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'hi-IN' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', locale: 'de-CH' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', locale: 'en-SG' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', locale: 'en-HK' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', locale: 'sv-SE' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', locale: 'nb-NO' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', locale: 'da-DK' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', locale: 'pl-PL' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', locale: 'cs-CZ' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', locale: 'hu-HU' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', locale: 'ru-RU' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', locale: 'pt-BR' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', locale: 'es-MX' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', locale: 'es-AR' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', locale: 'es-CL' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', locale: 'en-ZA' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', locale: 'tr-TR' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', locale: 'ko-KR' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', locale: 'th-TH' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', locale: 'ms-MY' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', locale: 'id-ID' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', locale: 'fil-PH' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', locale: 'vi-VN' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', locale: 'ar-EG' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', locale: 'ar-SA' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', locale: 'ar-AE' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', locale: 'ar-QA' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', locale: 'ar-KW' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', locale: 'ar-BH' },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼', locale: 'ar-OM' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', locale: 'ar-JO' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: '£', locale: 'ar-LB' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', locale: 'he-IL' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', locale: 'en-NG' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', locale: 'en-GH' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', locale: 'en-KE' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', locale: 'en-UG' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', locale: 'en-TZ' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', locale: 'am-ET' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', locale: 'ar-MA' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', locale: 'ar-TN' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', locale: 'ar-DZ' },
];

export default function CurrencySettings() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrencySettings();
  }, [userProfile?.company_id]);

  const fetchCurrencySettings = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('currency')
        .eq('id', userProfile.company_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching currency settings:', error);
        return;
      }

      if (data?.currency) {
        setSelectedCurrency(data.currency);
      }
    } catch (error) {
      console.error('Error fetching currency settings:', error);
    }
  };

  const handleSave = async () => {
    if (!userProfile?.company_id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ currency: selectedCurrency })
        .eq('id', userProfile.company_id);

      if (error) throw error;

      const currency = CURRENCIES.find(c => c.code === selectedCurrency);
      toast({
        title: "Currency Updated",
        description: `Currency has been changed to ${currency?.name} (${currency?.symbol}).`,
      });

      // Update localStorage for immediate effect
      localStorage.setItem('app_currency', selectedCurrency);
      
      // Trigger a page reload to update all currency displays
      window.location.reload();
    } catch (error) {
      console.error('Error saving currency:', error);
      toast({
        title: "Error",
        description: "Failed to update currency settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrencyInfo = CURRENCIES.find(c => c.code === selectedCurrency);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BadgeDollarSign className="h-5 w-5 mr-2" />
          Currency Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Select Currency</Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="bg-adicorp-dark border-white/10">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto bg-adicorp-dark border-white/10">
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSave}
              disabled={loading}
              className="bg-adicorp-purple hover:bg-adicorp-purple-dark"
            >
              {loading ? 'Saving...' : 'Save Currency'}
            </Button>
          </div>

          <div className="space-y-4">
            {selectedCurrencyInfo && (
              <div className="p-4 bg-adicorp-dark/30 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <BadgeDollarSign className="h-4 w-4 text-adicorp-purple" />
                  <span className="font-medium">Preview</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-white/70">
                    Currency: <span className="text-white font-medium">{selectedCurrencyInfo.name}</span>
                  </p>
                  <p className="text-white/70">
                    Symbol: <span className="text-white font-medium">{selectedCurrencyInfo.symbol}</span>
                  </p>
                  <p className="text-white/70">
                    Code: <span className="text-white font-medium">{selectedCurrencyInfo.code}</span>
                  </p>
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-white/70">
                      Sample: <span className="text-green-400 font-medium">
                        {new Intl.NumberFormat(selectedCurrencyInfo.locale, {
                          style: 'currency',
                          currency: selectedCurrencyInfo.code,
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(50000)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-xs text-blue-300">
                <strong>Note:</strong> Changing currency will update how amounts are displayed throughout the application. The page will refresh to apply changes immediately.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
