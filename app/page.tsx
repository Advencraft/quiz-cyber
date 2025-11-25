"use client"

import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  useEffect(() => {
    async function fetchQuestion() {
      const { data, error } = await supabase
        .from('question')
        .select('*')
        .limit(1);

      if (error) console.error(error);
      else console.log(data);
    }

    fetchQuestion();
  }, []);

  return <h1>Bienvenue sur CyberQuiz</h1>;
}