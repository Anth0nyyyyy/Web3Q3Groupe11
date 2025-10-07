// /frontend/cypress/e2e/student_join_simple.cy.ts

describe("Scénario d'Inscription Étudiant (Simple)", () => {

    it("devrait permettre à un étudiant de créer un groupe avec succès", () => {
        // --- COLLEZ VOTRE URL DE PARTAGE VALIDE ICI ---
// LIGNE CORRIGÉE
        const shareableUrl = 'http://localhost:5173/join/68e3733a972949799eee5325/9d893a4d9e827f6ca61b6796b7519628'; // Exemple

        // 1. Visiter l'URL de partage
        cy.visit(shareableUrl);

        // 2. Vérifier que la page se charge correctement
        cy.contains('h5', "ProjetJavaB2Q2").should('be.visible');

        // 3. Remplir le formulaire
        cy.get('input[name="lastName"]').type('Test');
        cy.get('input[name="firstName"]').type('Cypress');
        // REMPLACEZ PAR VOTRE VRAI PSEUDO GITHUB
        cy.get('input[name="githubUsername"]').type('Anth0nyyyyy');
        cy.get('input[name="matricule"]').type('la238361');

        // 4. Ajouter le membre
        cy.contains('button', 'Ajouter un membre').click();
        cy.get('.MuiCard-root')
            .should('contain', 'Test')
            .and('contain', 'Cypress');
        // 5. Soumettre le projet
        cy.contains('button', "Créer l'équipe et le dépôt GitHub").click();

        // 6. Vérifier l'écran de succès
        cy.contains('h5', 'Votre dépôt est prêt !').should('be.visible');
        cy.contains('a', 'Accéder au dépôt GitHub').should('have.attr', 'target', '_blank');
    });

});