"use client"

import { useEffect, useState, useRef } from 'react';

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <body className={theme}>
      { pages === 'profil' ?(
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
      ) : null }
    </body>
  );
}