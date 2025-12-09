"use client"

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Image from 'next/image';
import Link from "next/link";
import moment from 'moment'

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner"
import {Empty,EmptyDescription,EmptyHeader,EmptyMedia,EmptyTitle,} from "@/components/ui/empty"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { NavigationMenuLink } from '@radix-ui/react-navigation-menu';


export default function Questionnaire() {
    
  // ------------------------------------------------------ Questionnaire variables ------------------------------------------------------ //
  const tempsAvantQuestion = 3000;
  const espaceDébut = 5;
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [explication, setExplication] = useState("");
  const [afficherExplication, setAfficherExplication] = useState(false);
  const [boutonProchaineQuestion, setboutonProchaineQuestion] = useState(true);
  const [réponseDonné, setréponseDonné] = useState(-1);
  const [questionProgress, setquestionProgress] = useState(espaceDébut);
  const [questionRépondue, setquestionRépondue] = useState(false);
  const question = questions[questionIndex];
  
  // --------------------------------------------------- Questionnaire functionality ----------------------------------------------------- //
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
    setquestionRépondue(false);
  }

  function reloadQuestion() {
    setQuestionIndex(0);
    setquestionProgress(espaceDébut);
  }

  function handleClick(reponse: any) {
    setquestionRépondue(true);
    if (!question || afficherExplication) return;
    const estBonneReponse = reponse.est_correcte;
    setréponseDonné(reponse.id);
    const message = estBonneReponse
      ? "Bonne réponse !"
      : "Mauvaise réponse.";
    if (estBonneReponse === false){
      const explicationTexte = question.explication || message;
      setExplication(explicationTexte);
      setAfficherExplication(true);
    }
    if (estBonneReponse) {
      setboutonProchaineQuestion(false);
    }else {
    setTimeout(() => {
      setboutonProchaineQuestion(false);
    }, tempsAvantQuestion);
    }
  }

  function classRéponse(reponse: any, id: any) {
    if (questionRépondue && id === réponseDonné) {
      if (reponse.est_correcte) return "w-full justify-start mt-2 bg-green-100  border-green-400 text-green-900";
      else                      return "w-full justify-start mt-2 bg-red-100    border-red-400   text-red-900";
    }
    return "w-full justify-start mt-2";
  }

  function chargement(section: string) {
    return (
      <section id="chargement-section">
        <Card className="max-w-4xl mx-auto mt-10">
          <Empty className="w-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Spinner />
              </EmptyMedia>
              <EmptyTitle>Chargement du {section}...</EmptyTitle>
              <EmptyDescription>
                Le Chargement peut durer un certain temps.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Card>
      </section>
    );
  }

  return (
    <body className={theme}>
        <section id="navigation-section" className="flex justify-between items-center p-4 border-b mb-6 shadow-sm">
            <NavigationMenu>
                <NavigationMenuList className="flex-wrap">
                <NavigationMenuItem className='space-x-3'>

                    <NavigationMenuLink asChild className={pages === 'questionnaire' ? 'font-bold underline' : ''} onClick={() => changePages('questionnaire')}>
                    <Label className={navigationMenuTriggerStyle()}>
                    questionnaire
                    </Label>
                    </NavigationMenuLink>

                    <NavigationMenuLink asChild className={pages === 'classement' ? 'font-bold underline' : ''} onClick={() => changePages('classement')}>
                    <Label className={navigationMenuTriggerStyle()}>
                    classement
                    </Label>
                    </NavigationMenuLink>
                    
                    <NavigationMenuLink asChild className={pages === 'profil' ? 'font-bold underline' : ''} onClick={() => changePages('profil')}>
                    <Label className={navigationMenuTriggerStyle()}>
                    profil
                    </Label>
                    </NavigationMenuLink>

                    <NavigationMenuLink asChild>
                    <Label htmlFor="theme" className={navigationMenuTriggerStyle()}>
                        <Switch onClick={changeTheme()} id='theme'/>
                        {theme} Mode
                    </Label>
                    </NavigationMenuLink>

                </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </section>

        <section id="questionnaire-section">
            { !question && questions.length > 0 ? (
            <Card className="text-center mt-45 max-w-4xl mx-auto">
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
            ) : question ? (
            <Card className="max-w-4xl mx-auto mt-10">
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
                        disabled={questionRépondue}
                        className={classRéponse(reponse, reponse.id)}
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
            chargement('question')
            )}
        </section>
    </body>
  );
}