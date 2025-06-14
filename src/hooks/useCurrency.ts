
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useCurrency() {
  const [currency, setCurrency] = useState<string>('USD');
  const { userProfile } = useAuth();

  const fetchCurrency = async () => {
    if (!userProfile?.company_id) {
      const stored = localStorage.getItem('app_currency') || 'USD';
      setCurrency(stored);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('currency')
        .eq('id', userProfile.company_id)
        .single();

      if (data?.currency) {
        setCurrency(data.currency);
        localStorage.setItem('app_currency', data.currency);
      }
    } catch (error) {
      console.error('Error fetching currency:', error);
    }
  };

  useEffect(() => {
    fetchCurrency();
  }, [userProfile?.company_id]);

  return { currency, refetchCurrency: fetchCurrency };
}
