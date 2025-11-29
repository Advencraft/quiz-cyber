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
import { Progress } from "@/components/ui/progress"

export default function Home() {
  const tempsAvantQuestion = 3000;
  const espaceDébut = 5;
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [explication, setExplication] = useState("");
  const [afficherExplication, setAfficherExplication] = useState(false);
  const [boutonProchaineQuestion, setboutonProchaineQuestion] = useState(true);
  const [réponseDonné, setréponseDonné] = useState(-1);
  const [questionProgress, setquestionProgress] = useState(espaceDébut);

  const question = questions[questionIndex];
  
  useEffect(() => {
    async function fetchQuestion() {
      const { data, error } = await supabase
        .from('question')
        .select(` id, texte, image_url, image_credit_nom, image_credit_url,explication, reponses:reponse (id,texte,est_correcte)`)
        .order('id', { ascending: true });
      if (error) console.error(error);
      else setQuestions(data || []);;
    }

    fetchQuestion();
  }, []);

  function ProchaineQuestion() {
    setAfficherExplication(false);
    setboutonProchaineQuestion(true);
    setExplication("");
    setQuestionIndex((prev) => prev + 1);
    setquestionProgress((100-espaceDébut)-((questionIndex) / questions.length) * (100/questions.length - espaceDébut));
  }

  function reloadQuestion() {
    setQuestionIndex(0);
    setquestionProgress(espaceDébut);
  }

  function handleClick(reponse: any) {
    if (!question || afficherExplication) return;
    const estBonneReponse = reponse.est_correcte;
    setréponseDonné(reponse.id);
    const message = estBonneReponse
      ? "Bonne réponse !"
      : "Mauvaise réponse.";
    const explicationTexte = question.explication || message;
    setExplication(explicationTexte);
    setAfficherExplication(true);
    if (estBonneReponse) {
      setboutonProchaineQuestion(false);
    }else {
    setTimeout(() => {
      setboutonProchaineQuestion(false);
    }, tempsAvantQuestion);
    }
  }

  function classRéponse(reponse: any, afficherExplication: any, id: any) {
    if (afficherExplication && id === réponseDonné) {
      if (reponse.est_correcte) return "w-full justify-start mt-2 bg-green-100  border-green-400 text-green-900";
      else                      return "w-full justify-start mt-2 bg-red-100    border-red-400   text-red-900";
    }
    return "w-full justify-start mt-2";
  }

  if (!question && questions.length > 0) {
    return (
      <Card className="max-w-2xl mx-auto mt-75 p-6">
        <div className="text-center mt-auto">
          <h2 className="text-2xl font-bold">Quiz terminé !</h2>
          <p className="mt-4 text-muted-foreground">Merci d’avoir participé.</p>
          <Button
            onClick={reloadQuestion}
            className="mt-6"
          >
            Recommencer le quiz
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      {question ? (
        <Card className="max-w-4xl mx-auto mt-45">
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
                <CardTitle className="mx-auto" >Question {questionIndex + 1} sur {questions.length}</CardTitle>
                <Progress value={questionProgress} className="w-[90%] mx-auto" />
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-lg font-semibold mb-4">{question.texte}</p>
                {question.reponses.map((reponse: any) => (
                  <Button
                    key={reponse.id}
                    onClick={() => handleClick(reponse)}
                    disabled={afficherExplication}
                    className={classRéponse(reponse, afficherExplication, reponse.id)}
                    variant="outline"
                  >
                    {reponse.texte}
                  </Button>
                ))}
              </CardContent>
              {afficherExplication && (
              <Alert className="mt-6 bg-yellow-50 border-yellow-300 text-yellow-800">
                <AlertTitle>Explication</AlertTitle>
                <AlertDescription>{explication}</AlertDescription>
              </Alert>
              )}
              <div className="text-center mt-6">
                <Button onClick={ProchaineQuestion} hidden={boutonProchaineQuestion}>
                  Prochaine question
                </Button>
              </div>
            </div>
          </div>
        </Card>

      ) : (
        
        <div>
          <Alert className="bg-blue-50 border-blue-300 text-blue-800 max-w-xl mx-auto mt-50">
            <AlertTitle className="text-xl font-semibold">Bienvenue sur CyberQuiz</AlertTitle>
            <AlertDescription>
              Préparez-vous à tester vos connaissances !
            </AlertDescription>
          </Alert>

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
        </div>
      )}
    </div>
  );
}