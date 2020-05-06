# Déroulement de la partie 

La partie commence : les joueurs choisissent un pseudo et clique sur un bouton "Join game". --> Page home pour choisir le pseudo -> page qui mène à la game.

Le premier joueur à avoir cliqué sur join game est hôte de la partie -> bouton "passer au vote" + bouton "start game"

Chaque joueur à un mot écrit en haut de son écran.

Tous les joueurs ont le même mot sauf un intrus, qui ne sait pas lui-même qu'il est l'intrus.

Les joueurs doivent écrire un mot pour prouver qu'il ne sont pas les intrus.

L'intrus gagne si il n'est pas le plus voté à la fin, sinon les autres joueurs gagnent.

Joueurs max : 8

## Page home

* [ ] Choix du pseudo.

* [ ] Le premier à avoir rentré son pseudo est l'hôte.

* [ ] Si trop de joueurs dans le lobby : Page qui renvoie : partie en cours.

### Spécificités techniques

#### Client : 

Socket on du nombre de joueurs dans la game

Si inférieur à 8 ->
	Socket emit du pseudo du joueur.
		-> Si premier joueur : socket emit spécial, avec désignation de l'hôte.
		-> Pour les 7 autres : socket emit du pseudo seulement.
  
Si 8:
	Render page "lobby plein"
  
Une fois le pseudo rempli:
	Si hote
  	-> Page avec nombre de joueurs + bouton start game
  Sinon
		-> Une page avec waiting + nombre de joueurs en cours

#### Serveur : 

Socket on des pseudos 
-> Socket on spéciale pour le premier joueur : crée la partie, lui assigne le statut d'hôte
-> Socket on qui ajoute les autres joueurs au lobby en cours
-> Socket emit du nombre de personnes dans la game à la suite de ce socket.on
	-> Avec en data le nombre de personnes dans la game et si le mec est hôte ou pas

## Page game

* [ ] Bouton reset en haut à droite : Reset la partie si bug ou autre.

* [ ] Affichage du mot pour le joueur.

* [ ] Rappel des règles en haut de la page.

* [ ] Affichage en ligne de tous les pseudos juste en dessous des règles.

* [ ] Input "écrire un mot" en bas de la page.

* [ ] Bouton "envoyer" juste en dessous.

* [ ] Affichage du mot rentré sous le pseudo du joueur.

* [ ] L'hôte a un bouton "passer au vote" sous le bouton "envoyer"

## Page vote

* [ ] Affichage des pseudos en ligne au milieu/bas de la page.

* [ ] Au dessus de chaque pseudo afficher le nombre de personnes qui ont voté contre ce pseudo (0 au départ)

* [ ] Sous le pseudo un icon "croix" si le joueur n'a pas encore voté ou un icon "validé" si le joueur a voté.

* [ ] Sous cet icon un bouton "voter" qui permettra aux autres joueurs de voter contre ce pseudo.

* [ ] En bas de la page un bouton "confirmer" pour confirmer le vote.

## Page résultats

* [ ] Pseudos alignés avec le nombre de point de chacuns au dessus du pseudo.

* [ ] Message au centre VICTOIRE/DEFAITE.

* [ ] Pseudo de l'intrus

* [ ] Mot de l'intrus.

* [ ] L'autre mot.

* [ ] Un bouton "Nouvelle partie" cliquable par tout le monde