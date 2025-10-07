// /frontend/cypress/e2e/project_creation.cy.ts

describe('Scénario de Création de Projet', () => {

    // Avant chaque test, on se connecte en tant que professeur
    beforeEach(() => {
        // On visite directement l'URL complète pour plus de robustesse
        cy.visit('http://localhost:5173/login');

        cy.get('input[placeholder="Email"]').type('professeur@helha.be');
        cy.get('input[placeholder="Mot de passe"]').type('password123');
        cy.contains('button', 'Se connecter').click();

        // On s'assure d'être bien arrivé sur le dashboard avant de continuer
        cy.url().should('include', '/dashboard');
        cy.contains('h6', 'Projets').should('be.visible');
    });

    it('devrait permettre à un professeur de créer un nouveau projet', () => {
        // On définit des noms uniques pour chaque test pour éviter les conflits
        const projectName = `Projet Test Cypress ${Date.now()}`;
        const orgName = 'AnThorg'; // Assurez-vous que cette organisation existe

        // 1. L'utilisateur clique sur le bouton pour ouvrir le modal
        cy.contains('button', 'Créer un nouveau projet').click();

        // 2. On vérifie que le modal est bien visible en cherchant son titre
        cy.contains('h2', 'Créer un nouveau projet').should('be.visible');

        // 3. On remplit le formulaire du modal avec des sélecteurs robustes
        // On cherche le 'label' visible par l'utilisateur, on remonte au conteneur parent,
        // puis on trouve l'input à l'intérieur pour y taper le texte.
        cy.contains('label', 'Nom du projet').parent().find('input').type(projectName);
        cy.contains('label', 'Organisation GitHub').parent().find('input').type(orgName);
        cy.contains('label', 'Membres Min.').parent().find('input').clear().type('2');
        cy.contains('label', 'Membres Max.').parent().find('input').clear().type('4');
        cy.contains('label', 'Pattern du nom de dépôt').parent().find('input').clear().type('Cypress-Test-##');

        // On pourrait aussi ajouter un test pour l'upload de fichier :
        // cy.get('input[type="file"]').selectFile('cypress/fixtures/consignes.md');

        // 4. L'utilisateur soumet le formulaire
        cy.contains('button', 'Créer le projet').click();

        // 5. On vérifie que le modal a bien disparu
        cy.contains('h2', 'Créer un nouveau projet').should('not.exist');

        // 6. Assertion finale : on vérifie que le nouveau projet est maintenant visible dans la liste sur le dashboard
        cy.contains('.MuiCardContent-root', projectName).should('be.visible');
    });

});