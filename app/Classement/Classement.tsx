"use client"

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner"
import {Empty,EmptyDescription,EmptyHeader,EmptyMedia,EmptyTitle,} from "@/components/ui/empty"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { NavigationMenuLink } from '@radix-ui/react-navigation-menu';
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow} from "@/components/ui/table"

export default function Home() {

  // ------------------------------------------------------- Classement variables ------------------------------------------------------- //
  const [Classement, setClassement] = useState<any[]>([]);

  // ---------------------------------------------------- Classement functionality ------------------------------------------------------ //
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
      
        {Classement ? (
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
        )}
    </body>
  )
}