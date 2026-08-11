// /backend/src/models/Group.model.ts
import { Schema, model } from 'mongoose';

// CORRECTION : On importe tous nos types depuis le dossier partagé
import type { IGroup, ITeamMember } from '@shared/types/index.ts';


// Un sous-schéma pour les membres. Il est lié à l'interface importée.
const memberSchema = new Schema<ITeamMember>({
    lastName: { type: String, required: true },
    firstName: { type: String, required: true },
    githubUsername: { type: String, required: true },
    matricule: { type: String, required: true },
}, { _id: false });

// Le schéma principal, lié à l'interface IGroup importée.
const groupSchema = new Schema<IGroup>({
    name: { type: String, required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    members: [memberSchema],
    repoUrl: { type: String },
}, { timestamps: true });

// Le modèle est lié à l'interface IGroup.
const Group = model<IGroup>('Group', groupSchema);

export default Group;