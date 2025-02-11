import { supabase } from './supabase';
import type { SongDetails, Collaborator } from '../types';

export async function saveSplitSheet(songDetails: SongDetails, collaborators: Collaborator[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: splitSheet, error: splitSheetError } = await supabase
      .from('split_sheets')
      .insert({
        user_id: user.id,
        title: songDetails.title || 'Untitled Song',
        release_date: songDetails.releaseDate,
        artist_name: songDetails.artistName || 'Unknown Artist',
        produced_by: songDetails.producedBy || 'Unknown Producer',
        isrc_code: songDetails.isrcCode,
        duration: songDetails.duration,
        rights_type: songDetails.rightsType,
        separate_publishing_splits: songDetails.separatePublishingSplits,
        status: 'draft'
      })
      .select()
      .single();

    if (splitSheetError) throw splitSheetError;

    const collaboratorRows = collaborators.map(collaborator => ({
      split_sheet_id: splitSheet.id,
      legal_name: collaborator.legalName || 'Unknown',
      stage_name: collaborator.stageName,
      role: collaborator.role || 'Artist',
      email: collaborator.email,
      publisher_name: collaborator.publisherName,
      pro_affiliation: collaborator.proAffiliation,
      ipi_number: collaborator.ipiNumber,
      percentage: collaborator.percentage || 0
    }));

    const { error: collaboratorsError } = await supabase
      .from('collaborators')
      .insert(collaboratorRows);

    if (collaboratorsError) throw collaboratorsError;

    return { success: true, data: splitSheet };
  } catch (error) {
    console.error('Error saving split sheet:', error);
    return { success: false, error };
  }
}

export async function getSplitSheet(id: string) {
  try {
    const { data: splitSheet, error: splitSheetError } = await supabase
      .from('split_sheets')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (splitSheetError) throw splitSheetError;

    const { data: collaborators, error: collaboratorsError } = await supabase
      .from('collaborators')
      .select('*')
      .eq('split_sheet_id', id);

    if (collaboratorsError) throw collaboratorsError;

    return {
      success: true,
      data: {
        id: splitSheet.id,
        title: splitSheet.title,
        releaseDate: splitSheet.release_date,
        artistName: splitSheet.artist_name,
        producedBy: splitSheet.produced_by,
        isrcCode: splitSheet.isrc_code,
        duration: splitSheet.duration,
        rightsType: splitSheet.rights_type,
        separatePublishingSplits: splitSheet.separate_publishing_splits,
        status: splitSheet.status,
        collaborators: collaborators.map(c => ({
          legalName: c.legal_name,
          stageName: c.stage_name,
          role: c.role,
          email: c.email,
          publisherName: c.publisher_name,
          proAffiliation: c.pro_affiliation,
          ipiNumber: c.ipi_number,
          percentage: c.percentage,
          signature: c.signature,
          signatureDate: c.signature_date
        }))
      }
    };
  } catch (error) {
    console.error('Error fetching split sheet:', error);
    return { success: false, error };
  }
}

export async function getUserSplitSheets() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get only the split sheets where user is owner
    const { data: ownedSheets, error: ownedError } = await supabase
      .from('split_sheets')
      .select(`
        id,
        title,
        release_date,
        artist_name,
        produced_by,
        isrc_code,
        duration,
        rights_type,
        separate_publishing_splits,
        status,
        created_at,
        user_id
      `)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (ownedError) throw ownedError;

    // Get collaborators for owned sheets
    const { data: allCollaborators, error: collaboratorsError } = await supabase
      .from('collaborators')
      .select('*')
      .in('split_sheet_id', (ownedSheets || []).map(s => s.id));

    if (collaboratorsError) throw collaboratorsError;

    // Group collaborators by sheet
    const collaboratorsBySheet = (allCollaborators || []).reduce((acc: any, c) => {
      if (!acc[c.split_sheet_id]) {
        acc[c.split_sheet_id] = [];
      }
      acc[c.split_sheet_id].push({
        id: c.id,
        legal_name: c.legal_name,
        stage_name: c.stage_name,
        role: c.role,
        email: c.email,
        publisher_name: c.publisher_name,
        pro_affiliation: c.pro_affiliation,
        ipi_number: c.ipi_number,
        percentage: c.percentage,
        signature: c.signature,
        signature_date: c.signature_date
      });
      return acc;
    }, {});

    // Format sheets with their collaborators
    const formattedSheets = (ownedSheets || []).map(sheet => ({
      ...sheet,
      isOwner: true,
      collaborators: collaboratorsBySheet[sheet.id] || []
    }));

    return { success: true, data: formattedSheets };
  } catch (error) {
    console.error('Error fetching user split sheets:', error);
    return { success: false, error };
  }
}

export async function updateSignature(splitSheetId: string, email: string, signature: string) {
  try {
    const { data: collaborator, error: fetchError } = await supabase
      .from('collaborators')
      .select('id')
      .eq('split_sheet_id', splitSheetId)
      .eq('email', email)
      .single();

    if (fetchError) throw fetchError;
    if (!collaborator) throw new Error('Collaborator not found');

    const { error: updateError } = await supabase
      .from('collaborators')
      .update({ 
        signature: signature,
        signature_date: new Date().toISOString()
      })
      .eq('id', collaborator.id);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Error updating signature:', error);
    return { success: false, error };
  }
}