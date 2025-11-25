"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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

  return (
  <div>
    <Alert className="bg-blue-50 border-blue-300 text-blue-800 max-w-xl mx-auto mt-6">
      <AlertTitle className="text-xl font-semibold">Bienvenue sur CyberQuiz</AlertTitle>
      <AlertDescription>
        Préparez-vous à tester vos connaissances !
      </AlertDescription>
    </Alert>
  {question ? (
    <Card className="max-w-xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Question</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{question.texte}</p>
      </CardContent>
    </Card>
  ) : (
      <Empty className="w-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Spinner />
          </EmptyMedia>
          <EmptyTitle>Chargement de la question...</EmptyTitle>
          <EmptyDescription>
            Le Chargement peut durer un certain temps.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )}
  </div>
);

}