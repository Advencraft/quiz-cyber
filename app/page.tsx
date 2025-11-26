"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Image from 'next/image';
import Link from "next/link";
// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner"
import {Empty,EmptyDescription,EmptyHeader,EmptyMedia,EmptyTitle,} from "@/components/ui/empty"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [question, setQuestion] = useState<any>(null);
  useEffect(() => {
    async function fetchQuestion() {
      const { data, error } = await supabase
        .from('question')
        .select(` id, texte, image_url, image_credit_nom, image_credit_url, reponses:reponse (id,texte,est_correcte)`)
        .order('id', { ascending: true });
      if (error) console.error(error);
      else setQuestion(data[0]); // On stocke la première question dans l’état
    }

    fetchQuestion();
  }, []);

  function handleClick(reponse: any) {
    if (reponse.est_correcte) {
      alert("Bonne réponse !");
    } else {
      alert("Mauvaise réponse.");
    }
  }

  return (
    <div>
      <Alert className="bg-blue-50 border-blue-300 text-blue-800 max-w-xl mx-auto mt-6">
        <AlertTitle className="text-xl font-semibold">Bienvenue sur CyberQuiz</AlertTitle>
        <AlertDescription>
          Préparez-vous à tester vos connaissances !
        </AlertDescription>
      </Alert>

      {question ? (

        <Card className="max-w-4xl mx-auto mt-6">
          <div className="flex">
            {/* Colonne gauche : image + crédit */}
            <div className="w-1/2 p-4">
              {question.image_url ? (
                <Image
                  src={question.image_url}
                  alt="Illustration de la question"
                  width={400}
                  height={300}
                  className="rounded"
                />
              ) : (
                <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center text-sm text-gray-500 rounded">
                  Aucune image disponible
                </div>
              )}
              {question.image_credit_nom && question.image_credit_url && (
                <Alert className="mt-4 text-sm text-muted-foreground">
                  <AlertDescription>
                    <span className="inline">
                      Image :{" "}
                      <Link
                        href={question.image_credit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-primary"
                      >
                        {question.image_credit_nom}
                      </Link>
                    </span>
                  </AlertDescription>
                </Alert>
              )}

            </div>
            {/* Colonne droite : question + réponses */}
            <div className="w-1/2 p-4">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Question</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-lg font-semibold mb-4">{question.texte}</p>
                {question.reponses.map((reponse: any) => (
                  <Button
                    key={reponse.id}
                    onClick={() => handleClick(reponse)}
                    className="w-full justify-start mt-2"
                    variant="outline"
                  >
                    {reponse.texte}
                  </Button>
                ))}
              </CardContent>
            </div>
          </div>
        </Card>

      ) : (

        <Card className="max-w-4xl mx-auto mt-6">
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
        </Card>


        /*    Seconde proposition du chargement de la page avec des Skeletons
        <Card className="max-w-4xl mx-auto mt-6">
          <div className="flex">
            <div className="w-1/2 p-4">
              <Skeleton className="h-[285px] w-[400px] rounded" />
              <Skeleton className="h-[45px] w-[415px] mt-4 text-sm text-muted-foreground" />
            </div>
            <div className="w-1/2 p-4">
              <Skeleton className="h-[20px] w-[65px] p-0 mb-4" />
              <CardContent className="p-0">
                <Skeleton className="h-[25px] w-[200px] text-lg font-semibold mb-4" />
                <Skeleton className="h-[34px] w-[415px] mt-4 text-sm text-muted-foreground" />
                <Skeleton className="h-[34px] w-[415px] mt-4 text-sm text-muted-foreground" />
                <Skeleton className="h-[34px] w-[415px] mt-4 text-sm text-muted-foreground" />
              </CardContent>
            </div>
          </div>
        </Card>
      */

      )}
    </div>
  );
}