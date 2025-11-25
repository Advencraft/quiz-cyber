"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [question, setQuestion] = useState<any>(null);
  useEffect(() => {
    async function fetchQuestion() {
      const { data, error } = await supabase
        .from('question')
        .select('*');

      if (error) console.error(error);
      else setQuestion(data[0]); // On stocke la première question dans l’état
    }

    fetchQuestion();
  }, []);

  return question ? (
  <Card className="max-w-xl mx-auto mt-6">
    <CardHeader>
      <CardTitle>Question</CardTitle>
    </CardHeader>
    <CardContent>
      <p>{question.texte}</p>
    </CardContent>
  </Card>
) : (
  <p>Chargement de la question...</p>
);

}