export interface SongDetails {
  id?: string;
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

export interface Collaborator {
  legalName: string;
  stageName: string;
  role: string;
  email: string;
  publisherName: string;
  proAffiliation: string;
  ipiNumber: string;
  percentage: number;
}

export interface FormData {
  songTitle: string;
  releaseDate: string;
  artistName: string;
  producerName: string;
  isrcCode: string;
  songDuration: string;
  rightsType: 'composition' | 'master' | 'both';
  collaborators: {
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
  }[];
  publishers: {
    name: string;
    percentage: number;
  }[];
  showPublishing: boolean;
  disclaimerAccepted: boolean;
}