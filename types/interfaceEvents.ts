// types/index.ts
export interface CommitteeMember {
  name: string;
  position: string;
  photoUrl: string;
}

export interface Event {
  id: string;
  slug: string;
  thumbnailUrl: string;
  title: string;
  date: string;
  time: string;
  type: 'offline' | 'online';
  location: string;
  creator: string;
  committeeStructure?: CommitteeMember[];
  sponsorLogos?: string[];
  description: string;
  user_id?: string;
  created_at?: string;
}

export type EventFormData = Omit<Event, 'id' | 'user_id' | 'created_at'>;