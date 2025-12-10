"use client"

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
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
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function Home() {
  // --------------------------------------------------------- various variables --------------------------------------------------------- //
  const [theme, setTheme] = useState('light');
  const [pages, setPages] = useState('login');

  // ------------------------------------------------------- various functionality ------------------------------------------------------- //
  function changeTheme() {
    if (theme === 'light') return () => setTheme('dark');
    else if (theme === 'dark') return () => setTheme('light');
  };

  function changePages(page: string) {
    if (pages === page) return;
    if (page === 'questionnaire') reloadQuestion();
    setPages(page);
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
  async function sha256(message: string) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder('utf-8').encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    // console.log(hashHex);
    return hashHex;
  }
  
  // -------------------------------------------------------- login functionality -------------------------------------------------------- //
  const [PageUser, setPageUser] = useState('Login');
  const [Joueur, setJoueur] = useState<any[]>([]);

  const login_email = useRef<any>(null);
  const login_MDP = useRef<any>(null);
  
  const Registre_Pseudo = useRef<any>(null);
  const Registre_email = useRef<any>(null);
  const Registre_MDP = useRef<any>(null);
  const Registre_Verif_MDP = useRef<any>(null);

  // Erreur possible :
  // - false
  // - Erreur lors de l\'inscription:
  // - Utilisateur non trouvé
  // - Utilisateur déjà existant
  // - Mot de passe incorrect
  // - Les mots de passe ne correspondent pas
  // - Informations manquante
  // - Pseudo déjà utilisé
  const [Erreur_Formulaire_inscription, setErreur_Formulaire_inscription] = useState<any>('false');

  // ---------------------------------------------------------- login variables ---------------------------------------------------------- //
  function LoginOrRegister(param: string) {
    if (PageUser !== param){
      setPageUser(param);
      setErreur_Formulaire_inscription('false');
    }
  }

  async function fetchJoueurExist(EMail: string) {
    const { data, error } = await supabase
      .from('joueur')
      .select(` id, email, MDP_Hash, pseudo, date_inscription, Administrateur `)
      .eq('email', EMail);
    if (error) console.error(error);
    else return (data || []);
  }
  
  async function fetchPseudoExist(Pseudo: string) {
    const { data, error } = await supabase
      .from('joueur')
      .select(` id `)
      .eq('pseudo', Pseudo);
    if (error) console.error(error);
    else return (data || []);
  }

  function ConnexionReussi(){
    setErreur_Formulaire_inscription('false');
    setPages('profil');
  }
  
  function Déconnexion(){
    setPages('login');
    setJoueur([]);
  }

  async function getLogin(e: React.FormEvent<HTMLFormElement>) {
    let EMail = login_email.current.value;
    let MDP = await sha256(login_MDP.current.value);
    setErreur_Formulaire_inscription('false');

    console.log('\nMail: ' + EMail);
    console.log('MDP: ' + MDP);

    e.preventDefault();

    fetchJoueurExist(EMail).then((data: any) => {
      setJoueur(data);
      console.log(data);
      if (data.length === 0){
        console.log('Utilisateur non trouvé');
        setErreur_Formulaire_inscription('Utilisateur non trouvé');
        return;
      } else if (data[0].MDP_Hash !== MDP){
        console.log('Mot de passe incorrect');
        setErreur_Formulaire_inscription('Mot de passe incorrect');
        return;
      } else {
        console.log('Connexion réussie');
        ConnexionReussi();
      }
    });

  }

  async function getRegistrationUser(e: React.FormEvent<HTMLFormElement>) {
    // source : 
    // https://momentjs.com/
    const the_Date = new Date();
    const Date_now = moment(the_Date).format('YYYY-MM-DD');
    // ------------------------------------------------------------------------------
    let Pseudo = Registre_Pseudo.current.value;
    let EMail = Registre_email.current.value;
    let MDP = await sha256(Registre_MDP.current.value);
    let V_MDP = await sha256(Registre_Verif_MDP.current.value);
    setErreur_Formulaire_inscription('false');

    console.log('\nMail: ' + EMail);
    console.log('MDP: ' + MDP);
    console.log('V_MDP: ' + MDP);
    console.log('Pseudo: ' + Pseudo);
    console.log('Date: ' + Date_now);

    e.preventDefault();

    
    fetchJoueurExist(EMail).then((data: any) => {
      fetchPseudoExist(Pseudo).then((data: any) => {
        if (data.length > 0){
          console.log('Pseudo déjà utilisé');
          setErreur_Formulaire_inscription('Pseudo déjà utilisé');
          return;
        }
      });
      if (Erreur_Formulaire_inscription === 'Pseudo déjà utilisé') {
        return;
      }
      if (data.length > 0){
        console.log('Utilisateur déjà existant');
        setErreur_Formulaire_inscription('Utilisateur déjà existant');
        return;
      } else if (Pseudo === '' || EMail === '' || Registre_MDP.current.value === '' || Registre_Verif_MDP.current.value === ''){
        console.log('Informations manquante');
        setErreur_Formulaire_inscription('Informations manquante');
        return;
      } else if (MDP !== V_MDP){
        console.log('Les mots de passe ne correspondent pas');
        setErreur_Formulaire_inscription('Les mots de passe ne correspondent pas');
        return;
      } else {
        supabase
          .from('joueur')
          .insert([{ pseudo: Pseudo, email: EMail, MDP_Hash: MDP, date_inscription: Date_now}])
          .then(({ data, error }) => {
            if (error) {
              console.error('Erreur lors de l\'inscription:', error);
              setErreur_Formulaire_inscription('Erreur lors de l\'inscription:');
              return;
            } 
            else {
              fetchJoueurExist(EMail).then((data: any) => {
                setJoueur(data);
                console.log(data);
                if (data.length === 0){
                  console.log('Utilisateur non trouvé');
                  setErreur_Formulaire_inscription('Utilisateur non trouvé');
                  return;
                } else if (data[0].MDP_Hash !== MDP){
                  console.log('Mot de passe incorrect');
                  setErreur_Formulaire_inscription('Mot de passe incorrect');
                  return;
                } else {
                  console.log('Connexion réussie');
                  ConnexionReussi();
                }
              });
            }
          });
      }
      setJoueur(data[0]);
      console.log(Joueur);
    });

  }

  // ------------------------------------------------------ Questionnaire variables ------------------------------------------------------ //
  const [Classement, setClassement] = useState<any[]>([]);

  // --------------------------------------------------- Questionnaire functionality ----------------------------------------------------- //
  useEffect(() => {
    async function fetchClassement() {
      const { data, error } = await supabase
        .from('classement_joueur')
        .select(` id, classements:classement (id, date_partie, score, temps), classements_joueurs:joueur (id, pseudo)`)
        .order('id', { ascending: true });
      if (error) console.error(error);
      else setClassement(data || []);;
    }

    fetchClassement();
  }, []);

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

  // ------------------------------------------------------ menu admin variables -------------------------------------------------------- //
  const [sous_menu, setsous_menu] = useState('Statistique');
  const [joueurs, setjoueurs] = useState<any[]>([]);
  
  const Question_name = useRef<any>(null);
  const Question_proposition1 = useRef<any>(null);
  const Question_proposition2 = useRef<any>(null);
  const Question_proposition3 = useRef<any>(null);
  const Question_correct = useRef<any>(null);
  const Question_niveau = useRef<any>(null);
  const Question_credit_nom = useRef<any>(null);
  const Question_credit_url = useRef<any>(null);
  const Question_explication = useRef<any>(null);

  // ---------------------------------------------------- menu admin functionality ------------------------------------------------------ //
  useEffect(() => {
    async function fetchListUser() {
      const { data, error } = await supabase
        .from('joueur')
        .select(` id, email, MDP_Hash, pseudo, date_inscription, Administrateur `)
        .order('id', { ascending: true });
      if (error) console.error(error);
      else setjoueurs(data || []);
    }

    fetchListUser();
  }, []);

  function menu_admin( Utilisateur : any ){
    if ( Utilisateur.Administrateur == true ){
      return (
        <NavigationMenuLink asChild className={pages === 'Admin' ? 'font-bold underline' : ''} onClick={() => changePages('Admin')}>
          <Label className={navigationMenuTriggerStyle()}>
          Admin
          </Label>
        </NavigationMenuLink>
        );
      }
  }

  async function getRegistrationQuestion(e: React.FormEvent<HTMLFormElement>) {
    let question = Question_name.current.value;
    let prop1 = Question_proposition1.current.value;
    let prop2 = Question_proposition2.current.value;
    let prop3 = Question_proposition3.current.value;
    let correct = Question_correct.current.value;
    let niveau = Question_niveau.current.value;
    let credit_nom = Question_credit_nom.current.value;
    let credit_url = Question_credit_url.current.value;
    let explication = Question_explication.current.value;

    e.preventDefault();
  }


  return (
    <body className={theme}>
      { pages !== 'login' ?(
      <section id="navigation-section" className="flex justify-between items-center p-4 border-b shadow-sm">
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
              
              {Joueur.map((entry) => (
                menu_admin(entry)
                ))
              }

              <NavigationMenuLink asChild>
                <Label htmlFor="theme" className={navigationMenuTriggerStyle()}>
                  <Switch onClick={changeTheme()} id='theme'/>
                  {theme} Mode
                </Label>
              </NavigationMenuLink>

            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </section>) : null }
      { pages === 'questionnaire' ?(
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
      ) : pages === 'classement' ?( 
        Classement ? (
          <section id="classement-section">
            <Card className="max-w-4xl mx-auto mt-10">
              <div className="text-center mt-auto">
                <h2 className="text-2xl font-bold">Classement des Joueurs</h2>
                <p className="mt-4 text-muted-foreground">Voici le classement des joueurs :</p>
                <pre className="mt-6 text-left mx-10">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Joueur</TableHead>
                        <TableHead className="w-[100px]">Score</TableHead>
                        <TableHead className="w-[100px]">Temps</TableHead>
                        <TableHead className="w-[100px]">Date de la Partie</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Classement.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell >{entry.classements_joueurs.pseudo}</TableCell >
                          <TableCell >{entry.classements.score}</TableCell >
                          <TableCell >{entry.classements.temps}</TableCell >
                          <TableCell >{new Date(entry.classements.date_partie).toLocaleDateString()}</TableCell >
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </pre>
              </div>
            </Card>
          </section>
        ) : (
          chargement('classement')
        )
      ) : pages === 'profil' ?(
        <section  id="profil-section">
          <Card className="max-w-80 mx-auto mt-40">
            <CardTitle className="mx-auto" >
              Information sur le compte :
            </CardTitle>
            {Joueur.map((entry) => (
              <div className='mx-auto'>
                <div className='mt-2'>Id : {entry.id}<br></br></div>
                <div className='mt-2'>Pseudo : {entry.pseudo}<br></br></div>
                <div className='mt-2'>Email : {entry.email}<br></br></div>
                <div className='mt-2'>Date d'inscription : {entry.date_inscription}<br></br></div>
                <Button
                  className='mt-2 w-[100%]'
                  variant={'destructive'} 
                  onClick={() => Déconnexion()}>
                  Déconnexion
                </Button>
              </div>
            ))}
          </Card>
        </section>
      ) : pages === 'login' ?(
        <section id="login-section">
            <Card className="max-w-80 mx-auto mt-40">
              <div className="flex mx-5">
                <div className="w-1/2">
                  <Button className='w-[100%]' onClick={() => LoginOrRegister('Login')} variant={PageUser !== 'Login' ? 'link' : 'secondary'}>Se Connecter</Button>
                </div>
                <div className="w-1/2">
                  <Button className='w-[100%]' onClick={() => LoginOrRegister('Register')} variant={PageUser !== 'Register' ? 'link' : 'secondary'}>s'inscrire</Button>
                </div>
              </div>
              {
              PageUser === 'Login' ?(
                <form method="post" onSubmit={getLogin} className='mx-auto w-[75%]'>
                  <Label className='mt-3' htmlFor="email">Email</Label>
                  <Input type="email" placeholder="Email" id="email" ref={login_email}/>
                  { Erreur_Formulaire_inscription === 'Utilisateur non trouvé' ? (<Alert className="mt-1 bg-red-50 border-red-300 text-red-800"><AlertDescription>{Erreur_Formulaire_inscription}</AlertDescription></Alert>) : null}
                  <Label className='mt-3' htmlFor="password">Mot de passe</Label>
                  <Input type="password" placeholder="password" id="password" ref={login_MDP}/>
                  { Erreur_Formulaire_inscription === 'Mot de passe incorrect' ? (<Alert className="mt-1 bg-red-50 border-red-300 text-red-800"><AlertDescription>{Erreur_Formulaire_inscription}</AlertDescription></Alert>) : null}
                  { Erreur_Formulaire_inscription === 'Erreur lors de l\'inscription:' ? (<Alert className="mt-1 bg-red-50 border-red-300 text-red-800"><AlertDescription>{Erreur_Formulaire_inscription}</AlertDescription></Alert>) : null}
                  <Button className='mx-auto w-[100%] mt-3' type='submit'>Connexion</Button>
                </form>
              ): PageUser === 'Register' ?(
                <form method="post" onSubmit={getRegistrationUser} className='mx-auto w-[75%]'>
                  { Erreur_Formulaire_inscription === 'Informations manquante' ? (<Alert className="mt-1 bg-red-50 border-red-300 text-red-800"><AlertDescription>{Erreur_Formulaire_inscription}</AlertDescription></Alert>) : null}
                  <Label className='mt-3' htmlFor="pseudo">pseudo</Label>
                  <Input type="text" placeholder="Pseudo" id="pseudo" ref={Registre_Pseudo}/>
                  { Erreur_Formulaire_inscription === 'Pseudo déjà utilisé' ? (<Alert className="mt-1 bg-red-50 border-red-300 text-red-800"><AlertDescription>{Erreur_Formulaire_inscription}</AlertDescription></Alert>) : null}
                  <Label className='mt-3' htmlFor="email">Email</Label>
                  <Input type="email" placeholder="Email" id="email" ref={Registre_email}/>
                  { Erreur_Formulaire_inscription === 'Utilisateur déjà existant' ? (<Alert className="mt-1 bg-red-50 border-red-300 text-red-800"><AlertDescription>{Erreur_Formulaire_inscription}</AlertDescription></Alert>) : null}
                  <Label className='mt-3' htmlFor="password">Mot de passe</Label>
                  <Input type="password" placeholder="password" id="password" ref={Registre_MDP}/>
                  <Label className='mt-3' htmlFor="vpassword">vérification de mot de passe</Label>
                  <Input type="password" placeholder="verification password" id="vpassword" ref={Registre_Verif_MDP}/>
                  { Erreur_Formulaire_inscription === 'Les mots de passe ne correspondent pas' ? (<Alert className="mt-1 bg-red-50 border-red-300 text-red-800"><AlertDescription>{Erreur_Formulaire_inscription}</AlertDescription></Alert>) : null}
                  { Erreur_Formulaire_inscription === 'Mot de passe incorrect' ? (<Alert className="mt-1 bg-red-50 border-red-300 text-red-800"><AlertDescription>{Erreur_Formulaire_inscription}</AlertDescription></Alert>) : null}
                  { Erreur_Formulaire_inscription === 'Erreur lors de l\'inscription:' ? (<Alert className="mt-1 bg-red-50 border-red-300 text-red-800"><AlertDescription>{Erreur_Formulaire_inscription}</AlertDescription></Alert>) : null}
                  <Button className='mx-auto w-[100%] mt-3'>s'inscrire</Button>
                </form>
              ):(null)}
            </Card>
        </section>
      ) : pages === 'Admin' ?(
          <section id='admin-section' >
            <div id="Admin-menu-section" className='fixed w-[15%]'>
              <Card className='h-screen p-5 rounded-none shadow-none'>
                <Button className={sous_menu === 'Statistique' ? 'font-bold underline' : ''} onClick={() => setsous_menu('Statistique')}>Statistique</Button> 
                <Button className={sous_menu === 'Questions' ? 'font-bold underline' : ''} onClick={() => setsous_menu('Questions')}>Éditeur de Questions</Button> 
                <Button className={sous_menu === 'utilisateur' ? 'font-bold underline' : ''} onClick={() => setsous_menu('utilisateur')}>Gestionnaire d'utilisateur</Button> 
              </Card>
            </div>
            <div id='Admin-panel-section' className='fixed w-[85%] h-screen ml-[15%]'>
              <Card className="max-w-auto w-[90%] mx-auto p-5 mt-[1%]">
                <h1><b>{sous_menu} :</b></h1>
                { sous_menu === 'Statistique' ?(
                  <section id='Statistique-section'>
                  </section>
                ) : sous_menu === 'Questions' ?(
                  <section id='Questions-section'>
                    <form method="post" onSubmit={getRegistrationQuestion}>
                      <Label className='mt-3 pb-2' htmlFor="Question_name">Question :</Label>
                      <Input type="text" placeholder="Question posé" id="Question_name" ref={Question_name}/>

                      <Label className='mt-3 pb-2' htmlFor="Question_proposition1">Proposition n°1 :</Label>
                      <Input type="text" placeholder="Choix possible n°1" id="Question_proposition1" ref={Question_proposition1}/>
                      
                      <Label className='mt-3 pb-2' htmlFor="Question_proposition2">Proposition n°2 :</Label>
                      <Input type="text" placeholder="Choix possible n°2" id="Question_proposition2" ref={Question_proposition2}/>
                      
                      <Label className='mt-3 pb-2' htmlFor="Question_proposition3">Proposition n°3 :</Label>
                      <Input type="text" placeholder="Choix possible n°3" id="Question_proposition3" ref={Question_proposition3}/>
                      
                      <Label className='mt-3 pb-2' htmlFor="Question_correct">N° de la proposition correct :</Label>
                      <Input type="number" min="1" max="3" placeholder="Rentrer le numero de la proposition rentrer précédemment étant correct" id="Question_correct" ref={Question_correct}/>
                    
                      <Label className='mt-3 pb-2' htmlFor="Question_explication">Explication de la Réponse :</Label>
                      <Textarea placeholder="Réponse explicative" id="Question_explication" ref={Question_explication}/>

                      <Button className='mx-auto w-[100%] mt-3' type='submit'>Enregistrement de la question</Button>
                    </form>
                  </section>
                ) : sous_menu === 'utilisateur' ?(
                  joueurs ?(
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className='w-[0%]'>ID</TableHead>
                          <TableHead className='w-[0%]'>pseudo</TableHead>
                          <TableHead className='w-[0%]'>email</TableHead>
                          <TableHead className='w-[0%]'>MDP_Hash</TableHead>
                          <TableHead className='w-[0%]'>date_inscription</TableHead>
                          <TableHead className='w-[0%]'>Administrateur</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {joueurs.map((list_joueur) => (
                        <TableRow key={list_joueur.id}>
                          <TableCell >{list_joueur.id}</TableCell >
                          <TableCell >{list_joueur.pseudo}</TableCell >
                          <TableCell >{list_joueur.email}</TableCell >
                          <TableCell >{list_joueur.MDP_Hash}</TableCell >
                          <TableCell >{list_joueur.date_inscription}</TableCell >
                          <TableCell >{list_joueur.Administrateur == true ?('True'):('Flase')}</TableCell >
                        </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    chargement('classement')
                  )

                ) : null }
              </Card>
            </div>
          </section>
      ) : null }
    </body>
  );
}