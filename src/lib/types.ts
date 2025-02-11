export interface FormData {
  songTitle: string;
  releaseDate: string;
  artistName: string;
  producerName: string;
  isrcCode: string;
  songDuration: string;
  rightsType: 'composition' | 'master' | 'both';
  collaborators: Collaborator[];
  publishers: Publisher[];
  showPublishing: boolean;
  disclaimerAccepted: boolean;
}

export interface Collaborator {
  name: string;
  legal_name: string;
  stage_name: string;
  address: string;
  role: 'artist' | 'producer' | 'songwriter' | 'engineer';
  percentage: number;
  email: string;
  publisher_name: string;
  pro_affiliation: string;
  ipi_number: string;
  signature: string;
}

export interface Publisher {
  name: string;
  percentage: number;
}

export interface SongDetails {
  title: string;
  releaseDate: string;
  artistName: string;
  producedBy: string;
  isrcCode: string;
  duration: string;
  rightsType: 'Composition' | 'Master' | 'Both';
  separatePublishingSplits: boolean;
}

export interface PublisherSplit {
  publisherName: string;
  percentage: number;
  proAffiliation: string;
  ipiNumber: string;
  notes: string;
}