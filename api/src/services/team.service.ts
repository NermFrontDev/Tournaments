import * as teamModel from '../models/team.model';
import { Team } from '../types/team.interface';

export async function getAll() {
    return teamModel.findAll();
}

export async function getById(id: number) {
    return teamModel.findById(id);
}

export async function create(data: Team) {
    const id = await teamModel.insert(data);
    return teamModel.findById(id);
}

export async function update(id: number, data: any) {
    const exists = await teamModel.findById(id);
    if (!exists) return null;
    const allowed = ['name', 'short_name', 'logo_url', 'contact_email', 'contact_phone', 'coach'];
    const fields = {} as any;
    for (const key of allowed) {
        if (data[key] !== undefined) fields[key] = data[key];
    }
    if (Object.keys(fields).length === 0) return exists;
    await teamModel.update(id, fields);
    return await teamModel.findById(id);
}

export async function remove(id: number) {
    const exists = await teamModel.findById(id);
    if (!exists) return null;

    const activeTournaments = await teamModel.findActiveTournaments(id);
    if (activeTournaments.length > 0) {
        return false
    }
    await teamModel.remove(id);
    return true;
}