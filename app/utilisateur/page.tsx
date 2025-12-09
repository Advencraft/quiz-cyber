"use client"

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import moment from 'moment'

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function Login() {

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
    }
    }

    async function fetchJoueurExist(EMail: string) {
    const { data, error } = await supabase
        .from('joueur')
        .select(` id, email, MDP_Hash, pseudo, date_inscription `)
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

    async function getRegistration(e: React.FormEvent<HTMLFormElement>) {
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
            setErreur_Formulaire_inscription('Informations  ');
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

    return (
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
            <form method="post" onSubmit={getRegistration} className='mx-auto w-[75%]'>
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
                { Erreur_Formulaire_inscription === 'Erreur lors de l\'inscription:' ? (<Alert className="mt-1 bg-red-50 border-red-300 text-red-800"><AlertDescription>{Erreur_Formulaire_inscription}</AlertDescription></Alert>) : null}
                <Button className='mx-auto w-[100%] mt-3'>s'inscrire</Button>
            </form>
            ):(null)}
        </Card>
    </section>
    );
}