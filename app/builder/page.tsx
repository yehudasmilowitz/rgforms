'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { FormBuilderScreen } from '@/components/FormBuilder';

export default function BuilderPage() {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (state.screen === 'landing') {
      router.push('/');
    }
  }, [state.screen, router]);

  if (state.screen === 'landing') return null;
  return <FormBuilderScreen />;
}
